from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import Dict, Any
from ...core.database import get_db
from ...services.data_service import (
    generate_synthetic_workforce_data, save_synthetic_csv,
    validate_csv_dataframe, load_dataset_into_db
)
from ...models.employee import EmployeeRecord

router = APIRouter()

@router.get("/status")
def get_dataset_status(db: Session = Depends(get_db)):
    total = db.query(EmployeeRecord).count()
    weeks = db.query(EmployeeRecord.week_id).distinct().all()
    depts = db.query(EmployeeRecord.department).distinct().all()
    unique_emps = db.query(EmployeeRecord.employee_id).distinct().count()

    return {
        "is_loaded": total > 0,
        "total_records": total,
        "unique_employees": unique_emps,
        "weeks": sorted([w[0] for w in weeks if w[0]]),
        "departments": sorted([d[0] for d in depts if d[0]])
    }

@router.get("/preview")
def preview_dataset(limit: int = 15, db: Session = Depends(get_db)):
    records = db.query(EmployeeRecord).limit(limit).all()
    return [
        {
            "employee_id": r.employee_id,
            "name": r.name,
            "role": r.role,
            "department": r.department,
            "weekly_capacity": r.weekly_capacity_hours,
            "logged_hours": r.logged_hours,
            "completed_tasks": r.completed_tasks,
            "assigned_tasks": r.assigned_tasks,
            "backlog_tasks": r.backlog_tasks,
            "rework_rate": r.quality_rework_rate,
            "csat": r.client_csat,
            "overtime": r.overtime_hours,
            "absenteeism": r.absenteeism_days,
            "week_id": r.week_id,
            "productivity_score": r.productivity_score,
            "workload_ratio": r.workload_ratio
        }
        for r in records
    ]

@router.post("/generate-synthetic")
def generate_synthetic(
    num_employees: int = 60,
    seed: int = 42,
    db: Session = Depends(get_db)
):
    df = generate_synthetic_workforce_data(num_employees=num_employees, seed=seed)
    save_synthetic_csv(df)
    load_dataset_into_db(df, db, clear_existing=True)
    valid, errors, meta = validate_csv_dataframe(df)

    return {
        "status": "SUCCESS",
        "message": f"Successfully generated {len(df)} synthetic records for {meta['unique_employees']} employees across {len(meta['weeks'])} sprint weeks.",
        "metadata": meta,
        "disclaimer": "This synthetic dataset was generated for workforce simulation & demonstration. It does not represent actual Wipro internal employee records."
    }

@router.post("/upload")
async def upload_csv_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    valid, errors, meta = validate_csv_dataframe(df)
    if not valid:
        raise HTTPException(status_code=422, detail={"errors": errors, "message": "CSV validation failed."})

    load_dataset_into_db(df, db, clear_existing=True)

    return {
        "status": "SUCCESS",
        "message": f"Successfully uploaded and ingested {len(df)} records into SQLite workforce store.",
        "metadata": meta
    }
