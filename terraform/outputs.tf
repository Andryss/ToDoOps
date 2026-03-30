# Outputs after apply

output "todoops_app_vm_public_ip" {
  description = "Public IP address of todoops-app-vm (frontend + backend)"
  value       = yandex_compute_instance.app.network_interface[0].nat_ip_address
}

output "todoops_app_vm_fqdn" {
  description = "FQDN of todoops-app-vm (if set)"
  value       = try(yandex_compute_instance.app.fqdn, null)
}
