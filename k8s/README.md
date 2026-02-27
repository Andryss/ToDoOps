# Kubernetes – ToDoOps

Deploys the ToDoOps app (backend, frontend) to a Kubernetes cluster. PostgreSQL is provided by Yandex Managed Service; connection details go in a secret.

## Prerequisites

- `kubectl` configured for your cluster (e.g. after `terraform apply`, use `yc managed-kubernetes cluster get-credentials <cluster_id> --external`).
- Yandex Managed PostgreSQL cluster with a database and user; Docker images for backend and frontend in a registry.

## Backend with secret

The backend Deployment reads DB connection from the Secret `todoops-secrets` via `env[].valueFrom.secretKeyRef`:

- **SPRING_DATASOURCE_URL** – JDBC URL (e.g. `jdbc:postgresql://<host>:6432/<db>`)
- **SPRING_DATASOURCE_USERNAME** – DB user
- **SPRING_DATASOURCE_PASSWORD** – DB password

Create the secret first, then apply the backend so the pods get these env vars at runtime.

## Configuration

Copy the example files and set your values:

```bash
cp secret.example.yaml secret.yaml
# Edit secret.yaml: SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD
cp backend.example.yaml backend.yaml
cp frontend.example.yaml frontend.yaml
# Edit backend.yaml and frontend.yaml: replace YOUR_DOCKERHUB_USER with your image registry path (e.g. youruser/todoops-backend:latest)
```

## Run

From this directory:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
```

Or apply all at once:

```bash
kubectl apply -f .
```

## What the manifests create

- **namespace** – `todoops`
- **secret** – `todoops-secrets` (DB URL, user, password)
- **backend** – Deployment (2 replicas) + Service on port 8080
- **frontend** – Deployment + Service on port 80 (env: BACKEND_URL, API_LOCATION inlined)
- **ingress.yaml** – Commented example; uncomment and set host/ingressClassName when using an Ingress controller
