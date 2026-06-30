"""
=================================================================
Core AI Engine - Physics-Informed Fourier Neural Operator (PINN-FNO)
Phase 2: Fourier Neural Operator (FNO) model architecture and 
physics-informed Navier-Stokes fluid loss training loop.
=================================================================
"""

import os
import sys
import time
import torch
import torch.nn as nn
import torch.fft
import torch.optim as optim

# Ensure model directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_pipeline import load_climate_tensor, N_LAT, N_LON, N_VARIABLES
from physics_loss import ClimatePhysicsLoss

class SpectralConv2d(nn.Module):
    """
    2D Fourier Spectral Convolution layer.
    Transforms input to Fourier domain, filters high frequencies,
    applies complex-valued weights, and transforms back to physical space.
    """
    def __init__(self, in_channels, out_channels, modes1, modes2):
        super(SpectralConv2d, self).__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.modes1 = modes1 # Number of Fourier modes to keep
        self.modes2 = modes2

        # Complex weights parameter in Fourier space
        self.weights1 = nn.Parameter(torch.complex(
            torch.randn(in_channels, out_channels, self.modes1, self.modes2) * (1 / (in_channels * out_channels)),
            torch.randn(in_channels, out_channels, self.modes1, self.modes2) * (1 / (in_channels * out_channels))
        ))
        self.weights2 = nn.Parameter(torch.complex(
            torch.randn(in_channels, out_channels, self.modes1, self.modes2) * (1 / (in_channels * out_channels)),
            torch.randn(in_channels, out_channels, self.modes1, self.modes2) * (1 / (in_channels * out_channels))
        ))

    def compl_mul2d(self, input, weights):
        # Multiply complex tensor and complex weights
        return torch.einsum("bixy,ioxy->boxy", input, weights)

    def forward(self, x):
        batchsize = x.shape[0]
        # 1. Transform input to Fourier domain (Fast Fourier Transform)
        x_ft = torch.fft.rfft2(x)

        # 2. Filter high frequencies (keep only self.modes1, self.modes2 modes)
        out_ft = torch.zeros([batchsize, self.out_channels, x_ft.shape[-2], x_ft.shape[-1]], dtype=torch.cfloat, device=x.device)
        
        # Multiply filtered modes with complex weight parameters
        out_ft[:, :, :self.modes1, :self.modes2] = \
            self.compl_mul2d(x_ft[:, :, :self.modes1, :self.modes2], self.weights1)
        out_ft[:, :, -self.modes1:, :self.modes2] = \
            self.compl_mul2d(x_ft[:, :, -self.modes1:, :self.modes2], self.weights2)

        # 3. Transform back to physical space (Inverse Fast Fourier Transform)
        x = torch.fft.irfft2(out_ft, s=(x.size(-2), x.size(-1)))
        return x

class FNO2d(nn.Module):
    """
    2D Fourier Neural Operator (FNO) model.
    Maps spatial inputs to outputs using spectral convolutions.
    """
    def __init__(self, modes1=12, modes2=12, width=32):
        super(FNO2d, self).__init__()
        self.modes1 = modes1
        self.modes2 = modes2
        self.width = width

        # Input mapping (5 input variables: Temp, Humid, Wind U, Wind V, Pressure)
        self.fc0 = nn.Linear(5, self.width)

        # Spectral Convolution layers
        self.conv0 = SpectralConv2d(self.width, self.width, self.modes1, self.modes2)
        self.conv1 = SpectralConv2d(self.width, self.width, self.modes1, self.modes2)
        self.conv2 = SpectralConv2d(self.width, self.width, self.modes1, self.modes2)
        
        # Identity shortcuts
        self.w0 = nn.Conv2d(self.width, self.width, 1)
        self.w1 = nn.Conv2d(self.width, self.width, 1)
        self.w2 = nn.Conv2d(self.width, self.width, 1)

        # Output projection layers
        self.fc1 = nn.Linear(self.width, 128)
        self.fc2 = nn.Linear(128, 5) # 5 predicted output fields

    def forward(self, x):
        # Shape: [batch, height, width, channels]
        x = self.fc0(x)
        x = x.permute(0, 3, 1, 2) # [batch, channels, height, width]

        # Conv Block 0
        x1 = self.conv0(x)
        x2 = self.w0(x)
        x = torch.relu(x1 + x2)

        # Conv Block 1
        x1 = self.conv1(x)
        x2 = self.w1(x)
        x = torch.relu(x1 + x2)

        # Conv Block 2
        x1 = self.conv2(x)
        x2 = self.w2(x)
        x = x1 + x2

        x = x.permute(0, 2, 3, 1) # [batch, height, width, channels]
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def train_model(epochs=5, learning_rate=0.001, physics_weight=0.75):
    """
    Trains the FNO surrogate using both data fidelity and 
    Navier-Stokes fluid dynamics constraints (PINN loss).
    Saves the optimized model weights to a local checkpoint.
    """
    print("\n[Train] Starting Physics-Informed FNO training loop...")
    
    # 1. Load data
    tensor, stats, lats, lons = load_climate_tensor(n_timesteps=40)
    
    # Create input-target pairs (predict next timestep state)
    inputs = tensor[:-1] # timesteps 0 to T-1
    targets = tensor[1:] # timesteps 1 to T
    
    # 2. Instantiate Model, Loss function and Optimizer
    model = FNO2d(modes1=12, modes2=12, width=32)
    loss_fn = ClimatePhysicsLoss(physics_weight=physics_weight)
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    model.train()
    
    batch_size = 2
    n_samples = inputs.shape[0]
    
    t0 = time.time()
    for epoch in range(1, epochs + 1):
        epoch_loss = 0.0
        epoch_data_loss = 0.0
        epoch_momentum_loss = 0.0
        
        # Simple mini-batch training
        permutation = torch.randperm(n_samples)
        for i in range(0, n_samples, batch_size):
            indices = permutation[i:i+batch_size]
            batch_x = inputs[indices]
            batch_y = targets[indices]
            
            optimizer.zero_grad()
            
            # Forward pass
            pred = model(batch_x)
            
            # Compute PINN losses
            loss_dict = loss_fn(pred, batch_y)
            loss = loss_dict["total_loss"]
            
            # Backward pass and optimization step
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item() * len(indices)
            epoch_data_loss += loss_dict["data_loss"].item() * len(indices)
            epoch_momentum_loss += loss_dict["momentum_loss"].item() * len(indices)
            
        epoch_loss /= n_samples
        epoch_data_loss /= n_samples
        epoch_momentum_loss /= n_samples
        
        print(f"  Epoch {epoch:02d}/{epochs:02d} | "
              f"Total Loss: {epoch_loss:.6f} | "
              f"Data MSE: {epoch_data_loss:.6f} | "
              f"Physics NS: {epoch_momentum_loss:.6f}")
              
    elapsed = time.time() - t0
    print(f"[Train] Training completed in {elapsed:.2f}s.")
    
    # Save checkpoint
    checkpoint_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fno_monsoon_checkpoint.pt")
    torch.save(model.state_dict(), checkpoint_path)
    print(f"[Train] Model weights successfully saved to: {checkpoint_path}")

if __name__ == "__main__":
    train_model(epochs=5, learning_rate=0.001, physics_weight=0.75)
