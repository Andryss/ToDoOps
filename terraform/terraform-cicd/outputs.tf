output "sonarqube_vm_public_ip" {
  description = "Public IP of the SonarQube VM (Sonar web UI on port 9000 after install)"
  value       = yandex_compute_instance.sonarqube.network_interface[0].nat_ip_address
}

output "sonarqube_vm_internal_ip" {
  description = "Private IP in todoops-cicd subnet"
  value       = yandex_compute_instance.sonarqube.network_interface[0].ip_address
}
