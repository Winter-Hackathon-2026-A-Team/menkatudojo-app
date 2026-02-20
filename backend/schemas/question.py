from datetime import datetime
from pydantic import BaseModel, Field


class QuestionCreateRequest(BaseModel):
    category_id: int
    question_text: str = Field(min_length=1, max_length=5000)
    visibility: str = "global"   # "global" / "private" など（運用で増やしてOK）


class QuestionResponse(BaseModel):
    id: int
    owner_user_id: int | None
    category_id: int
    visibility: str
    source: str
    question_text: str
    is_active: int
    sort_order: int
    created_at: datetime
    updated_at: datetime

    # 画面でカテゴリ名も欲しいことが多いので、返す
    category_name: str | None = None

    class Config:
        from_attributes = True


class RandomFromSelectionRequest(BaseModel):
    question_ids: list[int] = Field(min_length=1)

