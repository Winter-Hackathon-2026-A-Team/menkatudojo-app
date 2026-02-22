# ホストゾーン設定
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name = "${var.project_name}-hosted-zone"
  }
}

# ドメイン名とALBを紐づけ
resource "aws_route53_record" "alb" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  # Aと指定しaliasを使うことでAレコードで登録可能(CNAMEは有料)
  type    = "A"
  #AWS独自のDNS拡張機能
  alias {
    #接続先のALB固有のDNS名を指定
    name                   = var.alb_dns_name
    #所属リージョンを指定
    zone_id                = var.alb_zone_id
    #ALBの状態を確認してから通信
    evaluate_target_health = true
  }
}

# サブドメインにwwwを登録
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# DNS検証の自動化
locals {
  _cert_validation_dvo = {
    for dvo in var.certificate_domain_validation_options : dvo.domain_name => dvo
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = toset([var.domain_name, "*.${var.domain_name}"])

  allow_overwrite = true
  name            = try(local._cert_validation_dvo[each.key].resource_record_name, "")
  records         = [try(local._cert_validation_dvo[each.key].resource_record_value, "")]
  ttl             = 60
  type            = try(local._cert_validation_dvo[each.key].resource_record_type, "CNAME")
  zone_id         = aws_route53_zone.main.zone_id
}
