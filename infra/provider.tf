#CLIのバージョン1.0以上
terraform {
  required_version = ">= 1.0"
  #HashiCorpからAWSプロバイダー取得
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    #ZIP化用(lambda)
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  backend "s3" {
    bucket = "menkatudojo-app"
    key    = "infrastructure/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
#共通設定(varの実体はvariables.tfを参照)
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
