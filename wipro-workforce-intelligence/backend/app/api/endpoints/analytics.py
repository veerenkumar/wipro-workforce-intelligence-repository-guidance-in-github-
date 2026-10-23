from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ...core.database import get_db
from ...models.employee import EmployeeRecord
from ...schemas.analytics import EmployeeDetail
from ...services.analytics_service import get_or_create_settings

router = APIRouter()

@router.get("/employees", response_model=List[EmployeeDetail])
def list_employees(
    department: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    week_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    settings = get_or_create_settings(db)
    query = db.query(EmployeeRecord)

    if week_id:
        query = query.filter(EmployeeRecord.week_id == week_id)
    else:
        # Default to latest week
        latest = db.query(EmployeeRecord.week_id).order_by(EmployeeRecord.week_id.desc()).first()
        if latest:
            query = query.filter(EmployeeRecord.week_id == latest[0])

    if department and department != "All Departments":
        query = query.filter(EmployeeRecord.department == department)
    if role and role != "All Roles":
        query = query.filter(EmployeeRecord.role == role)
    if status and status != "All Statuses":
        query = query.filter(EmployeeRecord.status_category == status)
    if search:
        s = f"%{search}%"
        query = query.filter((EmployeeRecord.name.ilike(s)) | (EmployeeRecord.employee_id.ilike(s)) | (EmployeeRecord.skills.ilike(s)))

    records = query.order_by(EmployeeRecord.logged_hours.desc()).limit(limit).all()

    def clean_name(emp_name: str, emp_id: str) -> str:
        if settings.anonymize_employee_data:
            return f"Resource {emp_id[-4:]}"
        return emp_name

    return [
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
            productivity_score=r.productivity_score if r.productivity_score is not None else 0.0,
            workload_ratio=r.workload_ratio if r.workload_ratio is not None else 1.0,
            status_category=r.status_category or "Balanced"
        )
        for r in records
    ]

@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    records = db.query(EmployeeRecord).all()
    departments = sorted(list(set(r.department for r in records if r.department)))
    roles = sorted(list(set(r.role for r in records if r.role)))
    weeks = sorted(list(set(r.week_id for r in records if r.week_id)))
    statuses = ["Balanced", "Overloaded", "Underutilized", "Burnout Risk"]
    return {
        "departments": departments,
        "roles": roles,
        "weeks": weeks,
        "statuses": statuses
    }
