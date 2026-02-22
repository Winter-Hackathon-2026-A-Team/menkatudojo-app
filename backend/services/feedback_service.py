from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from config.settings import settings


class FeedbackService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _generate_dummy_feedback(self, transcript_text: str):
        # 超簡易のダミー評価（あとでAIに差し替え）
        length = len(transcript_text.strip())

        if length >= 600:
            grade = "A"
            good_points = 3
            improve_points = 1
            tip = "結論→理由→具体例の順が安定しています。最後に一言でまとめるとさらに強いです。"
        elif length >= 250:
            grade = "B"
            good_points = 2
            improve_points = 2
            tip = "主張は伝わっています。要点を3つに絞り、具体例を1つ入れると説得力が上がります。"
        else:
            grade = "C"
            good_points = 1
            improve_points = 3
            tip = "情報量が少ないので、結論・理由・経験（数字/期間）を足してみてください。"

        return {
            "good_points": good_points,
            "improve_points": improve_points,
            "next_tip": tip,
            "grade": grade,
            "model_name": "dummy-feedback-v0",
        }

    async def upsert_feedback(self, attempt_id: int, avatar_id: int | None, transcript_text: str):
        fb = self._generate_dummy_feedback(transcript_text)

        await self.db.execute(
            text("""
                INSERT INTO feedbacks (attempt_id, avatar_id, good_points, improve_points, next_tip, grade, model_name)
                VALUES (:attempt_id, :avatar_id, :good_points, :improve_points, :next_tip, :grade, :model_name)
                ON DUPLICATE KEY UPDATE
                    avatar_id = VALUES(avatar_id),
                    good_points = VALUES(good_points),
                    improve_points = VALUES(improve_points),
                    next_tip = VALUES(next_tip),
                    grade = VALUES(grade),
                    model_name = VALUES(model_name)
            """),
            {
                "attempt_id": attempt_id,
                "avatar_id": avatar_id,
                "good_points": fb["good_points"],
                "improve_points": fb["improve_points"],
                "next_tip": fb["next_tip"],
                "grade": fb["grade"],
                "model_name": fb["model_name"],
            },
        )
        await self.db.commit()
        return fb

    async def get_feedback(self, attempt_id: int):
        r = await self.db.execute(
            text("""
                SELECT good_points, improve_points, next_tip, grade, model_name
                FROM feedbacks
                WHERE attempt_id = :attempt_id
                LIMIT 1
            """),
            {"attempt_id": attempt_id},
        )
        return r.mappings().first()