from sqlalchemy import VARCHAR, Integer, DateTime, ForeignKey, Text, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
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
        ForeignKey("avatars.id", ondelete="RESTRICT"),
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
        VARCHAR(255),
        nullable=True
    )

    model_name: Mapped[str] = mapped_column(
        VARCHAR(100),
        nullable=True
    )

    grade: Mapped[str] = mapped_column(
        Enum("A", "B", "C"),
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


    attempt = relationship("Attempt", back_populates="feedback")
    avatar = relationship("Avatar", back_populates="feedbacks")