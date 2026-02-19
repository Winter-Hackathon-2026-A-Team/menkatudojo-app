from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.category import Category


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_active(self) -> list[Category]:
        stmt = (
            select(Category)
            .where(Category.is_active == 1)
            .order_by(Category.sort_order.asc(), Category.id.asc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

