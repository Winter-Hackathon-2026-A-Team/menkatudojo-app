from sqlalchemy import Column, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.mysql import INTEGER, CHAR
from database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True
    )

    session_id = Column(
        CHAR(64),
        unique=True,
        nullable=False
    )
    
    user_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )

    expires_at = Column(
        DateTime,
        nullable=False,
    )

    revorked_at = Column(
        DateTime,
    )

    last_accessed_at = Column(
        DateTime,
    )

    updated_at = Column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
        nullable=False
    )