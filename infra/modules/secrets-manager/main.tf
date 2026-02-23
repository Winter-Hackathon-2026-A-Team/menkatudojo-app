# Secrets Manager Secret
resource "aws_secretsmanager_secret" "main" {
  name                    = "${var.project_name}/secrets"
  description             = "Secrets for ${var.project_name}"
  #削除した時に完全に削除されるまでの猶予期間
  recovery_window_in_days = var.recovery_window_in_days
  kms_key_id              = var.kms_key_arn

  tags = {
    Name = "${var.project_name}-secrets"
  }
}

# Secrets Manager Secret Version
resource "aws_secretsmanager_secret_version" "main" {
  secret_id = aws_secretsmanager_secret.main.id
  #実際の機密データ
  secret_string = jsonencode({
    db_username    = var.db_username
    db_password    = var.db_password
    whisper_api_key = var.whisper_api_key
    gemini_api_key  = var.gemini_api_key
  })
}
