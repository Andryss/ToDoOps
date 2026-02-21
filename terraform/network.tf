# VPC and subnet for ToDoOps VMs

resource "yandex_vpc_network" "todoops" {
  name        = "todoops-network"
  description = "Network for ToDoOps backend and frontend VMs"
}

resource "yandex_vpc_subnet" "todoops" {
  name           = "todoops-subnet"
  description    = "Subnet for ToDoOps VMs"
  network_id     = yandex_vpc_network.todoops.id
  v4_cidr_blocks = ["10.0.1.0/24"]
  zone           = var.default_zone
}
