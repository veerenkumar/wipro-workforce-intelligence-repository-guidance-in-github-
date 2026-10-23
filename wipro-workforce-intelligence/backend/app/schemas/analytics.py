from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    role: str
    department: str
    experience_years: float
    weekly_capacity_hours: float
    logged_hours: float
    completed_tasks: int
    assigned_tasks: int
    backlog_tasks: int
    quality_rework_rate: float
    client_csat: float
    overtime_hours: float
    absenteeism_days: float
    skills: str
    week_id: str

class EmployeeDetail(EmployeeBase):
    id: Optional[int] = None
    productivity_score: float
    workload_ratio: float
    status_category: str

class KPISummary(BaseModel):
    avg_productivity_score: float
    avg_workload_ratio: float
    total_active_workforce: int
    total_logged_hours: float
    total_capacity_hours: float
    total_overtime_hours: float
    avg_absenteeism_days: float
    task_completion_rate: float
    avg_quality_score: float
    avg_client_csat: float
    overloaded_count: int
    underutilized_count: int
    optimal_count: int
    burnout_risk_count: int
    operational_alert_level: str  # Normal, Moderate, Elevated, Critical

class TrendPoint(BaseModel):
    week_id: str
    productivity: float
    workload_ratio: float
    overtime_hours: float
    task_completion_rate: float
    rework_rate: float
    csat: float

class DepartmentMetric(BaseModel):
    department: str
    employee_count: int
    avg_productivity: float
    avg_workload_ratio: float
    total_overtime: float
    avg_csat: float
    rework_rate: float
    status: str

class RoleDistribution(BaseModel):
    role: str
    count: int
    avg_productivity: float
    avg_workload_ratio: float

class AnalyticsDashboardResponse(BaseModel):
    kpis: KPISummary
    weekly_trends: List[TrendPoint]
    department_metrics: List[DepartmentMetric]
    role_distribution: List[RoleDistribution]
    workload_distribution: Dict[str, int]
    top_performers: List[EmployeeDetail]
    at_risk_employees: List[EmployeeDetail]
