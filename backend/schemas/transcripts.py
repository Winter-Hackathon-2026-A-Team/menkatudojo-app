from pydantic import BaseModel, Field


class TranscriptUpsertRequest(BaseModel):
    text: str = Field(..., min_length=1)


class TranscriptResponse(BaseModel):
    text: str