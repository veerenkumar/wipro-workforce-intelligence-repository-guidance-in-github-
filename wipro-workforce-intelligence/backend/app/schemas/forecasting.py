from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class ModelMetrics(BaseModel):
    mae: float
    rmse: float
    r2_score: float
    baseline_mae: float  # Honest comparison with lag-1 or rolling average baseline
    relative_improvement_pct: float
    split_strategy: str
    train_samples_count: int
    test_samples_count: int

class FeatureImportance(BaseModel):
    feature: str
    importance: float
    shap_value: float
    description: str

class ForecastPoint(BaseModel):
    period: str
    historical_actual: Optional[float] = None
    predicted_productivity: float
    predicted_lower_bound: float
    predicted_upper_bound: float
    confidence_level: float

class DepartmentForecast(BaseModel):
    department: str
    current_productivity: float
    forecasted_next_month: float
    expected_change_pct: float
    projected_risk_level: str

class ForecastingResponse(BaseModel):
    status: str
    algorithm: str
    evaluation: ModelMetrics
    feature_importances: List[FeatureImportance]
    timeline_forecasts: List[ForecastPoint]
    department_forecasts: List[DepartmentForecast]
    shap_summary_insights: List[str]
