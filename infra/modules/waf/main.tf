# Web ACL
resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-waf"
  description = "WAF for ${var.project_name}"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # 許可するIPアドレスの設定
  dynamic "rule" {
    for_each = length(var.allowed_ip_ranges) > 0 ? [1] : []
    content {
      name     = "AllowIPSet"
      #１番最優先
      priority = 1

      statement {
        ip_set_reference_statement {
          arn = aws_wafv2_ip_set.allowed_ips[0].arn
        }
      }
      #指定したIPアドレスからアクセスが来たら許可
      action {
        allow {}
      }

      visibility_config {
        #何件のアクセスが許可されたか
        cloudwatch_metrics_enabled = true
        metric_name                = "AllowIPSet"
        #詳細をコンソール上で確認
        sampled_requests_enabled   = true
      }
    }
  }

  # AWSのセキュリティチームが作成している攻撃パターンの辞書を適用
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 10
    #攻撃と判定→ブロック
    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        #AWS公式ルール
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # 定型化された攻撃パターンのルールセット適用
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 20

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # Linuxサーバ特有の脆弱性を検知、遮断
  rule {
    name     = "AWSManagedRulesLinuxRuleSet"
    priority = 30

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesLinuxRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "LinuxRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # リクエスト制限
  rule {
    name     = "RateLimitRule"
    priority = 40

    statement {
      rate_based_statement {
        #1000で設定(5分間で)
        limit              = var.rate_limit
        #一つのIPが何回リクエストしたか
        aggregate_key_type = "IP"
      }
    }

    action {
      block {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRuleMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.project_name}-waf"
  }
}

# 許可するIPアドレスの設定
resource "aws_wafv2_ip_set" "allowed_ips" {
  count       = length(var.allowed_ip_ranges) > 0 ? 1 : 0
  name        = "${var.project_name}-allowed-ips"
  description = "Allowed IP addresses"
  scope       = "REGIONAL"
  ip_address_version = "IPV4"
  addresses         = var.allowed_ip_ranges

  tags = {
    Name = "${var.project_name}-allowed-ips"
  }
}

# WAFの有効化
resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
