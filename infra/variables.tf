variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "menkatudojo"
}

variable "environment" {
  description = "環境名（dev, staging, prod）"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
  default     = "menkatudojo.com"
}

variable "availability_zones" {
  description = "利用可能なアベイラビリティゾーン"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "db_subnet_cidrs" {
  description = "データベースサブネットのCIDRブロック"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24"]
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
  default     = "menkatudojo_db"
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
#確認後修正
variable "whisper_api_key" {
  description = "Whisper APIキー"
  type        = string
  sensitive   = true
  default     = ""
}
#確認後修正
variable "gemini_api_key" {
  description = "Gemini APIキー"
  type        = string
  sensitive   = true
  default     = ""
}

variable "webhook_url" {
  description = "Webhook URL (Mattermostへの通知用)"
  type        = string
  sensitive   = true
  default     = ""
}
#各自でipアドレスの設定をする必要あり
variable "allowed_cidr_blocks" {
  description = "管理アクセスを許可するCIDRブロック"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_nat_gateway" {
  description = "NAT Gatewayを有効化するか"
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "VPC Endpointsを有効化するか"
  type        = bool
  default     = true
}

variable "lambda_runtime" {
  description = "Lambda関数のランタイム"
  type        = string
  default     = "python3.11"
}

variable "lambda_timeout" {
  description = "Lambda関数のタイムアウト（秒）"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda関数のメモリサイズ（MB）"
  type        = number
  default     = 1024
}

variable "lambda_zip_path" {
  description = "Lambda関数のzipファイルパス（未指定時は modules/lambda の index.py から自動生成）"
  type        = string
  default     = ""
}
