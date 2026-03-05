# VPC and subnet for the ToDoOps application VM

resource "yandex_vpc_network" "todoops" {
  name        = "todoops-network"
  description = "Network for ToDoOps application VM"
}

resource "yandex_vpc_subnet" "todoops" {
  name           = "todoops-subnet"
  description    = "Subnet for ToDoOps application VM"
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

# Security group: inbound HTTP on default port 80
resource "yandex_vpc_security_group" "http_inbound" {
  name        = "http_inbound"
  description = "Allow HTTP inbound to VM"
  network_id  = yandex_vpc_network.todoops.id

  ingress {
    description    = "HTTP"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 80
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

# Security group for Kubernetes: API, Ingress (80, 443, 10254), NodePort range, node-to-node, egress
resource "yandex_vpc_security_group" "k8s" {
  name        = "todoops-k8s-sg"
  description = "Security group for Kubernetes cluster and nodes"
  network_id  = yandex_vpc_network.todoops.id

  ingress {
    description    = "HTTP traffic"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 80
  }

  ingress {
    description    = "HTTPS traffic"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 443
  }

  ingress {
    description    = "NGINX Ingress controller health checks"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 10256
  }

  ingress {
    description    = "NodePort traffic"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    from_port      = 30000
    to_port        = 32767
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
