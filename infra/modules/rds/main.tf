# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-mysql-params"
  family = "mysql8.0"
  #デフォルト文字設定
  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  #多言語対応で大文字・小文字を区別しない
  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "max_connections"
    value = "100"
  }

  tags = {
    Name = "${var.project_name}-mysql-params"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-mysql"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  #汎用SSD(2より3の方が20%ほど安い)
  storage_type          = "gp3"
  #暗号化
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  parameter_group_name   = aws_db_parameter_group.main.name

  #自動バックアップを保持する日数
  backup_retention_period = 7
  #バックアップを行う時間帯
  backup_window           = "03:00-04:00"
  #AWSがOSのパッチ適用などのmaintenanceを行う時間枠
  maintenance_window      = "mon:04:00-mon:05:00"

  multi_az               = false
  #インターネットから直接DBに接続できない(trueは許可)
  publicly_accessible    = false
  #trueにするとdestroyコマンドで削除されなくなる
  deletion_protection    = false
  #インスタンス削除時に最後にバックアップを取る設定(falseでバックアップを取る)
  skip_final_snapshot    = true
  #最終バックアップの名前に実行時の日付時刻を含める
  final_snapshot_identifier = "${var.project_name}-mysql-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  #MySQLの各種ログをCloudWatchに転送する設定
  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]
  #error = データベースのトラブル
  #general = データベースが「いつ」「誰から」「どのようなクエリ」を受け取ったか
  #slowquery = 実行に時間がかかっているクエリ

  #データベースの不可分析ツールを有効にする(7日間まで無料)
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  tags = {
    Name = "${var.project_name}-mysql"
  }
}
