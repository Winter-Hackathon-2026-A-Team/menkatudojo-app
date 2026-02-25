output "nginx_instance_ids" {
  description = "Nginx EC2インスタンスIDのリスト"
  value       = aws_instance.nginx[*].id
}

output "nginx_private_ips" {
  description = "Nginx EC2インスタンスのプライベートIPアドレスのリスト"
  value       = aws_instance.nginx[*].private_ip
}

output "fastapi_instance_ids" {
  description = "FastAPI EC2インスタンスIDのリスト"
  value       = aws_instance.fastapi[*].id
}

output "fastapi_private_ips" {
  description = "FastAPI EC2インスタンスのプライベートIPアドレスのリスト"
  value       = aws_instance.fastapi[*].private_ip
}

output "ec2_iam_role_arn" {
  description = "EC2 IAM Role ARN"
  value       = aws_iam_role.ec2.arn
}
