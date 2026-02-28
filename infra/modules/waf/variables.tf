variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "alb_arn" {
  description = "Application Load Balancer ARN"
  type        = string
}

variable "rate_limit" {
  description = "レート制限（1分あたりのリクエスト数）"
  type        = number
  default     = 1000
}

variable "allowed_ip_ranges" {
  description = "Allowed IP address ranges"
  type        = list(string)
  default     = []
}