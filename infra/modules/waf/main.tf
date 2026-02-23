#0.0.0.0/0はWAFv2では指定不可
locals {
    waf_allowed_ips = [
      for cidr in var.allowed_ip_ranges :
      trimspace(cidr)
      if trimspace(cidr) != "" && trimspace(cidr) != "0.0.0.0/0"
  ]
}


# Web ACL
resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-waf"
  description = "WAF for ${var.project_name}"
  scope       = "REGIONAL"

  default_action {
    allow {}
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
  count       = length(local.waf_allowed_ips) > 0 ? 1 : 0
  name        = "${var.project_name}-allowed-ips"
  description = "Allowed IP addresses"
  scope       = "REGIONAL"
  ip_address_version = "IPV4"
  addresses         = local.waf_allowed_ips

  tags = {
    Name = "${var.project_name}-allowed-ips"
  }
  lifecycle {
    # addresses に 0.0.0.0/0 が混入しないよう二重チェック
    precondition {
      condition     = !contains(local.waf_allowed_ips, "0.0.0.0/0")
      error_message = "WAF IP set must not contain 0.0.0.0/0 (use default_action allow instead)."
    }
  }
}

# WAFの有効化
resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
