# Subnet + security groups on the shared VPC from ../terraform-common.

data "terraform_remote_state" "common" {
  backend = "local"
  config = {
    path = "${path.module}/../terraform-common/terraform.tfstate"
  }
}

resource "yandex_vpc_subnet" "k8s" {
  name           = "todoops-subnet-k8s"
  description    = "Managed Kubernetes + load testing agent"
  network_id     = data.terraform_remote_state.common.outputs.vpc_network_id
  v4_cidr_blocks = ["10.0.2.0/24"]
  zone           = var.default_zone
}

resource "yandex_vpc_security_group" "k8s" {
  name        = "todoops-k8s-sg"
  description = "Security group for Kubernetes cluster and nodes"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

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

resource "yandex_vpc_security_group" "loadtesting_agent" {
  name        = "todoops-loadtesting-sg"
  description = "Load Testing agent VM: outbound only"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
