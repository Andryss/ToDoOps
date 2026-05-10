data "terraform_remote_state" "common" {
  backend = "local"
  config = {
    path = "${path.module}/../terraform-common/terraform.tfstate"
  }
}

resource "yandex_vpc_subnet" "cicd" {
  name           = "todoops-subnet-cicd"
  description    = "SonarQube / CI VM"
  network_id     = data.terraform_remote_state.common.outputs.vpc_network_id
  v4_cidr_blocks = ["10.0.3.0/24"]
  zone           = var.default_zone
}

resource "yandex_vpc_security_group" "ssh_inbound" {
  name        = "todoops-cicd-ssh"
  description = "SSH to SonarQube VM"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  ingress {
    description    = "SSH"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 22
  }
}

resource "yandex_vpc_security_group" "sonarqube_web" {
  name        = "todoops-cicd-sonarqube-web"
  description = "SonarQube HTTP UI (default container port 9000)"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  ingress {
    description    = "SonarQube web"
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"]
    port           = 9000
  }
}

resource "yandex_vpc_security_group" "all_outbound" {
  name        = "todoops-cicd-egress"
  description = "Allow outbound from SonarQube VM"
  network_id  = data.terraform_remote_state.common.outputs.vpc_network_id

  egress {
    description    = "Allow all outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
