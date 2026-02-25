from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, update
from config.settings import settings
from models.attempt import Attempt
from models.feedback import Feedback
from models.recording import Recording
from models.avatar import Avatar
from models.transcript import Transcript
from models.category import Category
from models.question import Question
import tempfile
import boto3
from botocore.client import Config

class FeedbackService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _generate_dummy_feedback(self, transcript_text: str):
        # 超簡易のダミー評価（あとでAIに差し替え）
        length = len(transcript_text.strip())

        if length >= 600:
            grade = "A"
            good_points = 3
            improve_points = 1
            tip = "結論→理由→具体例の順が安定しています。最後に一言でまとめるとさらに強いです。"
        elif length >= 250:
            grade = "B"
            good_points = 2
            improve_points = 2
            tip = "主張は伝わっています。要点を3つに絞り、具体例を1つ入れると説得力が上がります。"
        else:
            grade = "C"
            good_points = 1
            improve_points = 3
            tip = "情報量が少ないので、結論・理由・経験（数字/期間）を足してみてください。"

        return {
            "good_points": good_points,
            "improve_points": improve_points,
            "next_tip": tip,
            "grade": grade,
            "model_name": "dummy-feedback-v0",
        }

    async def upsert_feedback(self, attempt_id: int, avatar_id: int | None, transcript_text: str):
        fb = self._generate_dummy_feedback(transcript_text)

        await self.db.execute(
            text("""
                INSERT INTO feedbacks (attempt_id, avatar_id, good_points, improve_points, next_tip, grade, model_name)
                VALUES (:attempt_id, :avatar_id, :good_points, :improve_points, :next_tip, :grade, :model_name)
                ON DUPLICATE KEY UPDATE
                    avatar_id = VALUES(avatar_id),
                    good_points = VALUES(good_points),
                    improve_points = VALUES(improve_points),
                    next_tip = VALUES(next_tip),
                    grade = VALUES(grade),
                    model_name = VALUES(model_name)
            """),
            {
                "attempt_id": attempt_id,
                "avatar_id": avatar_id,
                "good_points": fb["good_points"],
                "improve_points": fb["improve_points"],
                "next_tip": fb["next_tip"],
                "grade": fb["grade"],
                "model_name": fb["model_name"],
            },
        )
        await self.db.commit()
        return fb

    async def get_feedback(self, attempt_id: int):
        r = await self.db.execute(
            text("""
                SELECT good_points, improve_points, next_tip, grade, model_name
                FROM feedbacks
                WHERE attempt_id = :attempt_id
                LIMIT 1
            """),
            {"attempt_id": attempt_id},
        )
        return r.mappings().first()
    

async def get_feedback(db, s3, user, attempt_public_id):
    
    stmt = (
        select(
            Feedback.good_points,
            Feedback.improve_points,
            Feedback.next_tip,
            Feedback.grade,
            Feedback.model_name,
            Feedback.avatar_id,
            Avatar.personality_id,
            Attempt.status,
            Attempt.error_message,
            Transcript.text,
            Recording.storage_key,
            Category.name,
            Question.question_text,
            Attempt.created_at
        )
        .join(Recording, Recording.attempt_id == Attempt.id)
        .join(Feedback, Feedback.attempt_id == Attempt.id)
        .join(Question, Attempt.question_id == Question.id)
        .join(Category, Category.id == Question.category_id)
        .join(Avatar, Avatar.id == Feedback.avatar_id)
        .join(Transcript, Transcript.attempt_id == Attempt.id)
        .where(
            Attempt.public_id == attempt_public_id,
            Attempt.user_id == user.id,
        )
    )

    # r = await db.execute(
    #     text("""
    #         SELECT
    #             f.good_points,
    #             f.improve_points,
    #             f.next_tip,
    #             f.grade,
    #             f.model_name,
    #             f.avatar_id,
    #             ava.personality_id,
    #             a.status,
    #             a.error_message,
    #             trans.text,
    #             rec.storage_key
    #         FROM attempts a
    #         JOIN feedbacks f ON f.attempt_id = a.id
    #         JOIN avatars ava ON ava.id = f.avatar_id
    #         JOIN transcripts trans ON trans.attempt_id = a.id
    #         JOIN recordings rec ON rec.attempt_id = a.id
    #         WHERE a.public_id = :public_id
    #           AND a.user_id = :user_id
    #         LIMIT 1
    #     """),
    #     {"public_id": attempt_public_id, "user_id": user["id"]},
    # )
    

    result = await db.execute(stmt)
    row = result.mappings().one_or_none()
    
    # # まだアップロードが終わっていないため、回答レコードが作成されていない場合
    # if row is None:
    #     return {
    #         "answerId": attempt_public_id,
    #         "analysisStatus": "processing",
    #         "characterConfig": {
    #             "avatarId": 1,
    #             "personalityId": 1
    #         },
    #         "transcript": "",
    #         "feedback": ""

    #     }

    if row["status"] == "processing":
        return {
            "answerId": attempt_public_id,
            "analysisStatus": row["status"],
            "characterConfig": {
                "avatarId": row["avatar_id"],
                "personalityId": row["personality_id"]
            },
            "transcript": "",
            "feedback": ""

        }
    
    if row["status"] == "failed":
        return {
            
            "answerId": attempt_public_id,
            "analysisStatus": row["status"],
            "personalityId":  row["personality_id"],
            "feedback": None,
            "code": row["error_message"]
        }


    video_url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": row["storage_key"],
        },
        ExpiresIn=1200
    )

    return {
        "answerId": attempt_public_id,
        "analysisStatus": row["status"],
        "categoryName": row["name"],
        "questionContent": row["question_text"],
        "createdAt": row["created_at"],
        "characterConfig": {
            "avatarId": row["avatar_id"],
            "personalityId": row["personality_id"]
        },
        "transcript": row["text"],
        "feedback": {
            "grade": row["grade"],
            "goodPoints": row["good_points"],
            "improvePoints": row["improve_points"],
            "nextTip": row["next_tip"],
            "videoUrl": video_url,
            "storageKey": row["storage_key"],
        }


    }

async def generate_feedback(db, s3, attempt_public_id, request, req):

    # 開発用
    if settings.DEBUG == True:
        s3 = boto3.client(
            "s3",
            endpoint_url="http://minio:9000",  # MinIO
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION_NAME,  # 形式上必須
            config=Config(signature_version="s3v4"),
        )

    # Whisper文字起こし
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        s3.download_fileobj(settings.S3_BUCKET_NAME, req.voiceStorageKey, tmp)
        tmp.flush()
        whisper_model = request.app.state.whisper_model
        segments, info = whisper_model.transcribe(
            tmp.name,
            language="ja"
        )

        transcript_text = "".join([segment.text for segment in segments])


    # アバター情報と、質問文取得
    stmt = (
        select(Avatar.description, Question.question_text)
        .join(Feedback, Feedback.avatar_id == Avatar.id)
        .join(Attempt, Attempt.id == Feedback.attempt_id)
        .join(Question, Question.id == Attempt.question_id)
        .where(Attempt.public_id == attempt_public_id)
    )

    result = await db.execute(stmt)
    row = result.one_or_none()
    avatar_description = row.description
    question_text = row.question_text

    # 開発用（Gemini無料枠超過回避）
    not_ai_flg = True

    if not_ai_flg:
        from types import SimpleNamespace

        good_points_res = SimpleNamespace()
        improve_points_res = SimpleNamespace()
        next_tip_res = SimpleNamespace()
        grade_res = SimpleNamespace()

        good_points_res.text = "テストテキスト"
        improve_points_res.text = "テストテキスト"
        next_tip_res.text = "テストテキスト"
        grade_res.text = "テストテキスト"

    else:

        # AIの共通プロンプト
        gemini_prompt_prefix = f"""
            質問: {question_text}

            回答: {transcript_text}

            文章のテイスト: {avatar_description} 

            上記の質問に対する回答を、文章のテイストに沿って、下記観点で評価してください。
            観点以外のことは生成しないでください。
            """

        # AIモデル取得
        gemini_model = request.app.state.gemini_model

        # AIからフィードバック取得
        good_points_res = gemini_model.generate_content(
            f"""
            {gemini_prompt_prefix}

            観点: 良いところ
            """
        )

        improve_points_res = gemini_model.generate_content(
            f"""
            {gemini_prompt_prefix}

            観点: 改善点
            """
        )

        next_tip_res = gemini_model.generate_content(
            f"""
            {gemini_prompt_prefix}

            観点:ワンポイントアドバイス
            """
        )

        grade_res = gemini_model.generate_content(
            f"""
            {gemini_prompt_prefix}
            
            観点:総評（A, B, C）で評価してください。Aが一番よく、Cが最も悪いとします。
                A, B, C以外の文字は返さないでください。
            """
        )

    # AIフィードバック結果をDBに反映
    await _update_feedback_record(db, attempt_public_id, good_points_res.text, improve_points_res.text, next_tip_res.text)
    await _update_attempt_record(db, attempt_public_id)
    await _update_transcript_record(db, attempt_public_id, transcript_text)
    await db.commit()

    

async def _update_feedback_record(db, attempt_public_id, good_points, improve_points, next_tip):
    
    # ① attempt を取得
    result = await db.execute(
        select(Attempt)
        .where(Attempt.public_id == attempt_public_id)
    )
    attempt = result.scalar_one_or_none()

    # ② feedback を更新
    stmt = (
        update(Feedback)
        .where(Feedback.attempt_id == attempt.id)
        .values(
            good_points=good_points,
            improve_points=improve_points,
            next_tip=next_tip,
        )
    )

    await db.execute(stmt)
    
async def _update_attempt_record(db, attempt_public_id):
    stmt = (
        update(Attempt)
        .where(Attempt.public_id == attempt_public_id)
        .values(
            status='completed'
        )
    )

    await db.execute(stmt)

    
async def _update_transcript_record(db, attempt_public_id, transcript_text):
    
    result = await db.execute(
        select(Attempt)
        .where(Attempt.public_id == attempt_public_id)
    )
    attempt = result.scalar_one_or_none()

    
    stmt = (
        update(Transcript)
        .where(Transcript.attempt_id == attempt.id)
        .values(
            text=transcript_text
        )
    )

    await db.execute(stmt)