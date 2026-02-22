variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "lambda_runtime" {
  description = "Lambda関数のランタイム"
  type        = string
  default     = "python3.11"
}

variable "lambda_timeout" {
  description = "Lambda関数のタイムアウト（秒）"
  type        = number
  default     = 60
}

variable "lambda_memory_size" {
  description = "Lambda関数のメモリサイズ（MB）"
  type        = number
  default     = 1024
}

variable "lambda_zip_path" {
  description = "Lambda関数のzipファイルパス"
  type        = string
  default     = ""
}

variable "videos_bucket_name" {
  description = "動画アップロード用S3バケット名"
  type        = string
}

variable "videos_bucket_arn" {
  description = "動画アップロード用S3バケットARN"
  type        = string
}

variable "audio_bucket_name" {
  description = "音声ファイル用S3バケット名"
  type        = string
}

variable "audio_bucket_arn" {
  description = "音声ファイル用S3バケットARN"
  type        = string
}

variable "fastapi_url" {
  description = "FastAPIのURL"
  type        = string
  default     = ""
}

variable "secrets_manager_arn" {
  description = "Secrets Manager ARN"
  type        = string
}

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}
