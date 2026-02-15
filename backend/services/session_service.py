from datetime import datetime
from sqlalchemy.orm import Session
from models.session import Session as SessionModel
from config.settings import settings
from zoneinfo import ZoneInfo

def get_user_id(db: Session, session_id: str) -> int | None:
    session = (
        db.query(SessionModel)
        .filter(SessionModel.session_id == session_id)
        .first()
    )
    if not session:
        return None

    if session.expires_at < datetime.now(ZoneInfo(settings.TZ)):
        return None

    return session.user_id
