# VM image and single compute instance (frontend + backend on one host)

data "yandex_compute_image" "vm_image" {
  family = "ubuntu-2204-lts"
}

resource "yandex_compute_instance" "app" {
  name        = "todoops-app-vm"
  description = "ToDoOps application VM (frontend and backend)"
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
    subnet_id = yandex_vpc_subnet.todoops.id
    nat       = true
    security_group_ids = [
      yandex_vpc_security_group.ssh_inbound.id,
      yandex_vpc_security_group.http_inbound.id,
      yandex_vpc_security_group.all_outbound.id,
    ]
  }

  metadata = var.ssh_public_key_path != "" ? {
    "ssh-keys" = "ubuntu:${file(var.ssh_public_key_path)}"
  } : {}
}
