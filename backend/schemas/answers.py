from pydantic import BaseModel

class CharacterConfig(BaseModel):
    avatarId: int
    personalityId: int

class PreUploadRequest(BaseModel):
    questionId: int
    characterConfig: CharacterConfig

class PreUploadResponse(BaseModel):
    recordingId: int
    uploadUrl: str
    storageKey: str 