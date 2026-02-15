from fastapi import APIRouter, Depends
from schemas.questions import questionContentResponse
from routers.dependencies import get_current_user
from core.security import verify_csrf
from services import question_service
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/api/questions", tags=["questions"])

# 署名付きURLの生成
@router.get("/{question_id}", response_model=questionContentResponse)
def get_question_data(
    question_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    result = question_service.get_question_data(db, current_user, question_id)

    return result
    