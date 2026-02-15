from fastapi import Depends, Cookie, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from services import session_service, user_service
from core.exceptions import InvalidSessionError

#　セッションIDから認証チェック 
def get_current_user(
    session_id: str = Cookie(None),
    db: Session = Depends(get_db),
):
    user_id = session_service.get_user_id(db, session_id)
    if not user_id:
        raise InvalidSessionError()

    user = user_service.get_user(db, user_id)

    return user