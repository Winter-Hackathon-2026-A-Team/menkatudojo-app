
from __future__ import annotations

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime, func
from sqlalchemy.sql import text as sql_text
from sqlalchemy.dialects.mysql import INTEGER, MEDIUMTEXT
from database import Base
from datetime import datetime

class Transcript(Base):
    __tablename__ = "transcripts"

    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True), 
        primary_key=True, 
        autoincrement=True
    )
    attempt_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True), 
        ForeignKey("attempts.id", ondelete="CASCADE"), 
        nullable=False, 
        unique=True
    )

    text: Mapped[str] = mapped_column(
        MEDIUMTEXT, 
        nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    attempt = relationship("Attempt", back_populates="transcript")

