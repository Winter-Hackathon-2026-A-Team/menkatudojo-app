from fastapi import APIRouter, Depends
from schemas.dashboard import DashboardResponse
from database import get_db
from routers.dependencies import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from services import user_service


router = APIRouter(prefix="/api/user", tags=["user"])

@router.get("/dashboard", response_model=DashboardResponse)
async def read_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await user_service.get_dashboard_data(db, current_user)