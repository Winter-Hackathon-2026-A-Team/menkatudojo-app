# KMSキーを操作できる権限設定を利用者がいる場合作成
locals {
  kms_role_arns = compact([var.ec2_role_arn, var.lambda_role_arn])
  _kms_allow_stmt_use = {
    Sid    = "Allow use of the key"
    Effect = "Allow"
    Principal = {
      AWS = local.kms_role_arns
    }
    Action = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    Resource = "*"
  }
  _kms_allow_stmt_attach = {
    Sid    = "Allow attachment of persistent resources"
    Effect = "Allow"
    Principal = {
      AWS = local.kms_role_arns
    }
    Action = [
      "kms:CreateGrant",
      "kms:ListGrants",
      "kms:RevokeGrant"
    ]
    Resource = "*"
    Condition = {
      Bool = {
        "kms:GrantIsForAWSResource" = "true"
      }
    }
  }
  # 
  kms_allow_statements = [
    for idx in (length(local.kms_role_arns) > 0 ? [0, 1] : []) :
    idx == 0 ? local._kms_allow_stmt_use : local._kms_allow_stmt_attach
  ]
}

# KMS Key
resource "aws_kms_key" "main" {
  description = "KMS key for ${var.project_name}"
  #削除するまでの猶予期間
  deletion_window_in_days = var.deletion_window_in_days
  #自動更新機能
  enable_key_rotation = true

  policy = jsonencode({
    Version = "2012-10-17"
    #具体的なルール
    Statement = concat(
      [
        {
          Sid    = "Enable IAM User Permissions"
          Effect = "Allow"
          Principal = {
            AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
          }
          Action   = "kms:*"
          Resource = "*"
        }
      ],
      local.kms_allow_statements
    )
  })

  tags = {
    Name = "${var.project_name}-kms-key"
  }
}

# KMS Alias
resource "aws_kms_alias" "main" {
  #KMSのルールで必ずalias/から始めないといけない
  name = "alias/${var.project_name}"
  #どの鍵にエイリアスをつけるかを指定
  target_key_id = aws_kms_key.main.key_id
}

# Data source(自分自身の情報取得)
data "aws_caller_identity" "current" {}

#Encrypt          = 暗号化
#Decrypt          = 復号化
#ReEncrypt*       = 暗号化→(内部復号化)→別キーに付け替え(複数鍵が無いと使えない)
#GenerateDataKey* = #4KB以上,何回もAPI読み出しが必要になる場合に使う(Envelope Encryption)
#DescribeKey      = 鍵の情報確認
#CreateGrant      = 許可書を新しく作る
#ListGrants       = 誰に許可書を出しているか確認する
#RevokeGrant      = 許可書を削除する

#AWSのサービスが、管理するAWSリソースのために鍵を使う場合のみ許可
#"kms:GrantIsForAWSResource" = "true"