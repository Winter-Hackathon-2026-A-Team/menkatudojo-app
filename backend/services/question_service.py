from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from models.question import Question
from models.category import Category
from config.settings import settings
from core.exceptions import QuestionNotFoundError, ForbiddenError
from sqlalchemy import select, func, or_
from schemas.question import QuestionGetResponse, QuestionItem


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

async def get_random_question_id_by_category(db, user, category_id):
    stmt = (
        select(Question.id)
        .where(Question.is_active == 1)
        .where(Question.category_id == category_id)
        .where((Question.source != "user") | (Question.owner_user_id == user.id))
        .order_by(func.rand())
        .limit(1)
    )
    result = await db.execute(stmt)
    qid = result.scalar_one_or_none()

    if not qid:
        raise QuestionNotFoundError()

    return qid

async def create_question(db, user, payload):
    question = Question(
        owner_user_id=user.id,
        category_id=payload.category_id,
        visibility=payload.visibility,
        source="user",
        question_text=payload.question_text,
        is_active=1,
        sort_order=0
    )

    db.add(question)
    await db.commit()
    await db.refresh(question)

    return question


async def get_question(db, user):

    stmt = (
        select(
            Question.id,
            Category.name,
            Question.question_text,
            Question.source,
            Question.sort_order,
        )
        .join(Category, Category.id == Question.category_id)
        .where(or_(Question.owner_user_id == user.id, Question.source == 'system'))
    )

    result = await db.execute(stmt)
    rows = result.mappings().all()

    return QuestionGetResponse(
        questions=[
            QuestionItem(
                questionId=row["id"],
                categoryName=row["name"],
                questionContent=row["question_text"],
                source=row["source"],
                sortOrder=row["sort_order"],
                durationLimitSeconds=settings.MAX_RECORDING_DURATION_S,
            )
            for row in rows
        ]
    )