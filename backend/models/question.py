from sqlalchemy import VARCHAR, DateTime, ForeignKey, Text, text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import INTEGER, TINYINT
from datetime import datetime
from database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True
    )

    owner_user_id: Mapped[int | None] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    category_id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    visibility: Mapped[str] = mapped_column(
        VARCHAR(20),
        nullable=False,
        server_default=text("'global'")
    )

    source: Mapped[str] = mapped_column(
        VARCHAR(20),
        nullable=False,
        server_default=text("'system'")
    )

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    is_active: Mapped[int] = mapped_column(
        TINYINT,
        nullable=False,
        server_default=text("1")
    )

    sort_order: Mapped[int] = mapped_column(
        INTEGER,
        nullable=False,
        server_default=text("0")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    category = relationship("Category", back_populates="questions")
    user = relationship("User", back_populates="questions")
    attempts = relationship("Attempt", back_populates="question")