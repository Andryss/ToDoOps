# VM image and compute instances (backend + frontend)

data "yandex_compute_image" "vm_image" {
  family = "ubuntu-2204-lts"
}

resource "yandex_compute_instance" "backend" {
  name        = "todoops-backend"
  description = "ToDoOps backend application VM"
  zone        = var.default_zone

  platform_id = "standard-v3"

  resources {
    cores  = 2
    memory = 2
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.vm_image.id
      size     = 20
      type     = "network-hdd"
    }
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.todoops.id
    nat                = true
    security_group_ids = [yandex_vpc_security_group.ssh_inbound.id, yandex_vpc_security_group.all_outbound.id]
  }

  metadata = var.ssh_public_key_path != "" ? {
    "ssh-keys" = "ubuntu:${file(var.ssh_public_key_path)}"
  } : {}
}

resource "yandex_compute_instance" "frontend" {
  name        = "todoops-frontend"
  description = "ToDoOps frontend application VM"
  zone        = var.default_zone

  platform_id = "standard-v3"

  resources {
    cores  = 2
    memory = 2
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.vm_image.id
      size     = 20
      type     = "network-hdd"
    }
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.todoops.id
    nat                = true
    security_group_ids = [yandex_vpc_security_group.ssh_inbound.id, yandex_vpc_security_group.all_outbound.id]
  }

  metadata = var.ssh_public_key_path != "" ? {
    "ssh-keys" = "ubuntu:${file(var.ssh_public_key_path)}"
  } : {}
}
