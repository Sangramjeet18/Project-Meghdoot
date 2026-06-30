"""
=================================================================
Scenario Simulator Engine - FNO Surrogate Inference Entry Point
Phase 3: Receives modifier parameters from Express server, 
runs FNO inference using PyTorch and xarray pipeline, 
calculates Navier-Stokes constraints, and outputs JSON grids.
=================================================================
"""

import os
import sys
import argparse
import time
import json

# Ensure parent directory of model or current directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api_bridge import run_simulation

def main():
    """
    Main entry point invoked by the Express server.
    Parses parameters, runs the real PyTorch FNO model, and saves the output.
    """
    parser = argparse.ArgumentParser(description="FNO Surrogate Model Inference Entry Point")
    parser.add_argument("--physics_weight", type=float, default=0.75)
    parser.add_argument("--ocean_heat", type=float, default=1.2)
    parser.add_argument("--greenspace", type=float, default=90.0)
    parser.add_argument("--aerosol", type=float, default=30.0)
    
    args = parser.parse_args()
    
    # 1. Map arguments to the parameters dictionary expected by the api_bridge
    params = {
        "physics": args.physics_weight,
        "ocean_heat": args.ocean_heat,
        "ndvi": args.greenspace,
        "aerosol": args.aerosol
    }
    
    start_time = time.time()
    
    # 2. Run the real physics-informed FNO simulation
    print(f"Executing real PyTorch FNO surrogate simulation...")
    result = run_simulation(params)
    
    inference_time = time.time() - start_time
    
    # 3. Ensure the JSON output contains correct metadata for both UI and logging
    result["metadata"]["inference_time_seconds"] = round(inference_time, 4)
    
    # 4. Save output to JSON file for backend query loading
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "simulation_output.json")
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)
        
    print(f"SUCCESS: FNO Surrogate simulation completed successfully.")
    print(f"Inference Time: {inference_time:.4f} seconds.")
    print(f"Output saved to {output_path}")

if __name__ == "__main__":
    main()
