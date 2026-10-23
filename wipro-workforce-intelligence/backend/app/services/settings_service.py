from sqlalchemy.orm import Session
from ..models.settings import SystemSettingsModel
from ..schemas.settings import SystemSettingsSchema
from .analytics_service import get_or_create_settings, calculate_record_scores

def get_current_settings(db: Session) -> SystemSettingsModel:
    return get_or_create_settings(db)

def update_system_settings(db: Session, new_settings: SystemSettingsSchema) -> SystemSettingsModel:
    settings = get_or_create_settings(db)

    settings.weight_task_completion = new_settings.weight_task_completion
    settings.weight_quality = new_settings.weight_quality
    settings.weight_csat = new_settings.weight_csat
    settings.weight_adherence = new_settings.weight_adherence

    settings.threshold_underutilized = new_settings.threshold_underutilized
    settings.threshold_optimal_max = new_settings.threshold_optimal_max
    settings.threshold_overload_warning = new_settings.threshold_overload_warning
    settings.threshold_critical_burnout = new_settings.threshold_critical_burnout

    settings.anonymize_employee_data = new_settings.anonymize_employee_data
    settings.mask_salary_or_sensitive = new_settings.mask_salary_or_sensitive
    settings.auto_trigger_optimizer = new_settings.auto_trigger_optimizer
    settings.anomaly_sensitivity = new_settings.anomaly_sensitivity

    db.commit()
    db.refresh(settings)

    # Recalculate derived productivity scores and status categories
    calculate_record_scores(db)

    return settings

def reset_settings_to_default(db: Session) -> SystemSettingsModel:
    settings = get_or_create_settings(db)
    settings.weight_task_completion = 0.35
    settings.weight_quality = 0.25
    settings.weight_csat = 0.20
    settings.weight_adherence = 0.20

    settings.threshold_underutilized = 0.80
    settings.threshold_optimal_max = 1.15
    settings.threshold_overload_warning = 1.25
    settings.threshold_critical_burnout = 1.40

    settings.anonymize_employee_data = False
    settings.mask_salary_or_sensitive = True
    settings.auto_trigger_optimizer = False
    settings.anomaly_sensitivity = 0.08

    db.commit()
    db.refresh(settings)

    calculate_record_scores(db)
    return settings
