output "db_instance_id" {
  description = "RDSインスタンスID"
  value       = aws_db_instance.main.id
}

output "db_instance_arn" {
  description = "RDSインスタンスARN"
  value       = aws_db_instance.main.arn
}

output "endpoint" {
  description = "RDSエンドポイント"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "port" {
  description = "RDSポート"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "データベース名"
  value       = aws_db_instance.main.db_name
}
