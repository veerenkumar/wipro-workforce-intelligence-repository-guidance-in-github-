from fastapi import APIRouter, Depends, Query, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Optional, List
from ...core.database import get_db
from ...schemas.recommendation import (
    RecommendationResponse, RecommendationCreate, RecommendationUpdate
)
from ...services.recommendation_service import (
    get_all_recommendations, update_recommendation_status, create_recommendation
)

router = APIRouter()

@router.get("", response_model=List[RecommendationResponse])
def list_recommendations(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_all_recommendations(db, status=status, priority=priority, category=category)

@router.post("", response_model=RecommendationResponse)
def add_recommendation(
    data: RecommendationCreate,
    db: Session = Depends(get_db)
):
    return create_recommendation(db, data)

@router.patch("/{rec_id}", response_model=RecommendationResponse)
def update_status(
    rec_id: str = Path(..., description="Recommendation unique ID"),
    update_data: RecommendationUpdate = None,
    db: Session = Depends(get_db)
):
    updated = update_recommendation_status(db, rec_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Recommendation '{rec_id}' not found.")
    return updated
