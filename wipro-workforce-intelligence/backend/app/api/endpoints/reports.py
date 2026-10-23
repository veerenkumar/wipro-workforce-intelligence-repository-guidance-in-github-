from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from ...core.database import get_db
from ...services.report_service import generate_pdf_management_report, generate_csv_workforce_export
from ...services.analytics_service import get_analytics_dashboard
from ...services.bottleneck_service import detect_operational_bottlenecks
from ...services.recommendation_service import get_all_recommendations

router = APIRouter()

@router.get("/pdf")
def export_pdf_report(
    week_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    pdf_bytes = generate_pdf_management_report(db, week_id=week_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=wipro_workforce_intelligence_report.pdf"}
    )

@router.get("/csv")
def export_csv_report(db: Session = Depends(get_db)):
    csv_text = generate_csv_workforce_export(db)
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=wipro_workforce_dataset_export.csv"}
    )

@router.get("/summary-json")
def export_summary_json(
    week_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    dashboard = get_analytics_dashboard(db, week_id=week_id)
    bottlenecks = detect_operational_bottlenecks(db, week_id=week_id)
    recommendations = get_all_recommendations(db)

    return {
        "kpi_summary": dashboard.kpis,
        "bottlenecks": bottlenecks,
        "recommendations_count": len(recommendations),
        "department_metrics": dashboard.department_metrics,
        "generated_at": dashboard.weekly_trends[-1].week_id if dashboard.weekly_trends else "N/A"
    }
