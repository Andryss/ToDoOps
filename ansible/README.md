# Ansible – Docker on ToDoOps VM

Installs Docker on the single application VM (`todoops-app-vm` from Terraform).

## Prerequisites

- Ansible 2.9+.
- SSH access to the VM (user and key set in `vars.yml`).
- VM public IP from Terraform: `terraform output -raw todoops_app_vm_public_ip` (from the `terraform/` directory).

## Configuration

Copy the example variables and set your values:

```bash
cp vars.example.yml vars.yml
# Edit vars.yml: todoops_app_vm_ip, ansible_user, ansible_ssh_private_key_file
```

## Run

```bash
cd ansible
ansible-playbook playbook.yml -e @vars.yml
```

## Variables (vars.yml)

- **todoops_app_vm_ip** – Public IP of `todoops-app-vm` (same as Terraform output `todoops_app_vm_public_ip`)
- **ansible_user** – SSH user on the VM (typically `ubuntu`)
- **ansible_ssh_private_key_file** – Path to SSH private key

## What the playbook does

- Installs Docker from the Ubuntu repository (`docker.io`).
- Starts and enables the Docker service.
- Adds the SSH user to the `docker` group.
