import sys
sys.modules['pyarrow'] = None

import ortools
from ortools.linear_solver import pywraplp
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.services.data_service import generate_synthetic_workforce_data, load_dataset_into_db

@pytest.fixture(scope="session")
def client():
    # Make sure DB schema and tables exist
    from backend.app.core.database import Base, engine
    Base.metadata.create_all(bind=engine)

    # Seed baseline records
    db = SessionLocal()
    df = generate_synthetic_workforce_data(num_employees=20, seed=123)
    load_dataset_into_db(df, db, clear_existing=True)
    db.close()

    with TestClient(app) as c:
        yield c

def test_health_check(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_dashboard_summary(client):
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "weekly_trends" in data
    assert data["kpis"]["total_active_workforce"] > 0
    assert data["kpis"]["avg_productivity_score"] > 0

def test_analytics_employees_and_filters(client):
    res = client.get("/api/v1/analytics/employees")
    assert res.status_code == 200
    emps = res.json()
    assert len(emps) > 0
    assert "employee_id" in emps[0]

    res_filters = client.get("/api/v1/analytics/filters")
    assert res_filters.status_code == 200
    filters = res_filters.json()
    assert len(filters["departments"]) > 0

def test_bottleneck_detection(client):
    res = client.get("/api/v1/bottlenecks")
    assert res.status_code == 200
    data = res.json()
    assert "total_bottlenecks" in data
    assert "bottlenecks" in data

def test_recommendations_lifecycle(client):
    res = client.get("/api/v1/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) > 0
    rec_id = recs[0]["rec_id"]

    # Test status update
    res_patch = client.patch(f"/api/v1/recommendations/{rec_id}", json={"status": "APPROVED", "notes": "Approved for sprint"})
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "APPROVED"

def test_workload_optimizer(client):
    payload = {
        "department": "All Departments",
        "max_workload_threshold": 1.20,
        "balance_weights": 0.5
    }
    res = client.post("/api/v1/optimizer/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert len(data["assignments"]) > 0
    assert len(data["workload_shifts"]) > 0

def test_forecasting_and_shap(client):
    res = client.get("/api/v1/forecasting")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "TRAINED_AND_EVALUATED"
    assert "evaluation" in data
    assert data["evaluation"]["mae"] >= 0
    assert len(data["feature_importances"]) > 0
    assert len(data["timeline_forecasts"]) > 0

def test_anomaly_detection(client):
    res = client.get("/api/v1/anomalies")
    assert res.status_code == 200
    data = res.json()
    assert "total_anomalies" in data
    assert "anomalies" in data

def test_dataset_management_and_synthetic(client):
    res = client.get("/api/v1/datasets/status")
    assert res.status_code == 200
    status = res.json()
    assert status["is_loaded"] is True

    res_gen = client.post("/api/v1/datasets/generate-synthetic?num_employees=30&seed=999")
    assert res_gen.status_code == 200
    assert res_gen.json()["status"] == "SUCCESS"

def test_reports_exports(client):
    # PDF
    res_pdf = client.get("/api/v1/reports/pdf")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000

    # CSV
    res_csv = client.get("/api/v1/reports/csv")
    assert res_csv.status_code == 200
    assert "employee_id" in res_csv.text

    # JSON summary
    res_json = client.get("/api/v1/reports/summary-json")
    assert res_json.status_code == 200
    assert "kpi_summary" in res_json.json()

def test_settings_get_and_update(client):
    res = client.get("/api/v1/settings")
    assert res.status_code == 200
    initial_settings = res.json()

    # Update weights
    update_payload = {
        "weight_task_completion": 0.40,
        "weight_quality": 0.30,
        "weight_csat": 0.15,
        "weight_adherence": 0.15,
        "threshold_underutilized": 0.80,
        "threshold_optimal_max": 1.15,
        "threshold_overload_warning": 1.25,
        "threshold_critical_burnout": 1.40,
        "anonymize_employee_data": False,
        "mask_salary_or_sensitive": True,
        "auto_trigger_optimizer": False,
        "anomaly_sensitivity": 0.08
    }
    res_put = client.put("/api/v1/settings", json=update_payload)
    assert res_put.status_code == 200
    assert res_put.json()["weight_task_completion"] == 0.40

    # Reset
    res_reset = client.post("/api/v1/settings/reset")
    assert res_reset.status_code == 200
    assert res_reset.json()["weight_task_completion"] == 0.35
