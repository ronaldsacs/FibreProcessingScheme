# This module acts as the Paper Tech & R&D Engineer, calculating sizes dynamically.

def calculate_pulper_size(adt_per_day: int, consistency: float, retention_hours: float) -> dict:
    """
    Calculates Pulper Volume and recommends OEM equipment.
    """
    # Calculate Volume in m³
    volume_m3 = (adt_per_day * 1000 / 24) / (consistency * 1000) * retention_hours
    
    # Calculate Flow rate for downstream equipment
    flow_m3h = (adt_per_day * 1000 / 24) / (consistency * 1000)
    
    return {
        "category": "Pulper",
        "calculated_volume_m3": round(volume_m3, 2),
        "downstream_flow_m3h": round(flow_m3h, 2),
        "recommended_oems": [
            {"oem": "Andritz", "model": "FibreFlow Drum Pulper", "type": "Drum (Low Consistency)"},
            {"oem": "Voith", "model": "IntensaMaule Pulper", "type": "Batch HiCon"}
        ]
    }

def calculate_screen_size(flow_m3h: float, contamination_level: int) -> dict:
    """
    Calculates Screening area based on flow and contamination.
    """
    # Higher contamination reduces capacity rate (m³/m²/hr)
    base_capacity_rate = 45.0
    adjusted_capacity_rate = base_capacity_rate - (contamination_level * 2.5)
    
    screen_area_m2 = flow_m3h / adjusted_capacity_rate
    
    return {
        "category": "Pressure Screen",
        "calculated_area_m2": round(screen_area_m2, 2),
        "adjusted_capacity_rate": round(adjusted_capacity_rate, 2),
        "recommended_oems": [
            {"oem": "Kadant", "model": "Pressure Screen PSV"},
            {"oem": "Andritz", "model": "ModuScreen C4"}
        ]
    }

def generate_scheme(tier: str, adt: int, contamination: dict) -> dict:
    """
    Generates the complete equipment list and PFD topology based on Tier.
    """
    equipment_list = []
    nodes = []
    edges = []
    
    # 1. Pulper Sizing
    if tier == "Basic":
        pulper = calculate_pulper_size(adt, consistency=0.045, retention_hours=1.0)
    elif tier == "Essential":
        pulper = calculate_pulper_size(adt, consistency=0.08, retention_hours=1.5)
    else: # Full-Fledged
        pulper = calculate_pulper_size(adt, consistency=0.08, retention_hours=2.0)
        
    equipment_list.append(pulper)
    nodes.append({"id": "n1", "data": {"label": f"Pulper\n{pulper['calculated_volume_m3']} m³"}, "position": {"x": 0, "y": 100}})
    
    # 2. Screening Sizing
    screen = calculate_screen_size(pulper["downstream_flow_m3h"], contamination["stickies"])
    equipment_list.append(screen)
    nodes.append({"id": "n2", "data": {"label": f"Screen\n{screen['calculated_area_m2']} m²"}, "position": {"x": 250, "y": 100}})
    
    edges.append({"id": "e1-2", "source": "n1", "target": "n2", "label": "Stock"})
    
    # 3. Storage Tower (Simplified for MVP)
    tower_volume = pulper["downstream_flow_m3h"] * 8 # 8 hours retention
    equipment_list.append({"category": "Storage Tower", "calculated_volume_m3": round(tower_volume, 2)})
    nodes.append({"id": "n3", "data": {"label": f"Machine Chest\n{round(tower_volume, 2)} m³"}, "position": {"x": 500, "y": 100}})
    edges.append({"id": "e2-3", "source": "n2", "target": "n3", "label": "Accepts"})

    # Add Reject Handling for Full-Fledged
    if tier == "Full-Fledged":
        equipment_list.append({"category": "Reject Handling System", "type": "Screw Press + Compactor"})
        nodes.append({"id": "n4", "data": {"label": "RHS\nScrew Press"}, "position": {"x": 250, "y": 250}})
        edges.append({"id": "e2-4", "source": "n2", "target": "n4", "label": "Rejects", "animated": True})

    return {
        "equipment_list": equipment_list,
        "pfd_topology": {"nodes": nodes, "edges": edges}
    }
