variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "kms_key_arn" {
  description = "S3バケット暗号化用KMSキーARN"
  type        = string
}
