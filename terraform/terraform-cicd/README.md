# terraform-cicd

Provisions a **dedicated VPC** (`10.0.3.0/24`), security groups (SSH, **TCP 9000** for SonarQube UI), and **`todoops-sonarqube-vm`** (Ubuntu 22.04, 4 vCPU / 8 GiB RAM, 50 GiB disk) on **Yandex Cloud**.

## Yandex Cloud and SonarQube

Yandex Cloud does **not** provide a managed SonarQube product (unlike a DB-as-a-service). SonarQube is run as **self-managed** software, typically on **Compute VM** (this module) or **inside Kubernetes**. Installation and SonarQube configuration live under **`../../sonarqube/`**.

State: **`terraform.tfstate`** in this directory (separate from **`terraform-vm/`** and **`terraform-k8s/`**).

## Prerequisites

Same auth as **`../README.md`**: copy **`terraform.example.tfvars`** → **`terraform.tfvars`**, service account key path **`../service-account-key.json`**.

## Apply

```bash
cd terraform/terraform-cicd
terraform init && terraform apply
```

## After apply

```bash
terraform output -raw sonarqube_vm_public_ip
ssh ubuntu@<public-ip>
```

Then install SonarQube on the VM using **`../../sonarqube/`** (Compose file: **`../../sonarqube/ansible/conf/docker-compose.yml`**; **`../../sonarqube/ansible/`** playbooks are recommended). Web UI: **`http://<public-ip>:9000`** once SonarQube is running.

## Destroy

Stop SonarQube and remove data volumes if you no longer need analysis history, then **`terraform destroy`**.
