import boto3
import subprocess
import os
import logging

# ログ設定(CloudWatch Logsへ)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')

def handler(event, context):
    try:
        # S3イベントからファイル情報を取得(階層構造)
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        
        logger.info(f"Processing file: s3://{bucket}/{key}")
        
        # S3から/tmpへコピーするためのpath(lambdaは/tmpでしか処理できない)
        download_path = f"/tmp/{os.path.basename(key)}"
        #FFmpegの処理ファイルの保存先
        audio_path = f"/tmp/output.mp3"
        
        logger.info(f"Downloading from s3://{bucket}/{key}")
        #　S3から動画をダウンロード
        s3.download_file(bucket, key, download_path)
        
        # FFmpeg で音声抽出 (高速設定)
        # -vn: 映像なし, -acodec libmp3lame: MP3変換
        logger.info(f"Extracting audio from s3://{bucket}/{key}")
        subprocess.run([
            #実行するファイルパス、-i=入力ファイル、-vn=ビデオ無効化
            '/opt/bin/ffmpeg', '-i', download_path, '-vn',
            #音声をmp3へ、-y強制上書き
            '-acodec', 'libmp3lame', audio_path, '-y'
           #FFmpegがエラーで終了したときにPython側でもエラーにする
        ], check=True, capture_output=True)
        
        # 音声をS3にアップロード
        audio_key = key.replace('uploads/', 'audio/').replace('.mp4', '.mp3')
        audio_bucket = os.environ['AUDIO_BUCKET']
        logger.info(f"Uploading audio to s3://{audio_bucket}/{audio_key}")
        s3.upload_file(audio_path, audio_bucket, audio_key)
        
        # 一時ファイルを削除
        for path in [download_path, audio_path]:
            try:
                os.remove(path)
            except:
                pass
        
        logger.info(f"Processing completed: s3://{bucket}/{key} -> s3://{audio_bucket}/{audio_key}")
        return {
            "status": "success",
            "audio": audio_key
        }
    #FFmpegのエラー処理
    except subprocess.CalledProcessError as e:
        #エラー情報を.decodeで文字列に戻す
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg error for s3://{bucket}/{key}: {error_msg}")
        raise
    #FFmpeg以外のエラー処理
    except Exception as e:
        logger.error(f"Error processing s3://{bucket}/{key}: {str(e)}")
        raise

#raiseすることによってAWS側にエラーを伝える
#S3→lambdaは自動リトライを2回までできる