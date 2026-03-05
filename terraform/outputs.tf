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
