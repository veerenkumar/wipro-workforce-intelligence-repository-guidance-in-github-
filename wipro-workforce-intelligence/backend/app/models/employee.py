from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from ..core.database import Base

class EmployeeRecord(Base):
    __tablename__ = "employee_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True)
    name = Column(String)
    role = Column(String, index=True)
    department = Column(String, index=True)
    experience_years = Column(Float)
    weekly_capacity_hours = Column(Float, default=40.0)
    logged_hours = Column(Float)
    completed_tasks = Column(Integer)
    assigned_tasks = Column(Integer)
    backlog_tasks = Column(Integer)
    quality_rework_rate = Column(Float)
    client_csat = Column(Float)
    overtime_hours = Column(Float)
    absenteeism_days = Column(Float)
    skills = Column(String)  # Comma-separated skills
    week_id = Column(String, index=True)  # e.g., "2026-W38"
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Derived computed scores stored for quick querying & caching
    productivity_score = Column(Float, nullable=True)
    workload_ratio = Column(Float, nullable=True)
    status_category = Column(String, default="Balanced")  # Balanced, Overloaded, Underutilized, Burnout Risk
