from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...core.database import get_db
from ...schemas.forecasting import ForecastingResponse
from ...services.forecasting_service import train_and_forecast_productivity

router = APIRouter()

@router.get("", response_model=ForecastingResponse)
def get_productivity_forecast(
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return train_and_forecast_productivity(db, department_filter=department)
