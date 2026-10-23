from fastapi import APIRouter
from .endpoints import (
    dashboard, analytics, bottlenecks, recommendations,
    optimizer, forecasting, anomalies, datasets, reports, settings
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Executive Dashboard"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Workforce Analytics"])
api_router.include_router(bottlenecks.router, prefix="/bottlenecks", tags=["Bottleneck Detection"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["AI Recommendations"])
api_router.include_router(optimizer.router, prefix="/optimizer", tags=["Workload Optimizer"])
api_router.include_router(forecasting.router, prefix="/forecasting", tags=["Productivity Forecasting"])
api_router.include_router(anomalies.router, prefix="/anomalies", tags=["Anomaly Detection"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Dataset Management"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Exports"])
api_router.include_router(settings.router, prefix="/settings", tags=["Configuration & Settings"])
