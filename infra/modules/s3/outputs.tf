output "videos_bucket_name" {
  description = "動画アップロード用S3バケット名"
  value       = aws_s3_bucket.videos.id
}

output "videos_bucket_arn" {
  description = "動画アップロード用S3バケットARN"
  value       = aws_s3_bucket.videos.arn
}

output "audio_bucket_name" {
  description = "音声保存用S3バケット名"
  value       = aws_s3_bucket.audio.id
}

output "audio_bucket_arn" {
  description = "音声保存用S3バケットARN"
  value       = aws_s3_bucket.audio.arn
}

output "alb_logs_bucket_name" {
  description = "ALBログ用S3バケット名"
  value       = aws_s3_bucket.alb_logs.id
}

output "alb_logs_bucket_arn" {
  description = "ALBログ用S3バケットARN"
  value       = aws_s3_bucket.alb_logs.arn
}

# ルート outputs.tfのs3_bucket_name
output "bucket_name" {
  description = "メインS3バケット名（動画バケット）"
  value       = aws_s3_bucket.videos.id
}
