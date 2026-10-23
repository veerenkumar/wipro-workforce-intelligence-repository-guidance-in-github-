from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecommendationBase(BaseModel):
    title: str
    category: str
    target_type: str
    target_name: str
    priority: str
    description: str
    evidence: str
    projected_impact: str
    effort_estimate: str
    notes: Optional[str] = None

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationUpdate(BaseModel):
    status: Optional[str] = None  # PENDING, APPROVED, REJECTED, COMPLETED
    notes: Optional[str] = None

class RecommendationResponse(RecommendationBase):
    id: int
    rec_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
