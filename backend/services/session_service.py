from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from core.security import generate_session_id
from config.settings import base as settings

JST = timezone(timedelta(hours=9))

class SessionService:
    def __init__(self, db):
        self.db = db

    async def create_session(self, user_id: int):
        session_id = generate_session_id()
        expires_at = datetime.now(JST) + timedelta(days=settings.SESSION_EXPIRE_DAYS)

        await self.db.execute(
            text("""
                 INSERT INTO sessions (session_id, user_id, expires_at)
                 VALUES (:session_id, :user_id, :expires_at)
            """),
            {"session_id": session_id, "user_id": user_id, "expires_at": expires_at},
        )
        await self.db.commit()
        return session_id
     
    async def revoke_session(self, session_id: str) -> None:
        now = datetime.now(JST)
        await self.db.execute(
            text("""
                 UPDATE sessions
                 SET revoked_at = :now
                 WHERE session_id = :session_id
                    AND revoked_at IS NULL
            """),
            {"session_id": session_id, "now": now},
        )
        await self.db.commit()

    async def get_valid_session(self, session_id: str):
        now = datetime.now(JST)
        result = await self.db.execute(
            text("""
                 SELECT *
                 FROM sessions
                 WHERE session_id = :session_id
                   AND revoked_at IS NULL
                   AND expires_at > :now
                 LIMIT 1
            """),
            {"session_id": session_id, "now": now},
        )
        return result.mappings().first()
    
        