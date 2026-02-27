# Input variables

variable "service_account_key_file" {
  description = "Path to Yandex Cloud service account key JSON file (see service-account-key.example.json)"
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
  description = "Default availability zone for resources"
  type        = string
  default     = "ru-central1-a"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "pg_database" {
  description = "PostgreSQL database name (Yandex Managed PG)"
  type        = string
  default     = "todoops"
}

variable "pg_username" {
  description = "PostgreSQL user name (Yandex Managed PG)"
  type        = string
  default     = "todoops"
}

variable "pg_password" {
  description = "Password for the PostgreSQL user (Managed PG cluster)"
  type        = string
  sensitive   = true
}

