from sqlalchemy.orm import Session
from sqlalchemy import update, select

import boto3
from botocore.exceptions import ClientError
from botocore.client import BaseClient

from config.settings import settings
from core import settings
from core.exceptions import (
    RecordingNotFoundError,
    RecordingFileSizeExceededError,
    InvalidRecordingMimeTypeError,
)

from models.attempt import Attempt
from models.recording import Recording



WEBM_MAGIC_NUMBER = b"\x1A\x45\xDF\xA3"

# S3に保存された動画ファイルサイズ/MIMETYPEの検証、およびそれらのDB登録
def validate_recording_object(
    db: Session,
    s3: BaseClient, # core/s3_client.pyで取得したクライアントを渡す。
    public_id: int,
    storage_key: str
) -> None:
    """
    S3上の動画オブジェクトを厳密検証する

    - 存在確認
    - ファイルサイズ上限チェック
    - WebMマジックナンバー検証

    """

    s3 = boto3.client("s3")

    # ① メタデータ取得（存在 + サイズチェック）
    try:
        head = s3.head_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=storage_key,
        )
    except ClientError as e:
        _delete_attempt_record(db, public_id)
        raise RecordingNotFoundError()

    file_size = head.get("ContentLength")

    if file_size > settings.MAX_RECORDING_FILESIZE:
        _delete_attempt_record(db, public_id)
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
        _delete_attempt_record(db, public_id)
        raise RecordingNotFoundError()

    # ③ マジックナンバー検証（厳密）
    if first_bytes != WEBM_MAGIC_NUMBER:
        _delete_attempt_record(db, public_id)
        raise InvalidRecordingMimeTypeError()
    
    _update_recording_size(db, public_id, file_size)


# 
def _delete_attempt_record(
    db: Session,
    public_id: int,
) -> None:
    """
    public_id を使って回答レコードを削除する内部関数
    """
    attempt = db.query(Attempt).filter(
        Attempt.public_id == public_id
    ).first()

    if attempt:
        db.delete(attempt)
        db.commit()


def _update_recording_size(
    db: Session,
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

    db.execute(stmt)