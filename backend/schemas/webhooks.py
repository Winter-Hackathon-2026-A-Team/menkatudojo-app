from pydantic import BaseModel, Field
from typing import Optional, Literal



class FeedbackGenerateRequest(BaseModel):
    voiceStorageKey: str