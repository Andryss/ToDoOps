# terraform-vm

Provisions **security groups** and **`todoops-app-vm`** (Ubuntu 22.04) on shared subnet **`10.0.1.0/24`** from **`../terraform-common/`** (VPC and subnet are **not** defined here).

State lives in **`terraform.tfstate`** in this directory.

## Prerequisites

1. Apply **`../terraform-common/`** first so **`../terraform-common/terraform.tfstate`** exists (used via **`terraform_remote_state`**).
2. Terraform ≥ 1.0, **`service_account_key_file`**, **`cloud_id`**, **`folder_id`** in **`terraform.tfvars`**. SSH: **`ssh_public_key_path`** (e.g. `~/.ssh/id_ed25519.pub`).

## First run

```bash
cd terraform/terraform-vm
cp terraform.example.tfvars terraform.tfvars
# Edit terraform.tfvars
terraform init && terraform apply
```

## Outputs

- **`todoops_app_vm_public_ip`** — SSH, Ansible, HTTP.

Related: **`../README.md`**, **`../terraform-common/`**, **`../terraform-k8s/`**, **`../../ansible/`**.
