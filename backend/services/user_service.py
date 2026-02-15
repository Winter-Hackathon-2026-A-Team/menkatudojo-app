from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from core.exceptions import UserNotFoundError

def get_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError()
    return user