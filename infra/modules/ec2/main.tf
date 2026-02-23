# Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  #検索条件に合致するAMIが複数見つかった場合、最新の作成日時のものを採用する
  most_recent = true
  #amazonと指定することでAWS公式のAMIを選択
  owners      = ["amazon"]
  #filterで絞り込み
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    #完全仮想化、現在の主流
    values = ["hvm"]
  }
}

# IAM Role for EC2 instances
resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        #一時的なトークンを発行
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-role"
  }
}

# IAM Policy for EC2 instances
resource "aws_iam_role_policy" "ec2" {
  name = "${var.project_name}-ec2-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          #ファイルの取得
          "s3:GetObject",
          #ファイルのアップロード
          "s3:PutObject",
          #ファイルの削除
          "s3:DeleteObject",
          #バケット内の一覧表示
          "s3:ListBucket"
        ]
        Resource = [
          "${var.s3_bucket_arn}",
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          #シークレット(機密性の高い情報)を取得
          "secretsmanager:GetSecretValue",
          #名前や更新情報などを取得(シークレットは取得できない)
          "secretsmanager:DescribeSecret"
        ]
        Resource = var.secrets_manager_arn
      },
      {
        Effect = "Allow"
        Action = [
          #特定のパラメータを１つ取得
          "ssm:GetParameter",
          #複数
          "ssm:GetParameters",
          #指定したパス配下にあるパラメータをすべて取得
          "ssm:GetParametersByPath"
        ]
        #特定の条件に絞り込む①リージョン②アカウント③プロジェクト名
        Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/*"
      },
      {
        Effect = "Allow"
        Action = [
          #復号化
          "kms:Decrypt"
        ]
        Resource = var.kms_key_arn
      },
      {
        Effect = "Allow"
        Action = [
          #Session Manager用の権限
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          #Session ManagerログをS3に保存
          "s3:PutObject"
        ]
        Resource = "${var.session_logs_bucket_arn}/*"
      }
    ]
  })
}

# IAMインスタンスプロフィールを作成
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# 実行中のAWSリージョンの情報を取得
data "aws_region" "current" {}
# terraformを実行しているAWSアカウントのID、ユーザARNを取得
data "aws_caller_identity" "current" {}

# Nginxの設定
locals {
  #FastAPIにIPアドレスが存在するか確認
  nginx_user_data = length(var.fastapi_private_ips) > 0 ? (
    <<-EOF
      #Shebang,Bashで実行されることを指定
      #!/bin/bash
      yum update -y
      yum install -y nginx docker
      
      # Dockerサービスを開始
      systemctl start docker
      #次回のOS起動時に自動で起動
      systemctl enable docker
      
      # Nginx設定
      cat > /etc/nginx/conf.d/default.conf <<'NGINX_CONF'
      #EC2(fastAPI)の数だけIPアドレス+ポート番号を返す
      upstream fastapi {
          ${join("\n          ", [for ip in var.fastapi_private_ips : "server ${ip}:8000;"])}
      }
      
      server {
          #httpでの接続待ち
          listen 80;
          server_name _;
          
          location /api/ {
              proxy_pass http://fastapi;
              client_max_body_size 100M;
              #バックエンドからの返信を待つ時間
              proxy_read_timeout 60s;
              #バックエンドへの接続を試みる時間
              proxy_connect_timeout 60s;

              #ドメイン名をfastAPIに伝える
              proxy_set_header Host $host;
              #リクエストを送ってきたユーザのIPアドレスを伝える
              proxy_set_header X-Real-IP $remote_addr;
              #経由してきた記録に自分の直前の接続元を書き足して転送
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              #http,httpsどちらでアクセスしてきたかfastAPIに伝える
              proxy_set_header X-Forwarded-Proto $scheme;
          }
          #フロントの画面表示
          location / {
              #htmlをこのファイルに配置
              root /usr/share/nginx/html;
              #最初に開くファイル名
              index index.html;
              #リクエストされたファイル、ディレクトリがなければindex.htmlを返す
              try_files $uri $uri/ /index.html;
          }
          
          location /health {
              #ログを記録しない
              access_log off;
              return 200 "healthy\n";
              add_header Content-Type text/plain;
          }
      }
      NGINX_CONF 
      
      systemctl start nginx
      #OSの再起動時に自動起動
      systemctl enable nginx
    EOF
  ) : (
    #初回起動時に実行される
    <<-EOF
      #!/bin/bash
      yum update -y
      yum install -y nginx docker
      
      systemctl start docker
      systemctl enable docker
      
      # Nginx設定（FastAPIのIPアドレスは後で設定）
      cat > /etc/nginx/conf.d/default.conf <<'NGINX_CONF'
      upstream fastapi {
          # FastAPI
      }
      
      server {
          listen 80;
          server_name _;
          
          location /api/ {
              proxy_pass http://fastapi;
              client_max_body_size 100M;
              proxy_read_timeout 60s;
              proxy_connect_timeout 60s;

              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
          }
          
          location / {
              root /usr/share/nginx/html;
              index index.html;
          }
          
          location /health {
              access_log off;
              return 200 "healthy\n";
              add_header Content-Type text/plain;
          }
      }
      NGINX_CONF
      
      systemctl start nginx
      systemctl enable nginx
    EOF
  )

  #FastAPIの初期環境構築
  fastapi_user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    
    # Dockerサービスを開始
    systemctl start docker
    systemctl enable docker
    
    # Docker Composeインストール
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # アプリケーションコードを配置（実際の運用ではS3から取得するなど）
    mkdir -p /app
    cd /app
    
    # 環境変数の設定（Secrets Managerから取得するスクリプトを追加）
    # 実際の運用では、起動時にSecrets Managerから取得するスクリプトを実行
    
    systemctl restart docker
  EOF
}

# EC2(Nginx)
resource "aws_instance" "nginx" {
  #作成個数を指定
  count                  = length(var.private_subnet_ids)
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type_nginx
  subnet_id              = var.private_subnet_ids[count.index]
  vpc_security_group_ids = [var.nginx_security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  #初期設定スクリプト
  user_data = base64encode(local.nginx_user_data)

  #ディスク設定
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  tags = {
    Name = "${var.project_name}-nginx-${count.index + 1}"
    Type = "Nginx"
  }
}

# EC2(FastAPI)
resource "aws_instance" "fastapi" {
  count                  = length(var.private_subnet_ids)
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type_fastapi
  subnet_id              = var.private_subnet_ids[count.index]
  vpc_security_group_ids = [var.fastapi_security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data = base64encode(local.fastapi_user_data)

  root_block_device {
    volume_type = "gp3"
    volume_size = 30
    encrypted   = true
  }

  tags = {
    Name = "${var.project_name}-fastapi-${count.index + 1}"
    Type = "FastAPI"
  }
}
