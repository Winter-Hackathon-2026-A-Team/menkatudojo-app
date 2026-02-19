from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from models.question import Question
from config.settings import settings
from core.exceptions import QuestionNotFoundError, ForbiddenError
from sqlalchemy import select, func


async def get_question_data(db, user, question_id):
    stmt = (
        select(Question)
        .options(selectinload(Question.category))
        .filter(Question.id == question_id)
    )
    result = await db.execute(stmt)
    question = result.scalars().first()

    if not question:
        raise QuestionNotFoundError()

    if question.source == "user" and question.owner_user_id != user.id:
        raise ForbiddenError()

    return {
        "questionId": question.id,
        "categoryName": question.category.name if question.category else None,
        "questionContent": question.question_text,
        "source": question.source,
        "sortOrder": question.sort_order,
        "durationLimitSeconds": settings.MAX_RECORDING_DURATION_S
    }

async def get_random_question_id(db, user):
    # 「他人の user 問題」は出さない（403回避）
    # is_active=1 のみ対象
    stmt = (
        select(Question.id)
        .where(Question.is_active == 1)
        .where((Question.source != "user") | (Question.owner_user_id == user.id))
        .order_by(func.rand())          # MySQLのランダム
        .limit(1)
    )
    result = await db.execute(stmt)
    qid = result.scalar_one_or_none()

    if not qid:
        raise QuestionNotFoundError()

    return qid
