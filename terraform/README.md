# Terraform

Infrastructure for ToDoOps on **Yandex Cloud** uses **one shared VPC** (quota-friendly) plus **separate state** per stack.

| Directory | What it creates |
|-----------|-----------------|
| **`terraform-common/`** | **Single** `yandex_vpc_network` only. **Apply this first.** |
| **`terraform-vm/`** | Subnet **`10.0.1.0/24`**, security groups, **`todoops-app-vm`**. Reads common state for **`vpc_network_id`**. |
| **`terraform-k8s/`** | Subnet **`10.0.2.0/24`**, Managed Kubernetes, SGs, load testing agent. Reads common state. |
| **`terraform-cicd/`** | Subnet **`10.0.3.0/24`**, security groups, **`todoops-sonarqube-vm`**. Reads common state. |

Sibling stacks use **`terraform_remote_state`** with **local** backend path **`${path.module}/../terraform-common/terraform.tfstate`**. Keep **`terraform/`** layout as in the repo, or adjust paths consistently.

## Auth and variables

Place a real service account key JSON as **`service-account-key.json`** next to this file. Shape: **`service-account-key.example.json`**. [Create an authorized key](https://yandex.cloud/ru/docs/iam/operations/authentication/manage-authorized-keys#create-authorized-key).

**`terraform.tfvars`** in **`terraform-common/`**, **`terraform-vm/`**, **`terraform-k8s/`**, and **`terraform-cicd/`** (gitignored). Keep **`cloud_id`**, **`folder_id`**, and **`default_zone`** aligned. Key path is often **`../service-account-key.json`** inside each stack. Templates: **`terraform.example.tfvars`** here and in each subdirectory.

## Commands (order)

```bash
cd terraform/terraform-common
cp terraform.example.tfvars terraform.tfvars
terraform init && terraform apply

cd ../terraform-vm    # and/or terraform-k8s, terraform-cicd
terraform init && terraform apply
```

Run **`terraform init`** in each directory the first time (each stack has its own **`.terraform.lock.hcl`**).

## Quota / migration

If you **already** created three separate VPCs with older versions of these modules, you may hit **`vpc.networks.count`** until you **destroy** those old networks (e.g. **`terraform destroy`** on each old stack, or delete VPCs in the console). Then apply **`terraform-common`** once, then re-apply the other stacks. Subnet IDs will change; **VMs and clusters may be recreated**.

More detail: **`terraform-common/README.md`**, **`terraform-vm/README.md`**, **`terraform-k8s/README.md`**, **`terraform-cicd/README.md`**.
