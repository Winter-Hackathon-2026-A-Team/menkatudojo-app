from pydantic import BaseModel
from typing import List
from datetime import datetime

class CharacterConfig(BaseModel):
    avatarId: int
    personalityId: int

class FeedbackGrade(BaseModel):
    grade: str

class LatestAnswer(BaseModel):
    answerId: str
    categoryName: str
    questionContent: str
    createdAt: datetime
    characterConfig: CharacterConfig
    feedback: FeedbackGrade

class DashboardStats(BaseModel):
    totalCount: int
    totalDays: int
    totalDurationSeconds: int

class DashboardResponse(BaseModel):
    stats: DashboardStats
    latestAnswers: List[LatestAnswer]