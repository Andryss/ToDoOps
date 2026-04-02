output "todoops_app_vm_public_ip" {
  description = "Public IP address of todoops-app-vm"
  value       = yandex_compute_instance.app.network_interface[0].nat_ip_address
}
