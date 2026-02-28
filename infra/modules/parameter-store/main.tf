# Parameter Store Parameters
resource "aws_ssm_parameter" "db_host" {
  name        = "/${var.project_name}/db/host"
  description = "Database host"
  type        = "String"
  value       = var.db_host
  key_id      = var.kms_key_arn

  tags = {
    Name = "${var.project_name}-db-host"
  }
}

resource "aws_ssm_parameter" "db_port" {
  name        = "/${var.project_name}/db/port"
  description = "Database port"
  type        = "String"
  value       = tostring(var.db_port)

  tags = {
    Name = "${var.project_name}-db-port"
  }
}

resource "aws_ssm_parameter" "db_name" {
  name        = "/${var.project_name}/db/name"
  description = "Database name"
  type        = "String"
  value       = var.db_name
  key_id      = var.kms_key_arn

  tags = {
    Name = "${var.project_name}-db-name"
  }
}

resource "aws_ssm_parameter" "fastapi_url" {
  name        = "/${var.project_name}/fastapi/url"
  description = "FastAPI URL"
  type        = "String"
  value       = var.fastapi_url

  tags = {
    Name = "${var.project_name}-fastapi-url"
  }
}

resource "aws_ssm_parameter" "s3_videos_bucket" {
  name        = "/${var.project_name}/s3/videos-bucket"
  description = "S3 videos bucket name"
  type        = "String"
  value       = var.s3_videos_bucket

  tags = {
    Name = "${var.project_name}-s3-videos-bucket"
  }
}

resource "aws_ssm_parameter" "s3_audio_bucket" {
  name        = "/${var.project_name}/s3/audio-bucket"
  description = "S3 audio bucket name"
  type        = "String"
  value       = var.s3_audio_bucket

  tags = {
    Name = "${var.project_name}-s3-audio-bucket"
  }
}
