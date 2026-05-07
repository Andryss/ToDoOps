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
  description = "Availability zone for VPC, subnet, and VM"
  type        = string
  default     = "ru-central1-a"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}
