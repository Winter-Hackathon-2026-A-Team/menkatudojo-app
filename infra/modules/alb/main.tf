# 証明書申請
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    #新しい証明書を先に作成してから古い証明書を削除
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-certificate"
  }
}

# 証明書が使えるようになるまで待機
resource "aws_acm_certificate_validation" "main" {
  certificate_arn = aws_acm_certificate.main.arn
  #待機時間
  timeouts {
    create = "10m"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  #falseでインターネットからのアクセスを受け取れる
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids
  #falseにすることでdestroy時にリソース削除
  enable_deletion_protection = false
  #http2=高速規約
  enable_http2               = true
  #リクエストをAZに均等に振り分ける
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = var.alb_logs_bucket
    enabled = true
    prefix  = "alb"
  }

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# ALB → Nginx
resource "aws_lb_target_group" "nginx" {
  name     = "${var.project_name}-nginx-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    #チェックを有効
    enabled             = true
    #2回連続で成功=正常
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-nginx-tg"
  }
}

# 80番ポートのリクエストを443番ポートへ転送
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      #次回からhttps(キャッシュに保存)
      status_code = "HTTP_301"
    }
  }
}

# HTTPS解析→NginX
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  #証明書が有効になるまで待機
  certificate_arn   = aws_acm_certificate_validation.main.certificate_arn
  #リクエストをNginXへ
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nginx.arn
  }
}
