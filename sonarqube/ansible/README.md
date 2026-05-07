# Ansible (SonarQube VM)

Playbooks target **`todoops-sonarqube-vm`** from **`terraform/terraform-cicd`**: install Docker and **Compose v2**, set **`vm.max_map_count`** for SonarQube, then run **`docker compose`** using **`conf/docker-compose.yml`** and a rendered **`.env`**.

Uses **`community.docker.docker_compose_v2`** (same pattern as repo root **`ansible/`**).

## Setup

```bash
cd sonarqube/ansible
ansible-galaxy collection install -r requirements.yml
cp vars.example.yml vars.yml
```

Edit **`vars.yml`**: **`sonarqube_vm_ip`** (e.g. **`terraform output -raw sonarqube_vm_public_ip`** from **`terraform/terraform-cicd`**), SSH user/key, **`sonarqube_jdbc_password`**, and optional **`sonarqube_compose_project_dir`**.

## Playbooks

| Playbook | What it does |
|----------|----------------|
| **`install-docker.yml`** | **`vm.max_map_count`**, Docker + Compose v2 on Ubuntu, enables **`docker`**, adds **`ansible_user`** to **`docker`**. |
| **`compose-up.yml`** | Copies **`conf/docker-compose.yml`** to the VM, renders **`.env`** from **`conf/sonarqube.env.j2`**, **`docker compose up`**. |
| **`compose-down.yml`** | **`docker compose down`** (named volumes kept). |

```bash
ansible-playbook install-docker.yml -e @vars.yml
ansible-playbook compose-up.yml -e @vars.yml
ansible-playbook compose-down.yml -e @vars.yml
```

UI: **`http://<sonarqube_vm_ip>:9000`** after the stack is healthy.
