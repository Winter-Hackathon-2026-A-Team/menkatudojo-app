from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    sort_order: int
    is_active: int

    class Config:
        from_attributes = True
