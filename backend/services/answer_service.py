from sqlalchemy.orm import Session
from sqlalchemy import update, select

import boto3
from botocore.exceptions import ClientError
from botocore.client import BaseClient
from botocore.client import Config

from config.settings import settings

from core.exceptions import (
    RecordingNotFoundError,
    RecordingFileSizeExceededError,
    InvalidRecordingMimeTypeError,
)

from models.attempt import Attempt
from models.recording import Recording

from sqlalchemy.ext.asyncio import AsyncSession

WEBM_MAGIC_NUMBER = b"\x1A\x45\xDF\xA3"

# 動作確認できていない。
# S3に保存された動画ファイルサイズ/MIMETYPEの検証、およびそれらのDB登録
async def validate_recording_object(db, s3, public_id):
    """
    S3上の動画オブジェクトを厳密検証する

    - 存在確認
    - ファイルサイズ上限チェック
    - WebMマジックナンバー検証

    """
    storage_key = await _get_storage_key(db, public_id)

    if settings.DEBUG:
        s3 = boto3.client(
                "s3",
                endpoint_url="http://minio:9000",  # MinIO
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION_NAME,  # 形式上必須
                config=Config(signature_version="s3v4"),
            )

    # ① メタデータ取得（存在 + サイズチェック）
    try:
        head = s3.head_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=storage_key,
        )
    except ClientError as e:
        await _delete_attempt_record(db, public_id)
        raise RecordingNotFoundError()

    file_size = head.get("ContentLength")

    if file_size > settings.MAX_RECORDING_FILESIZE:
        await _delete_attempt_record(db, public_id)
        raise RecordingFileSizeExceededError()

    # ② 先頭バイトのみ取得（Rangeで最小限）
    try:
        obj = s3.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=storage_key,
            Range="bytes=0-3",  # 先頭4バイトのみ取得
        )
        first_bytes = obj["Body"].read(4)
    except ClientError:
        await _delete_attempt_record(db, public_id)
        raise RecordingNotFoundError()

    # ③ マジックナンバー検証（厳密）
    if first_bytes != WEBM_MAGIC_NUMBER:
        await _delete_attempt_record(db, public_id)
        raise InvalidRecordingMimeTypeError()
    
    await _update_recording_size(db, public_id, file_size)


# 
async def _delete_attempt_record(
    db: AsyncSession,
    public_id: int,
) -> None:
    """
    public_id を使って回答レコードを削除する内部関数
    """
    stmt = select(Attempt).filter(Attempt.public_id == public_id)
    result = await db.execute(stmt)
    attempt = result.scalars().first()


    if attempt:
        db.delete(attempt)
        db.commit()


async def _update_recording_size(
    db: AsyncSession,
    public_id: str,
    file_size: int,
) -> None:
    """
    public_id から attempts.id を取得し、
    recordings.size_bytes を更新する内部関数
    """

    subquery = (
        select(Attempt.id)
        .where(Attempt.public_id == public_id)
        .scalar_subquery()
    )

    stmt = (
        update(Recording)
        .where(Recording.attempt_id == subquery)
        .values(size_bytes=file_size)
    )

    await db.execute(stmt)


async def _get_storage_key(db, public_id):
    stmt = (
        select(Recording.storage_key)
        .select_from(Attempt)
        .join(Recording, Recording.attempt_id == Attempt.id)
        .where(Attempt.public_id == public_id)
    )

    result = await db.execute(stmt)
    row = result.mappings().one_or_none()
    return row["storage_key"]