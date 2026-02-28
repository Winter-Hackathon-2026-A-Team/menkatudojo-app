from pydantic import BaseModel, Field


class RecordingUpsertRequest(BaseModel):
    storage_key: str = Field(..., min_length=1, max_length=600)
    mime_type: str = Field(..., min_length=1, max_length=50)
    size_bytes: int = Field(..., ge=1)


class RecordingResponse(BaseModel):
    storage_key: str
    mime_type: str
    size_bytes: int