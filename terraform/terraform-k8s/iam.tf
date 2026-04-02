# Service accounts and folder IAM roles for Managed Kubernetes and Load Testing.

resource "yandex_iam_service_account" "k8s" {
  name        = "todoops-k8s-sa"
  description = "Service account for Kubernetes cluster and node group"
}

resource "yandex_resourcemanager_folder_iam_member" "k8s_clusters_agent" {
  folder_id = var.folder_id
  role      = "k8s.clusters.agent"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}

resource "yandex_resourcemanager_folder_iam_member" "k8s_vpc_public_admin" {
  folder_id = var.folder_id
  role      = "vpc.publicAdmin"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}

resource "yandex_resourcemanager_folder_iam_member" "k8s_load_balancer_admin" {
  folder_id = var.folder_id
  role      = "load-balancer.admin"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}

resource "yandex_resourcemanager_folder_iam_member" "k8s_registry_puller" {
  folder_id = var.folder_id
  role      = "container-registry.images.puller"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}

# --- Load Testing agent (https://yandex.cloud/docs/load-testing/tf-ref)

resource "yandex_iam_service_account" "loadtesting" {
  name        = "todoops-loadtesting-sa"
  description = "Service account for Load Testing agent"
}

resource "yandex_resourcemanager_folder_iam_member" "loadtesting_generator_client" {
  folder_id = var.folder_id
  role      = "loadtesting.generatorClient"
  member    = "serviceAccount:${yandex_iam_service_account.loadtesting.id}"
}
