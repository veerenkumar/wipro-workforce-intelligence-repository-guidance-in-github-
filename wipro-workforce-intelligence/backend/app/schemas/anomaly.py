from pydantic import BaseModel
from typing import List, Optional

class AnomalyRecord(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    department: str
    role: str
    week_id: str
    anomaly_score: float  # Normalized anomaly severity (0 to 100)
    anomaly_type: str  # Overtime-Quality Decoupling, Phantom Backlog Spike, Absenteeism Surge, Underutilization Drop
    detected_features: List[str]
    explanation: str
    suggested_investigation: str

class AnomalyResponse(BaseModel):
    total_anomalies: int
    contamination_rate: float
    high_severity_count: int
    anomalies_by_department: dict
    anomalies: List[AnomalyRecord]
