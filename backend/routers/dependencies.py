from fastapi import Depends, Cookie, HTTPException


from database import get_db
from services import session_service, user_service
from core.exceptions import InvalidSessionError

from sqlalchemy.ext.asyncio import AsyncSession


#　セッションIDから認証チェック 
async def get_current_user(
    session_id: str = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    user_id = await session_service.get_user_id(db, session_id)
    if not user_id:
        raise InvalidSessionError()

    user = await user_service.get_user(db, user_id)

    return user