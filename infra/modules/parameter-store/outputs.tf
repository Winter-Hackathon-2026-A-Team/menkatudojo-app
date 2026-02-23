output "db_host_parameter_name" {
  description = "DB Host Parameter Name"
  value       = aws_ssm_parameter.db_host.name
}

output "db_port_parameter_name" {
  description = "DB Port Parameter Name"
  value       = aws_ssm_parameter.db_port.name
}

output "db_name_parameter_name" {
  description = "DB Name Parameter Name"
  value       = aws_ssm_parameter.db_name.name
}
