# terraform-k8s

Provisions **Yandex Managed Kubernetes**: a **dedicated VPC** (`todoops-k8s-network`), subnet **`10.0.2.0/24`**, cluster **`todoops-k8s`** with a fixed-size node group (2 nodes in the example config), security groups for the API and NodePorts, plus a **Yandex Load Testing** agent VM in the same subnet (egress-only security group, separate service account with `loadtesting.generatorClient`).

Folder IAM for the cluster service account is in **`iam.tf`** (`k8s.clusters.agent`, `vpc.publicAdmin`, `load-balancer.admin`, `container-registry.images.puller`, etc.).

State lives in **`terraform.tfstate`** in this directory.

## Prerequisites

Terraform ≥ 1.0, same **`cloud_id`** / **`folder_id`** / key as for other stacks in **`terraform/`** (key path usually **`../service-account-key.json`**). **`yc`** CLI helps to fetch kubeconfig after apply.

## First run

```bash
cd terraform/terraform-k8s
cp terraform.example.tfvars terraform.tfvars
# Edit terraform.tfvars
terraform init && terraform apply
```

## After apply

```bash
terraform output -raw k8s_cluster_id
yc managed-kubernetes cluster get-credentials <id> --external
```

Deploy manifests from **`../../k8s/`**. Useful outputs: **`k8s_cluster_endpoint`**, **`k8s_cluster_ca_certificate`**, **`loadtesting_agent_id`** (for the Load Testing console).

Related: **`../README.md`**, **`../terraform-vm/`** (VM is in another VPC), **`../../k8s/`**, **`../../loadtest/`** for Tank / cloud load tests.
