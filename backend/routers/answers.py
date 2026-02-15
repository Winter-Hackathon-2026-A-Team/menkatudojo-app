from fastapi import APIRouter, Depends
from schemas.answers import PreUploadRequest, PreUploadResponse
from routers.dependencies import get_current_user
from core.security import verify_csrf
from services import recording_service
from sqlalchemy.orm import Session
from database import get_db
from core.s3_client import get_s3_client

router = APIRouter(prefix="/api/answers", tags=["answers"])

# 署名付きURLの生成
@router.post("/pre-upload", dependencies=[Depends(verify_csrf)], response_model=PreUploadResponse)
def create_presigned_url(
    req: PreUploadRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    s3 = Depends(get_s3_client)
):
    
    result = recording_service.create_presigned_url(db, s3, current_user, req)

    return result
    

