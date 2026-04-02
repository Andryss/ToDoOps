# Ansible (application VM)

Playbooks target **`todoops-app-vm`** from **`terraform/terraform-vm`**: install Docker and the **Compose v2** plugin, then run **`docker compose`** using **`conf/docker-compose.yml`** and a generated **`.env`** (Postgres + backend + frontend services).

The **`community.docker`** collection drives Compose via the **`docker_compose_v2`** module (`docker compose`, not legacy Compose v1).

## Setup

```bash
cd ansible
ansible-galaxy collection install -r requirements.yml
cp vars.example.yml vars.yml
```

Set **`todoops_app_vm_ip`** (e.g. **`terraform output -raw todoops_app_vm_public_ip`** from **`terraform/terraform-vm`**), SSH user/key, image tags, and DB password in **`vars.yml`**. See **`vars.example.yml`** for all variables.

## Playbooks

| Playbook | What it does |
|----------|----------------|
| **`install-docker.yml`** | Installs Docker and Compose v2 plugin on Ubuntu, enables service, adds **`ansible_user`** to **`docker`**. |
| **`compose-up.yml`** | Copies compose file to the VM, renders **`.env`** from **`conf/todoops.env.template.j2`**, runs **`docker compose up`** with image pull. |
| **`compose-down.yml`** | **`docker compose down`** (containers/network for the project; named volumes are kept). |

```bash
ansible-playbook install-docker.yml -e @vars.yml
ansible-playbook compose-up.yml -e @vars.yml
ansible-playbook compose-down.yml -e @vars.yml
```

Compose layout and pinned Postgres image: **`conf/docker-compose.yml`**.
