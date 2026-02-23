output "key_id" {
  description = "KMSキーID"
  value       = aws_kms_key.main.id
}

output "key_arn" {
  description = "KMSキーARN"
  value       = aws_kms_key.main.arn
}

output "alias_name" {
  description = "KMSエイリアス名"
  value       = aws_kms_alias.main.name
}
