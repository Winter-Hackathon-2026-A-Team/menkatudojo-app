from fastapi import APIRouter, Depends
from schemas.questions import questionContentResponse
from routers.dependencies import get_current_user
from core.security import verify_csrf
from services import question_service
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/questions", tags=["questions"])

# 質問内容と、録画可能時間を返す
@router.get("/{question_id}", response_model=questionContentResponse)
async def get_question_data(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    return await question_service.get_question_data(db, current_user, question_id)
    