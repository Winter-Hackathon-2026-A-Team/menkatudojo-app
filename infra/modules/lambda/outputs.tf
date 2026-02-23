output "function_name" {
  description = "Lambda関数名"
  value       = aws_lambda_function.audio_extractor.function_name
}

output "function_arn" {
  description = "Lambda関数ARN"
  value       = aws_lambda_function.audio_extractor.arn
}

output "function_invoke_arn" {
  description = "Lambda関数のInvoke ARN"
  value       = aws_lambda_function.audio_extractor.invoke_arn
}

output "lambda_role_arn" {
  description = "Lambda実行ロールARN"
  value       = aws_iam_role.lambda.arn
}
