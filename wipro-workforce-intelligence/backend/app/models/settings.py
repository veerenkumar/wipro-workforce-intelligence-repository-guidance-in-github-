from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from ..core.database import Base

class SystemSettingsModel(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    # Productivity scoring weights (sum up to 1.0)
    weight_task_completion = Column(Float, default=0.35)
    weight_quality = Column(Float, default=0.25)
    weight_csat = Column(Float, default=0.20)
    weight_adherence = Column(Float, default=0.20)

    # Workload ratio thresholds
    threshold_underutilized = Column(Float, default=0.80)
    threshold_optimal_max = Column(Float, default=1.15)
    threshold_overload_warning = Column(Float, default=1.25)
    threshold_critical_burnout = Column(Float, default=1.40)

    # Privacy controls
    anonymize_employee_data = Column(Boolean, default=False)
    mask_salary_or_sensitive = Column(Boolean, default=True)

    # Operational settings
    auto_trigger_optimizer = Column(Boolean, default=False)
    anomaly_sensitivity = Column(Float, default=0.08)  # contamination factor for Isolation Forest

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
