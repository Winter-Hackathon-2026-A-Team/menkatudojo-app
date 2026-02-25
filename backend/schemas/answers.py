from pydantic import BaseModel
from typing import List
from datetime import datetime

class CharacterConfig(BaseModel):
    avatarId: int
    personalityId: int

class PreUploadRequest(BaseModel):
    questionId: int
    characterConfig: CharacterConfig

class PreUploadResponse(BaseModel):
    answerId: str
    uploadUrl: str
    storageKey: str 

class FeedbackGrade(BaseModel):
    grade: str

class FeedbackAll(BaseModel):
    goodPoints: str
    improvePoints: str
    nextTip: str
    grade: str
    videoUrl: str
    storageKey: str


class Meta(BaseModel):
    totalCount: int
    totalPages: int
    currentPage: int

class AnswerItem(BaseModel):
    answerId: str
    categoryName: str
    questionContent: str
    createdAt: datetime
    characterConfig: CharacterConfig
    feedback: FeedbackGrade
    
class HistoryListResponse(BaseModel):
    answers: List[AnswerItem]
    meta: Meta

class HistoryDetailResponse(BaseModel):
    answerId: str
    analysisStatus: str = "completed"
    categoryName: str
    questionContent: str
    createdAt: datetime
    characterConfig: CharacterConfig
    transcript: str | None = None
    feedback: FeedbackAll | None = None