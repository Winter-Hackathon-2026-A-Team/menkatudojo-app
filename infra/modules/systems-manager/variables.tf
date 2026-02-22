variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}

variable "session_logs_bucket" {
  description = "Session Managerログを保存するS3バケット名"
  type        = string
  default     = ""
}

variable "session_logs_bucket_arn" {
  description = "Session Managerログを保存するS3バケットARN"
  type        = string
  default     = ""
}
