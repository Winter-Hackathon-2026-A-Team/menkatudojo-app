variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
}

variable "alb_dns_name" {
  description = "Application Load BalancerのDNS名"
  type        = string
}

variable "alb_zone_id" {
  description = "Application Load BalancerのZone ID"
  type        = string
}

variable "certificate_domain_validation_options" {
  description = "ACM証明書のドメイン検証オプション"
  type = list(object({
    domain_name           = string
    resource_record_name  = string
    resource_record_type  = string
    resource_record_value = string
  }))
  default     = []
}
