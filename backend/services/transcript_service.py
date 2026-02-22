from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


class TranscriptService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upsert_transcript(self, attempt_id: int, text_value: str):
        await self.db.execute(
            text("""
                INSERT INTO transcripts (attempt_id, text)
                VALUES (:attempt_id, :text)
                ON DUPLICATE KEY UPDATE
                    text = VALUES(text)
            """),
            {"attempt_id": attempt_id, "text": text_value},
        )
        await self.db.commit()

    async def get_transcript(self, attempt_id: int):
        r = await self.db.execute(
            text("""
                SELECT text
                FROM transcripts
                WHERE attempt_id = :attempt_id
                LIMIT 1
            """),
            {"attempt_id": attempt_id},
        )
        return r.mappings().first()