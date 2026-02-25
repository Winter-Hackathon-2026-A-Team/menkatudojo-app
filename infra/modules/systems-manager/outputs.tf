output "session_manager_document_name" {
  description = "Session Manager Document Name"
  value       = aws_ssm_document.session_manager_prefs.name
}

output "session_manager_log_group_name" {
  description = "Session Manager CloudWatch Log Group Name"
  value       = aws_cloudwatch_log_group.session_manager.name
}
