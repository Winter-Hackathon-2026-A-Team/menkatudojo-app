from sqlalchemy import VARCHAR, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.mysql import INTEGER, CHAR, SMALLINT
from datetime import datetime
from database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

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

    avatar_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("avatar.id", ondelete="RESTRICT"),
        nullable=False
    )
    
    good_points: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    improve_points: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    next_tip: Mapped[str] = mapped_column(
        VARCHAR(255)
    )

    model_name: Mapped[str] = mapped_column(
        VARCHAR(100)
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

