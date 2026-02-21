from sqlalchemy import String, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import INTEGER

from database import Base

class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    session_id: Mapped[str] = mapped_column(
        String(64), 
        unique=True, 
        nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    expires_at: Mapped["DateTime"] = mapped_column(
        DateTime, 
        nullable=False
    )
    revoked_at: Mapped["DateTime | None"] = mapped_column(
        DateTime, 
        nullable=True
    )
    last_accessed_at: Mapped["DateTime | None"] = mapped_column(
        DateTime, 
        nullable=True
    )
    user = relationship("User", lazy="joined")
    __table_args__ = (
        Index("ix_sessions_user_id", "user_id"),
    )