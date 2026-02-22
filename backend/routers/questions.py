from fastapi import APIRouter, Depends
from schemas.questions import questionContentResponse, QuestionCreateRequest
from dependencies.auth import get_current_user
from core.security import verify_csrf
from services import question_service
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.get("/random", response_model=questionContentResponse)
async def get_random_question(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    qid = await question_service.get_random_question_id(db, current_user)
    return await question_service.get_question_data(db, current_user, qid)

@router.get("/random/{category_id}", response_model=questionContentResponse)
async def get_random_question_by_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    qid = await question_service.get_random_question_id_by_category(
        db, current_user, category_id
    )
    return await question_service.get_question_data(db, current_user, qid)


# 質問内容と、録画可能時間を返す
@router.get("/{question_id}", response_model=questionContentResponse)
async def get_question_data(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    return await question_service.get_question_data(db, current_user, question_id)

@router.post("", status_code=201, dependencies=[Depends(verify_csrf)])
async def create_question(
    payload: QuestionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    question = await question_service.create_question(db, current_user, payload)
    return {"message": "Question created", "questionId": question.id}
    