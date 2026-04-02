# Input variables (Managed Kubernetes stack)

variable "service_account_key_file" {
  description = "Path to Yandex Cloud service account key JSON (see ../service-account-key.example.json)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloud_id" {
  description = "Yandex Cloud ID"
  type        = string
}

variable "folder_id" {
  description = "Yandex Cloud folder ID"
  type        = string
}

variable "default_zone" {
  description = "Default availability zone for cluster, subnet, and Load Testing agent"
  type        = string
  default     = "ru-central1-a"
}
