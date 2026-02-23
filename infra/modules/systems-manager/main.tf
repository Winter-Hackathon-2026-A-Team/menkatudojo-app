# Session Manager セッションログ用 CloudWatch Logs ロググループ
resource "aws_cloudwatch_log_group" "session_manager" {
  name              = "/aws/ssm/session-manager/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-session-manager-logs"
  }
}

# Systems Manager Documentの定義
resource "aws_ssm_document" "session_manager_prefs" {
  name            = "SSM-SessionManagerRunShell"
  document_type   = "Session"
  document_format = "JSON"

  content = jsonencode({
    schemaVersion = "1.0"
    description   = "ログを自動でS3へ"
    #対話型シェルセッション
    sessionType   = "Standard_Stream"
    inputs = {
      s3BucketName                = var.session_logs_bucket
      s3KeyPrefix                 = "session-logs"
      s3EncryptionEnabled         = true
      kmsKeyId                    = var.kms_key_arn
      shellProfile = {
        linux = "echo '[SSM Session started]'"
      }
    }
  })

  tags = {
    Name = "${var.project_name}-session-manager-prefs"
  }
}
