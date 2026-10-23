from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ..models.employee import EmployeeRecord
from ..models.settings import SystemSettingsModel
from ..schemas.bottleneck import BottleneckItem, BottleneckSummaryResponse
from .analytics_service import get_or_create_settings
import numpy as np

def detect_operational_bottlenecks(
    db: Session,
    week_id: Optional[str] = None,
    department: Optional[str] = None
) -> BottleneckSummaryResponse:
    settings = get_or_create_settings(db)
    query = db.query(EmployeeRecord)
    if department:
        query = query.filter(EmployeeRecord.department == department)
    records = query.all()

    if not records:
        return BottleneckSummaryResponse(
            total_bottlenecks=0,
            critical_count=0,
            high_count=0,
            medium_count=0,
            estimated_total_loss_hours=0.0,
            bottlenecks=[]
        )

    # Determine latest week if not supplied
    available_weeks = sorted(list(set(r.week_id for r in records)))
    active_week = week_id if week_id in available_weeks else available_weeks[-1]
    current_records = [r for r in records if r.week_id == active_week]

    bottlenecks: List[BottleneckItem] = []

    # Helper function for anonymization
    def format_entity(r: EmployeeRecord) -> str:
        if settings.anonymize_employee_data:
            return f"{r.role} ({r.employee_id[-4:]})"
        return f"{r.name} ({r.role})"

    # Group by department
    depts = sorted(list(set(r.department for r in current_records)))

    # 1. Rule: Severe Departmental Overload & Overtime Accumulation
    for dept in depts:
        dept_recs = [r for r in current_records if r.department == dept]
        overloaded = [r for r in dept_recs if r.workload_ratio >= settings.threshold_overload_warning]
        burnout = [r for r in dept_recs if r.workload_ratio >= settings.threshold_critical_burnout]

        if len(burnout) >= 2 or (len(overloaded) / len(dept_recs)) >= 0.30:
            tot_overtime = sum(r.overtime_hours for r in dept_recs)
            loss_est = round(tot_overtime * 0.75 + len(burnout) * 12.0, 1)
            affected_names = [format_entity(r) for r in (burnout + overloaded)[:4]]
            bottlenecks.append(BottleneckItem(
                id=f"BTN-OVL-{dept[:3].upper()}-{active_week[-3:]}",
                category="Severe Overload",
                severity="Critical" if len(burnout) >= 3 else "High",
                title=f"Capacity Saturation in {dept}",
                department=dept,
                affected_count=len(overloaded),
                affected_entities=affected_names,
                description=f"Over 30% of engineering staff in {dept} is running beyond safe workload limits, with {len(burnout)} engineers in critical burnout territory.",
                root_cause=f"High project sprint velocity combined with client milestone compressions and unallocated bench buffer.",
                impact_metrics=f"{round(tot_overtime, 1)} total overtime hours logged; avg workload ratio is {round(float(np.mean([r.workload_ratio for r in dept_recs])), 2)}x",
                estimated_weekly_loss_hours=loss_est,
                recommended_action="Execute automated OR-Tools task redistribution and mobilize bench capacity."
            ))

    # 2. Rule: Task Delay & Backlog Accumulation
    for dept in depts:
        dept_recs = [r for r in current_records if r.department == dept]
        high_backlog = [r for r in dept_recs if r.backlog_tasks >= 4]
        if len(high_backlog) >= 3:
            tot_backlog = sum(r.backlog_tasks for r in dept_recs)
            affected_names = [format_entity(r) for r in high_backlog[:4]]
            bottlenecks.append(BottleneckItem(
                id=f"BTN-BCK-{dept[:3].upper()}-{active_week[-3:]}",
                category="Task Delay & Backlog",
                severity="High",
                title=f"Sprint Backlog Congestion in {dept}",
                department=dept,
                affected_count=len(high_backlog),
                affected_entities=affected_names,
                description=f"{len(high_backlog)} team members have accumulated 4+ pending backlog tasks, threatening sprint delivery milestones.",
                root_cause="Dependencies on external API approvals and scope creep during active sprint cycle.",
                impact_metrics=f"{tot_backlog} total backlog items pending across {dept}.",
                estimated_weekly_loss_hours=round(tot_backlog * 3.5, 1),
                recommended_action="Implement sprint de-scoping, reassign blocking dependencies, and trigger workload rebalance."
            ))

    # 3. Rule: Quality Defect & High Rework Loop
    high_rework = [r for r in current_records if r.quality_rework_rate >= 0.18]
    if len(high_rework) >= 3:
        affected_depts = list(set(r.department for r in high_rework))
        affected_names = [format_entity(r) for r in high_rework[:5]]
        tot_rework_loss = sum(r.logged_hours * r.quality_rework_rate for r in high_rework)
        bottlenecks.append(BottleneckItem(
            id=f"BTN-QAL-{active_week[-3:]}",
            category="Quality Defect Loop",
            severity="High",
            title="Elevated Code Review & Rework Cycle",
            department=", ".join(affected_depts[:2]),
            affected_count=len(high_rework),
            affected_entities=affected_names,
            description=f"{len(high_rework)} senior resources exhibit rework rates exceeding 18%, draining engineering throughput into recurring defect patching.",
            root_cause="Rapid architectural turnover and lack of automated pre-commit static testing gates.",
            impact_metrics=f"Avg rework rate of {round(float(np.mean([r.quality_rework_rate for r in high_rework])) * 100, 1)}% across affected engineers.",
            estimated_weekly_loss_hours=round(tot_rework_loss, 1),
            recommended_action="Enforce strict SonarQube/ESLint gates and pair programming on complex modules."
        ))

    # 4. Rule: Burnout Surge & Absenteeism Correlation
    burnout_surge = [r for r in current_records if r.overtime_hours >= 8.0 and r.absenteeism_days >= 2.0]
    if len(burnout_surge) >= 2:
        affected_names = [format_entity(r) for r in burnout_surge]
        tot_absent = sum(r.absenteeism_days for r in burnout_surge)
        bottlenecks.append(BottleneckItem(
            id=f"BTN-BRN-{active_week[-3:]}",
            category="Burnout Surge",
            severity="Critical",
            title="High Overtime / Absenteeism Attrition Risk",
            department=burnout_surge[0].department,
            affected_count=len(burnout_surge),
            affected_entities=affected_names,
            description="Correlation observed between prolonged overtime (>8 hrs) and elevated absenteeism (>2 days), indicating acute fatigue.",
            root_cause="Single point of failure (SPOF) on mission-critical client support deliverables.",
            impact_metrics=f"{round(tot_absent, 1)} days lost to unplanned absence among key personnel.",
            estimated_weekly_loss_hours=round(tot_absent * 8.0 + len(burnout_surge) * 10.0, 1),
            recommended_action="Mandate compensatory rest, reassign high-urgency tasks immediately, and activate secondary on-call engineer."
        ))

    # 5. Rule: Skillset Scarcity / Single Point of Failure
    # Check if certain specialized skills (e.g. Kubernetes, SAP CPI, FHIR) are held by only 1 person who is overloaded
    skill_counts: Dict[str, List[EmployeeRecord]] = {}
    for r in current_records:
        for s in [s.strip() for s in r.skills.split(",") if s.strip()]:
            skill_counts.setdefault(s, []).append(r)

    scarce_skills = []
    for skill, emps in skill_counts.items():
        if len(emps) <= 2 and any(e.workload_ratio > 1.20 for e in emps):
            scarce_skills.append((skill, emps))

    if scarce_skills:
        top_skill, affected_emps = scarce_skills[0]
        bottlenecks.append(BottleneckItem(
            id=f"BTN-SKL-{active_week[-3:]}",
            category="Skill Shortage",
            severity="Medium",
            title=f"Specialized Skill Bottleneck: {top_skill}",
            department=affected_emps[0].department,
            affected_count=len(affected_emps),
            affected_entities=[format_entity(e) for e in affected_emps],
            description=f"Skill '{top_skill}' is concentrated in only {len(affected_emps)} engineer(s) who are currently overloaded at {affected_emps[0].workload_ratio}x capacity.",
            root_cause="Specialized niche technology requirements without established shadow knowledge base.",
            impact_metrics=f"Critical path dependency risk on '{top_skill}' components.",
            estimated_weekly_loss_hours=18.0,
            recommended_action=f"Launch cross-skilling sessions and onboard a certified secondary specialist in {top_skill}."
        ))

    # Summary counts
    crit = sum(1 for b in bottlenecks if b.severity == "Critical")
    high = sum(1 for b in bottlenecks if b.severity == "High")
    med = sum(1 for b in bottlenecks if b.severity == "Medium")
    total_loss = sum(b.estimated_weekly_loss_hours for b in bottlenecks)

    return BottleneckSummaryResponse(
        total_bottlenecks=len(bottlenecks),
        critical_count=crit,
        high_count=high,
        medium_count=med,
        estimated_total_loss_hours=round(total_loss, 1),
        bottlenecks=bottlenecks
    )
