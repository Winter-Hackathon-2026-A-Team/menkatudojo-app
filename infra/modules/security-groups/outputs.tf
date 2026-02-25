output "alb_security_group_id" {
  description = "ALB Security Group ID"
  value       = aws_security_group.alb.id
}

output "nginx_security_group_id" {
  description = "Nginx Security Group ID"
  value       = aws_security_group.nginx.id
}

output "fastapi_security_group_id" {
  description = "FastAPI Security Group ID"
  value       = aws_security_group.fastapi.id
}

output "rds_security_group_id" {
  description = "RDS Security Group ID"
  value       = aws_security_group.rds.id
}

output "lambda_security_group_id" {
  description = "Lambda Security Group ID"
  value       = aws_security_group.lambda.id
}

output "vpc_endpoints_security_group_id" {
  description = "VPC Endpoints Security Group ID"
  value       = aws_security_group.vpc_endpoints.id
}

output "session_manager_security_group_id" {
  description = "Session Manager Security Group ID"
  value       = aws_security_group.session_manager.id
}
