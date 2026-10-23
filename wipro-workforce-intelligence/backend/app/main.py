import sys
# Prevent pyarrow protobuf C-symbol collision with Google OR-Tools on macOS
sys.modules['pyarrow'] = None

import ortools
from ortools.linear_solver import pywraplp
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.config import settings
from .core.database import engine, Base, SessionLocal
from .api.router import api_router
from .models.employee import EmployeeRecord
from .services.data_service import generate_synthetic_workforce_data, save_synthetic_csv, load_dataset_into_db
from .services.recommendation_service import seed_default_recommendations_if_empty

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Automatically seed initial synthetic data if database is fresh
    db = SessionLocal()
    try:
        count = db.query(EmployeeRecord).count()
        if count == 0:
            print("Database empty. Generating baseline synthetic workforce dataset...")
            df = generate_synthetic_workforce_data(num_employees=60, seed=42)
            save_synthetic_csv(df)
            load_dataset_into_db(df, db, clear_existing=False)
            print(f"Loaded {len(df)} synthetic records across 12 sprint weeks.")

        seed_default_recommendations_if_empty(db)
    except Exception as e:
        print(f"Startup initialization notice: {e}")
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Wipro Workforce Productivity & Workload Intelligence Agent — AI-powered workforce capacity, bottleneck diagnosis, and workload allocation optimization.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "api_docs": "/docs",
        "disclaimer": "This system operates on synthetic enterprise simulation datasets for demonstration and workforce optimization purposes."
    }
