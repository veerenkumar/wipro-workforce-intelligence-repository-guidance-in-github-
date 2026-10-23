import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.recommendation import RecommendationModel
from ..schemas.recommendation import (
    RecommendationCreate, RecommendationUpdate, RecommendationResponse
)
from .bottleneck_service import detect_operational_bottlenecks

def seed_default_recommendations_if_empty(db: Session):
    existing = db.query(RecommendationModel).first()
    if existing:
        return

    defaults = [
        RecommendationModel(
            rec_id="REC-WIP-01",
            title="Automated Workload Rebalance for Cloud & Digital Workspace",
            category="Workload Rebalance",
            target_type="Department",
            target_name="Cloud Infrastructure & Digital Workspace",
            priority="Critical",
            status="PENDING",
            description="Redistribute 8 high-urgency Kubernetes & Terraform infrastructure tasks from overloaded senior engineers to qualified mid-level staff with capacity.",
            evidence="Avg workload ratio in Cloud Infrastructure is 1.34x; 4 senior engineers logged >52 hrs last sprint with 18 hrs overtime.",
            projected_impact="-24% Overtime, +15% On-Time Sprint Delivery",
            effort_estimate="Immediate (via OR-Tools Optimizer)",
            notes="Ready for managerial approval and solver deployment."
        ),
        RecommendationModel(
            rec_id="REC-WIP-02",
            title="Enforce Automated SonarQube & Pre-commit Quality Gates",
            category="Quality Gate",
            target_type="Department",
            target_name="Enterprise Applications & SAP",
            priority="High",
            status="APPROVED",
            description="Deploy automated static code analysis and ABAP test cockpit checks in the CI/CD pipeline to intercept defect loops before PR merge.",
            evidence="Quality rework rate in SAP practice reached 22.4%, consuming ~42 engineering hours per week on bug fixes.",
            projected_impact="-18% Defect Rework, +12 pts Productivity Score",
            effort_estimate="1 sprint implementation",
            notes="Approved by Delivery Head. Rollout scheduled for Sprint 39."
        ),
        RecommendationModel(
            rec_id="REC-WIP-03",
            title="Cross-Skill Secondary Specialists in FHIR & Healthcare Cloud",
            category="Skill Augmentation",
            target_type="Department",
            target_name="Healthcare & Life Sciences Digital",
            priority="Medium",
            status="PENDING",
            description="Conduct a 2-week structured pair programming initiative to train 3 backend engineers in FHIR/HL7 standards to eliminate single-point-of-failure dependencies.",
            evidence="Only 1 lead architect currently supports all 4 client FHIR integrations, resulting in a queue bottleneck of 7 delayed tasks.",
            projected_impact="Eliminates single point of failure; reduces task latency by 35%",
            effort_estimate="2 sprints pairing",
            notes="Curriculum ready from Wipro Digital Academy."
        ),
        RecommendationModel(
            rec_id="REC-WIP-04",
            title="Mandate Overtime Cap & Fatigue Recovery for At-Risk Engineers",
            category="Wellbeing",
            target_type="Employee",
            target_name="Critical Overtime Cohort",
            priority="Critical",
            status="PENDING",
            description="Enforce strict 45h/week cap and assign 1 compensatory recovery day for 5 engineers exhibiting sustained overtime >12h and elevated absenteeism.",
            evidence="Absenteeism surged from 0.4 to 2.8 days/sprint among engineers logging over 55 weekly hours.",
            projected_impact="-65% Burnout Attrition Risk, Restores CSAT to >4.5",
            effort_estimate="Immediate policy enforcement",
            notes="HR and resource management alignment needed."
        ),
        RecommendationModel(
            rec_id="REC-WIP-05",
            title="Bench Mobilization for BFSI Payment Gateway Sprint",
            category="Capacity",
            target_type="Department",
            target_name="BFSI Digital Banking & Payments",
            priority="High",
            status="COMPLETED",
            description="Onboard 2 senior Java/Spring Boot engineers from the internal talent cloud to absorb high transaction processing backlog.",
            evidence="BFSI backlog reached 28 tasks ahead of client regulatory compliance deadline.",
            projected_impact="Cleared 100% of regulatory backlog on schedule",
            effort_estimate="Completed in Sprint 37",
            notes="Engineers onboarded and actively delivering."
        )
    ]

    for d in defaults:
        db.add(d)
    db.commit()

def get_all_recommendations(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None
) -> List[RecommendationModel]:
    seed_default_recommendations_if_empty(db)
    query = db.query(RecommendationModel)
    if status:
        query = query.filter(RecommendationModel.status == status.upper())
    if priority:
        query = query.filter(RecommendationModel.priority == priority)
    if category:
        query = query.filter(RecommendationModel.category == category)
    return query.order_by(RecommendationModel.created_at.desc()).all()

def update_recommendation_status(
    db: Session,
    rec_id: str,
    update_data: RecommendationUpdate
) -> Optional[RecommendationModel]:
    rec = db.query(RecommendationModel).filter(RecommendationModel.rec_id == rec_id).first()
    if not rec:
        return None

    if update_data.status:
        rec.status = update_data.status.upper()
    if update_data.notes is not None:
        rec.notes = update_data.notes
    rec.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rec)
    return rec

def create_recommendation(
    db: Session,
    data: RecommendationCreate
) -> RecommendationModel:
    rec_id = f"REC-WIP-{str(uuid.uuid4())[:6].upper()}"
    rec = RecommendationModel(
        rec_id=rec_id,
        title=data.title,
        category=data.category,
        target_type=data.target_type,
        target_name=data.target_name,
        priority=data.priority,
        status="PENDING",
        description=data.description,
        evidence=data.evidence,
        projected_impact=data.projected_impact,
        effort_estimate=data.effort_estimate,
        notes=data.notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
