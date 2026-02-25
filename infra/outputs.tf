#外部に公開する接続情報

#apply後に取得
#EC2を作る時やエンドポイントを作る時に「どのVPCに作るか」指定するために必要
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}
#アクセス用アドレスを表示
output "alb_dns_name" {
  description = "Application Load BalancerのDNS名"
  value       = module.alb.alb_dns_name
}
#Route53,Aレコードに登録するため
output "alb_zone_id" {
  description = "Application Load BalancerのZone ID"
  value       = module.alb.alb_zone_id
}
#Route53のzone_idを取得
output "route53_zone_id" {
  description = "Route 53 Hosted Zone ID"
  value       = module.route53.zone_id
}
#取得したドメインを使うため
output "route53_name_servers" {
  description = "Route 53 Name Servers"
  value       = module.route53.name_servers
}

output "s3_bucket_name" {
  description = "S3バケット名"
  value       = module.s3.bucket_name
}

output "rds_endpoint" {
  description = "RDSエンドポイント"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDSポート"
  value       = module.rds.port
}

output "lambda_function_name" {
  description = "Lambda関数名"
  value       = module.lambda.function_name
}
#ARN=AWS全体で一意な名前
output "lambda_function_arn" {
  description = "Lambda関数のARN"
  value       = module.lambda.function_arn
}

output "secrets_manager_secret_arn" {
  description = "Secrets ManagerのシークレットARN"
  value       = module.secrets.secret_arn
  sensitive   = true
}

output "kms_key_id" {
  description = "KMSキーID"
  value       = module.kms.key_id
}

output "sns_topic_arn" {
  description = "SNSトピックARN"
  value       = module.sns.topic_arn
}

#2回目 apply で main.tf に設定するために使用
output "ec2_iam_role_arn" {
  description = "EC2 IAMロールARN（2回目applyで module.kms の ec2_role_arn に設定）"
  value       = module.ec2.ec2_iam_role_arn
}

output "lambda_role_arn" {
  description = "Lambda実行ロールARN（2回目applyで module.kms の lambda_role_arn に設定）"
  value       = module.lambda.lambda_role_arn
}

output "fastapi_private_ips" {
  description = "FastAPIのプライベートIPリスト（2回目applyで module.ec2 の fastapi_private_ips に設定）"
  value       = module.ec2.fastapi_private_ips
}
