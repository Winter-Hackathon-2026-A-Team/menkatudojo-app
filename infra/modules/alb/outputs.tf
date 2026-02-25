output "alb_id" {
  description = "Application Load Balancer ID"
  value       = aws_lb.main.id
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "Application Load BalancerのDNS名"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Application Load BalancerのZone ID"
  value       = aws_lb.main.zone_id
}

output "nginx_target_group_arn" {
  description = "Nginx Target Group ARN"
  value       = aws_lb_target_group.nginx.arn
}

output "certificate_arn" {
  description = "ACM Certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "certificate_domain_validation_options" {
  description = "ACM Certificate Domain Validation Options"
  value       = aws_acm_certificate.main.domain_validation_options
}
