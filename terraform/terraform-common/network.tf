# Shared VPC only. Subnets are created in terraform-vm, terraform-k8s, terraform-cicd (same network_id).

resource "yandex_vpc_network" "todoops" {
  name        = "todoops-shared-network"
  description = "Shared VPC for terraform-vm, terraform-k8s, terraform-cicd"
}
