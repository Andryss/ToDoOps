# terraform-k8s

Provisions **Yandex Managed Kubernetes** on the **shared** VPC from **`../terraform-common/`**: subnet **`10.0.2.0/24`**, cluster **`todoops-k8s`**, node group (**2 nodes, 4 vCPU / 8 GiB RAM each**), security groups, plus a **Yandex Load Testing** agent in the same subnet.

Folder IAM for the cluster service account is in **`iam.tf`**.

State lives in **`terraform.tfstate`** in this directory.

## Prerequisites

1. Apply **`../terraform-common/`** first.
2. Terraform ≥ 1.0, same **`cloud_id`** / **`folder_id`** / key as siblings. **`yc`** for kubeconfig.

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

### `Permission denied` when creating the cluster

The cluster service account must have **`k8s.clusters.agent`**, **`vpc.publicAdmin`**, **`load-balancer.admin`**, and **`container-registry.images.puller`** on the folder **before** the CreateCluster API runs. **`kubernetes.tf`** uses **`depends_on`** on those IAM bindings so Terraform does not start the cluster in parallel (a common cause of transient **Permission denied**).

The identity in your Terraform provider key also needs permission to manage Kubernetes (for example **`managed-kubernetes.editor`** or **`editor`** on the folder). If it still fails, wait a minute and **`terraform apply`** again (IAM propagation).

Related: **`../README.md`**, **`../terraform-common/`**, **`../terraform-vm/`** (other subnet in same VPC), **`../../k8s/`**, **`../../loadtest/`**.
