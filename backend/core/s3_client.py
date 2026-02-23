import boto3
from botocore.client import Config
from config.settings import settings

# router側で、
def get_s3_client():
    
    # 開発用に一時的に
    print("AWS_ACCESS_KEY_ID:", settings.AWS_ACCESS_KEY_ID)
    print("AWS_SECRET_ACCESS_KEY:", settings.AWS_SECRET_ACCESS_KEY)
    print("S3_ENDPOINT_URL:", settings.S3_ENDPOINT_URL)



    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,  # MinIO
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION_NAME,  # 形式上必須
        config=Config(signature_version="s3v4"),
    )
