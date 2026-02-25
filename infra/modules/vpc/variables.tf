variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
}

variable "availability_zones" {
  description = "利用可能なアベイラビリティゾーン"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットのCIDRブロック"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネットのCIDRブロック"
  type        = list(string)
}

variable "db_subnet_cidrs" {
  description = "データベースサブネットのCIDRブロック"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "NAT Gatewayを有効化するか"
  type        = bool
  default     = true
}
