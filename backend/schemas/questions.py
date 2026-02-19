from pydantic import BaseModel

class questionContentResponse(BaseModel):
    questionId: int
    categoryName: str
    questionContent: str
    source: str
    sortOrder: int
    durationLimitSeconds: int

