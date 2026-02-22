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


@router.get("/{attempt_public_id}")
async def get_feedback(
    attempt_public_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    r = await db.execute(
        text("""
            SELECT
                f.good_points,
                f.improve_points,
                f.next_tip,
                f.grade,
                f.model_name
            FROM attempts a
            JOIN feedbacks f ON f.attempt_id = a.id
            WHERE a.public_id = :public_id
              AND a.user_id = :user_id
            LIMIT 1
        """),
        {"public_id": attempt_public_id, "user_id": user["id"]},
    )
    row = r.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "attemptPublicId": attempt_public_id,
        "goodPoints": int(row["good_points"]) if row["good_points"] is not None else 0,
        "improvePoints": int(row["improve_points"]) if row["improve_points"] is not None else 0,
        "nextTip": row["next_tip"] or "",
        "grade": row["grade"],
        "modelName": row["model_name"] or "",
    }