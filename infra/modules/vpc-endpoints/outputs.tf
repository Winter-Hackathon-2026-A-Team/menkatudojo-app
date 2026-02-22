output "s3_endpoint_id" {
  description = "S3 VPC Endpoint ID"
  value       = aws_vpc_endpoint.s3.id
}

output "secrets_manager_endpoint_id" {
  description = "Secrets Manager VPC Endpoint ID"
  value       = aws_vpc_endpoint.secrets_manager.id
}

output "ssm_endpoint_id" {
  description = "SSM VPC Endpoint ID"
  value       = aws_vpc_endpoint.ssm.id
}

output "ssm_messages_endpoint_id" {
  description = "SSM Messages VPC Endpoint ID"
  value       = aws_vpc_endpoint.ssm_messages.id
}

output "ec2_messages_endpoint_id" {
  description = "EC2 Messages VPC Endpoint ID"
  value       = aws_vpc_endpoint.ec2_messages.id
}

output "cloudwatch_logs_endpoint_id" {
  description = "CloudWatch Logs VPC Endpoint ID"
  value       = aws_vpc_endpoint.cloudwatch_logs.id
}

output "kms_endpoint_id" {
  description = "KMS VPC Endpoint ID"
  value       = aws_vpc_endpoint.kms.id
}
