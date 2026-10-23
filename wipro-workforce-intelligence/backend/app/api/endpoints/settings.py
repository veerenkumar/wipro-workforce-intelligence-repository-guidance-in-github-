from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...schemas.settings import SystemSettingsSchema
from ...services.settings_service import (
    get_current_settings, update_system_settings, reset_settings_to_default
)

router = APIRouter()

@router.get("", response_model=SystemSettingsSchema)
def read_settings(db: Session = Depends(get_db)):
    return get_current_settings(db)

@router.put("", response_model=SystemSettingsSchema)
def save_settings(
    new_settings: SystemSettingsSchema,
    db: Session = Depends(get_db)
):
    return update_system_settings(db, new_settings)

@router.post("/reset", response_model=SystemSettingsSchema)
def reset_settings(db: Session = Depends(get_db)):
    return reset_settings_to_default(db)
