from pydantic import BaseModel, Field
from typing import Optional, Literal


AttemptStatus = Literal["CREATED", "UPLOADED", "TRANSCRIBED", "FEEDBACKED", "ERROR"]


class AttemptCreateRequest(BaseModel):
    question_id: int = Field(..., ge=1)
    duration_limit_s: Optional[int] = Field(default=None, ge=1, le=3600)


class AttemptCreateResponse(BaseModel):
    public_id: str
    status: AttemptStatus


class AttemptDetailResponse(BaseModel):
    public_id: str
    question_id: int
    status: AttemptStatus
    duration_limit_s: Optional[int]
    duration_s: Optional[int]
    has_recording: bool
    has_transcript: bool
    has_feedback: bool