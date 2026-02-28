from sqlalchemy import VARCHAR, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import INTEGER, CHAR, SMALLINT
from datetime import datetime
from database import Base


class Avatar(Base):
    __tablename__ = "avatars"

    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True
    )

    personality_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
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

    feedbacks = relationship("Feedback", back_populates="avatar")