from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from ..core.database import Base

class RecommendationModel(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    rec_id = Column(String, unique=True, index=True)
    title = Column(String)
    category = Column(String, index=True)  # Workload Rebalance, Skill Augmentation, Quality Gate, Wellbeing, Capacity
    target_type = Column(String)  # Department, Employee, Project
    target_name = Column(String)
    priority = Column(String)  # High, Critical, Medium, Low
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED, COMPLETED
    description = Column(Text)
    evidence = Column(Text)  # Quantitative signals backing this
    projected_impact = Column(String)  # e.g., "+14% Throughput, -22% Overtime"
    effort_estimate = Column(String)  # e.g., "1-2 sprints", "Immediate"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)
