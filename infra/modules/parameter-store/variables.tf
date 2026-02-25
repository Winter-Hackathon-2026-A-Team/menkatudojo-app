variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}

variable "db_host" {
  description = "データベースホスト"
  type        = string
  default     = ""
}

variable "db_port" {
  description = "データベースポート"
  type        = number
  default     = 3306
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = ""
}

variable "fastapi_url" {
  description = "FastAPI URL"
  type        = string
  default     = ""
}

variable "s3_videos_bucket" {
  description = "S3動画バケット名"
  type        = string
  default     = ""
}

variable "s3_audio_bucket" {
  description = "S3音声バケット名"
  type        = string
  default     = ""
}
