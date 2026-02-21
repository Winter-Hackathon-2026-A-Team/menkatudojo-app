from sqlalchemy import VARCHAR, Integer, DateTime, ForeignKey, text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.mysql import INTEGER, BIGINT
from datetime import datetime
from database import Base


class Recording(Base):
    __tablename__ = "recordings"

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

    storage_key: Mapped[str] = mapped_column(
        VARCHAR(600),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        VARCHAR(50),
        nullable=False,
        server_default=text("'video/webm'")
    )

    size_bytes: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
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

