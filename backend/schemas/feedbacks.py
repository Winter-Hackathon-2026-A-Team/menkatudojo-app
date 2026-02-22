from pydantic import BaseModel, Field
from typing import Optional, Literal


Grade = Literal["A", "B", "C"]


class FeedbackGenerateRequest(BaseModel):
    avatar_id: Optional[int] = Field(default=None, ge=1)


class FeedbackResponse(BaseModel):
    good_points: int
    improve_points: int
    next_tip: Optional[str]
    grade: Optional[Grade]
    model_name: Optional[str]