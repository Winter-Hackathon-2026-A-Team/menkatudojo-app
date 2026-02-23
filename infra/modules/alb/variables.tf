variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "パブリックサブネットIDのリスト"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ALB Security Group ID"
  type        = string
}

variable "alb_logs_bucket" {
  description = "ALBログを保存するS3バケット名"
  type        = string
  default     = ""
}
