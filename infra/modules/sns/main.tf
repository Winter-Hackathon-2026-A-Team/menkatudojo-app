# SNS Topic
resource "aws_sns_topic" "alerts" {
  name              = "${var.project_name}-alerts"
  display_name      = "${var.project_name} Alerts"
  #メッセージ内容を暗号化
  kms_master_key_id = var.kms_key_arn

  tags = {
    Name = "${var.project_name}-alerts"
  }
}

# SNS Subscription for Webhook (Mattermostへの通知)
resource "aws_sns_topic_subscription" "webhook" {
  count     = var.webhook_url != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "https"
  endpoint  = var.webhook_url
}
