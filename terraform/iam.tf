# Service account and IAM roles for Yandex Managed Kubernetes.
# The cluster and nodes use this SA to manage resources and pull images.

resource "yandex_iam_service_account" "k8s" {
  name        = "todoops-k8s-sa"
  description = "Service account for Kubernetes cluster and node group"
}

# Cluster needs this role to manage the control plane and nodes.
resource "yandex_resourcemanager_folder_iam_member" "k8s_clusters_agent" {
  folder_id = var.folder_id
  role      = "k8s.clusters.agent"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}

# For public cluster master and LoadBalancer services.
resource "yandex_resourcemanager_folder_iam_member" "k8s_vpc_public_admin" {
  folder_id = var.folder_id
  role      = "vpc.publicAdmin"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}
