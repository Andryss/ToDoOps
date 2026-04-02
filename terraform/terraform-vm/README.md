# terraform-vm

Provisions the **application VM** and a small **VPC**: network **`todoops-network`**, subnet **`10.0.1.0/24`**, security groups for SSH, HTTP, and general egress, and one **`yandex_compute_instance`** (`todoops-app-vm`) with Ubuntu 22.04.

State lives in **`terraform.tfstate`** in this directory.

## Prerequisites

Terraform ≥ 1.0, Yandex provider configured via **`service_account_key_file`** in **`terraform.tfvars`**, plus **`cloud_id`** and **`folder_id`**. SSH access uses **`ssh_public_key_path`** (default in examples: `~/.ssh/id_ed25519.pub`).

## First run

```bash
cd terraform/terraform-vm
cp terraform.example.tfvars terraform.tfvars
# Edit terraform.tfvars (and sync shared fields with ../terraform.tfvars if you use it)
terraform init && terraform apply
```

## Outputs

- **`todoops_app_vm_public_ip`** — use for SSH, Ansible inventory, or public HTTP to the VM.
- **`vpc_network_id`** — this stack’s VPC only (not used by **`terraform-k8s`**, which has its own network).

Related: **`../README.md`**, **`../terraform-k8s/`** for the cluster stack, **`../../ansible/`** to install Docker and run Compose on the VM.
