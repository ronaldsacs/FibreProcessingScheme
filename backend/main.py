from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uuid

from database import get_db
from models import UserProject, GeneratedScheme
from sizing_engine import generate_scheme

app = FastAPI(title="OCC Mill Sizer API")

# Pydantic Models for Input
class ProjectInput(BaseModel):
    project_name: str
    target_capacity_adt: int
    tier: str # "Basic", "Essential", "Full-Fledged"
    contamination: dict # e.g., {"metals": 5, "plastics": 6, "stickies": 8, "ash": 4}

@app.post("/api/projects/generate")
def create_and_generate_scheme(input_data: ProjectInput, db: Session = Depends(get_db)):
    # 1. Create Project
    new_project = UserProject(
        project_name=input_data.project_name,
        target_capacity_adt=input_data.target_capacity_adt
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # 2. Run Calculation Engine
    scheme_data = generate_scheme(
        tier=input_data.tier,
        adt=input_data.target_capacity_adt,
        contamination=input_data.contamination
    )
    
    # 3. Save Generated Scheme
    new_scheme = GeneratedScheme(
        project_id=new_project.project_id,
        tier=input_data.tier,
        equipment_list_json=scheme_data["equipment_list"],
        pfd_topology_json=scheme_data["pfd_topology"]
    )
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)
    
    return {
        "message": "Scheme generated successfully",
        "project_id": str(new_project.project_id),
        "scheme_id": str(new_scheme.scheme_id),
        "result": scheme_data
    }

# Run the server using: uvicorn main:app --reload
