from uuid import uuid4
from models.attempt import Attempt
from models.recording import Recording
from models.avatar import Avatar
from models.feedback import Feedback
from datetime import datetime
from config.settings import settings
from zoneinfo import ZoneInfo



async def create_presigned_url(db, s3, user, req):
    # 回答レコード生成
    attempt = await _create_attempt_record(db, user, req)
    # 動画レコード生成
    recording = await _create_recording_record(db, attempt)
    # フィードバックレコード生成
    feedback = await _create_feedback_record(db, attempt, req)

    try:
        presigned_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": recording.storage_key,
                "ContentType": settings.ALLOW_RECORDING_MIME_TYPE,
            },
                ExpiresIn=300,
        )

    except Exception:
        await db.rollback()
        raise

    await db.commit()

    return {
        "answerId": attempt.public_id,
        "uploadUrl": presigned_url,
        "storageKey": recording.storage_key
    }


async def _create_attempt_record(db, user, req):
    attempt = Attempt(
        public_id=str(uuid4()),
        user_id=user.id,
        question_id=req.questionId,
        status="processing",
        duration_limit_s=settings.MAX_RECORDING_DURATION_S
    )

    db.add(attempt)
    await db.flush()

    return attempt

async def _create_recording_record(db, attempt):
    now = datetime.now(ZoneInfo(settings.TZ))
    recording = Recording(
        attempt_id=attempt.id,
        storage_key=f"recordings/{now:%Y}/{now:%m}/{attempt.public_id}/{uuid4()}.webm"
    )

    db.add(recording)
    await db.flush()

    return recording

async def _create_feedback_record(db, attempt, req):
    feedback = Feedback(
       attempt_id=attempt.id,
       avatar_id=req.characterConfig.avatarId,
       good_points="",
       improve_points="",
    )

    db.add(feedback)
    await db.flush()

    return feedback
