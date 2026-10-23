from pydantic import BaseModel, Field
from typing import Optional

class SystemSettingsSchema(BaseModel):
    weight_task_completion: float = Field(0.35, ge=0.0, le=1.0)
    weight_quality: float = Field(0.25, ge=0.0, le=1.0)
    weight_csat: float = Field(0.20, ge=0.0, le=1.0)
    weight_adherence: float = Field(0.20, ge=0.0, le=1.0)

    threshold_underutilized: float = Field(0.80, ge=0.0, le=1.5)
    threshold_optimal_max: float = Field(1.15, ge=0.8, le=2.0)
    threshold_overload_warning: float = Field(1.25, ge=1.0, le=2.5)
    threshold_critical_burnout: float = Field(1.40, ge=1.1, le=3.0)

    anonymize_employee_data: bool = False
    mask_salary_or_sensitive: bool = True
    auto_trigger_optimizer: bool = False
    anomaly_sensitivity: float = Field(0.08, ge=0.01, le=0.25)
