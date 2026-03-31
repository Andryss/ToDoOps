# Ansible – ToDoOps VM

Three playbooks for the single application VM (`todoops-app-vm`): install Docker + Compose v2 plugin, bring the stack up with **Docker Compose v2** (CLI plugin), or stop the stack.

Compose is driven by [`community.docker.docker_compose_v2`](https://ansible-collections.github.io/community.docker/branch/main/docker_compose_v2_module.html), which shells out to `docker compose` (not deprecated Compose v1).

## Prerequisites

- Ansible 2.14+ (or ansible-core with collections).
- Collection **community.docker**: `ansible-galaxy collection install -r requirements.yml`
- SSH access to the VM (`vars.yml`).
- VM public IP from Terraform: `terraform output -raw todoops_app_vm_public_ip`.

## Configuration

```bash
cd ansible
ansible-galaxy collection install -r requirements.yml
cp vars.example.yml vars.yml
# Edit vars.yml: IP, SSH, backend/frontend images, postgres password, etc.
```

## Playbooks

### 1. `install-docker.yml`

Installs `docker.io` and **`docker-compose-v2`** (Ubuntu Compose CLI plugin), starts Docker, adds `ansible_user` to the `docker` group.

```bash
ansible-playbook install-docker.yml -e @vars.yml
```

### 2. `compose-up.yml`

Copies `conf/docker-compose.yml` to the VM, renders `.env` from `conf/todoops.env.template.j2` (backend/frontend images and DB settings), then runs **`docker compose up`** with **`pull: always`**. Postgres is pinned in the compose file (not a variable).

```bash
ansible-playbook compose-up.yml -e @vars.yml
```

### 3. `compose-down.yml`

Runs **`docker compose down`** only: stops and removes containers (and default project network). **Named volumes are not removed** (no `-v`). Does **not** re-render `.env`; the **`.env` left by `compose-up`** must still be present.

If `docker-compose.yml` is missing, the play skips the down task.

```bash
ansible-playbook compose-down.yml -e @vars.yml
```

## Variables (`vars.yml`)

| Variable                                                                    | Purpose                                                                               |
|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `todoops_app_vm_ip`                                                         | VM public IP                                                                          |
| `ansible_user`, `ansible_ssh_private_key_file`                              | SSH                                                                                   |
| `todoops_compose_project_dir`                                               | Remote directory for `docker-compose.yml` and `.env` (default `/opt/todoops/compose`) |
| `todoops_backend_image`                                                     | Backend image (e.g. `user/todoops-backend:latest`)                                    |
| `todoops_frontend_image`                                                    | Frontend image (e.g. `user/todoops-frontend:latest`)                                  |
| `todoops_postgres_db`, `todoops_postgres_user`, `todoops_postgres_password` | Database bootstrap (in `.env`)                                                        |

`conf/docker-compose.yml` sets **Postgres** to **`postgres:15-alpine`**. Backend and frontend images use **`${BACKEND_IMAGE}`** / **`${FRONTEND_IMAGE}`** from `.env`.

## Stack layout

Services: **Postgres**, **backend** (port 8080), **frontend** (nginx, port 80). Frontend proxies `/api/v1` to the backend using the existing nginx template env vars.
