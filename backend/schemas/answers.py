from pydantic import BaseModel

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


class FeedbackGenerateRequest(BaseModel):
    voiceStorageKey: str