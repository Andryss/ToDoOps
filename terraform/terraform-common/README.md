# terraform-common

Creates **only** the shared **`yandex_vpc_network`**. Each sibling stack creates its own **`yandex_vpc_subnet`** attached to **`vpc_network_id`** (still **one** VPC for the whole project → **`vpc.networks.count`** = 1).

| Subnet CIDR   | Defined in        |
|---------------|-------------------|
| `10.0.1.0/24` | **`../terraform-vm/`**   |
| `10.0.2.0/24` | **`../terraform-k8s/`**  |
| `10.0.3.0/24` | **`../terraform-cicd/`** |

## Apply order

1. **`terraform init && terraform apply`** in **this directory** (creates `terraform.tfstate` that siblings read).
2. Then apply **`terraform-vm`**, **`terraform-k8s`**, and **`terraform-cicd`** in any order.

Sibling stacks use a **local** `terraform_remote_state` pointing at **`../terraform-common/terraform.tfstate`**. Keep the repo layout or set a symlink / copy state path consistently.

## Migrating from separate VPCs per stack

If you already applied the old modules (each with its own network), you must **free** the old networks before the folder can fit a single shared VPC without raising the quota:

- Option A: **`terraform destroy`** in each of **`terraform-vm`**, **`terraform-k8s`**, **`terraform-cicd`** (destroys workloads), then apply **`terraform-common`**, then re-apply the three stacks.
- Option B: Delete unused VPCs in the console and use **`terraform state rm`** on the removed `yandex_vpc_network` / `yandex_vpc_subnet` resources in each stack, then import or recreate — only if you know what you are doing.

After switching, subnet **IDs** change; expect **compute / cluster** resources to be **recreated** when you point them at the new subnets.
