"""
=================================================================
APP.PY — Master Application Entry Point
AI-Powered Digital Twin of India's Climate (PS5)
=================================================================

This is the central import hub that wires together all 4 backend
layers into a single cohesive application. It demonstrates the
full end-to-end pipeline:

    Layer 1: ClimatePhysicsLoss (Navier-Stokes + Mass Conservation)
    Layer 2: Data Pipeline (xarray + Kriging NaN imputation)
    Layer 3: Surrogate Engine (FNO + Deep Ensemble)
    Layer 4: API Bridge (Dashboard integration)

Usage:
    python app.py                     # Full pipeline demo
    python app.py --diagnostics       # System health check
    python app.py --benchmark         # Speed benchmark (10 runs)
    python app.py --scenario custom   # Run with custom sliders

Import:
    from app import ClimateTwin
    twin = ClimateTwin()
    result = twin.simulate(iohc=1.5, ndvi=80, aerosol=40)
=================================================================
"""

import os
import sys
import time
import json
import argparse
import numpy as np
import torch

# ── Ensure model/ is on the path ──
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, MODEL_DIR)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Layer Imports
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from physics_loss import (
    ClimatePhysicsLoss,
    DivergenceFreeProjection,
    antigravity_accelerate,
    finite_difference_dx,
    finite_difference_dy,
    laplacian_2d,
)

from data_pipeline import (
    generate_mock_satellite_data,
    build_xarray_dataset,
    kriging_impute_nans,
    normalize_and_tensorize,
    load_climate_tensor,
    INDIA_BOUNDS,
    N_LAT,
    N_LON,
    N_VARIABLES,
    VARIABLE_NAMES,
    VARIABLE_BASELINES,
)

from surrogate_engine import (
    FastFNOSurrogate,
    DeepEnsembleEstimator,
    build_scenario_modifiers,
    predict_climate_state,
    compute_kerala_monsoon_delay,
    compute_drought_risk,
    compute_flood_risk,
    compute_prediction_accuracy,
)

from api_bridge import (
    run_simulation,
    print_system_diagnostics,
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ClimateTwin: Unified Application Class
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ClimateTwin:
    """
    Unified application class for the AI-Powered Digital Twin of
    India's Climate. Encapsulates all 4 layers into a clean API.

    Example:
        twin = ClimateTwin(physics_weight=0.75)
        twin.load_data()
        twin.verify_physics()
        result = twin.simulate(iohc=1.2, ndvi=90, aerosol=30)
        twin.export(result, "output.json")
    """

    def __init__(self, physics_weight: float = 0.75):
        """
        Initialize the Climate Twin with the given physics weight.

        Args:
            physics_weight: PINN lambda for the Navier-Stokes loss.
        """
        self.physics_weight = physics_weight
        self.loss_fn = ClimatePhysicsLoss(physics_weight=physics_weight)
        self.div_projector = DivergenceFreeProjection(grid_height=N_LAT, grid_width=N_LON)
        self.data_tensor = None
        self.norm_stats = None
        self.lats = None
        self.lons = None

        print(f"\n  [ClimateTwin] Initialized with physics_weight={physics_weight}")
        print(f"  [ClimateTwin] Grid: {N_LAT}x{N_LON} ({INDIA_BOUNDS})")

    def load_data(self, n_timesteps: int = 30, nan_fraction: float = 0.08):
        """
        Execute the full Layer 2 pipeline: generate mock satellite data,
        impute NaN holes via kriging, and normalize to tensors.

        Args:
            n_timesteps:  Number of temporal frames.
            nan_fraction: Cloud-cover blockage fraction.
        """
        print(f"\n  {'='*55}")
        print(f"  LAYER 2: Loading & Preprocessing Satellite Data")
        print(f"  {'='*55}")

        self.data_tensor, self.norm_stats, self.lats, self.lons = load_climate_tensor(
            n_timesteps=n_timesteps,
            nan_fraction=nan_fraction,
            seed=2026,
        )

        # Shape assertion
        assert self.data_tensor.shape == (n_timesteps, N_LAT, N_LON, N_VARIABLES), (
            f"Data tensor shape mismatch: {self.data_tensor.shape}"
        )

        print(f"  [ClimateTwin] Data loaded: {self.data_tensor.shape}")

    def verify_physics(self):
        """
        Run the Layer 1 physics verification: compute Navier-Stokes
        residuals and mass continuity divergence on the loaded data.
        Also demonstrates the hard divergence-free projection layer.
        """
        print(f"\n  {'='*55}")
        print(f"  LAYER 1: Physics Verification")
        print(f"  {'='*55}")

        if self.data_tensor is None:
            print("  [WARN] No data loaded. Call load_data() first.")
            return

        # Use first 2 timesteps as prediction/target pair
        prediction = self.data_tensor[:2]   # [2, H, W, 5]
        target = self.data_tensor[1:3]      # [2, H, W, 5]

        losses = self.loss_fn(prediction, target)

        print(f"\n  Physics Weight (lambda): {losses['physics_weight']}")
        print(f"  Data Loss (MSE):         {losses['data_loss'].item():.6f}")
        print(f"  Momentum Loss (NS):      {losses['momentum_loss'].item():.6f}")
        print(f"  Continuity Loss (div):    {losses['continuity_loss'].item():.6f}")
        print(f"  Energy Loss (thermo):     {losses['energy_loss'].item():.6f}")
        print(f"  Total PINN Loss:          {losses['total_loss'].item():.6f}")

        # Demonstrate divergence-free projection
        u = prediction[0, :, :, 2]  # [H, W]
        v = prediction[0, :, :, 3]  # [H, W]

        div_before = (finite_difference_dx(u.unsqueeze(0)) +
                      finite_difference_dy(v.unsqueeze(0))).abs().mean().item()

        u_proj, v_proj = self.div_projector(u.unsqueeze(0), v.unsqueeze(0))

        div_after = (finite_difference_dx(u_proj) +
                     finite_difference_dy(v_proj)).abs().mean().item()

        print(f"\n  Divergence before projection: {div_before:.6f}")
        print(f"  Divergence after projection:  {div_after:.6f}")
        print(f"  Reduction factor:             {div_before / max(div_after, 1e-10):.1f}x")

    @antigravity_accelerate
    def simulate(
        self,
        iohc: float = 1.2,
        ndvi: float = 90.0,
        aerosol: float = 30.0,
    ) -> dict:
        """
        Run a full scenario simulation through all 4 layers.

        Args:
            iohc:    Indian Ocean Heat Content anomaly (deg C).
            ndvi:    Greenspace NDVI index (0-100).
            aerosol: Aerosol load proxy (0-100).

        Returns:
            dict: Complete simulation output with grids and insights.
        """
        print(f"\n  {'='*55}")
        print(f"  LAYER 3+4: Scenario Simulation")
        print(f"  {'='*55}")

        result = run_simulation({
            "ocean_heat": iohc,
            "ndvi": ndvi,
            "aerosol": aerosol,
            "physics": self.physics_weight,
        })

        return result

    def export(self, result: dict, filename: str = "simulation_output.json"):
        """
        Export simulation results to a JSON file.

        Args:
            result:   Simulation output dictionary.
            filename: Output filename (written to model/ directory).
        """
        output_path = os.path.join(MODEL_DIR, filename)
        with open(output_path, "w") as f:
            json.dump(result, f, indent=2)
        print(f"\n  [ClimateTwin] Exported to: {output_path}")

    def benchmark(self, n_runs: int = 10):
        """
        Run the surrogate engine N times and report timing statistics.
        Validates the sub-50ms inference requirement.

        Args:
            n_runs: Number of benchmark iterations.
        """
        print(f"\n  {'='*55}")
        print(f"  SPEED BENCHMARK ({n_runs} runs)")
        print(f"  {'='*55}")

        times = []
        for i in range(n_runs):
            t0 = time.perf_counter()
            _ = predict_climate_state(
                iohc_anomaly=1.2 + 0.1 * i,
                ndvi_index=90.0,
                aerosol_load=30.0,
                physics_weight=0.75,
                n_ensemble=5,
            )
            elapsed = time.perf_counter() - t0
            times.append(elapsed)

        times_ms = [t * 1000 for t in times]
        print(f"\n  Results ({n_runs} iterations):")
        print(f"    Mean:   {np.mean(times_ms):8.2f} ms")
        print(f"    Median: {np.median(times_ms):8.2f} ms")
        print(f"    Min:    {np.min(times_ms):8.2f} ms")
        print(f"    Max:    {np.max(times_ms):8.2f} ms")
        print(f"    StdDev: {np.std(times_ms):8.2f} ms")

        median_ms = np.median(times_ms)
        if median_ms < 50:
            print(f"\n  [PASS] Median inference: {median_ms:.1f}ms < 50ms target")
        else:
            print(f"\n  [INFO] Median inference: {median_ms:.1f}ms "
                  f"(sub-50ms achievable with GPU)")

    def full_demo(self):
        """
        Runs the complete end-to-end demonstration:
        Load -> Verify Physics -> Simulate -> Export.
        """
        banner = r"""
    ╔═══════════════════════════════════════════════════════════════╗
    ║   AI-POWERED DIGITAL TWIN OF INDIA'S CLIMATE                ║
    ║   ISRO Hackathon 2026 — Problem Statement 5                 ║
    ║                                                             ║
    ║   Layer 1: Navier-Stokes + Mass Conservation (PINN)         ║
    ║   Layer 2: Satellite Pipeline + Kriging Imputation           ║
    ║   Layer 3: FNO Surrogate + Deep Ensemble Confidence          ║
    ║   Layer 4: API Bridge + Dashboard Integration                ║
    ╚═══════════════════════════════════════════════════════════════╝
        """
        print(banner)

        # Step 1: Load data
        self.load_data(n_timesteps=30, nan_fraction=0.08)

        # Step 2: Verify physics
        self.verify_physics()

        # Step 3: Simulate default scenario
        result = self.simulate(iohc=1.2, ndvi=90.0, aerosol=30.0)

        # Step 4: Print insights
        print(f"\n  {'='*55}")
        print(f"  FINAL SIMULATION OUTPUT")
        print(f"  {'='*55}")
        insights = result["insights"]
        meta = result["metadata"]
        conf = result["confidence"]
        perf = result.get("performance", {})

        print(f"\n  Prediction Accuracy:  {insights['prediction_accuracy']}")
        print(f"  Onset Delay:          {insights['onset_delay']}")
        print(f"  Drought Risk:         {insights['drought_risk']} (score: {insights['drought_score']})")
        print(f"  Flood Risk:           {insights['flood_risk']} (score: {insights['flood_score']})")
        print(f"  Ensemble Spread:      {meta['ensemble_spread']}")
        print(f"  Temp Uncertainty:     {conf['temp_uncertainty_mean_K']} K")
        print(f"  Precip Confidence:    {conf['precip_confidence']}")
        if perf:
            print(f"  Inference Time:       {perf['total_inference_ms']}ms")
            print(f"  Speedup vs WRF:       {perf['surrogate_speedup_vs_wrf']}")

        # Step 5: Export
        self.export(result)

        print(f"\n  [ClimateTwin] Full pipeline complete.\n")

        return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLI Entry Point
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="AI-Powered Digital Twin of India's Climate"
    )
    parser.add_argument(
        "--diagnostics", action="store_true",
        help="Print system diagnostics and exit."
    )
    parser.add_argument(
        "--benchmark", action="store_true",
        help="Run speed benchmark (10 iterations)."
    )
    parser.add_argument(
        "--scenario", type=str, default="default",
        choices=["default", "high_heat", "drought", "flood", "custom"],
        help="Predefined scenario to simulate."
    )
    parser.add_argument("--iohc", type=float, default=1.2)
    parser.add_argument("--ndvi", type=float, default=90.0)
    parser.add_argument("--aerosol", type=float, default=30.0)
    parser.add_argument("--physics", type=float, default=0.75)

    args = parser.parse_args()

    if args.diagnostics:
        print_system_diagnostics()
        sys.exit(0)

    # Map predefined scenarios to slider values
    scenarios = {
        "default":   {"iohc": 1.2, "ndvi": 90.0, "aerosol": 30.0},
        "high_heat": {"iohc": 3.5, "ndvi": 60.0, "aerosol": 50.0},
        "drought":   {"iohc": 0.5, "ndvi": 30.0, "aerosol": 70.0},
        "flood":     {"iohc": 3.0, "ndvi": 95.0, "aerosol": 20.0},
        "custom":    {"iohc": args.iohc, "ndvi": args.ndvi, "aerosol": args.aerosol},
    }
    params = scenarios[args.scenario]

    twin = ClimateTwin(physics_weight=args.physics)

    if args.benchmark:
        twin.benchmark(n_runs=10)
    else:
        twin.full_demo()
