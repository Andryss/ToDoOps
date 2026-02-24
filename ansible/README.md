# Ansible – Docker on ToDoOps VMs

Installs Docker CE on the backend and frontend VMs.

## Prerequisites

- Ansible 2.9+.
- SSH access to VMs (user and key set in vars.yml).

## Configuration

Copy the example variables and set your values:

```bash
cp vars.example.yml vars.yml
# Edit vars.yml: backend_ip, frontend_ip, ansible_user, ansible_ssh_private_key_file
```

## Run

```bash
cd ansible
ansible-playbook playbook.yml -e @vars.yml
```

## Variables (vars.yml)

- **backend_ip** – Backend VM public IP
- **frontend_ip** – Frontend VM public IP
- **ansible_user** – SSH user on the VMs
- **ansible_ssh_private_key_file** – Path to SSH private key

## What the playbook does

- Installs Docker from the Ubuntu repository (docker.io).
- Starts and enables the Docker service.
- Adds the SSH user to the docker group.

## Run on one host

```bash
ansible-playbook playbook.yml -e @vars.yml --limit backend
```
