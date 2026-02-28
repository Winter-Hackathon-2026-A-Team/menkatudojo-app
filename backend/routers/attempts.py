from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from dependencies.auth import get_current_user

from schemas.attempts import AttemptCreateRequest, AttemptCreateResponse, AttemptDetailResponse
from schemas.recordings import RecordingUpsertRequest
from schemas.transcripts import TranscriptUpsertRequest
from schemas.feedbacks import FeedbackGenerateRequest, FeedbackResponse

from services.attempt_service import AttemptService
from services.recording_service import RecordingService
from services.transcript_service import TranscriptService
from services.feedback_service import FeedbackService


router = APIRouter(prefix="/api/attempts", tags=["attempts"])


@router.post("", response_model=AttemptCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_attempt(
    payload: AttemptCreateRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = AttemptService(db)
    created = await svc.create_attempt(user_id=user["id"], question_id=payload.question_id, duration_limit_s=payload.duration_limit_s)
    return created


@router.get("/{public_id}", response_model=AttemptDetailResponse)
async def get_attempt_detail(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = AttemptService(db)
    detail = await svc.get_attempt_detail_owned(user_id=user["id"], public_id=public_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return detail


@router.post("/{public_id}/recording", status_code=status.HTTP_204_NO_CONTENT)
async def upsert_recording(
    public_id: str,
    payload: RecordingUpsertRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    attempt_svc = AttemptService(db)
    attempt = await attempt_svc.get_attempt_owned(user_id=user["id"], public_id=public_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    rec_svc = RecordingService(db)
    await rec_svc.upsert_recording(
        attempt_id=attempt["id"],
        storage_key=payload.storage_key,
        mime_type=payload.mime_type,
        size_bytes=payload.size_bytes,
    )
    await attempt_svc.update_status(attempt_id=attempt["id"], status="UPLOADED")
    return


@router.post("/{public_id}/transcript", status_code=status.HTTP_204_NO_CONTENT)
async def upsert_transcript(
    public_id: str,
    payload: TranscriptUpsertRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    attempt_svc = AttemptService(db)
    attempt = await attempt_svc.get_attempt_owned(user_id=user["id"], public_id=public_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    tr_svc = TranscriptService(db)
    await tr_svc.upsert_transcript(attempt_id=attempt["id"], text_value=payload.text)
    await attempt_svc.update_status(attempt_id=attempt["id"], status="TRANSCRIBED")
    return


@router.post("/{public_id}/feedback", response_model=FeedbackResponse)
async def generate_feedback(
    public_id: str,
    payload: FeedbackGenerateRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    attempt_svc = AttemptService(db)
    attempt = await attempt_svc.get_attempt_owned(user_id=user["id"], public_id=public_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    tr_svc = TranscriptService(db)
    tr = await tr_svc.get_transcript(attempt_id=attempt["id"])
    if not tr:
        raise HTTPException(status_code=400, detail="Transcript not found. Please upload transcript first.")

    fb_svc = FeedbackService(db)
    fb = await fb_svc.upsert_feedback(attempt_id=attempt["id"], avatar_id=payload.avatar_id, transcript_text=tr["text"])
    await attempt_svc.update_status(attempt_id=attempt["id"], status="FEEDBACKED")
    return fb


@router.get("/{public_id}/feedback", response_model=FeedbackResponse)
async def get_feedback(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    attempt_svc = AttemptService(db)
    attempt = await attempt_svc.get_attempt_owned(user_id=user["id"], public_id=public_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    fb_svc = FeedbackService(db)
    fb = await fb_svc.get_feedback(attempt_id=attempt["id"])
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return fb