from pydantic import BaseModel
from typing import List, Optional

class BottleneckItem(BaseModel):
    id: str
    category: str  # Severe Overload, Task Delay / Backlog, Skill Shortage, Quality Defect Loop, Burnout Surge
    severity: str  # Critical, High, Medium, Low
    title: str
    department: str
    affected_count: int
    affected_entities: List[str]  # Employee names or IDs or skills
    description: str
    root_cause: str
    impact_metrics: str
    estimated_weekly_loss_hours: float
    recommended_action: str

class BottleneckSummaryResponse(BaseModel):
    total_bottlenecks: int
    critical_count: int
    high_count: int
    medium_count: int
    estimated_total_loss_hours: float
    bottlenecks: List[BottleneckItem]
