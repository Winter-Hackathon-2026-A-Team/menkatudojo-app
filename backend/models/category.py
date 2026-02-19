from sqlalchemy import VARCHAR, DateTime, text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import INTEGER
from datetime import datetime
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True
    )

    name: Mapped[str] = mapped_column(
        VARCHAR(50),
        nullable=False,
        unique=True
    )

    description: Mapped[str | None] = mapped_column(
        VARCHAR(255),
        nullable=True
    )

    sort_order: Mapped[int] = mapped_column(
        INTEGER,
        nullable=False,
        server_default=text("0")
    )

    is_active: Mapped[int] = mapped_column(
        INTEGER,
        nullable=False,
        server_default=text("1")
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

    
    questions = relationship("Question", back_populates="category")
