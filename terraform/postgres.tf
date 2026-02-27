# Yandex Managed Service for PostgreSQL

//noinspection MissingProperty
resource "yandex_mdb_postgresql_cluster" "todoops" {
  name        = "todoops-pg"
  description = "PostgreSQL for ToDoOps app"
  environment = "PRODUCTION"
  network_id  = yandex_vpc_network.todoops.id

  config {
    version = "15"
    resources {
      resource_preset_id = "s2.micro"
      disk_size          = 10
      disk_type_id       = "network-ssd"
    }
  }

  host {
    zone             = var.default_zone
    subnet_id        = yandex_vpc_subnet.pg.id
    assign_public_ip = false
  }

  security_group_ids = [yandex_vpc_security_group.pg.id]
}

# App user first
resource "yandex_mdb_postgresql_user" "todoops" {
  cluster_id = yandex_mdb_postgresql_cluster.todoops.id
  name       = var.pg_username
  password   = var.pg_password
}

# Database owned by todoops user (full rights on schema public).
resource "yandex_mdb_postgresql_database" "todoops" {
  cluster_id = yandex_mdb_postgresql_cluster.todoops.id
  name       = var.pg_database
  owner      = var.pg_username

  depends_on = [yandex_mdb_postgresql_cluster.todoops, yandex_mdb_postgresql_user.todoops]
}
