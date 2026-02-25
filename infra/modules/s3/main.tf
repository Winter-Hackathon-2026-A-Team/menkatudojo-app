# 動画アップロード用S3バケット（Lambdaトリガー用）
resource "aws_s3_bucket" "videos" {
  bucket = "${var.project_name}-videos"

  tags = {
    Name = "${var.project_name}-videos"
  }
}

# バケットに保存される動画データの自動暗号化
resource "aws_s3_bucket_server_side_encryption_configuration" "videos" {
  bucket = aws_s3_bucket.videos.id

  rule {
    # AWS側で自動的に暗号化
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# バージョニング有効化(動画保存用)
resource "aws_s3_bucket_versioning" "videos" {
  bucket = aws_s3_bucket.videos.id

  versioning_configuration {
    status = "Enabled"
  }
}

# 音声保存用S3バケット
resource "aws_s3_bucket" "audio" {
  bucket = "${var.project_name}-audio"

  tags = {
    Name = "${var.project_name}-audio"
  }
}

# 音声データの自動暗号化
resource "aws_s3_bucket_server_side_encryption_configuration" "audio" {
  bucket = aws_s3_bucket.audio.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# ALBアクセスログ・Session Managerログ用S3バケット
resource "aws_s3_bucket" "alb_logs" {
  bucket = "${var.project_name}-alb-logs"

  tags = {
    Name = "${var.project_name}-alb-logs"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# ライフサイクルポリシー
resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    filter {}

    expiration {
      days = 7
    }
  }
}
