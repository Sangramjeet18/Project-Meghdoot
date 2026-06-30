"""
AI-Powered Digital Twin of India's Climate
ISRO Hackathon 2026 — Problem Statement 5

Backend Python Package
======================

Modules:
    physics_loss      — Layer 1: Navier-Stokes & Mass Conservation PINN Loss
    data_pipeline     — Layer 2: Satellite Data Ingestion + Kriging Imputation
    surrogate_engine  — Layer 3: FNO Surrogate + Deep Ensemble Confidence
    api_bridge        — Layer 4: Dashboard API Integration Bridge
    app               — Master application entry point (ClimateTwin class)
"""

from .physics_loss import (
    ClimatePhysicsLoss,
    DivergenceFreeProjection,
    antigravity_accelerate,
)

from .data_pipeline import (
    load_climate_tensor,
    generate_mock_satellite_data,
    kriging_impute_nans,
    INDIA_BOUNDS,
    N_LAT,
    N_LON,
)

from .surrogate_engine import (
    FastFNOSurrogate,
    DeepEnsembleEstimator,
    predict_climate_state,
)

from .api_bridge import run_simulation

__version__ = "1.0.0"
__author__ = "Climate Twin Team"
