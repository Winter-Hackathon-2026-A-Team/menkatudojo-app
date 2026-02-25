import os
from config.settings import settings
import tempfile
import subprocess
import requests
import boto3
from botocore.client import Config

def process_video(recording_key, s3):
    s3 = boto3.client(
            "s3",
            endpoint_url="http://minio:9000",  # MinIO
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION_NAME,  # 形式上必須
            config=Config(signature_version="s3v4"),
        )

    # 一時ファイル作成
    with tempfile.TemporaryDirectory() as tmpdir:
        recording_path = os.path.join(tmpdir, "input.webm")
        audio_path = os.path.join(tmpdir, "output.wav")

        # 1. MinIOから動画取得
        response = s3.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=recording_key,
        )

        with open(recording_path, "wb") as f:
            f.write(response["Body"].read())

        # 2. 音声抽出（wav）
        subprocess.run(
            [
                "ffmpeg",
                "-i", recording_path,
                "-vn",
                "-acodec", "pcm_s16le",  # wav用
                "-ar", "16000",         # 16kHz (Whisper向け)
                "-ac", "1",             # モノラル
                audio_path
            ],
            check=True
        )


        # 3. MinIOへ音声アップロード
        audio_key = recording_key.replace("recordings/", "audios/", 1)
        audio_key = audio_key.replace(".webm", ".wav")
        s3.upload_file(
            audio_path,
            settings.S3_BUCKET_NAME,
            f"{audio_key}"
        )

        attempt_public_id = extract_attempt_public_id(recording_key)
        # 4. 完了後に処理（例：API呼び出し）
        notify_completion(audio_key, attempt_public_id)


def notify_completion(audio_key, attempt_public_id):
    print(f"Audio upload completed: {audio_key}")

    
    requests.post(f"http://localhost:8000/webhooks/{attempt_public_id}/generate", json={"voiceStorageKey": audio_key})


def extract_attempt_public_id(recording_key: str) -> str:
    filename = os.path.basename(recording_key)
    # abc123_550e8400-e29b-41d4-a716-446655440000.webm

    name_without_ext = os.path.splitext(filename)[0]
    # abc123_550e8400-e29b-41d4-a716-446655440000

    attempt_public_id = name_without_ext.split("_")[0]

    return attempt_public_id