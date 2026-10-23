from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...core.database import get_db
from ...schemas.anomaly import AnomalyResponse
from ...services.anomaly_service import detect_workforce_anomalies

router = APIRouter()

@router.get("", response_model=AnomalyResponse)
def get_anomalies(
    week_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return detect_workforce_anomalies(db, week_id=week_id, department_filter=department)
