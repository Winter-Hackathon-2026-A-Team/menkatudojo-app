output "secret_id" {
  description = "Secrets Manager Secret ID"
  value       = aws_secretsmanager_secret.main.id
}

output "secret_arn" {
  description = "Secrets Manager Secret ARN"
  value       = aws_secretsmanager_secret.main.arn
}
