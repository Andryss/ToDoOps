output "vpc_network_id" {
  description = "Shared VPC network ID (use for subnets in sibling stacks)"
  value       = yandex_vpc_network.todoops.id
}
