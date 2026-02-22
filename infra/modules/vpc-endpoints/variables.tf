variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "プライベートサブネットIDのリスト"
  type        = list(string)
}

variable "private_route_table_ids" {
  description = "プライベートルートテーブルIDのリスト"
  type        = list(string)
  default     = []
}

variable "database_route_table_ids" {
  description = "データベースルートテーブルIDのリスト"
  type        = list(string)
  default     = []
}

variable "vpc_endpoints_security_group_id" {
  description = "VPC Endpoints Security Group ID"
  type        = string
}

variable "session_manager_security_group_id" {
  description = "Session Manager Security Group ID"
  type        = string
}
