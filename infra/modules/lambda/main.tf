# Lambda関数コードのzip化
data "archive_file" "lambda_zip" {
  type        = "zip"
  #path.module=このディレクトリ内
  source_file = "${path.module}/index.py"
  output_path = "${path.module}/lambda_function.zip"
}

# Lambda 実行ロール
resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Lambda 実行ポリシー
resource "aws_iam_role_policy" "lambda" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        #CloudWatch Logsへの出力権限
        Effect = "Allow"
        Action = [
            #ログストリーム=一連のログのまとまり
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        #権限の範囲
        Resource = "${aws_cloudwatch_log_group.lambda.arn}:*"
      },
      {
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = ["${var.videos_bucket_arn}/*", "${var.audio_bucket_arn}/*"]
      }
    ]
  })
}

# S3がLambdaを起動することを許可する設定
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3"
  #Lambda関数を起動許可
  action        = "lambda:InvokeFunction"
  #どのLambdaに権限を付与するか指定
  function_name = aws_lambda_function.audio_extractor.function_name
  principal     = "s3.amazonaws.com"
  #指定した特定のバケットからのイベントのみに起動を制限
  source_arn    = var.videos_bucket_arn
}

# Lambda 関数本体
resource "aws_lambda_function" "audio_extractor" {
  filename         = var.lambda_zip_path != "" ? var.lambda_zip_path : data.archive_file.lambda_zip.output_path
  #ファイルの中身が１文字でも変わったらTerraformが更新を検知
  source_code_hash = var.lambda_zip_path != "" ? null : data.archive_file.lambda_zip.output_base64sha256
  function_name    = "${var.project_name}-audio-extractor"
  role            = aws_iam_role.lambda.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  #index.pyから参照
  environment {
    variables = {
      VIDEOS_BUCKET = var.videos_bucket_name
      AUDIO_BUCKET  = var.audio_bucket_name
    }
  }

  # FFmpeg レイヤーの有効化
  layers = var.lambda_layer_arn != "" ? [var.lambda_layer_arn] : []
}

# S3 イベント通知設定
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.videos_bucket_name

  lambda_function {
    #Lambda関数を指定
    lambda_function_arn = aws_lambda_function.audio_extractor.arn
    #トリガー
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
    filter_suffix       = ".mp4"
  }

  depends_on = [aws_lambda_permission.allow_s3]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}-audio-extractor"
  retention_in_days = 7
}