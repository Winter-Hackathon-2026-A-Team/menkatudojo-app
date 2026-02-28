from __future__ import annotations
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from core.exceptions import UserNotFoundError
from uuid import uuid4
from sqlalchemy import text, select, func, distinct
from models.attempt import Attempt as Answer
from models.question import Question
from models.category import Category
from models.feedback import Feedback
from schemas.dashboard import (
    DashboardResponse, 
    DashboardStats, 
    LatestAnswer, 
    CharacterConfig, 
    FeedbackGrade
)

from sqlalchemy.ext.asyncio import AsyncSession

from core.security import hash_password
from sqlalchemy.orm import selectinload


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_by_email(self, email: str):
        result = await self.db.execute(
            text("""
                 SELECT id, public_id, email, username, password, is_active
                 FROM users
                 WHERE email = :email
                 LIMIT 1
            """),
            {"email": email}
        )
        return result.mappings().first()
    
    async def find_by_id(self, user_id: int):
        result = await self.db.execute(
            text("""
                 SELECT id, public_id, email, username, password, is_active
                 FROM users
                 WHERE id = :id
                 LIMIT 1
            """),
            {"id": user_id}
        )
        return result.mappings().first()
    
    async def create_user(self, email: str, username: str, password: str):
        existing = await self.find_by_email(email)
        if existing:
            return None, "EMAIL_ALREADY_EXISTS"
        
        password_hased = hash_password(password)

        public_id = str(uuid4())

        await self.db.execute(
            text("""
                 INSERT INTO users (public_id, email, password, username, is_active)
                 VALUES (:public_id, :email, :password, :username, 1)
            """),
            {
                "public_id": public_id,
                "email": email,
                "password": password_hased,
                "username": username
            },
        )

        user = await self.find_by_email(email)
        return user, None

        
async def get_user(db: AsyncSession, user_id: int):
    stmt = select(User).filter(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise UserNotFoundError()
    return user


# --- dashboard ---


async def get_dashboard_data(db: AsyncSession, user: User) -> DashboardResponse:
    """
    ダッシュボード用の統計情報と直近の回答履歴を取得する
    """
    # 1. 統計情報の取得 (stats)
    stats_stmt = (
        select(
            func.count(Answer.id).label("totalCount"),
            func.count(distinct(func.date(Answer.created_at))).label("totalDays"),
            func.sum(Answer.duration_s).label("totalDurationSeconds")
        )
        .where(Answer.user_id == user.id)
    )
    stats_result = await db.execute(stats_stmt)
    stats_row = stats_result.mappings().one()

    # 2. 直近の回答取得 (latestAnswers)
    latest_stmt = (
        select(Answer)
        .options(
            # AnswerからQuestion、さらにCategoryまで一気にロード（N+1問題対策）
            selectinload(Answer.question).selectinload(Question.category),
            selectinload(Answer.feedback).selectinload(Feedback.avatar)
        )
        .where(Answer.user_id == user.id)
        .order_by(Answer.created_at.desc())
        .limit(3)
    )
    latest_result = await db.execute(latest_stmt)
    answers = latest_result.scalars().all()

    # 3. レスポンスの組み立て
    return DashboardResponse(
        stats=DashboardStats(
            totalCount=stats_row["totalCount"] or 0,
            totalDays=stats_row["totalDays"] or 0,
            totalDurationSeconds=int(stats_row["totalDurationSeconds"] or 0)
        ),
        latestAnswers=[
            LatestAnswer(
                answerId=str(ans.public_id),
                categoryName=ans.question.category.name if ans.question and ans.question.category else "未設定",
                questionContent=ans.question.question_text if ans.question else "不明な質問",
                createdAt=ans.created_at,
                characterConfig=CharacterConfig(
                    avatarId=ans.feedback.avatar_id,
                    personalityId=ans.feedback.avatar.personality_id
                ),
                feedback=FeedbackGrade(
                    grade=ans.feedback.grade if ans.feedback else "N/A"
                )
            )
            for ans in answers
        ]
    )

