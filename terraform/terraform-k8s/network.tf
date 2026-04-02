# VPC, Kubernetes subnet, and security groups (independent from terraform-vm).

resource "yandex_vpc_network" "k8s" {
  name        = "todoops-k8s-network"
  description = "Network for Managed Kubernetes and Load Testing agent"
}

resource "yandex_vpc_subnet" "k8s" {
  name           = "todoops-k8s-subnet"
  description    = "Subnet for Kubernetes cluster and nodes"
  network_id     = yandex_vpc_network.k8s.id
  v4_cidr_blocks = ["10.0.2.0/24"]
  zone           = var.default_zone
}

resource "yandex_vpc_security_group" "k8s" {
  name        = "todoops-k8s-sg"
  description = "Security group for Kubernetes cluster and nodes"
  network_id  = yandex_vpc_network.k8s.id

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

# Egress-only SG for Load Testing agent (no duplicate rules on todoops-k8s-sg).
resource "yandex_vpc_security_group" "loadtesting_agent" {
  name        = "todoops-loadtesting-sg"
  description = "Load Testing agent VM: outbound only"
  network_id  = yandex_vpc_network.k8s.id

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
