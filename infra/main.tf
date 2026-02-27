# VPC
module "vpc" {
  source = "./modules/vpc"

  project_name          = var.project_name
  vpc_cidr              = var.vpc_cidr
  availability_zones    = var.availability_zones
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  db_subnet_cidrs       = var.db_subnet_cidrs
  enable_nat_gateway    = var.enable_nat_gateway
}

# Security Groups
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = module.vpc.vpc_cidr_block
}

# KMS (EC2とLambdaのロールARNはapply後に入力)
module "kms" {
  source = "./modules/kms"

  project_name = var.project_name
  ec2_role_arn    = ""
  lambda_role_arn = ""
}

# Secrets Manager
module "secrets" {
  source = "./modules/secrets-manager"

  project_name    = var.project_name
  kms_key_arn     = module.kms.key_arn
  db_username     = var.db_username
  db_password     = var.db_password
  whisper_api_key = var.whisper_api_key
  gemini_api_key  = var.gemini_api_key
}

# S3
module "s3" {
  source = "./modules/s3"

  project_name         = var.project_name
  kms_key_arn          = module.kms.key_arn
}

# Lambda
module "lambda" {
  source = "./modules/lambda"

  project_name         = var.project_name
  lambda_runtime       = var.lambda_runtime
  lambda_timeout       = var.lambda_timeout
  lambda_memory_size   = var.lambda_memory_size
  lambda_zip_path      = var.lambda_zip_path
  #どのバケットを監視して、どのバケットから動画を読み込むかを定義
  videos_bucket_name   = module.s3.videos_bucket_name
  videos_bucket_arn    = module.s3.videos_bucket_arn
  #抽出した音声をどこに保存するかを定義
  audio_bucket_name    = module.s3.audio_bucket_name
  audio_bucket_arn     = module.s3.audio_bucket_arn
  #FastAPIに通知するためのURL
  fastapi_url          = "https://${var.domain_name}/api"
  secrets_manager_arn  = module.secrets.secret_arn
  kms_key_arn          = module.kms.key_arn
#module.s3を作成してから実行されるように設定
  depends_on = [module.s3]
}

# RDS
module "rds" {
  source = "./modules/rds"

  project_name        = var.project_name
  #RDSを配置するSubnet
  database_subnet_ids = module.vpc.database_subnet_ids
  rds_security_group_id = module.security_groups.rds_security_group_id
  #リソース
  db_instance_class   = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  kms_key_arn         = module.kms.key_arn
}

# EC2
module "ec2" {
  source = "./modules/ec2"

  project_name           = var.project_name
  private_subnet_ids     = module.vpc.private_subnet_ids
  nginx_security_group_id   = module.security_groups.nginx_security_group_id
  fastapi_security_group_id = module.security_groups.fastapi_security_group_id
  instance_type_nginx    = var.instance_type_nginx
  instance_type_fastapi  = var.instance_type_fastapi
  s3_bucket_arn          = module.s3.videos_bucket_arn
  secrets_manager_arn    = module.secrets.secret_arn
  kms_key_arn            = module.kms.key_arn
  session_logs_bucket_arn = module.s3.alb_logs_bucket_arn
  # apply後に設定
  fastapi_private_ips     = []
}

# ALB
module "alb" {
  source = "./modules/alb"

  project_name         = var.project_name
  domain_name          = var.domain_name
  vpc_id               = module.vpc.vpc_id
  public_subnet_ids    = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_security_group_id
  alb_logs_bucket      = module.s3.alb_logs_bucket_name
}

# Route 53 (証明書検証用のDNSレコードを作成)
module "route53" {
  source = "./modules/route53"

  project_name         = var.project_name
  domain_name          = var.domain_name
  alb_dns_name         = module.alb.alb_dns_name
  alb_zone_id          = module.alb.alb_zone_id
  #ACMからCNAMEレコードをDNSに登録
  certificate_domain_validation_options = module.alb.certificate_domain_validation_options
}

# ACM 証明書の検証完了待ち（Route53 の検証レコード作成後に実行し、タイムアウトを延長）
resource "aws_acm_certificate_validation" "main" {
  certificate_arn = module.alb.certificate_arn
  depends_on      = [module.route53]

  timeouts {
    create = "25m"
  }
}

# WAF
module "waf" {
  source = "./modules/waf"
  project_name = var.project_name
  alb_arn      = module.alb.alb_arn
  rate_limit   = 1000
}

# VPC Endpoints
module "vpc_endpoints" {
  #作成するかしないかの判定(0作成しない)
  count  = var.enable_vpc_endpoints ? 1 : 0
  source = "./modules/vpc-endpoints"

  project_name                    = var.project_name
  vpc_id                          = module.vpc.vpc_id
  private_subnet_ids              = module.vpc.private_subnet_ids
  private_route_table_ids         = module.vpc.private_route_table_id != null ? [module.vpc.private_route_table_id] : []
  database_route_table_ids        = [module.vpc.database_route_table_id]
  vpc_endpoints_security_group_id = module.security_groups.vpc_endpoints_security_group_id
  session_manager_security_group_id = module.security_groups.session_manager_security_group_id
}

# Parameter Store
module "parameter_store" {
  source = "./modules/parameter-store"

  project_name     = var.project_name
  kms_key_arn      = module.kms.key_arn
  db_host          = module.rds.endpoint
  db_port          = module.rds.port
  db_name          = module.rds.db_name
  fastapi_url      = "https://${var.domain_name}/api"
  s3_videos_bucket = module.s3.videos_bucket_name
  s3_audio_bucket  = module.s3.audio_bucket_name

  depends_on = [module.rds, module.alb]
}

# Systems Manager
module "systems_manager" {
  source = "./modules/systems-manager"

  project_name           = var.project_name
  kms_key_arn            = module.kms.key_arn
  session_logs_bucket    = module.s3.alb_logs_bucket_name # 別途Session Manager用バケットを作成する場合は変更
  session_logs_bucket_arn = module.s3.alb_logs_bucket_arn
}

# SNS
module "sns" {
  source = "./modules/sns"

  project_name = var.project_name
  kms_key_arn  = module.kms.key_arn
  webhook_url  = var.webhook_url
}

# CloudWatch
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name        = var.project_name
  sns_topic_arn       = module.sns.topic_arn
  #ARNの末尾のID部分を取得
  alb_arn_suffix      = split("/", module.alb.alb_arn)[length(split("/", module.alb.alb_arn)) - 1]
  rds_instance_id     = module.rds.db_instance_id
  ec2_instance_ids    = concat(module.ec2.nginx_instance_ids, module.ec2.fastapi_instance_ids)
  lambda_function_name = module.lambda.function_name

  depends_on = [
    module.alb,
    module.rds,
    module.ec2,
    module.lambda,
    module.sns
  ]
}

# ALB ターゲット(NginX)
resource "aws_lb_target_group_attachment" "nginx" {
  count            = length(module.ec2.nginx_instance_ids)
  target_group_arn = module.alb.nginx_target_group_arn
  target_id        = module.ec2.nginx_instance_ids[count.index]
  port             = 80
}
