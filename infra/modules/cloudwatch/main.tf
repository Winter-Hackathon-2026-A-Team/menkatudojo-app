# ALB→NginX→FastAPI(5xxエラー)
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${var.project_name}-alb-5xx-errors"
  #判定基準(しきい値)
  comparison_operator = "GreaterThanThreshold"
  #異常判定を確定させるまでの回数
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  #1回の判定時間のエラー数を集計
  period              = 60
  #集計方法
  statistic           = "Sum"
  #60秒で3回以上のエラーで異常
  threshold           = 3
  alarm_description   = "This metric monitors ALB 5xx errors"
  alarm_actions       = [var.sns_topic_arn]
  #どのALBを監視するか
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "${var.project_name}-alb-5xx-errors"
  }
}

# ALB→NginX→FastAPI(4xxエラー)
resource "aws_cloudwatch_metric_alarm" "alb_4xx_errors" {
  alarm_name          = "${var.project_name}-alb-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_4XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 3
  alarm_description   = "This metric monitors ALB 4xx errors"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name = "${var.project_name}-alb-4xx-errors"
  }
}

# RDS CPU使用率
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  #監視対象をCPU使用率に設定
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Name = "${var.project_name}-rds-cpu"
  }
}

# RDS　空き容量
resource "aws_cloudwatch_metric_alarm" "rds_free_storage" {
  alarm_name          = "${var.project_name}-rds-free-storage"
  #しきい値を下回ったら以上
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  #空きストレージ容量を指定(Byte)
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  #2GBを下回ったら
  threshold           = 2000000000
  alarm_description   = "This metric monitors RDS free storage space"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Name = "${var.project_name}-rds-free-storage"
  }
}

# EC2インスタンス CPU使用率
resource "aws_cloudwatch_metric_alarm" "ec2_cpu" {
  #EC2の数だけアラート作成
  count               = length(var.ec2_instance_ids)
  alarm_name          = "${var.project_name}-ec2-${count.index + 1}-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors EC2 CPU utilization"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    InstanceId = var.ec2_instance_ids[count.index]
  }

  tags = {
    Name = "${var.project_name}-ec2-${count.index + 1}-cpu"
  }
}

# Lambdaエラー
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 2
  alarm_description   = "This metric monitors Lambda function errors"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    FunctionName = var.lambda_function_name
  }

  tags = {
    Name = "${var.project_name}-lambda-errors"
  }
}

# Lambda実行時間
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.project_name}-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  #実行時間
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  #2分
  threshold           = 120000
  alarm_description   = "This metric monitors Lambda function duration"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    FunctionName = var.lambda_function_name
  }

  tags = {
    Name = "${var.project_name}-lambda-duration"
  }
}
