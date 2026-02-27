from fastapi import APIRouter, Depends, Query
from schemas.answers import PreUploadRequest, PreUploadResponse, HistoryListResponse, HistoryDetailResponse

from routers.dependencies import get_current_user
from core.security import verify_csrf
from services import recording_service, history_service
from database import get_db
from core.s3_client import get_s3_client
from sqlalchemy.ext.asyncio import AsyncSession
from services import feedback_service

router = APIRouter(prefix="/api/answers", tags=["answers"])

# テスト
# @router.post("/pre-upload")
# async def create_presigned_url(request: Request):
#     body = await request.json()
#     print("Raw JSON received:", body)

# 署名付きURLの生成
@router.post("/pre-upload", response_model=PreUploadResponse)
async def create_presigned_url(
    req: PreUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    s3 = Depends(get_s3_client)
):
    
    return await recording_service.create_presigned_url(db, s3, current_user, req)
    

@router.get("/{attempt_public_id}")
async def get_feedback(
    attempt_public_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    s3 = Depends(get_s3_client)
):
    
    return await feedback_service.get_feedback(db, s3, user, attempt_public_id)


# 履歴一覧
@router.get("", response_model=HistoryListResponse)
async def get_history_list(
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=6, le=6),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    
    return await history_service.get_history_list(db, current_user, page, limit)
    

@router.get("/{answer_id}", response_model=HistoryDetailResponse)
async def get_history_detail(
    answer_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
    s3 = Depends(get_s3_client)
):
    
    return await history_service.get_history_detail(db, current_user, s3, answer_id)
