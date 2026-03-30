# Terraform – ToDoOps VM in Yandex Cloud

Creates one application VM (frontend and backend on the same host), network, and security groups in Yandex Cloud.

## Prerequisites

- Terraform 1.0+.
- Yandex Cloud account: cloud ID, folder ID, and a service account key file (JSON). How to create the key: [Yandex Cloud – authorized keys](https://yandex.cloud/ru/docs/iam/operations/authentication/manage-authorized-keys#create-authorized-key).

## Configuration

Copy the example variables and set your values:

```bash
cp terraform.example.tfvars terraform.tfvars
# Edit terraform.tfvars: cloud_id, folder_id, service_account_key_file, default_zone, ssh_public_key_path
```

## Run

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## Variables (terraform.tfvars)

- **cloud_id** – Yandex Cloud ID
- **folder_id** – Yandex Cloud folder ID
- **service_account_key_file** – Path to service account key JSON (see `service-account-key.example.json`; [create a key in the console](https://yandex.cloud/ru/docs/iam/operations/authentication/manage-authorized-keys#create-authorized-key))
- **default_zone** – Availability zone (default: ru-central1-a)
- **ssh_public_key_path** – Path to SSH public key for VM access

## What Terraform creates

- **Network** – VPC and subnet (10.0.1.0/24).
- **Security groups** – ssh_inbound (SSH), all_outbound (egress).
- **Application VM** (`todoops-app-vm`) – Ubuntu, 2 cores, 4 GB RAM, public IP (hosts both frontend and backend).

## Outputs

After apply, use outputs for Ansible or SSH:

```bash
terraform output todoops_app_vm_public_ip
terraform output todoops_app_vm_fqdn
```
