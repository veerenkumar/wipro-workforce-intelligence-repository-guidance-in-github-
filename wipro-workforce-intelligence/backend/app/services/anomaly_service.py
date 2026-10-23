import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest
from ..models.employee import EmployeeRecord
from ..schemas.anomaly import AnomalyRecord, AnomalyResponse
from .analytics_service import get_or_create_settings

ANOMALY_FEATURE_COLS = [
    "logged_hours", "overtime_hours", "backlog_tasks",
    "quality_rework_rate", "client_csat", "absenteeism_days",
    "productivity_score"
]

def detect_workforce_anomalies(
    db: Session,
    week_id: Optional[str] = None,
    department_filter: Optional[str] = None
) -> AnomalyResponse:
    settings = get_or_create_settings(db)
    query = db.query(EmployeeRecord)
    if department_filter and department_filter != "All Departments":
        query = query.filter(EmployeeRecord.department == department_filter)
    records = query.all()

    if len(records) < 10:
        return AnomalyResponse(
            total_anomalies=0,
            contamination_rate=settings.anomaly_sensitivity,
            high_severity_count=0,
            anomalies_by_department={},
            anomalies=[]
        )

    # Determine latest snapshot
    available_weeks = sorted(list(set(r.week_id for r in records)))
    active_week = week_id if week_id in available_weeks else available_weeks[-1]
    current_recs = [r for r in records if r.week_id == active_week]

    if len(current_recs) < 5:
        current_recs = records

    df = pd.DataFrame([{
        "id": r.id,
        "employee_id": r.employee_id,
        "name": f"Resource {r.employee_id[-4:]}" if settings.anonymize_employee_data else r.name,
        "department": r.department,
        "role": r.role,
        "week_id": r.week_id,
        "logged_hours": r.logged_hours,
        "overtime_hours": r.overtime_hours,
        "backlog_tasks": r.backlog_tasks,
        "quality_rework_rate": r.quality_rework_rate,
        "client_csat": r.client_csat,
        "absenteeism_days": r.absenteeism_days,
        "productivity_score": r.productivity_score if r.productivity_score is not None else 70.0
    } for r in current_recs])

    X = df[ANOMALY_FEATURE_COLS].fillna(0)

    # Fit Isolation Forest
    iso_forest = IsolationForest(
        contamination=settings.anomaly_sensitivity,
        random_state=42,
        n_estimators=100
    )
    predictions = iso_forest.fit_predict(X)  # -1 = anomaly, 1 = normal
    raw_scores = iso_forest.decision_function(X)  # lower = more abnormal

    # Normalize anomaly score from 0 (normal) to 100 (extreme anomaly)
    min_s = float(raw_scores.min())
    max_s = float(raw_scores.max())
    range_s = (max_s - min_s) if (max_s - min_s) > 0 else 1.0

    anomalies: List[AnomalyRecord] = []
    means = X.mean()
    stds = X.std().replace(0, 1.0)

    for idx, (pred, score) in enumerate(zip(predictions, raw_scores)):
        if pred == -1:
            row = df.iloc[idx]
            row_features = X.iloc[idx]
            z_scores = ((row_features - means) / stds).to_dict()

            # Identify features with high absolute Z-score
            deviant_features = []
            for feat, z in z_scores.items():
                if abs(z) >= 1.5:
                    label = feat.replace("_", " ").title()
                    direction = "Spike" if z > 0 else "Drop"
                    deviant_features.append(f"{label} {direction} (Z={round(z, 1)})")

            if not deviant_features:
                deviant_features.append("Multi-factor compound deviation")

            # Classify anomaly type
            if z_scores.get("overtime_hours", 0) > 1.8 and z_scores.get("quality_rework_rate", 0) > 1.4:
                a_type = "Overtime-Quality Decoupling"
                explanation = "Engineers logging extreme overtime while defect rework surged, indicating counterproductive fatigue."
                action = "Review workload limits immediately and initiate automated quality testing."
            elif z_scores.get("backlog_tasks", 0) > 1.8:
                a_type = "Phantom Backlog Surge"
                explanation = "Unusual accumulation of pending backlog tasks deviating significantly from team sprint median."
                action = "Inspect external blocker tickets and verify scope integrity."
            elif z_scores.get("absenteeism_days", 0) > 1.8 and z_scores.get("overtime_hours", 0) > 1.2:
                a_type = "Acute Burnout & Absence"
                explanation = "High overtime hours accompanied by multiple unplanned absence days in the same period."
                action = "Implement wellness check-in and reassign critical-path deliverables."
            elif z_scores.get("productivity_score", 0) < -1.6:
                a_type = "Severe Throughput Drop"
                explanation = "Productivity score collapsed well below departmental baseline."
                action = "Investigate tooling impediments, environment outages, or unclear requirements."
            else:
                a_type = "Multi-Variable Behavioral Outlier"
                explanation = "Simultaneous divergence across workload, client CSAT, and task completion metrics."
                action = "Review sprint standup notes with project delivery manager."

            # Calculate severity (0 to 100)
            norm_severity = round(float((max_s - score) / range_s * 100.0), 1)
            norm_severity = min(100.0, max(50.0, norm_severity))

            anomalies.append(AnomalyRecord(
                id=f"ANO-{row['employee_id']}-{row['week_id'][-3:]}",
                employee_id=str(row["employee_id"]),
                employee_name=str(row["name"]),
                department=str(row["department"]),
                role=str(row["role"]),
                week_id=str(row["week_id"]),
                anomaly_score=norm_severity,
                anomaly_type=a_type,
                detected_features=deviant_features,
                explanation=explanation,
                suggested_investigation=action
            ))

    # Sort by anomaly score descending
    anomalies.sort(key=lambda x: x.anomaly_score, reverse=True)

    # Breakdown by department
    dept_counts: Dict[str, int] = {}
    for a in anomalies:
        dept_counts[a.department] = dept_counts.get(a.department, 0) + 1

    high_sev = sum(1 for a in anomalies if a.anomaly_score >= 80.0)

    return AnomalyResponse(
        total_anomalies=len(anomalies),
        contamination_rate=settings.anomaly_sensitivity,
        high_severity_count=high_sev,
        anomalies_by_department=dept_counts,
        anomalies=anomalies
    )
