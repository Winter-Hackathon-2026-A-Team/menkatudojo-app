output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "VPC CIDRブロック"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "パブリックサブネットIDのリスト"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "プライベートサブネットIDのリスト"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "データベースサブネットIDのリスト"
  value       = aws_subnet.database[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_id" {
  description = "NAT Gateway ID"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[0].id : null
}

output "nat_gateway_public_ip" {
  description = "NAT GatewayのパブリックIP"
  value       = var.enable_nat_gateway ? aws_eip.nat[0].public_ip : null
}

output "private_route_table_id" {
  description = "プライベートルートテーブルID"
  value       = var.enable_nat_gateway ? aws_route_table.private[0].id : null
}

output "database_route_table_id" {
  description = "データベースルートテーブルID"
  value       = aws_route_table.database.id
}
