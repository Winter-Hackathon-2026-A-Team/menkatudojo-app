from sqlalchemy import VARCHAR, Integer, DateTime, ForeignKey, text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.mysql import INTEGER, CHAR, SMALLINT, MEDIUMTEXT
from datetime import datetime
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
        unique=True,
        nullable=False
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

