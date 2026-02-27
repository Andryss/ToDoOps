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

# Subnet for Kubernetes cluster and node group (dedicated CIDR)
resource "yandex_vpc_subnet" "k8s" {
  name           = "todoops-k8s-subnet"
  description    = "Subnet for Kubernetes cluster and nodes"
  network_id     = yandex_vpc_network.todoops.id
  v4_cidr_blocks = ["10.0.2.0/24"]
  zone           = var.default_zone
}

# Subnet for Managed PostgreSQL
resource "yandex_vpc_subnet" "pg" {
  name           = "todoops-pg-subnet"
  description    = "Subnet for PostgreSQL cluster"
  network_id     = yandex_vpc_network.todoops.id
  v4_cidr_blocks = ["10.0.3.0/24"]
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

# Security group for Kubernetes: API server (443), node-to-node, egress
resource "yandex_vpc_security_group" "k8s" {
  name        = "todoops-k8s-sg"
  description = "Security group for Kubernetes cluster and nodes"
  network_id  = yandex_vpc_network.todoops.id

  ingress {
    description    = "Kubernetes API (HTTPS)"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 443
  }

  ingress {
    description    = "Node-to-node (internal)"
    protocol       = "ANY"
    v4_cidr_blocks = ["10.0.0.0/8"]
  }

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group for Managed PostgreSQL: allow 6432 from VPC (k8s, VMs)
resource "yandex_vpc_security_group" "pg" {
  name        = "todoops-pg-sg"
  description = "Allow PostgreSQL from ToDoOps VPC"
  network_id  = yandex_vpc_network.todoops.id

  ingress {
    description    = "PostgreSQL (Yandex Managed PG port)"
    protocol       = "TCP"
    v4_cidr_blocks = ["10.0.0.0/8"]
    port           = 6432
  }

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
