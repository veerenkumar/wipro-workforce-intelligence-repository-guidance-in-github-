from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...core.database import get_db
from ...schemas.bottleneck import BottleneckSummaryResponse
from ...services.bottleneck_service import detect_operational_bottlenecks

router = APIRouter()

@router.get("", response_model=BottleneckSummaryResponse)
def get_bottlenecks(
    week_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return detect_operational_bottlenecks(db, week_id=week_id, department=department)
