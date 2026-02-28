import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


class AttemptService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_attempt(self, user_id: int, question_id: int, duration_limit_s: int | None):
        public_id = str(uuid.uuid4())

        await self.db.execute(
            text("""
                INSERT INTO attempts (public_id, user_id, question_id, duration_limit_s, status)
                VALUES (:public_id, :user_id, :question_id, :duration_limit_s, 'CREATED')
            """),
            {
                "public_id": public_id,
                "user_id": user_id,
                "question_id": question_id,
                "duration_limit_s": duration_limit_s,
            },
        )
        await self.db.commit()

        return {"public_id": public_id, "status": "CREATED"}

    async def get_attempt_owned(self, user_id: int, public_id: str):
        r = await self.db.execute(
            text("""
                SELECT id, public_id, user_id, question_id, status, duration_limit_s, duration_s
                FROM attempts
                WHERE public_id = :public_id
                  AND user_id = :user_id
                  AND deleted_at IS NULL
                LIMIT 1
            """),
            {"public_id": public_id, "user_id": user_id},
        )
        return r.mappings().first()

    async def get_attempt_detail_owned(self, user_id: int, public_id: str):
        r = await self.db.execute(
            text("""
                SELECT
                  a.public_id,
                  a.question_id,
                  a.status,
                  a.duration_limit_s,
                  a.duration_s,
                  EXISTS(SELECT 1 FROM recordings r WHERE r.attempt_id = a.id) AS has_recording,
                  EXISTS(SELECT 1 FROM transcripts t WHERE t.attempt_id = a.id) AS has_transcript,
                  EXISTS(SELECT 1 FROM feedbacks f WHERE f.attempt_id = a.id) AS has_feedback
                FROM attempts a
                WHERE a.public_id = :public_id
                  AND a.user_id = :user_id
                  AND a.deleted_at IS NULL
                LIMIT 1
            """),
            {"public_id": public_id, "user_id": user_id},
        )
        row = r.mappings().first()
        if not row:
            return None

        # MySQLのEXISTSは 0/1 で返ることがあるので bool へ
        row = dict(row)
        row["has_recording"] = bool(row["has_recording"])
        row["has_transcript"] = bool(row["has_transcript"])
        row["has_feedback"] = bool(row["has_feedback"])
        return row

    async def update_status(self, attempt_id: int, status: str, error_message: str | None = None):
        await self.db.execute(
            text("""
                UPDATE attempts
                SET status = :status,
                    error_message = :error_message
                WHERE id = :id
            """),
            {"status": status, "error_message": error_message, "id": attempt_id},
        )
        await self.db.commit()