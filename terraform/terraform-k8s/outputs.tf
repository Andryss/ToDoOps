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
