from pydantic import BaseModel
from typing import List, Dict, Optional

class TaskInput(BaseModel):
    task_id: str
    title: str
    required_skill: str
    estimated_hours: float
    priority: int  # 1 (Highest) to 5
    deadline_days: int

class EmployeeCandidate(BaseModel):
    employee_id: str
    name: str
    department: str
    skills: List[str]
    current_logged_hours: float
    weekly_capacity_hours: float
    current_workload_ratio: float

class TaskAssignment(BaseModel):
    task_id: str
    task_title: str
    assigned_employee_id: str
    assigned_employee_name: str
    required_skill: str
    allocated_hours: float
    priority: int
    match_status: str

class EngineerWorkloadShift(BaseModel):
    employee_id: str
    name: str
    initial_hours: float
    initial_workload_ratio: float
    added_hours: float
    optimized_hours: float
    optimized_workload_ratio: float
    status_before: str
    status_after: str

class OptimizationRequest(BaseModel):
    department: Optional[str] = None
    max_workload_threshold: float = 1.15
    balance_weights: float = 0.5  # Weight for variance balancing vs priority fulfillment

class OptimizationResponse(BaseModel):
    status: str
    solver_message: str
    total_tasks_assigned: int
    unassigned_tasks_count: int
    avg_workload_ratio_before: float
    avg_workload_ratio_after: float
    workload_variance_reduction_percent: float
    assignments: List[TaskAssignment]
    workload_shifts: List[EngineerWorkloadShift]
