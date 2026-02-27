# Yandex Managed Service for Kubernetes: cluster and node group.

resource "yandex_kubernetes_cluster" "todoops" {
  name        = "todoops-k8s"
  description = "Kubernetes cluster for ToDoOps"
  network_id  = yandex_vpc_network.todoops.id

  master {
    zonal {
      zone      = var.default_zone
      subnet_id = yandex_vpc_subnet.k8s.id
    }
    public_ip          = true
    security_group_ids = [yandex_vpc_security_group.k8s.id]
  }

  service_account_id      = yandex_iam_service_account.k8s.id
  node_service_account_id = yandex_iam_service_account.k8s.id

  release_channel         = "REGULAR"
  network_policy_provider = "CALICO"
}

resource "yandex_kubernetes_node_group" "todoops" {
  cluster_id  = yandex_kubernetes_cluster.todoops.id
  name        = "todoops-node-group"
  description = "Node group for ToDoOps workloads"
  version     = null # use cluster default

  instance_template {
    platform_id = "standard-v3"

    resources {
      cores  = 2
      memory = 2
    }

    boot_disk {
      type = "network-hdd"
      size = 30
    }

    network_interface {
      subnet_ids         = [yandex_vpc_subnet.k8s.id]
      nat                = true
      security_group_ids = [yandex_vpc_security_group.k8s.id]
    }
  }

  scale_policy {
    fixed_scale {
      size = 2
    }
  }

  allocation_policy {
    location {
      zone = var.default_zone
    }
  }
}
