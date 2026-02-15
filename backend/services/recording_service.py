from uuid import uuid4
from models.attempt import Attempt
from models.recording import Recording
from models.avatar import Avatar
from models.feedback import Feedback
from datetime import datetime, timezone
import boto3
from config.settings import settings
from zoneinfo import ZoneInfo



def create_presigned_url(db, s3, user, req):
    # 回答レコード生成
    attempt = _create_attempt_record(db, user, req)
    # 動画レコード生成
    recording = _create_recording_record(db, attempt)
    # アバターレコード生成
    avatar = _create_avatar_record(db, req)
    # フィードバックレコード生成
    feedback = _create_feedback_record(db, attempt, avatar, req)

    try:
        presigned_url = s3.generate_presigned_post(
            Bucket=settings.S3_BUCKET_NAME,
            Key=recording.storage_key,
            Fields={
                "Content-Type": settings.ALLOW_RECORDING_MIME_TYPE,
            },
            Conditions=[
                ["starts-with", "$Content-Type", settings.ALLOW_RECORDING_MIME_TYPE],
                ["content-length-range", 1, settings.MAX_RECORDING_FILESIZE], # 1~max_filesize[byte]まで可
            ],
            ExpiresIn=300,
        )

    except Exception:
        db.rollback()
        raise

    db.commit()

    return {
        "answerId": attempt.public_id,
        "uploadUrl": presigned_url["url"],
        "storageKey": recording.storage_key
    }



def _create_attempt_record(db, user, req):
    attempt = Attempt(
        public_id=str(uuid4()),
        user_id=user.id,
        question_id=req.questionId,
        status="processing",
        duration_limit_s=settings.MAX_RECORDING_DURATION_S
    )

    db.add(attempt)
    db.flush()

    return attempt

def _create_recording_record(db, attempt):
    now = datetime.now(ZoneInfo(settings.TZ))
    recording = Recording(
        attempt_id=attempt.id,
        storage_key=f"recordings/{now:%Y}/{now:%m}/{attempt.public_id}/{uuid4()}.webm"
    )

    db.add(recording)
    db.flush()

    return recording

def _create_avatar_record(db, req):
    avatar = Avatar(
        personality_id=req.characterConfig.personalityId
    )

    db.add(avatar)
    db.flush()

    return avatar

def _create_feedback_record(db, attempt, avatar, req):
    feedback = Feedback(
       attempt_id=attempt.id,
       avatar_id=avatar.id,
       good_points="",
       improve_points="",
    )

    db.add(feedback)
    db.flush()

    return feedback
