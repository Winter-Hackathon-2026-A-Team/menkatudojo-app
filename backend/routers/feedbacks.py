from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from routers.auth import get_current_user
from services.ai_feedback_service import generate_ai_feedback_for_attempt


router = APIRouter(prefix="/api/feedbacks", tags=["feedbacks"])


@router.post("/{attempt_public_id}/generate")
async def generate_feedback(
    attempt_public_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        result = await generate_ai_feedback_for_attempt(
            db=db,
            attempt_public_id=attempt_public_id,
            current_user_id=user["id"],
        )
        return result
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

