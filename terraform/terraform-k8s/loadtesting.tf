# Yandex Cloud Load Testing agent in the Kubernetes subnet.
# https://yandex.cloud/docs/load-testing/tf-ref

resource "yandex_loadtesting_agent" "todoops" {
  name        = "todoops-loadtest-agent"
  description = "Load Testing agent for ToDoOps k8s stack (${var.default_zone})"
  folder_id   = var.folder_id

  compute_instance {
    service_account_id = yandex_iam_service_account.loadtesting.id
    platform_id        = "standard-v3"

    resources {
      cores  = 2
      memory = 2
    }

    boot_disk {
      initialize_params {
        size = 15
        type = "network-hdd"
      }
    }

    network_interface {
      subnet_id          = yandex_vpc_subnet.k8s.id
      nat                = true
      security_group_ids = [yandex_vpc_security_group.loadtesting_agent.id]
    }
  }

  log_settings {

  }
}
