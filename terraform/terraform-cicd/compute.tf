data "yandex_compute_image" "vm_image" {
  family = "ubuntu-2204-lts"
}

resource "yandex_compute_instance" "sonarqube" {
  name        = "todoops-sonarqube-vm"
  description = "VM for SonarQube (lab CI static analysis)"
  zone        = var.default_zone

  platform_id = "standard-v3"

  resources {
    cores  = 2
    memory = 4
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.vm_image.id
      size     = 20
      type     = "network-hdd"
    }
  }

  network_interface {
    subnet_id = yandex_vpc_subnet.cicd.id
    nat       = true
    security_group_ids = [
      yandex_vpc_security_group.ssh_inbound.id,
      yandex_vpc_security_group.sonarqube_web.id,
      yandex_vpc_security_group.all_outbound.id,
    ]
  }

  metadata = var.ssh_public_key_path != "" ? {
    "ssh-keys" = "ubuntu:${file(var.ssh_public_key_path)}"
  } : {}
}
