# Subnet + security groups on the shared VPC from ../terraform-common.

data "terraform_remote_state" "common" {
  backend = "local"
  config = {
    path = "${path.module}/../terraform-common/terraform.tfstate"
  }
}

resource "yandex_vpc_subnet" "todoops" {
  name           = "todoops-subnet-app-vm"
  description    = "Application VM"
  network_id     = data.terraform_remote_state.common.outputs.vpc_network_id
  v4_cidr_blocks = ["10.0.1.0/24"]
  zone           = var.default_zone
}

resource "yandex_vpc_security_group" "ssh_inbound" {
  name        = "todoops-vm-ssh-inbound"
  description = "Allow SSH inbound to application VM"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  ingress {
    description    = "SSH"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 22
  }
}

resource "yandex_vpc_security_group" "http_inbound" {
  name        = "todoops-vm-http-inbound"
  description = "Allow HTTP inbound to application VM"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  ingress {
    description    = "HTTP"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 80
  }
}

resource "yandex_vpc_security_group" "all_outbound" {
  name        = "todoops-vm-egress"
  description = "Allow all outbound from application VM"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
