variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNSトピックARN"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARNサフィックス（ロードバランサー名）"
  type        = string
  default     = ""
}

variable "rds_instance_id" {
  description = "RDSインスタンスID"
  type        = string
  default     = ""
}

variable "ec2_instance_ids" {
  description = "EC2インスタンスIDのリスト"
  type        = list(string)
  default     = []
}

variable "lambda_function_name" {
  description = "Lambda関数名"
  type        = string
  default     = ""
}
