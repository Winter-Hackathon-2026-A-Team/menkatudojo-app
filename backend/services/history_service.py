from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from models.attempt import Attempt
from models.question import Question
from models.transcript import Transcript
from models.recording import Recording
from models.feedback import Feedback
from models.avatar import Avatar
from models.category import Category
from models.user import User
import math
from core.exceptions import ForbiddenError
from config.settings import settings

async def get_history_list(db, user, page, limit):
    
    # ユーザーの面接履歴の総数を得るためのクエリ
    count_stmt = (
        select(func.count(distinct(Attempt.id)))
        .join(Question, Attempt.question_id == Question.id)
        .join(Transcript, Transcript.attempt_id == Attempt.id)
        .join(Recording, Recording.attempt_id == Attempt.id)
        .join(Feedback, Feedback.attempt_id == Attempt.id)
        .join(Avatar, Avatar.id == Feedback.avatar_id)
        .where(Attempt.user_id == user.id)
    )

    # ユーザーの面接履歴の総数
    total_count = (await db.execute(count_stmt)).scalar_one()

    # ユーザーの面接履歴がない場合
    if total_count == 0:
        return {
            "answers": [],
            "meta": {
                "totalCount": 0,
                "totalPages": 0,
                "currentPage": 0,
            }
        }
    
    # 総ページ数の計算
    total_pages = math.ceil(total_count / limit) 

    offset = (page - 1) * limit

    # 要求されたページに載せる情報だけを抽出するためのクエリ
    stmt = (
        select(
            Attempt.public_id,
            Category.name,
            Attempt.created_at,
            Question.question_text,
            Feedback.avatar_id,
            Avatar.personality_id,
            Feedback.grade,
        )
        .join(Question, Attempt.question_id == Question.id)
        .join(Category, Category.id == Question.category_id)
        .join(Feedback, Feedback.attempt_id == Attempt.id)
        .join(Avatar, Avatar.id == Feedback.avatar_id)
        .where(Attempt.user_id == user.id)
        .order_by(Attempt.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    # 履歴取得
    result = await db.execute(stmt)
    rows = result.all()

    tgt_attempts = []


    for row in rows:
        tgt_attempts.append({
            "answerId": row.public_id,
            "categoryName": row.name,
            "questionContent": row.question_text,
            "createdAt": row.created_at,
            "characterConfig": {
                "avatarId": row.avatar_id,
                "personalityId": row.personality_id
            },
            "feedback": {
                "grade": row.grade
            }
        })

    

    return {
        "answers": tgt_attempts,
        "meta": {
            "totalCount": total_count,
            "totalPages": total_pages,
            "currentPage": page,
        }
    }


async def get_history_detail(db, user, s3, answer_id):

    stmt = (
        select(
            Attempt.public_id.label("public_id"),
            Category.name,
            Question.question_text,
            Attempt.created_at,
            Feedback.avatar_id,
            Avatar.personality_id,
            Transcript.text,
            Feedback.grade,
            Feedback.good_points,
            Feedback.improve_points,
            Feedback.next_tip,
            Recording.storage_key,
        )
        .join(Question, Attempt.question_id == Question.id)
        .join(Category, Category.id == Question.category_id)
        .join(Recording, Recording.attempt_id == Attempt.id)
        .join(Feedback, Feedback.attempt_id == Attempt.id)
        .join(Avatar, Avatar.id == Feedback.avatar_id)
        .join(Transcript, Transcript.attempt_id == Attempt.id)
        .where(
            Attempt.public_id == answer_id,
            Attempt.user_id == user.id,
        )
    )

    result = await db.execute(stmt)
    row = result.mappings().one_or_none()

    # 存在しない or 他人のデータ
    if row is None:
        raise ForbiddenError()

    video_url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": row["storage_key"],
        },
        ExpiresIn=1200
    )

    return {
        "answerId": row["public_id"],
        "categoryName": row["name"],
        "questionContent": row["question_text"],
        "createdAt": row["created_at"],
        "characterConfig": {
            "avatarId": row["avatar_id"],
            "personalityId": row["personality_id"]
        },
        "transcript": row["text"],
        "feedback": {
            "grade": row["grade"],
            "goodPoints": row["good_points"],
            "improvePoints": row["improve_points"],
            "nextTip": row["next_tip"],
            "videoUrl": video_url,
            "storageKey": row["storage_key"],
        }
    }

