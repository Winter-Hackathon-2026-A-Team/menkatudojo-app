variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "database_subnet_ids" {
  description = "データベースサブネットIDのリスト"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS Security Group ID"
  type        = string
}

variable "db_instance_class" {
  description = "RDSインスタンスクラス"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "RDSの割り当てストレージ（GB）"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "データベース名"
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

variable "kms_key_arn" {
  description = "KMSキーARN"
  type        = string
}
