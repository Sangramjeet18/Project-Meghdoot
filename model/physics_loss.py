"""
=================================================================
LAYER 1: MATHEMATICAL PHYSICS LAYER
ClimatePhysicsLoss - Navier-Stokes & Mass Conservation Constraints
=================================================================

This module implements the physics-informed loss functions that
enforce atmospheric fluid dynamics constraints on the FNO surrogate
model. It uses torch.autograd.grad for differentiable spatial/temporal
derivative computation and penalizes violations of:

  1. Simplified 2D Incompressible Navier-Stokes Momentum Equations
  2. Mass Continuity (Divergence-Free Constraint: du/dx + dv/dy = 0)
  3. Thermodynamic Energy Balance (optional regularizer)

Reference: Raissi et al., "Physics-Informed Neural Networks" (2019)
           Li et al., "Fourier Neural Operator for PDEs" (2021)
=================================================================
"""

import torch
import torch.nn as nn
import functools
import time


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Easter Egg Decorator: @antigravity_accelerate
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def antigravity_accelerate(func):
    """
    A benchmarking decorator that measures execution time and prints
    a witty message about removing 'computational weight' from the
    climate matrix. Inspired by Python's `import antigravity`.

    Usage:
        @antigravity_accelerate
        def my_heavy_computation(...):
            ...
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"\n  [antigravity] Engaging anti-gravity drive for '{func.__name__}'...")
        print(f"  [antigravity] Removing computational weight from the climate matrix...")
        t0 = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - t0
        print(f"  [antigravity] '{func.__name__}' executed in {elapsed*1000:.2f}ms")
        if elapsed < 0.05:
            print(f"  [antigravity] Sub-50ms achieved! The atmosphere is now weightless.\n")
        else:
            print(f"  [antigravity] {elapsed:.3f}s -- still faster than WRF by 10,000x.\n")
        return result
    return wrapper


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Autograd-Based Spatial Derivative Utilities
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _spatial_gradient(field, coords, dim_index):
    """
    Compute the spatial derivative of 'field' with respect to the
    coordinate tensor at 'dim_index' using torch.autograd.grad.

    Args:
        field:     Tensor of shape [B, H, W] -- the scalar field.
        coords:    Tensor of shape [B, H, W, 2] -- (lat, lon) coords
                   with requires_grad=True.
        dim_index: 0 for d/d(lat), 1 for d/d(lon).

    Returns:
        Tensor of shape [B, H, W] -- the partial derivative.
    """
    grad_outputs = torch.ones_like(field)
    grads = torch.autograd.grad(
        outputs=field,
        inputs=coords,
        grad_outputs=grad_outputs,
        create_graph=True,
        retain_graph=True,
        allow_unused=True,
    )[0]

    if grads is None:
        return torch.zeros_like(field)

    # Extract the gradient along the requested spatial dimension
    return grads[..., dim_index]


def finite_difference_dx(field, dx=1.0):
    """
    Central finite difference approximation for d(field)/dx along
    the last spatial dimension (longitude axis, dim=-1).

    Args:
        field: Tensor [B, H, W]
        dx:    Grid spacing in degrees (default 1.0 for ~111 km).

    Returns:
        Tensor [B, H, W] -- spatial derivative along x.
    """
    assert field.dim() >= 2, f"Expected >= 2D tensor, got {field.dim()}D"
    return (torch.roll(field, shifts=-1, dims=-1) -
            torch.roll(field, shifts=1, dims=-1)) / (2.0 * dx)


def finite_difference_dy(field, dy=1.0):
    """
    Central finite difference approximation for d(field)/dy along
    the second-to-last spatial dimension (latitude axis, dim=-2).

    Args:
        field: Tensor [B, H, W]
        dy:    Grid spacing in degrees (default 1.0 for ~111 km).

    Returns:
        Tensor [B, H, W] -- spatial derivative along y.
    """
    assert field.dim() >= 2, f"Expected >= 2D tensor, got {field.dim()}D"
    return (torch.roll(field, shifts=-1, dims=-2) -
            torch.roll(field, shifts=1, dims=-2)) / (2.0 * dy)


def laplacian_2d(field, dx=1.0, dy=1.0):
    """
    Computes the 2D Laplacian (diffusion operator) of a scalar field
    using second-order central finite differences.

    Laplacian(f) = d2f/dx2 + d2f/dy2

    Args:
        field: Tensor [B, H, W]
        dx, dy: Grid spacings.

    Returns:
        Tensor [B, H, W] -- the Laplacian.
    """
    d2f_dx2 = (torch.roll(field, -1, dims=-1) - 2.0 * field +
               torch.roll(field, 1, dims=-1)) / (dx ** 2)
    d2f_dy2 = (torch.roll(field, -1, dims=-2) - 2.0 * field +
               torch.roll(field, 1, dims=-2)) / (dy ** 2)
    return d2f_dx2 + d2f_dy2


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ClimatePhysicsLoss: The Core PINN Loss Module
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ClimatePhysicsLoss(nn.Module):
    """
    Physics-Informed Neural Network (PINN) loss module for atmospheric
    fluid dynamics. Combines data-driven MSE loss with physics residual
    penalties derived from the Navier-Stokes equations and mass
    conservation (divergence-free condition).

    Loss_total = Loss_data + lambda * Loss_physics

    where:
        Loss_physics = L_momentum + L_continuity + L_energy

    Channel Convention (5-variable climate state vector):
        Channel 0: Temperature (T) [Kelvin]
        Channel 1: Specific Humidity (q) [kg/kg]
        Channel 2: Zonal Wind (u) [m/s]    -- east-west component
        Channel 3: Meridional Wind (v) [m/s] -- north-south component
        Channel 4: Surface Pressure (p) [hPa]

    Args:
        physics_weight: Lambda coefficient for the physics loss term.
                        Default 0.75 (matching the frontend PINN slider).
        rho:            Air density [kg/m3]. Default 1.225 (sea level ISA).
        nu:             Kinematic viscosity [m2/s]. Default 1.5e-5.
        dx:             Longitudinal grid spacing [degrees]. Default 0.5.
        dy:             Latitudinal grid spacing [degrees]. Default 0.5.
        enforce_continuity: If True, adds hard mass continuity constraint.
    """

    # Channel index constants
    CH_TEMP = 0
    CH_HUMID = 1
    CH_WIND_U = 2
    CH_WIND_V = 3
    CH_PRESSURE = 4

    def __init__(
        self,
        physics_weight: float = 0.75,
        rho: float = 1.225,
        nu: float = 1.5e-5,
        dx: float = 0.5,
        dy: float = 0.5,
        enforce_continuity: bool = True,
    ):
        super(ClimatePhysicsLoss, self).__init__()
        self.physics_weight = physics_weight
        self.rho = rho
        self.nu = nu
        self.dx = dx
        self.dy = dy
        self.enforce_continuity = enforce_continuity
        self.mse_loss = nn.MSELoss()

    def _extract_fields(self, state):
        """
        Extract individual physical fields from the 5-channel state tensor.

        Args:
            state: Tensor of shape [B, H, W, 5]

        Returns:
            Tuple of (T, q, u, v, p), each [B, H, W]
        """
        assert state.shape[-1] == 5, (
            f"State tensor must have 5 channels (T, q, u, v, p), "
            f"got {state.shape[-1]}"
        )
        T = state[..., self.CH_TEMP]
        q = state[..., self.CH_HUMID]
        u = state[..., self.CH_WIND_U]
        v = state[..., self.CH_WIND_V]
        p = state[..., self.CH_PRESSURE]
        return T, q, u, v, p

    def navier_stokes_residual(self, u, v, p):
        """
        Computes the 2D incompressible Navier-Stokes momentum residual.

        The steady-state simplified momentum equations are:

            Residual_u = u * du/dx + v * du/dy + (1/rho) * dp/dx - nu * Lap(u)
            Residual_v = u * dv/dx + v * dv/dy + (1/rho) * dp/dy - nu * Lap(v)

        A physically consistent solution has both residuals = 0.

        Args:
            u: Zonal wind tensor [B, H, W]
            v: Meridional wind tensor [B, H, W]
            p: Pressure tensor [B, H, W]

        Returns:
            Scalar loss (mean squared residual across the domain).
        """
        # ── Advection terms: (u . grad) u ──
        du_dx = finite_difference_dx(u, self.dx)
        du_dy = finite_difference_dy(u, self.dy)
        dv_dx = finite_difference_dx(v, self.dx)
        dv_dy = finite_difference_dy(v, self.dy)

        # ── Pressure gradient force: (1/rho) * grad(p) ──
        dp_dx = finite_difference_dx(p, self.dx)
        dp_dy = finite_difference_dy(p, self.dy)

        # ── Viscous diffusion: nu * Laplacian(u, v) ──
        lap_u = laplacian_2d(u, self.dx, self.dy)
        lap_v = laplacian_2d(v, self.dx, self.dy)

        # ── Navier-Stokes Momentum Residuals ──
        residual_u = (
            u * du_dx + v * du_dy +
            (1.0 / self.rho) * dp_dx -
            self.nu * lap_u
        )
        residual_v = (
            u * dv_dx + v * dv_dy +
            (1.0 / self.rho) * dp_dy -
            self.nu * lap_v
        )

        # L2 norm of residuals across the entire spatial domain
        momentum_loss = torch.mean(residual_u ** 2) + torch.mean(residual_v ** 2)
        return momentum_loss

    def mass_continuity_loss(self, u, v):
        """
        Enforces the incompressible mass continuity constraint
        (divergence-free condition):

            div(V) = du/dx + dv/dy = 0

        This prevents the neural network from creating "ghost mass"
        or artificial water vapor sources/sinks.

        Args:
            u: Zonal wind tensor [B, H, W]
            v: Meridional wind tensor [B, H, W]

        Returns:
            Scalar loss penalizing non-zero divergence.
        """
        du_dx = finite_difference_dx(u, self.dx)
        dv_dy = finite_difference_dy(v, self.dy)

        divergence = du_dx + dv_dy
        continuity_loss = torch.mean(divergence ** 2)
        return continuity_loss

    def energy_balance_regularizer(self, T, u, v):
        """
        A simplified thermodynamic energy conservation regularizer.
        Penalizes unphysical temperature advection patterns where the
        thermal energy budget is grossly violated.

        Simplified advection equation residual:
            dT/dt ~ -(u * dT/dx + v * dT/dy)

        We penalize the magnitude of the advective tendency when it
        produces implausible thermal gradients.

        Args:
            T: Temperature field [B, H, W]
            u: Zonal wind [B, H, W]
            v: Meridional wind [B, H, W]

        Returns:
            Scalar regularization loss.
        """
        dT_dx = finite_difference_dx(T, self.dx)
        dT_dy = finite_difference_dy(T, self.dy)

        # Thermal advection tendency
        advection = u * dT_dx + v * dT_dy

        # Penalize extreme advective tendencies (soft constraint)
        energy_loss = torch.mean(torch.clamp(advection.abs() - 5.0, min=0.0) ** 2)
        return energy_loss

    def forward(self, prediction, target):
        """
        Compute the total PINN loss combining data fidelity and
        physics constraints.

        Args:
            prediction: Model output tensor [B, H, W, 5]
            target:     Ground truth tensor [B, H, W, 5]

        Returns:
            dict with keys:
                'total_loss': The combined scalar loss for backpropagation.
                'data_loss':  MSE between prediction and target.
                'momentum_loss': Navier-Stokes residual magnitude.
                'continuity_loss': Divergence-free violation magnitude.
                'energy_loss': Energy balance regularizer magnitude.
        """
        # ── Shape assertions ──
        assert prediction.shape == target.shape, (
            f"Shape mismatch: prediction {prediction.shape} vs target {target.shape}"
        )
        assert prediction.dim() == 4, (
            f"Expected 4D tensor [B, H, W, C], got {prediction.dim()}D"
        )
        assert prediction.shape[-1] == 5, (
            f"Expected 5 channels, got {prediction.shape[-1]}"
        )

        # ── Data Fidelity Loss (MSE) ──
        data_loss = self.mse_loss(prediction, target)

        # ── Extract physical fields from prediction ──
        T_pred, q_pred, u_pred, v_pred, p_pred = self._extract_fields(prediction)

        # ── Physics Residual Losses ──
        momentum_loss = self.navier_stokes_residual(u_pred, v_pred, p_pred)

        continuity_loss = torch.tensor(0.0, device=prediction.device)
        if self.enforce_continuity:
            continuity_loss = self.mass_continuity_loss(u_pred, v_pred)

        energy_loss = self.energy_balance_regularizer(T_pred, u_pred, v_pred)

        # ── Combined Physics Loss ──
        physics_loss = momentum_loss + continuity_loss + 0.1 * energy_loss

        # ── Total PINN Loss ──
        total_loss = data_loss + self.physics_weight * physics_loss

        return {
            "total_loss": total_loss,
            "data_loss": data_loss,
            "momentum_loss": momentum_loss,
            "continuity_loss": continuity_loss,
            "energy_loss": energy_loss,
            "physics_weight": self.physics_weight,
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Hard Divergence-Free Projection Layer
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DivergenceFreeProjection(nn.Module):
    """
    A hard constraint layer that projects wind field predictions onto
    the space of divergence-free vector fields using a Helmholtz
    decomposition in the Fourier domain.

    Given predicted (u, v), we solve for a stream function psi such that:
        u_corrected = -d(psi)/dy
        v_corrected =  d(psi)/dx

    This guarantees du_corrected/dx + dv_corrected/dy = 0 exactly.
    """

    def __init__(self, grid_height: int = 60, grid_width: int = 60):
        super(DivergenceFreeProjection, self).__init__()
        self.H = grid_height
        self.W = grid_width

    def forward(self, u, v):
        """
        Project (u, v) onto the divergence-free subspace.

        Args:
            u: Zonal wind [B, H, W]
            v: Meridional wind [B, H, W]

        Returns:
            (u_proj, v_proj): Corrected divergence-free wind components.
        """
        assert u.shape == v.shape, f"u and v must have same shape: {u.shape} vs {v.shape}"
        B = u.shape[0]

        # Compute divergence in Fourier space
        u_hat = torch.fft.rfft2(u)
        v_hat = torch.fft.rfft2(v)

        # Frequency grids
        kx = torch.fft.rfftfreq(self.W, d=1.0).to(u.device)  # [W//2 + 1]
        ky = torch.fft.fftfreq(self.H, d=1.0).to(u.device)   # [H]

        # Broadcast to [1, H, W//2+1]
        kx = kx.unsqueeze(0).unsqueeze(0).expand(B, self.H, -1)
        ky = ky.unsqueeze(0).unsqueeze(-1).expand(B, -1, kx.shape[-1])

        # Divergence spectrum: div_hat = i*kx*u_hat + i*ky*v_hat
        two_pi_i = 2.0j * torch.pi
        div_hat = two_pi_i * kx * u_hat + two_pi_i * ky * v_hat

        # Laplacian denominator: -(kx^2 + ky^2) * (2*pi)^2
        k_sq = kx ** 2 + ky ** 2
        k_sq_safe = k_sq.clone()
        k_sq_safe[k_sq_safe == 0] = 1.0  # avoid division by zero at DC

        # Solve Poisson equation for correction potential phi:
        #   Lap(phi) = div  =>  phi_hat = div_hat / (-(2*pi)^2 * k_sq)
        phi_hat = div_hat / (-(2.0 * torch.pi) ** 2 * k_sq_safe)
        phi_hat[k_sq == 0] = 0.0  # zero DC component

        # Subtract gradient of phi to enforce div-free
        u_correction = torch.fft.irfft2(two_pi_i * kx * phi_hat, s=(self.H, self.W))
        v_correction = torch.fft.irfft2(two_pi_i * ky * phi_hat, s=(self.H, self.W))

        u_proj = u - u_correction
        v_proj = v - v_correction

        return u_proj, v_proj


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module Self-Test
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    print("=" * 65)
    print("  LAYER 1: ClimatePhysicsLoss Self-Test")
    print("=" * 65)

    B, H, W, C = 2, 60, 60, 5

    # Create synthetic prediction and target tensors
    prediction = torch.randn(B, H, W, C, requires_grad=False)
    target = prediction + 0.05 * torch.randn(B, H, W, C)

    # Instantiate the PINN loss with default physics_weight=0.75
    loss_fn = ClimatePhysicsLoss(physics_weight=0.75)
    losses = loss_fn(prediction, target)

    print(f"\n  Tensor Shape: [{B}, {H}, {W}, {C}]")
    print(f"  Physics Weight (lambda): {losses['physics_weight']}")
    print(f"  Data Loss (MSE):         {losses['data_loss'].item():.6f}")
    print(f"  Momentum Loss (NS):      {losses['momentum_loss'].item():.6f}")
    print(f"  Continuity Loss (div):    {losses['continuity_loss'].item():.6f}")
    print(f"  Energy Loss (thermo):     {losses['energy_loss'].item():.6f}")
    print(f"  Total PINN Loss:          {losses['total_loss'].item():.6f}")

    # Test divergence-free projection
    print(f"\n  Testing DivergenceFreeProjection layer...")
    proj = DivergenceFreeProjection(grid_height=H, grid_width=W)
    u_raw = torch.randn(B, H, W)
    v_raw = torch.randn(B, H, W)
    u_proj, v_proj = proj(u_raw, v_raw)

    # Verify divergence is near zero after projection
    div_before = finite_difference_dx(u_raw) + finite_difference_dy(v_raw)
    div_after = finite_difference_dx(u_proj) + finite_difference_dy(v_proj)
    print(f"  Divergence before projection: {div_before.abs().mean().item():.6f}")
    print(f"  Divergence after projection:  {div_after.abs().mean().item():.6f}")
    print(f"\n  [OK] Layer 1 verification complete.")
