import io
import csv
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from .analytics_service import get_analytics_dashboard
from .bottleneck_service import detect_operational_bottlenecks
from .recommendation_service import get_all_recommendations
from ..models.employee import EmployeeRecord

def generate_pdf_management_report(db: Session, week_id: str = None) -> bytes:
    """
    Generates a professional executive intelligence PDF report.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0B192C"),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=14
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1E3E62"),
        spaceBefore=12,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E293B")
    )

    story = []

    # Title & Header
    story.append(Paragraph("Wipro Workforce Productivity & Workload Intelligence", title_style))
    story.append(Paragraph(
        f"Executive Management Assessment Report | Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Confidential (Operational Demo Simulation)",
        subtitle_style
    ))
    story.append(Spacer(1, 8))

    # Fetch fresh analytics
    dashboard = get_analytics_dashboard(db, week_id=week_id)
    kpis = dashboard.kpis

    # KPI Table
    story.append(Paragraph("Executive KPI Summary Snapshot", h2_style))
    kpi_data = [
        ["Metric", "Value", "Metric", "Value"],
        ["Avg Productivity Score", f"{kpis.avg_productivity_score} / 100", "Total Active Workforce", f"{kpis.total_active_workforce} Engineers"],
        ["Avg Workload Ratio", f"{kpis.avg_workload_ratio}x", "Total Capacity Hours", f"{kpis.total_capacity_hours} hrs"],
        ["Total Overtime Hours", f"{kpis.total_overtime_hours} hrs", "Task Completion Rate", f"{kpis.task_completion_rate}%"],
        ["Quality Score", f"{kpis.avg_quality_score}%", "Avg Client CSAT", f"{kpis.avg_client_csat} / 5.0"],
        ["Overloaded Staff", f"{kpis.overloaded_count}", "Burnout Risk Staff", f"{kpis.burnout_risk_count}"],
        ["Operational Alert Level", kpis.operational_alert_level, "Optimal Balanced Staff", f"{kpis.optimal_count}"]
    ]

    t_kpi = Table(kpi_data, colWidths=[140, 120, 140, 120])
    t_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0B192C")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(t_kpi)
    story.append(Spacer(1, 14))

    # Bottleneck Highlights
    story.append(Paragraph("Active Operational Bottlenecks", h2_style))
    btn_response = detect_operational_bottlenecks(db, week_id=week_id)
    btn_data = [["ID", "Category", "Severity", "Department", "Estimated Weekly Loss"]]
    for b in btn_response.bottlenecks[:5]:
        btn_data.append([
            b.id,
            b.category,
            b.severity,
            Paragraph(b.department, body_style),
            f"{b.estimated_weekly_loss_hours} hrs"
        ])

    if len(btn_data) == 1:
        btn_data.append(["-", "No Active Bottlenecks", "Normal", "All", "0 hrs"])

    t_btn = Table(btn_data, colWidths=[70, 110, 60, 200, 80])
    t_btn.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3E62")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(t_btn)
    story.append(Spacer(1, 14))

    # AI Recommendations
    story.append(Paragraph("AI Recommendations & Intervention Plan", h2_style))
    recs = get_all_recommendations(db)
    rec_data = [["Ref ID", "Title", "Category", "Status", "Projected Impact"]]
    for r in recs[:5]:
        rec_data.append([
            r.rec_id,
            Paragraph(r.title, body_style),
            r.category,
            r.status,
            Paragraph(r.projected_impact, body_style)
        ])

    t_rec = Table(rec_data, colWidths=[75, 175, 100, 60, 110])
    t_rec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0B192C")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(t_rec)
    story.append(Spacer(1, 16))

    # Disclaimer note
    story.append(Paragraph(
        "Notice: This report is generated by the Wipro Workforce Productivity & Workload Intelligence Agent using synthetic simulation data for demonstration and workload optimization validation. No actual internal employee records are referenced.",
        subtitle_style
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_csv_workforce_export(db: Session) -> str:
    """
    Exports all employee workforce records as CSV.
    """
    records = db.query(EmployeeRecord).all()
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "employee_id", "name", "role", "department", "experience_years",
        "weekly_capacity_hours", "logged_hours", "completed_tasks",
        "assigned_tasks", "backlog_tasks", "quality_rework_rate",
        "client_csat", "overtime_hours", "absenteeism_days", "skills",
        "week_id", "productivity_score", "workload_ratio", "status_category"
    ])

    for r in records:
        writer.writerow([
            r.employee_id, r.name, r.role, r.department, r.experience_years,
            r.weekly_capacity_hours, r.logged_hours, r.completed_tasks,
            r.assigned_tasks, r.backlog_tasks, r.quality_rework_rate,
            r.client_csat, r.overtime_hours, r.absenteeism_days, r.skills,
            r.week_id, r.productivity_score, r.workload_ratio, r.status_category
        ])

    return output.getvalue()
