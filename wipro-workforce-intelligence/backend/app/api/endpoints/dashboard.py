from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...core.database import get_db
from ...schemas.analytics import AnalyticsDashboardResponse
from ...services.analytics_service import get_analytics_dashboard

router = APIRouter()

@router.get("/summary", response_model=AnalyticsDashboardResponse)
def get_dashboard_summary(
    week_id: Optional[str] = Query(None, description="Sprint week ID e.g. 2026-W39"),
    department: Optional[str] = Query(None, description="Department name"),
    db: Session = Depends(get_db)
):
    return get_analytics_dashboard(db, week_id=week_id, department=department)
