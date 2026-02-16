from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services.session_service import SessionService

COOKIE_NAME = "session_id"

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    session_id: str | None = Cookie(default=None, alias=COOKIE_NAME),
):
    # Cookieが無ければ未ログイン
    if not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # sessionsテーブルで有効なセッションか確認
    sess_svc = SessionService(db)
    sess = await sess_svc.get_valid_session(session_id)
    if not sess:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # users取得
    r = await db.execute(
        text("""
            SELECT id, public_id, email, username, is_active
            FROM users
            WHERE id = :id
            LIMIT 1
        """),
        {"id": sess["user_id"]},
    )
    user = r.mappings().first()

    if not user or int(user["is_active"]) != 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return user
