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
