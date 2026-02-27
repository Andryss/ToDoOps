# Outputs after apply

output "backend_public_ip" {
  description = "Public IP address of the backend VM"
  value       = yandex_compute_instance.backend.network_interface[0].nat_ip_address
}

output "frontend_public_ip" {
  description = "Public IP address of the frontend VM"
  value       = yandex_compute_instance.frontend.network_interface[0].nat_ip_address
}

output "backend_fqdn" {
  description = "FQDN of the backend VM (if set)"
  value       = try(yandex_compute_instance.backend.fqdn, null)
}

output "frontend_fqdn" {
  description = "FQDN of the frontend VM (if set)"
  value       = try(yandex_compute_instance.frontend.fqdn, null)
}

# --- Kubernetes cluster

output "k8s_cluster_id" {
  description = "ID of the Kubernetes cluster"
  value       = yandex_kubernetes_cluster.todoops.id
}

output "k8s_cluster_ca_certificate" {
  description = "Cluster CA certificate (for kubeconfig)"
  value       = yandex_kubernetes_cluster.todoops.master[0].cluster_ca_certificate
  sensitive   = true
}

output "k8s_cluster_endpoint" {
  description = "Kubernetes API endpoint (HTTPS)"
  value       = yandex_kubernetes_cluster.todoops.master[0].external_v4_endpoint
}

# --- PostgreSQL (Yandex Managed)

output "pg_host_fqdn" {
  description = "PostgreSQL host FQDN (use in JDBC URL and k8s secret)"
  value       = yandex_mdb_postgresql_cluster.todoops.host[0].fqdn
}

output "pg_database" {
  description = "PostgreSQL database name"
  value       = var.pg_database
}

output "pg_user" {
  description = "PostgreSQL user name"
  value       = var.pg_username
}

output "pg_jdbc_url" {
  description = "JDBC URL for Spring (port 6432 for Yandex Managed PG)"
  value       = "jdbc:postgresql://${yandex_mdb_postgresql_cluster.todoops.host[0].fqdn}:6432/${var.pg_database}"
  sensitive   = true
}
