from sqlalchemy import select
from models.category import Category

async def get_category_list(db):
    stmt = (
        select(Category)
        .where(Category.is_active == 1)
        .order_by(Category.sort_order, Category.id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()