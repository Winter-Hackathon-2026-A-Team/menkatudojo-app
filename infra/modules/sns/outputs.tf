output "topic_arn" {
  description = "SNSトピックARN"
  value       = aws_sns_topic.alerts.arn
}

output "topic_name" {
  description = "SNSトピック名"
  value       = aws_sns_topic.alerts.name
}
