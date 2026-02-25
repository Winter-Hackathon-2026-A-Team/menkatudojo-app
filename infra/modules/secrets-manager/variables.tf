variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "データベースパスワード"
  type        = string
  sensitive   = true
}

variable "whisper_api_key" {
  description = "Whisper APIキー"
  type        = string
  sensitive   = true
  default     = ""
}

variable "gemini_api_key" {
  description = "Gemini APIキー"
  type        = string
  sensitive   = true
  default     = ""
}

variable "recovery_window_in_days" {
  description = "シークレットの復旧期間（日）"
  type        = number
  default     = 30
}
