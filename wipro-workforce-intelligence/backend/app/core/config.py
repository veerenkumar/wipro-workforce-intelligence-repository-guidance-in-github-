from pydantic import BaseModel
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data" / "synthetic"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/workforce.db")

class Settings(BaseModel):
    app_name: str = "Wipro Workforce Productivity & Workload Intelligence Agent"
    version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    database_url: str = DATABASE_URL
    data_dir: Path = DATA_DIR

settings = Settings()
