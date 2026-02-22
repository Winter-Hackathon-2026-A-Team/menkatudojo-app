variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "deletion_window_in_days" {
  description = "KMSキーの削除待機期間（日）"
  type        = number
  default     = 30
}

variable "ec2_role_arn" {
  description = "EC2 IAM Role ARN"
  type        = string
  default     = ""
}

variable "lambda_role_arn" {
  description = "Lambda IAM Role ARN"
  type        = string
  default     = ""
}
