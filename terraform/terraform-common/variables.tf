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
  description = "Zone for all subnets (must match sibling stacks)"
  type        = string
  default     = "ru-central1-a"
}
