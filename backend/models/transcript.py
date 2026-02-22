from __future__ import annotations

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.sql import text as sql_text
from sqlalchemy.dialects.mysql import INTEGER, MEDIUMTEXT
from database import Base


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
    created_at: Mapped[str] = mapped_column(
        DateTime, 
        nullable=False, 
        server_default=sql_text("CURRENT_TIMESTAMP")
    )