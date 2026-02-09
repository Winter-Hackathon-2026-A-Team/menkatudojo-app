from __future__ import annotations
from uuid import uuid4
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import hash_password

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

        
    
