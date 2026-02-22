variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "private_subnet_ids" {
  description = "プライベートサブネットIDのリスト"
  type        = list(string)
}

variable "nginx_security_group_id" {
  description = "Nginx Security Group ID"
  type        = string
}

variable "fastapi_security_group_id" {
  description = "FastAPI Security Group ID"
  type        = string
}

variable "instance_type_nginx" {
  description = "Nginx EC2インスタンスタイプ"
  type        = string
  default     = "t3.small"
}

variable "instance_type_fastapi" {
  description = "FastAPI EC2インスタンスタイプ"
  type        = string
  default     = "t3.medium"
}

variable "s3_bucket_arn" {
  description = "S3バケットARN"
  type        = string
}

variable "secrets_manager_arn" {
  description = "Secrets Manager ARN"
  type        = string
}

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}

variable "session_logs_bucket_arn" {
  description = "Session Managerログを保存するS3バケットARN"
  type        = string
}

variable "fastapi_private_ips" {
  description = "FastAPIインスタンスのプライベートIPアドレス"
  type        = list(string)
  default     = []
}
