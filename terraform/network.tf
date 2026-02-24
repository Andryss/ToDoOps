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

# Security group: inbound SSH only
resource "yandex_vpc_security_group" "ssh_inbound" {
  name        = "ssh_inbound"
  description = "Allow SSH inbound to VM"
  network_id  = yandex_vpc_network.todoops.id

  ingress {
    description    = "SSH"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 22
  }
}

# Security group: outbound all
resource "yandex_vpc_security_group" "all_outbound" {
  name        = "all_outbound"
  description = "Allow all outbound from VM"
  network_id  = yandex_vpc_network.todoops.id

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
