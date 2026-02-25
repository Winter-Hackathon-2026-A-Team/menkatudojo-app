variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "alb_arn" {
  description = "Application Load Balancer ARN"
  type        = string
}

variable "allowed_ip_ranges" {
  description = "許可するIPアドレス範囲のリスト"
  type        = list(string)
  default     = []
}

variable "rate_limit" {
  description = "レート制限（1分あたりのリクエスト数）"
  type        = number
  default     = 1000
}
