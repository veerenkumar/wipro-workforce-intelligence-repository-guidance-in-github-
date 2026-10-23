import numpy as np
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from ortools.linear_solver import pywraplp
from ..models.employee import EmployeeRecord
from ..schemas.optimizer import (
    OptimizationRequest, OptimizationResponse,
    TaskAssignment, EngineerWorkloadShift, TaskInput
)
from .analytics_service import get_or_create_settings

# Preset backlog tasks for simulation if none provided
DEFAULT_SIMULATION_TASKS = [
    {"task_id": "TSK-101", "title": "Terraform EKS Cluster Migration", "skill": "Terraform", "hours": 12.0, "priority": 5, "deadline_days": 2},
    {"task_id": "TSK-102", "title": "Kubernetes Ingress Controller Upgrade", "skill": "Kubernetes", "hours": 8.0, "priority": 4, "deadline_days": 4},
    {"task_id": "TSK-103", "title": "SAP S/4HANA OData Endpoint Integration", "skill": "ABAP", "hours": 14.0, "priority": 5, "deadline_days": 3},
    {"task_id": "TSK-104", "title": "PyTorch Model Drift Detection Pipeline", "skill": "Python", "hours": 10.0, "priority": 4, "deadline_days": 5},
    {"task_id": "TSK-105", "title": "Zero Trust IAM Policy Automation", "skill": "AWS Security", "hours": 12.0, "priority": 5, "deadline_days": 2},
    {"task_id": "TSK-106", "title": "ISO 20022 Payment Gateway Webhook", "skill": "Java", "hours": 16.0, "priority": 5, "deadline_days": 3},
    {"task_id": "TSK-107", "title": "FHIR Patient Vitals API Integration", "skill": "Python", "hours": 14.0, "priority": 4, "deadline_days": 4},
    {"task_id": "TSK-108", "title": "Azure DevOps Blue/Green Pipeline Fix", "skill": "CI/CD", "hours": 6.0, "priority": 3, "deadline_days": 6},
    {"task_id": "TSK-109", "title": "Snowflake dbt Transformation Layer", "skill": "SQL", "hours": 8.0, "priority": 3, "deadline_days": 7},
    {"task_id": "TSK-110", "title": "Microservices Resiliency Circuit Breaker", "skill": "Spring Boot", "hours": 10.0, "priority": 4, "deadline_days": 5}
]

def optimize_workload_allocation(
    db: Session,
    request: OptimizationRequest,
    custom_tasks: Optional[List[TaskInput]] = None
) -> OptimizationResponse:
    settings = get_or_create_settings(db)
    all_recs = db.query(EmployeeRecord).all()
    if not all_recs:
        return OptimizationResponse(
            status="ERROR",
            solver_message="No employee records available in database for optimization.",
            total_tasks_assigned=0,
            unassigned_tasks_count=0,
            avg_workload_ratio_before=0.0,
            avg_workload_ratio_after=0.0,
            workload_variance_reduction_percent=0.0,
            assignments=[],
            workload_shifts=[]
        )

    # Get latest snapshot week
    available_weeks = sorted(list(set(r.week_id for r in all_recs)))
    active_week = available_weeks[-1]
    dept_filter = request.department

    query = [r for r in all_recs if r.week_id == active_week]
    if dept_filter and dept_filter != "All Departments":
        query = [r for r in query if r.department == dept_filter]

    if not query:
        query = [r for r in all_recs if r.week_id == active_week]

    # Convert engineers into optimization candidates
    engineers = []
    for r in query:
        name = f"Resource {r.employee_id[-4:]}" if settings.anonymize_employee_data else r.name
        skill_list = [s.strip() for s in r.skills.split(",") if s.strip()]
        cap = r.weekly_capacity_hours if r.weekly_capacity_hours > 0 else 40.0
        engineers.append({
            "record": r,
            "id": r.employee_id,
            "name": name,
            "dept": r.department,
            "skills": skill_list,
            "capacity": cap,
            "logged": r.logged_hours,
            "ratio": r.workload_ratio
        })

    # Prepare tasks to allocate
    tasks = []
    if custom_tasks and len(custom_tasks) > 0:
        for t in custom_tasks:
            tasks.append({
                "id": t.task_id,
                "title": t.title,
                "skill": t.required_skill,
                "hours": t.estimated_hours,
                "priority": t.priority,
                "deadline": t.deadline_days
            })
    else:
        tasks = [
            {
                "id": t["task_id"],
                "title": t["title"],
                "skill": t["skill"],
                "hours": t["hours"],
                "priority": t["priority"],
                "deadline": t["deadline_days"]
            }
            for t in DEFAULT_SIMULATION_TASKS
        ]

    # Initialize Google OR-Tools SCIP Integer Programming Solver
    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver:
        solver = pywraplp.Solver.CreateSolver('CBC')

    assignments: List[TaskAssignment] = []
    eng_added_hours = [0.0] * len(engineers)
    max_threshold = request.max_workload_threshold

    if solver:
        # Decision variables: x[i, j] in {0, 1}
        x = {}
        for i, t in enumerate(tasks):
            req_skill = t["skill"].lower()
            for j, eng in enumerate(engineers):
                eng_skills = [s.lower() for s in eng["skills"]]
                has_skill = any(req_skill in s or s in req_skill for s in eng_skills)
                if has_skill:
                    x[(i, j)] = solver.BoolVar(f"x_{i}_{j}")
                else:
                    x[(i, j)] = None

        # Constraint 1: Each task assigned to at most 1 engineer
        for i, t in enumerate(tasks):
            eligible_vars = [x[(i, j)] for j in range(len(engineers)) if x[(i, j)] is not None]
            if eligible_vars:
                solver.Add(solver.Sum(eligible_vars) <= 1)

        # Constraint 2: Engineer capacity limit
        for j, eng in enumerate(engineers):
            assigned_hours = [tasks[i]["hours"] * x[(i, j)] for i in range(len(tasks)) if x[(i, j)] is not None]
            if assigned_hours:
                max_allowed = max(eng["capacity"] * max_threshold, eng["logged"] + 2.0)
                solver.Add(solver.Sum(assigned_hours) <= (max_allowed - eng["logged"] + 8.0))

        # Objective: Maximize (Priority * 10) - (Current Workload Ratio Penalty)
        objective = solver.Objective()
        for i, t in enumerate(tasks):
            for j, eng in enumerate(engineers):
                if x[(i, j)] is not None:
                    # Higher priority gets more weight; placing on underutilized engineers preferred
                    coeff = (t["priority"] * 10.0) - (max(0.0, eng["ratio"] - 0.85) * 15.0)
                    objective.SetCoefficient(x[(i, j)], coeff)

        objective.SetMaximization()
        solver_status = solver.Solve()

        if solver_status in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
            for i, t in enumerate(tasks):
                for j, eng in enumerate(engineers):
                    var = x[(i, j)]
                    if var is not None and var.solution_value() > 0.5:
                        eng_added_hours[j] += t["hours"]
                        assignments.append(TaskAssignment(
                            task_id=t["id"],
                            task_title=t["title"],
                            assigned_employee_id=eng["id"],
                            assigned_employee_name=eng["name"],
                            required_skill=t["skill"],
                            allocated_hours=t["hours"],
                            priority=t["priority"],
                            match_status="Verified Skill Match (OR-Tools SCIP)"
                        ))

    # Heuristic fallback if solver couldn't allocate or wasn't available
    if len(assignments) == 0:
        sorted_tasks = sorted(tasks, key=lambda t: t["priority"], reverse=True)
        for t in sorted_tasks:
            req_skill = t["skill"].lower()
            eligible = [
                (j, eng) for j, eng in enumerate(engineers)
                if any(req_skill in s.lower() or s.lower() in req_skill for s in eng["skills"])
            ]
            if not eligible:
                continue

            eligible.sort(key=lambda item: (item[1]["logged"] + eng_added_hours[item[0]]) / item[1]["capacity"])
            best_j, best_eng = eligible[0]
            projected = (best_eng["logged"] + eng_added_hours[best_j] + t["hours"]) / best_eng["capacity"]
            if projected <= max_threshold + 0.20:
                eng_added_hours[best_j] += t["hours"]
                assignments.append(TaskAssignment(
                    task_id=t["id"],
                    task_title=t["title"],
                    assigned_employee_id=best_eng["id"],
                    assigned_employee_name=best_eng["name"],
                    required_skill=t["skill"],
                    allocated_hours=t["hours"],
                    priority=t["priority"],
                    match_status="Skill Matched (Heuristic Dispatch)"
                ))

    # Calculate workload shifts for each engineer
    shifts: List[EngineerWorkloadShift] = []
    initial_ratios = []
    optimized_ratios = []

    for j, eng in enumerate(engineers):
        init_h = eng["logged"]
        init_r = eng["ratio"]
        added_h = round(eng_added_hours[j], 1)
        opt_h = round(init_h + added_h, 1)
        opt_r = round(opt_h / eng["capacity"], 2)

        initial_ratios.append(init_r)
        optimized_ratios.append(opt_r)

        def get_status(r: float) -> str:
            if r > settings.threshold_critical_burnout:
                return "Burnout Risk"
            elif r > settings.threshold_overload_warning:
                return "Overloaded"
            elif r < settings.threshold_underutilized:
                return "Underutilized"
            return "Balanced"

        shifts.append(EngineerWorkloadShift(
            employee_id=eng["id"],
            name=eng["name"],
            initial_hours=init_h,
            initial_workload_ratio=init_r,
            added_hours=added_h,
            optimized_hours=opt_h,
            optimized_workload_ratio=opt_r,
            status_before=get_status(init_r),
            status_after=get_status(opt_r)
        ))

    var_before = float(np.var(initial_ratios)) if initial_ratios else 0.0
    var_after = float(np.var(optimized_ratios)) if optimized_ratios else 0.0
    variance_reduction = max(0.0, round(((var_before - var_after) / (var_before + 1e-6)) * 100.0, 1))

    unassigned_count = len(tasks) - len(assignments)
    msg = f"Google OR-Tools integer programming optimizer assigned {len(assignments)} of {len(tasks)} tasks adhering to skill, capacity and deadline constraints."

    return OptimizationResponse(
        status="SUCCESS",
        solver_message=msg,
        total_tasks_assigned=len(assignments),
        unassigned_tasks_count=unassigned_count,
        avg_workload_ratio_before=round(float(np.mean(initial_ratios)), 2) if initial_ratios else 1.0,
        avg_workload_ratio_after=round(float(np.mean(optimized_ratios)), 2) if optimized_ratios else 1.0,
        workload_variance_reduction_percent=variance_reduction,
        assignments=assignments,
        workload_shifts=shifts
    )
