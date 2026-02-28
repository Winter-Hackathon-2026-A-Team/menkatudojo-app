
from __future__ import annotations
import enum
from sqlalchemy import VARCHAR, Integer, DateTime, ForeignKey, text, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sqlalchemy.dialects.mysql import INTEGER, CHAR, SMALLINT
from datetime import datetime
from database import Base

class AttemptStatus(str, enum.Enum):
    CREATED = "CREATED"
    UPLOADED = "UPLOADED"
    TRANSCRIBED = "TRANSCRIBED"
    FEEDBACKED = "FEEDBACKED"
    ERROR = "ERROR"


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True
    )

    public_id: Mapped[int] = mapped_column(
        CHAR(64),
        unique=True,
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    question_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("questions.id", ondelete="RESTRICT"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        VARCHAR(20),
        nullable=False,
        server_default=text("'created'")
    )

    duration_limit_s: Mapped[int] = mapped_column(
        SMALLINT(unsigned=True),
        nullable=False,
        server_default="90"
    )

    duration_s: Mapped[int] = mapped_column(
        SMALLINT(unsigned=True),
        nullable=True
    )

    error_message: Mapped[str] = mapped_column(
        VARCHAR(255),
        nullable=True
    )

    deleted_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
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


    
    question = relationship("Question", back_populates="attempts")
    feedback = relationship("Feedback", back_populates="attempt", uselist=False)
    transcript = relationship("Transcript", back_populates="attempt")
    user = relationship("User", back_populates="attempts")
    recording = relationship("Recording", back_populates="attempt")