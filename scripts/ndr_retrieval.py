
import requests
import json

# NDR_ENGINEERING_PROTOCOL v2.1
# Auth: Sovereign Data Engineer
NDR_API_KEY = "YOUR_NDR_API_KEY_HERE"
BASE_URL = "https://ndr.nstauthority.co.uk/api/v1"

def fetch_well_artifact(well_identifier):
    """
    Ingests well-header and casing data from NSTA NDR.
    Targeting Geodetic Shifts and Metallurgy Specs for Sovereign Five assets.
    """
    headers = {
        "Authorization": f"Bearer {NDR_API_KEY}",
        "Content-Type": "application/json",
        "X-ARL-Performance": "0.11ms"
    }
    
    # Query by Well Name or WINS Number
    params = {"query": well_identifier}
    
    try:
        response = requests.get(f"{BASE_URL}/wells/header", params=params, headers=headers)
        
        if response.status_code == 403:
            return {"error": "403_FORBIDDEN: Invalid NDR_API_KEY or expired session."}
        elif response.status_code == 404:
            return {"error": f"404_NOT_FOUND: Asset '{well_identifier}' not in NDR registry."}
        
        response.raise_for_status()
        raw_data = response.json()
        
        # Mapping to Sovereign_Ledger Logic
        mapped_asset = {
            "uwi": raw_data.get("uwi"),
            "planned_td": raw_data.get("planned_depth"),
            "actual_td": raw_data.get("actual_depth"),
            "datum_correction": raw_data.get("geodetic_correction_m", 0.0),
            "casing_grade": raw_data.get("metallurgy_grade", "Unknown"),
            "max_temp": raw_data.get("max_recorded_temp_c"),
            "max_press": raw_data.get("max_recorded_press_psi")
        }
        
        return mapped_asset

    except requests.exceptions.RequestException as e:
        return {"error": f"SYSTEM_CRASH: {str(e)}"}

# Example Usage:
# harris_data = fetch_well_artifact("Harris H1")
# print(json.dumps(harris_data, indent=2))
