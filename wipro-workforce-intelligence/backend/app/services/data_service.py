import os
import random
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from ..models.employee import EmployeeRecord
from ..core.config import settings

DEPARTMENTS = [
    "Cloud Infrastructure & Digital Workspace",
    "Enterprise Applications & SAP",
    "Data Analytics & Enterprise AI",
    "Cybersecurity & Risk Services",
    "BFSI Digital Banking & Payments",
    "Healthcare & Life Sciences Digital"
]

ROLES_BY_DEPT = {
    "Cloud Infrastructure & Digital Workspace": [
        ("Cloud Architect", ["AWS", "Kubernetes", "Terraform", "Docker", "DevOps"]),
        ("Senior Cloud Engineer", ["Azure", "Terraform", "CI/CD", "Linux"]),
        ("Site Reliability Engineer", ["Kubernetes", "Prometheus", "Python", "Go"]),
        ("Systems Administrator", ["Linux", "Bash", "VMware", "Networking"])
    ],
    "Enterprise Applications & SAP": [
        ("SAP S/4HANA Lead", ["SAP S/4HANA", "Fiori", "ABAP", "Integration"]),
        ("Senior Functional Consultant", ["SAP SD", "SAP MM", "Business Process"]),
        ("ABAP Developer", ["ABAP", "Core Data Services", "OData"]),
        ("ERP Integration Specialist", ["SAP CPI", "REST APIs", "XML", "Java"])
    ],
    "Data Analytics & Enterprise AI": [
        ("Lead AI/ML Engineer", ["Python", "PyTorch", "FastAPI", "MLOps"]),
        ("Senior Data Scientist", ["Python", "scikit-learn", "Pandas", "SQL"]),
        ("Data Platform Engineer", ["Spark", "Snowflake", "Databricks", "Kafka"]),
        ("BI & Analytics Developer", ["PowerBI", "SQL", "Tableau", "dbt"])
    ],
    "Cybersecurity & Risk Services": [
        ("Cyber Defense Lead", ["SIEM", "Incident Response", "Splunk", "Threat Intel"]),
        ("Cloud Security Architect", ["AWS Security", "Zero Trust", "IAM", "Compliance"]),
        ("Penetration Tester", ["Burp Suite", "Metasploit", "Network Security"]),
        ("GRC Analyst", ["ISO 27001", "SOC 2", "Risk Assessment", "Audit"])
    ],
    "BFSI Digital Banking & Payments": [
        ("Core Banking Architect", ["Java", "Spring Boot", "Kafka", "Microservices"]),
        ("Senior Full-Stack Engineer", ["React", "TypeScript", "Node.js", "PostgreSQL"]),
        ("Payments Integration Lead", ["ISO 20022", "SWIFT", "REST APIs", "OAuth2"]),
        ("QA Automation Lead", ["Selenium", "Cypress", "Python", "Jest"])
    ],
    "Healthcare & Life Sciences Digital": [
        ("HealthTech Solutions Architect", ["FHIR", "HL7", "Cloud", "HIPAA"]),
        ("Clinical Data Engineer", ["Python", "SQL", "ETL", "EMR Integration"]),
        ("Full-Stack Developer", ["React", "Python", "FastAPI", "Docker"]),
        ("Compliance & Validation Lead", ["FDA CFR Part 11", "GxP", "Validation"])
    ]
}

FIRST_NAMES = [
    "Aarav", "Aditi", "Rohan", "Priya", "Vikram", "Kavita", "Deepak", "Sneha",
    "Ananya", "Rahul", "Pooja", "Arjun", "Neha", "Sanjay", "Divya", "Gaurav",
    "Meera", "Karthik", "Ritu", "Alok", "Tanvi", "Sunil", "Shreya", "Naveen"
]

LAST_NAMES = [
    "Sharma", "Patel", "Nair", "Venkatesh", "Sen", "Rao", "Gupta", "Deshmukh",
    "Iyer", "Banerjee", "Reddy", "Kulkarni", "Menon", "Joshi", "Bose", "Verma",
    "Pillai", "Choudhury", "Bhat", "Mehta", "Malhotra", "Kapoor", "Saxena", "Soni"
]

WEEKS = [f"2026-W{w:02d}" for w in range(28, 40)]  # 12 consecutive weeks

def generate_synthetic_workforce_data(num_employees: int = 60, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic, synthetic Wipro-inspired technology workforce metrics.
    DISCLAIMER: This dataset is entirely synthetically generated for demonstration
    and operational simulation purposes. It does not represent actual internal records of Wipro Limited.
    """
    random.seed(seed)
    np.random.seed(seed)

    records = []
    emp_profiles = []

    # Create baseline employee profiles
    for i in range(num_employees):
        dept = DEPARTMENTS[i % len(DEPARTMENTS)]
        roles = ROLES_BY_DEPT[dept]
        role_info = roles[i % len(roles)]
        role_name = role_info[0]
        base_skills = role_info[1]

        emp_id = f"WIP-{1000 + i}"
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        exp = round(random.uniform(1.5, 16.0), 1)
        capacity = 40.0 if random.random() > 0.1 else random.choice([32.0, 45.0])

        # Baseline persona profiles: High performer, Average, Overloaded, At-risk
        persona = random.choices(
            ["balanced", "overloaded", "underutilized", "burnout_prone", "high_flyer"],
            weights=[0.50, 0.20, 0.10, 0.12, 0.08]
        )[0]

        emp_profiles.append({
            "employee_id": emp_id,
            "name": name,
            "role": role_name,
            "department": dept,
            "experience_years": exp,
            "weekly_capacity_hours": capacity,
            "skills": ", ".join(base_skills),
            "persona": persona
        })

    # Generate historical records across 12 sprint weeks
    for week_idx, week_id in enumerate(WEEKS):
        # Add slight macro surge or project deadlines to later weeks
        dept_pressure = {
            "Cloud Infrastructure & Digital Workspace": 1.1 if week_idx >= 6 else 1.0,
            "Enterprise Applications & SAP": 1.15 if week_idx >= 7 else 0.98,
            "Data Analytics & Enterprise AI": 1.05,
            "Cybersecurity & Risk Services": 1.2 if week_idx in [8, 9, 10] else 1.0,
            "BFSI Digital Banking & Payments": 1.12 if week_idx >= 5 else 1.0,
            "Healthcare & Life Sciences Digital": 0.95
        }

        for p in emp_profiles:
            persona = p["persona"]
            cap = p["weekly_capacity_hours"]
            dept_mult = dept_pressure[p["department"]]

            # Persona specific dynamics
            if persona == "overloaded":
                logged = cap * random.uniform(1.22, 1.48) * dept_mult
                assigned = random.randint(14, 28)
                rework = random.uniform(0.12, 0.28)
                csat = random.uniform(3.2, 4.2)
                absenteeism = random.choice([0, 1, 2, 3]) if week_idx > 4 else 0
            elif persona == "burnout_prone":
                logged = cap * random.uniform(1.30, 1.60) * dept_mult
                assigned = random.randint(18, 32)
                rework = random.uniform(0.18, 0.35)
                csat = random.uniform(2.8, 3.8)
                absenteeism = random.choice([1, 2, 3, 4]) if week_idx >= 6 else random.choice([0, 1])
            elif persona == "underutilized":
                logged = cap * random.uniform(0.55, 0.78)
                assigned = random.randint(4, 9)
                rework = random.uniform(0.02, 0.09)
                csat = random.uniform(3.8, 4.6)
                absenteeism = random.choice([0, 0, 1])
            elif persona == "high_flyer":
                logged = cap * random.uniform(0.95, 1.12)
                assigned = random.randint(12, 22)
                rework = random.uniform(0.01, 0.07)
                csat = random.uniform(4.5, 5.0)
                absenteeism = 0
            else:  # balanced
                logged = cap * random.uniform(0.88, 1.14) * dept_mult
                assigned = random.randint(10, 18)
                rework = random.uniform(0.04, 0.12)
                csat = random.uniform(4.0, 4.8)
                absenteeism = random.choice([0, 0, 0, 1])

            # Enforce valid math
            logged = round(max(15.0, min(75.0, logged)), 1)
            overtime = max(0.0, round(logged - cap, 1))

            # Task completion
            completion_factor = random.uniform(0.70, 0.98) if persona != "burnout_prone" else random.uniform(0.55, 0.85)
            completed = int(round(assigned * completion_factor))
            backlog = max(0, assigned - completed + random.randint(0, 3))

            records.append({
                "employee_id": p["employee_id"],
                "name": p["name"],
                "role": p["role"],
                "department": p["department"],
                "experience_years": p["experience_years"],
                "weekly_capacity_hours": cap,
                "logged_hours": logged,
                "completed_tasks": completed,
                "assigned_tasks": assigned,
                "backlog_tasks": backlog,
                "quality_rework_rate": round(rework, 3),
                "client_csat": round(csat, 2),
                "overtime_hours": overtime,
                "absenteeism_days": float(absenteeism),
                "skills": p["skills"],
                "week_id": week_id
            })

    df = pd.DataFrame(records)
    return df

def save_synthetic_csv(df: pd.DataFrame, filepath: Optional[str] = None) -> str:
    if filepath is None:
        target_dir = settings.data_dir
        target_dir.mkdir(parents=True, exist_ok=True)
        filepath = str(target_dir / "wipro_workforce_synthetic_dataset.csv")
    df.to_csv(filepath, index=False)
    return filepath

def validate_csv_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str], Dict[str, any]]:
    """
    Validates CSV columns and datatypes against required workforce schema.
    """
    errors = []
    required_cols = [
        "employee_id", "name", "role", "department", "experience_years",
        "weekly_capacity_hours", "logged_hours", "completed_tasks",
        "assigned_tasks", "backlog_tasks", "quality_rework_rate",
        "client_csat", "overtime_hours", "absenteeism_days", "skills", "week_id"
    ]

    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        errors.append(f"Missing required columns: {', '.join(missing)}")
        return False, errors, {}

    # Check non-empty
    if len(df) == 0:
        errors.append("Dataset is empty.")
        return False, errors, {}

    # Check for invalid negatives in numeric fields
    numeric_checks = [
        "weekly_capacity_hours", "logged_hours", "completed_tasks",
        "assigned_tasks", "backlog_tasks", "overtime_hours", "absenteeism_days"
    ]
    for col in numeric_checks:
        if (pd.to_numeric(df[col], errors='coerce') < 0).any():
            errors.append(f"Column '{col}' contains negative values.")

    meta = {
        "total_records": len(df),
        "unique_employees": int(df["employee_id"].nunique()),
        "departments": list(df["department"].unique()),
        "weeks": sorted(list(df["week_id"].unique())),
        "avg_logged_hours": round(float(df["logged_hours"].mean()), 2)
    }

    return (len(errors) == 0), errors, meta

def load_dataset_into_db(df: pd.DataFrame, db: Session, clear_existing: bool = True):
    from .analytics_service import calculate_record_scores
    if clear_existing:
        db.query(EmployeeRecord).delete()
        db.commit()

    records_to_insert = []
    for _, row in df.iterrows():
        cap = float(row["weekly_capacity_hours"]) if float(row["weekly_capacity_hours"]) > 0 else 40.0
        logged = float(row["logged_hours"])
        workload_ratio = round(logged / cap, 3)

        # Basic status
        if workload_ratio > 1.35:
            status = "Burnout Risk"
        elif workload_ratio > 1.15:
            status = "Overloaded"
        elif workload_ratio < 0.80:
            status = "Underutilized"
        else:
            status = "Balanced"

        rec = EmployeeRecord(
            employee_id=str(row["employee_id"]),
            name=str(row["name"]),
            role=str(row["role"]),
            department=str(row["department"]),
            experience_years=float(row["experience_years"]),
            weekly_capacity_hours=cap,
            logged_hours=logged,
            completed_tasks=int(row["completed_tasks"]),
            assigned_tasks=int(row["assigned_tasks"]),
            backlog_tasks=int(row["backlog_tasks"]),
            quality_rework_rate=float(row["quality_rework_rate"]),
            client_csat=float(row["client_csat"]),
            overtime_hours=float(row["overtime_hours"]),
            absenteeism_days=float(row["absenteeism_days"]),
            skills=str(row["skills"]),
            week_id=str(row["week_id"]),
            workload_ratio=workload_ratio,
            status_category=status
        )
        records_to_insert.append(rec)

    db.bulk_save_objects(records_to_insert)
    db.commit()

    # Recalculate productivity scores using current system settings
    calculate_record_scores(db)
