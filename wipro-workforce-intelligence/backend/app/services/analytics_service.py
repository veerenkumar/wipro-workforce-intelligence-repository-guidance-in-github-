import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from ..models.employee import EmployeeRecord
from ..models.settings import SystemSettingsModel
from ..schemas.analytics import (
    KPISummary, TrendPoint, DepartmentMetric,
    RoleDistribution, AnalyticsDashboardResponse, EmployeeDetail
)

def get_or_create_settings(db: Session) -> SystemSettingsModel:
    settings = db.query(SystemSettingsModel).first()
    if not settings:
        settings = SystemSettingsModel()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def calculate_productivity_score(
    completed_tasks: float,
    assigned_tasks: float,
    quality_rework_rate: float,
    client_csat: float,
    logged_hours: float,
    weekly_capacity_hours: float,
    settings: SystemSettingsModel
) -> float:
    """
    Computes a robust, weighted 0-100 productivity score:
    - Task Completion Component (0-100)
    - Quality Component (100 - rework% * 100)
    - Client CSAT Component ((csat / 5.0) * 100)
    - Schedule & Capacity Adherence (100 - abs(workload_ratio - 1.0) * 50)
    """
    # 1. Completion Rate
    if assigned_tasks <= 0:
        completion_ratio = 1.0 if completed_tasks > 0 else 0.8
    else:
        completion_ratio = min(1.3, completed_tasks / assigned_tasks)
    comp_score = min(100.0, completion_ratio * 100.0)

    # 2. Quality Score (Lower rework = higher quality)
    quality_score = max(0.0, min(100.0, (1.0 - max(0.0, quality_rework_rate)) * 100.0))

    # 3. Client CSAT (Scale 1.0 - 5.0 to 20 - 100)
    safe_csat = max(1.0, min(5.0, client_csat if client_csat is not None else 3.5))
    csat_score = (safe_csat / 5.0) * 100.0

    # 4. Schedule / Capacity Adherence
    cap = max(10.0, weekly_capacity_hours)
    ratio = logged_hours / cap
    # Optimal ratio is ~1.0; penalty increases if severe overload or heavy underutilization
    adherence_penalty = abs(ratio - 1.0) * 40.0
    adherence_score = max(20.0, min(100.0, 100.0 - adherence_penalty))

    # Weighted sum
    total_weights = (
        settings.weight_task_completion +
        settings.weight_quality +
        settings.weight_csat +
        settings.weight_adherence
    )
    if total_weights <= 0:
        total_weights = 1.0

    score = (
        (comp_score * settings.weight_task_completion) +
        (quality_score * settings.weight_quality) +
        (csat_score * settings.weight_csat) +
        (adherence_score * settings.weight_adherence)
    ) / total_weights

    return round(max(0.0, min(100.0, score)), 2)

def calculate_record_scores(db: Session):
    """
    Recalculates derived productivity scores & workload ratios for all database records.
    """
    settings = get_or_create_settings(db)
    records = db.query(EmployeeRecord).all()
    for rec in records:
        rec.productivity_score = calculate_productivity_score(
            rec.completed_tasks,
            rec.assigned_tasks,
            rec.quality_rework_rate,
            rec.client_csat,
            rec.logged_hours,
            rec.weekly_capacity_hours,
            settings
        )
        cap = rec.weekly_capacity_hours if rec.weekly_capacity_hours > 0 else 40.0
        rec.workload_ratio = round(rec.logged_hours / cap, 3)

        if rec.workload_ratio >= settings.threshold_critical_burnout:
            rec.status_category = "Burnout Risk"
        elif rec.workload_ratio >= settings.threshold_overload_warning:
            rec.status_category = "Overloaded"
        elif rec.workload_ratio < settings.threshold_underutilized:
            rec.status_category = "Underutilized"
        else:
            rec.status_category = "Balanced"

    db.commit()

def get_analytics_dashboard(
    db: Session,
    week_id: Optional[str] = None,
    department: Optional[str] = None
) -> AnalyticsDashboardResponse:
    settings = get_or_create_settings(db)

    # Base query for all records (for trends)
    all_query = db.query(EmployeeRecord)
    if department:
        all_query = all_query.filter(EmployeeRecord.department == department)
    all_records = all_query.all()

    if not all_records:
        # Return empty response safely
        return AnalyticsDashboardResponse(
            kpis=KPISummary(
                avg_productivity_score=0, avg_workload_ratio=0, total_active_workforce=0,
                total_logged_hours=0, total_capacity_hours=0, total_overtime_hours=0,
                avg_absenteeism_days=0, task_completion_rate=0, avg_quality_score=0,
                avg_client_csat=0, overloaded_count=0, underutilized_count=0,
                optimal_count=0, burnout_risk_count=0, operational_alert_level="Normal"
            ),
            weekly_trends=[], department_metrics=[], role_distribution=[],
            workload_distribution={"Balanced": 0, "Overloaded": 0, "Underutilized": 0, "Burnout Risk": 0},
            top_performers=[], at_risk_employees=[]
        )

    # Determine latest week if not specified
    available_weeks = sorted(list(set(r.week_id for r in all_records)))
    current_week = week_id if week_id in available_weeks else available_weeks[-1]

    # Current snapshot records
    current_records = [r for r in all_records if r.week_id == current_week]

    # Anonymize names if enabled
    def clean_name(emp_name: str, emp_id: str) -> str:
        if settings.anonymize_employee_data:
            return f"Resource {emp_id[-4:]}"
        return emp_name

    # Current KPIs
    total_active = len(current_records)
    total_logged = sum(r.logged_hours for r in current_records)
    total_cap = sum(r.weekly_capacity_hours for r in current_records)
    total_overtime = sum(r.overtime_hours for r in current_records)
    avg_prod = np.mean([r.productivity_score for r in current_records]) if total_active > 0 else 0.0
    avg_ratio = np.mean([r.workload_ratio for r in current_records]) if total_active > 0 else 0.0
    avg_absent = np.mean([r.absenteeism_days for r in current_records]) if total_active > 0 else 0.0

    total_assigned = sum(r.assigned_tasks for r in current_records)
    total_completed = sum(r.completed_tasks for r in current_records)
    comp_rate = (total_completed / total_assigned * 100.0) if total_assigned > 0 else 0.0

    avg_rework = np.mean([r.quality_rework_rate for r in current_records]) if total_active > 0 else 0.0
    avg_quality = (1.0 - avg_rework) * 100.0
    avg_csat = np.mean([r.client_csat for r in current_records]) if total_active > 0 else 0.0

    overloaded_count = sum(1 for r in current_records if r.status_category == "Overloaded")
    burnout_risk_count = sum(1 for r in current_records if r.status_category == "Burnout Risk")
    underutilized_count = sum(1 for r in current_records if r.status_category == "Underutilized")
    optimal_count = sum(1 for r in current_records if r.status_category == "Balanced")

    # Operational alert determination
    burnout_pct = (burnout_risk_count / total_active) if total_active > 0 else 0
    overload_pct = ((overloaded_count + burnout_risk_count) / total_active) if total_active > 0 else 0
    if burnout_pct > 0.15 or overload_pct > 0.35:
        alert_level = "Critical"
    elif overload_pct > 0.22 or avg_absent > 1.8:
        alert_level = "Elevated"
    elif overload_pct > 0.12:
        alert_level = "Moderate"
    else:
        alert_level = "Normal"

    kpis = KPISummary(
        avg_productivity_score=round(float(avg_prod), 1),
        avg_workload_ratio=round(float(avg_ratio), 2),
        total_active_workforce=total_active,
        total_logged_hours=round(float(total_logged), 1),
        total_capacity_hours=round(float(total_cap), 1),
        total_overtime_hours=round(float(total_overtime), 1),
        avg_absenteeism_days=round(float(avg_absent), 2),
        task_completion_rate=round(float(comp_rate), 1),
        avg_quality_score=round(float(avg_quality), 1),
        avg_client_csat=round(float(avg_csat), 2),
        overloaded_count=overloaded_count,
        underutilized_count=underutilized_count,
        optimal_count=optimal_count,
        burnout_risk_count=burnout_risk_count,
        operational_alert_level=alert_level
    )

    # Weekly Trends (Across all available historical weeks)
    weekly_trends = []
    for w in available_weeks:
        w_recs = [r for r in all_records if r.week_id == w]
        if not w_recs:
            continue
        tot_assigned = sum(r.assigned_tasks for r in w_recs)
        tot_done = sum(r.completed_tasks for r in w_recs)
        w_comp = (tot_done / tot_assigned * 100.0) if tot_assigned > 0 else 0.0

        weekly_trends.append(TrendPoint(
            week_id=w,
            productivity=round(float(np.mean([r.productivity_score for r in w_recs])), 1),
            workload_ratio=round(float(np.mean([r.workload_ratio for r in w_recs])), 2),
            overtime_hours=round(float(np.sum([r.overtime_hours for r in w_recs])), 1),
            task_completion_rate=round(float(w_comp), 1),
            rework_rate=round(float(np.mean([r.quality_rework_rate for r in w_recs]) * 100), 1),
            csat=round(float(np.mean([r.client_csat for r in w_recs])), 2)
        ))

    # Department Metrics
    dept_metrics = []
    all_depts = sorted(list(set(r.department for r in current_records)))
    for d in all_depts:
        d_recs = [r for r in current_records if r.department == d]
        d_ratio = np.mean([r.workload_ratio for r in d_recs])
        d_status = "Optimal"
        if d_ratio > settings.threshold_critical_burnout:
            d_status = "Burnout Risk"
        elif d_ratio > settings.threshold_overload_warning:
            d_status = "Overloaded"
        elif d_ratio < settings.threshold_underutilized:
            d_status = "Underutilized"

        dept_metrics.append(DepartmentMetric(
            department=d,
            employee_count=len(d_recs),
            avg_productivity=round(float(np.mean([r.productivity_score for r in d_recs])), 1),
            avg_workload_ratio=round(float(d_ratio), 2),
            total_overtime=round(float(np.sum([r.overtime_hours for r in d_recs])), 1),
            avg_csat=round(float(np.mean([r.client_csat for r in d_recs])), 2),
            rework_rate=round(float(np.mean([r.quality_rework_rate for r in d_recs]) * 100), 1),
            status=d_status
        ))

    # Role Distribution
    role_metrics = []
    all_roles = sorted(list(set(r.role for r in current_records)))
    for ro in all_roles:
        r_recs = [r for r in current_records if r.role == ro]
        role_metrics.append(RoleDistribution(
            role=ro,
            count=len(r_recs),
            avg_productivity=round(float(np.mean([r.productivity_score for r in r_recs])), 1),
            avg_workload_ratio=round(float(np.mean([r.workload_ratio for r in r_recs])), 2)
        ))

    # Workload distribution dictionary
    workload_dist = {
        "Balanced": optimal_count,
        "Overloaded": overloaded_count,
        "Underutilized": underutilized_count,
        "Burnout Risk": burnout_risk_count
    }

    # Top performers (highest productivity, balanced ratio)
    sorted_recs = sorted(current_records, key=lambda x: x.productivity_score, reverse=True)
    top_performers = [
        EmployeeDetail(
            id=r.id,
            employee_id=r.employee_id,
            name=clean_name(r.name, r.employee_id),
            role=r.role,
            department=r.department,
            experience_years=r.experience_years,
            weekly_capacity_hours=r.weekly_capacity_hours,
            logged_hours=r.logged_hours,
            completed_tasks=r.completed_tasks,
            assigned_tasks=r.assigned_tasks,
            backlog_tasks=r.backlog_tasks,
            quality_rework_rate=r.quality_rework_rate,
            client_csat=r.client_csat,
            overtime_hours=r.overtime_hours,
            absenteeism_days=r.absenteeism_days,
            skills=r.skills,
            week_id=r.week_id,
            productivity_score=r.productivity_score,
            workload_ratio=r.workload_ratio,
            status_category=r.status_category
        ) for r in sorted_recs[:6]
    ]

    # At-risk employees (burnout risk, excessive overtime, or high rework backlog)
    at_risk = [r for r in current_records if r.status_category in ["Burnout Risk", "Overloaded"] or r.backlog_tasks >= 5]
    sorted_at_risk = sorted(at_risk, key=lambda x: (x.workload_ratio, x.backlog_tasks), reverse=True)
    at_risk_employees = [
        EmployeeDetail(
            id=r.id,
            employee_id=r.employee_id,
            name=clean_name(r.name, r.employee_id),
            role=r.role,
            department=r.department,
            experience_years=r.experience_years,
            weekly_capacity_hours=r.weekly_capacity_hours,
            logged_hours=r.logged_hours,
            completed_tasks=r.completed_tasks,
            assigned_tasks=r.assigned_tasks,
            backlog_tasks=r.backlog_tasks,
            quality_rework_rate=r.quality_rework_rate,
            client_csat=r.client_csat,
            overtime_hours=r.overtime_hours,
            absenteeism_days=r.absenteeism_days,
            skills=r.skills,
            week_id=r.week_id,
            productivity_score=r.productivity_score,
            workload_ratio=r.workload_ratio,
            status_category=r.status_category
        ) for r in sorted_at_risk[:8]
    ]

    return AnalyticsDashboardResponse(
        kpis=kpis,
        weekly_trends=weekly_trends,
        department_metrics=dept_metrics,
        role_distribution=role_metrics,
        workload_distribution=workload_dist,
        top_performers=top_performers,
        at_risk_employees=at_risk_employees
    )
