# Outputs after apply

output "todoops_app_vm_public_ip" {
  description = "Public IP address of todoops-app-vm (frontend + backend)"
  value       = yandex_compute_instance.app.network_interface[0].nat_ip_address
}

output "todoops_app_vm_fqdn" {
  description = "FQDN of todoops-app-vm (if set)"
  value       = try(yandex_compute_instance.app.fqdn, null)
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
