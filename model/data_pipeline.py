"""
=================================================================
LAYER 2: MOCK DATA STREAM & SATELLITE INPUT PIPELINE
Xarray-Based Multi-Dimensional Climate Data Loader with
Spatial Kriging Interpolation for NaN Imputation
=================================================================

This module provides:
  1. A synthetic NetCDF-like data generator mimicking ISRO MOSDAC/VEDAS
     satellite feeds over the Indian subcontinent bounding box.
  2. A localized spatial kriging interpolation engine to fill NaN gaps
     caused by cloud-cover blockages in real satellite imagery.
  3. Conversion utilities from xarray Datasets to normalized PyTorch
     tensors ready for FNO surrogate model consumption.

Bounding Box:
    Latitude:  8.0 N to 38.0 N  (Indian subcontinent)
    Longitude: 68.0 E to 98.0 E

Variables (5 channels):
    0: Temperature (T)        [Kelvin]
    1: Specific Humidity (q)  [kg/kg]
    2: Zonal Wind (u)         [m/s]
    3: Meridional Wind (v)    [m/s]
    4: Surface Pressure (p)   [hPa]
=================================================================
"""

import numpy as np
import torch

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Constants
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INDIA_BOUNDS = {
    "lat_min": 8.0,
    "lat_max": 38.0,
    "lon_min": 68.0,
    "lon_max": 98.0,
}

GRID_RESOLUTION = 0.5   # degrees (approx 55 km)
N_LAT = int((INDIA_BOUNDS["lat_max"] - INDIA_BOUNDS["lat_min"]) / GRID_RESOLUTION)  # 60
N_LON = int((INDIA_BOUNDS["lon_max"] - INDIA_BOUNDS["lon_min"]) / GRID_RESOLUTION)  # 60
N_VARIABLES = 5
VARIABLE_NAMES = ["temperature", "humidity", "wind_u", "wind_v", "pressure"]

# Physical baseline ranges for each variable (used for generation & normalization)
VARIABLE_BASELINES = {
    "temperature": {"mean": 300.0, "std": 8.0, "unit": "K"},
    "humidity":    {"mean": 0.012, "std": 0.005, "unit": "kg/kg"},
    "wind_u":      {"mean": 2.0,   "std": 4.0, "unit": "m/s"},
    "wind_v":      {"mean": -1.5,  "std": 3.5, "unit": "m/s"},
    "pressure":    {"mean": 1013.0, "std": 8.0, "unit": "hPa"},
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Synthetic Satellite Data Generator
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_mock_satellite_data(
    n_timesteps: int = 30,
    nan_fraction: float = 0.08,
    seed: int = 42,
):
    """
    Generates a synthetic multi-dimensional climate dataset mimicking
    ISRO MOSDAC INSAT-3D / Scatsat-1 / Oceansat satellite observations.

    The data includes realistic spatial patterns:
      - Temperature decreases with latitude (cooler in the Himalayas)
      - Humidity is higher along the Western Ghats and NE India
      - Monsoon winds blow from the southwest
      - Pressure follows standard ISA with terrain effects

    NaN values are injected to simulate real cloud-cover blockages.

    Args:
        n_timesteps:  Number of time steps (days). Default 30.
        nan_fraction: Fraction of grid cells masked as NaN. Default 0.08.
        seed:         Random seed for reproducibility.

    Returns:
        dict with keys:
            'lats':      np.ndarray [N_LAT]
            'lons':      np.ndarray [N_LON]
            'time':      np.ndarray [n_timesteps]
            'data':      np.ndarray [n_timesteps, N_LAT, N_LON, N_VARIABLES]
            'variables': list of variable names
            'metadata':  dict with bounds and resolution info
    """
    rng = np.random.default_rng(seed)

    lats = np.linspace(INDIA_BOUNDS["lat_min"], INDIA_BOUNDS["lat_max"], N_LAT)
    lons = np.linspace(INDIA_BOUNDS["lon_min"], INDIA_BOUNDS["lon_max"], N_LON)
    times = np.arange(n_timesteps)

    lon_grid, lat_grid = np.meshgrid(lons, lats)

    data = np.zeros((n_timesteps, N_LAT, N_LON, N_VARIABLES), dtype=np.float32)

    for t in range(n_timesteps):
        # Channel 0: Temperature -- decreases with latitude, diurnal cycle
        T_base = 310.0 - 0.8 * (lat_grid - 8.0) + 2.0 * np.sin(2.0 * np.pi * t / 30.0)
        data[t, :, :, 0] = T_base + rng.normal(0, 1.5, (N_LAT, N_LON))

        # Channel 1: Humidity -- higher on Western Ghats and NE India
        wg_boost = 0.008 * np.exp(-((lon_grid - 74.0) ** 2) / 8.0) * (lat_grid < 20.0)
        ne_boost = 0.006 * np.exp(-((lon_grid - 92.0) ** 2 + (lat_grid - 25.0) ** 2) / 20.0)
        data[t, :, :, 1] = 0.010 + wg_boost + ne_boost + rng.normal(0, 0.002, (N_LAT, N_LON))
        data[t, :, :, 1] = np.clip(data[t, :, :, 1], 0.001, 0.030)

        # Channel 2: Zonal Wind (u) -- SW monsoon (positive = westerly)
        monsoon_factor = 0.5 + 0.5 * np.sin(2.0 * np.pi * (t + 5) / 30.0)
        data[t, :, :, 2] = 4.0 * monsoon_factor * (1.0 - (lat_grid - 18.0) ** 2 / 400.0)
        data[t, :, :, 2] += rng.normal(0, 1.5, (N_LAT, N_LON))

        # Channel 3: Meridional Wind (v) -- southerly monsoon inflow
        data[t, :, :, 3] = -3.0 * monsoon_factor * np.exp(-((lat_grid - 15.0) ** 2) / 100.0)
        data[t, :, :, 3] += rng.normal(0, 1.0, (N_LAT, N_LON))

        # Channel 4: Pressure -- standard with terrain effects
        terrain = 5.0 * np.exp(-((lon_grid - 78.0) ** 2 + (lat_grid - 32.0) ** 2) / 15.0)
        data[t, :, :, 4] = 1013.0 - 0.12 * lat_grid - terrain + rng.normal(0, 2.0, (N_LAT, N_LON))

    # ── Inject NaN holes (cloud cover blockage) ──
    nan_mask = rng.random((n_timesteps, N_LAT, N_LON)) < nan_fraction
    for ch in range(N_VARIABLES):
        channel_data = data[:, :, :, ch]
        channel_data[nan_mask] = np.nan
        data[:, :, :, ch] = channel_data

    metadata = {
        "bounds": INDIA_BOUNDS,
        "resolution_deg": GRID_RESOLUTION,
        "grid_shape": (N_LAT, N_LON),
        "n_timesteps": n_timesteps,
        "nan_fraction": nan_fraction,
        "source": "Synthetic MOSDAC/VEDAS Simulation",
    }

    return {
        "lats": lats,
        "lons": lons,
        "time": times,
        "data": data,
        "variables": VARIABLE_NAMES,
        "metadata": metadata,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Xarray Dataset Builder
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_xarray_dataset(raw_data: dict):
    """
    Converts the raw numpy data dictionary into a properly structured
    xarray Dataset with named dimensions and coordinate labels.

    This mirrors the format of real ECMWF ERA5 or MOSDAC NetCDF files.

    Args:
        raw_data: Output from generate_mock_satellite_data().

    Returns:
        xarray.Dataset with dimensions (time, latitude, longitude)
        and data variables for each climate field.
    """
    try:
        import xarray as xr
    except ImportError:
        print("[WARNING] xarray not installed. Returning raw dict instead.")
        return raw_data

    data_vars = {}
    for i, var_name in enumerate(raw_data["variables"]):
        data_vars[var_name] = (
            ["time", "latitude", "longitude"],
            raw_data["data"][:, :, :, i],
        )

    ds = xr.Dataset(
        data_vars,
        coords={
            "time": raw_data["time"],
            "latitude": raw_data["lats"],
            "longitude": raw_data["lons"],
        },
        attrs=raw_data["metadata"],
    )
    return ds


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Spatial Kriging NaN Imputation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def kriging_impute_nans(data, kernel_size: int = 5):
    """
    Fills NaN gaps in multi-dimensional climate grids using localized
    spatial kriging interpolation. This simulates the standard approach
    for cleaning cloud-cover blockages in real MOSDAC satellite feeds.

    The algorithm uses an iterative Gaussian-weighted spatial average
    of neighboring valid pixels. It converges to a smooth interpolation
    that respects the local spatial autocorrelation structure.

    Args:
        data: np.ndarray of shape [T, H, W, C] with NaN holes.
        kernel_size: Diameter of the local kriging neighborhood.
                     Must be odd. Default 5 (2-pixel radius).

    Returns:
        np.ndarray of shape [T, H, W, C] with all NaN values filled.
    """
    assert kernel_size % 2 == 1, f"kernel_size must be odd, got {kernel_size}"
    assert data.ndim == 4, f"Expected 4D array [T, H, W, C], got {data.ndim}D"

    result = data.copy()
    T, H, W, C = result.shape
    radius = kernel_size // 2

    # Build Gaussian weight kernel
    y_offsets, x_offsets = np.mgrid[-radius:radius+1, -radius:radius+1]
    sigma = radius / 2.0
    gaussian_kernel = np.exp(-(x_offsets ** 2 + y_offsets ** 2) / (2 * sigma ** 2))

    # Iteratively fill NaNs (max 3 passes for convergence)
    for iteration in range(3):
        nan_count_before = np.isnan(result).sum()
        if nan_count_before == 0:
            break

        for ch in range(C):
            for t in range(T):
                field = result[t, :, :, ch]
                nan_mask = np.isnan(field)

                if not nan_mask.any():
                    continue

                # Pad the field for boundary handling
                padded = np.pad(field, radius, mode="reflect")
                padded_valid = np.pad(
                    (~nan_mask).astype(np.float32), radius, mode="constant",
                    constant_values=0.0,
                )

                nan_indices = np.argwhere(nan_mask)
                for idx in nan_indices:
                    iy, ix = idx
                    py, px = iy + radius, ix + radius

                    # Extract local neighborhood
                    neighborhood = padded[py - radius:py + radius + 1,
                                          px - radius:px + radius + 1]
                    valid_mask = padded_valid[py - radius:py + radius + 1,
                                             px - radius:px + radius + 1]

                    # Weighted average of valid neighbors
                    weights = gaussian_kernel * valid_mask
                    weight_sum = weights.sum()

                    if weight_sum > 0:
                        interpolated = np.nansum(neighborhood * weights) / weight_sum
                        result[t, iy, ix, ch] = interpolated

        nan_count_after = np.isnan(result).sum()
        if nan_count_after == nan_count_before:
            # No more progress possible; fill remaining with channel mean
            for ch in range(C):
                ch_mean = np.nanmean(result[:, :, :, ch])
                result[:, :, :, ch] = np.where(
                    np.isnan(result[:, :, :, ch]), ch_mean, result[:, :, :, ch]
                )
            break

    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Normalization & Tensor Conversion
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def normalize_and_tensorize(data, return_stats: bool = False):
    """
    Z-score normalizes each variable channel independently and converts
    the numpy array to a PyTorch float32 tensor.

    Args:
        data: np.ndarray of shape [T, H, W, C], NaN-free.
        return_stats: If True, also return the (mean, std) per channel.

    Returns:
        torch.Tensor of shape [T, H, W, C] (float32)
        Optionally: (tensor, stats_dict)
    """
    assert data.ndim == 4, f"Expected 4D array, got {data.ndim}D"
    assert not np.isnan(data).any(), "Data contains NaN -- run kriging_impute_nans first"

    T, H, W, C = data.shape
    normalized = np.zeros_like(data)
    stats = {}

    for ch in range(C):
        ch_data = data[:, :, :, ch]
        mu = ch_data.mean()
        sigma = ch_data.std() + 1e-8  # avoid div-by-zero
        normalized[:, :, :, ch] = (ch_data - mu) / sigma
        stats[VARIABLE_NAMES[ch]] = {"mean": float(mu), "std": float(sigma)}

    tensor = torch.from_numpy(normalized).float()

    # Shape assertion
    assert tensor.shape == (T, H, W, C), (
        f"Output shape mismatch: expected ({T}, {H}, {W}, {C}), got {tensor.shape}"
    )

    if return_stats:
        return tensor, stats
    return tensor


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Full Pipeline: Load -> Impute -> Normalize -> Tensorize
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def load_climate_tensor(
    n_timesteps: int = 30,
    nan_fraction: float = 0.08,
    seed: int = 42,
):
    """
    End-to-end pipeline: generate synthetic satellite data, impute NaN
    gaps via kriging, normalize, and return a training-ready tensor.

    Args:
        n_timesteps:  Number of temporal samples.
        nan_fraction: Cloud-cover NaN fraction.
        seed:         Random seed.

    Returns:
        Tuple of:
            tensor: torch.Tensor [T, H, W, 5]
            stats:  dict of per-channel normalization statistics
            lats:   np.ndarray [H]
            lons:   np.ndarray [W]
    """
    # 1. Generate mock satellite data
    raw = generate_mock_satellite_data(n_timesteps, nan_fraction, seed)

    # 2. Report NaN statistics
    nan_count = np.isnan(raw["data"]).sum()
    total_cells = raw["data"].size
    print(f"  [Pipeline] Generated {n_timesteps} timesteps on "
          f"{N_LAT}x{N_LON} grid ({N_VARIABLES} vars)")
    print(f"  [Pipeline] NaN cells: {nan_count}/{total_cells} "
          f"({100.0 * nan_count / total_cells:.1f}%)")

    # 3. Impute NaN holes via spatial kriging
    clean_data = kriging_impute_nans(raw["data"], kernel_size=5)
    remaining_nans = np.isnan(clean_data).sum()
    print(f"  [Pipeline] After kriging imputation: {remaining_nans} NaNs remaining")

    # 4. Normalize and convert to tensor
    tensor, stats = normalize_and_tensorize(clean_data, return_stats=True)
    print(f"  [Pipeline] Output tensor shape: {tensor.shape} (dtype={tensor.dtype})")

    return tensor, stats, raw["lats"], raw["lons"]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Module Self-Test
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    print("=" * 65)
    print("  LAYER 2: Data Pipeline Self-Test")
    print("=" * 65)

    tensor, stats, lats, lons = load_climate_tensor(
        n_timesteps=30, nan_fraction=0.10, seed=2026
    )

    print(f"\n  Normalization Statistics:")
    for var_name, s in stats.items():
        print(f"    {var_name:15s}: mean={s['mean']:10.4f}  std={s['std']:8.4f}")

    print(f"\n  Latitude range:  [{lats[0]:.1f}, {lats[-1]:.1f}]")
    print(f"  Longitude range: [{lons[0]:.1f}, {lons[-1]:.1f}]")
    print(f"  Tensor min/max:  [{tensor.min().item():.3f}, {tensor.max().item():.3f}]")
    print(f"\n  [OK] Layer 2 verification complete.")
