variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}

variable "webhook_url" {
  description = "Webhook URL (Mattermostへの通知用)"
  type        = string
  default     = ""
}
