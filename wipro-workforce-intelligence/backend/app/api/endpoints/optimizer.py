from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...schemas.optimizer import OptimizationRequest, OptimizationResponse
from ...services.optimizer_service import optimize_workload_allocation

router = APIRouter()

@router.post("/run", response_model=OptimizationResponse)
def run_workload_optimizer(
    request: OptimizationRequest,
    db: Session = Depends(get_db)
):
    return optimize_workload_allocation(db, request=request)
