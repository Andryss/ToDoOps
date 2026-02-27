# Terraform – ToDoOps VM in Yandex Cloud

Creates application VM, network, security groups, and optionally a **Kubernetes cluster** (Yandex Managed Service for Kubernetes) in Yandex Cloud.

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
- **pg_database** – PostgreSQL database name (default: todoops)
- **pg_username** – PostgreSQL app user name (default: todoops)
- **pg_password** – Password for the PostgreSQL app user

## What Terraform creates

- **Network** – VPC, subnet for VM (10.0.1.0/24), subnet for Kubernetes (10.0.2.0/24).
- **Security groups** – ssh_inbound (TCP 22), http_inbound (TCP 80), all_outbound (egress), k8s (API 443, node-to-node, egress).
- **Application VM** (`todoops-app-vm`) – Ubuntu, 2 cores, 4 GB RAM, public IP (hosts both frontend and backend).
- **Kubernetes** – Managed cluster + node group (service account, IAM roles, zonal master, public API).
- **PostgreSQL** – Yandex Managed PG cluster (one host, database `todoops`, user `todoops`, subnet 10.0.3.0/24, port 6432).

## Outputs

After apply, use outputs for Ansible or SSH:

```bash
terraform output todoops_app_vm_public_ip
terraform output todoops_app_vm_fqdn
```

For Kubernetes, get kubeconfig with Yandex CLI (install `yc` and run `yc init`):

```bash
terraform output -raw k8s_cluster_id   # use this as <cluster_id>
yc managed-kubernetes cluster get-credentials <cluster_id> --external
kubectl get nodes
```

For the app use PostgreSQL outputs:

```bash
terraform output pg_jdbc_url
terraform output pg_host_fqdn
# User and database from tfvars (pg_username, pg_database); password from pg_password
```
