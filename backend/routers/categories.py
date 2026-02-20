from fastapi import APIRouter, Depends
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from services import category_service

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/")
async def get_categories(
    db: AsyncSession = Depends(get_db),
):
    categories = await category_service.get_category_list(db)
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
        }
        for c in categories
    ]