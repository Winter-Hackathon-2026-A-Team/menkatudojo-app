from fastapi import APIRouter, Depends, Request, BackgroundTasks
from urllib.parse import unquote
from core.s3_client import get_s3_client
from services import webhook_service
from database import get_db
from core.s3_client import get_s3_client
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.webhooks import FeedbackGenerateRequest
from services import feedback_service

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# シークレットチェック（カスタムヘッダーを入れる）するのが理想だが、今回は省略
@router.post("/minio-webhooku438fh39ur390ur38iwpqr3")
async def minio_webhook(
    request: Request, 
    background_tasks: BackgroundTasks,
    s3 = Depends(get_s3_client)
    ):
    event = await request.json()
    for record in event.get("Records", []):
        recording_key = unquote(record["s3"]["object"]["key"])

        background_tasks.add_task(webhook_service.process_video, recording_key, s3)


@router.post("/{attempt_public_id}/generate")
async def generate_feedback(
    req: FeedbackGenerateRequest,
    request: Request,
    attempt_public_id: str,
    db: AsyncSession = Depends(get_db),
    s3 = Depends(get_s3_client)
):
    
    await feedback_service.generate_feedback(db, s3, attempt_public_id, request, req)