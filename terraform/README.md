# Terraform

Infrastructure for ToDoOps on **Yandex Cloud** is split into **root modules** with **separate state** and **separate VPCs** (no shared network between stacks unless you add peering yourself).

| Directory | What it creates |
|-----------|-----------------|
| **`terraform-vm/`** | VPC, subnet `10.0.1.0/24`, security groups, **`todoops-app-vm`** (SSH + HTTP). |
| **`terraform-k8s/`** | Its own VPC, subnet `10.0.2.0/24`, Managed Kubernetes cluster + nodes, security groups, **Yandex Load Testing** agent + service account. |
| **`terraform-cicd/`** | VPC, subnet `10.0.3.0/24`, security groups (SSH + SonarQube **9000**), **`todoops-sonarqube-vm`** for self-hosted SonarQube (see **`../sonarqube/`**). |

You can apply stacks independently; they do not read each other’s state.

## Auth and variables

Place a real service account key JSON as **`service-account-key.json`** next to this file. Shape: **`service-account-key.example.json`**. [Create an authorized key](https://yandex.cloud/ru/docs/iam/operations/authentication/manage-authorized-keys#create-authorized-key).

**`terraform.tfvars`** exists in **`terraform/`**, **`terraform-vm/`**, **`terraform-k8s/`**, and **`terraform-cicd/`** (all gitignored). Keep **`cloud_id`**, **`folder_id`**, and **`default_zone`** aligned across them. Key path: **`service-account-key.json`** in the parent `terraform/` folder vs **`../service-account-key.json`** inside each stack. Committed templates: **`terraform.example.tfvars`** (here) and **`terraform.example.tfvars`** in each subdirectory.

## Commands

```bash
cd terraform/terraform-vm    # or terraform/terraform-k8s / terraform/terraform-cicd
terraform init && terraform apply
```

Run **`terraform init`** in each directory the first time (each stack has its own **`.terraform.lock.hcl`**).

More detail: **`terraform-vm/README.md`**, **`terraform-k8s/README.md`**, **`terraform-cicd/README.md`**.
