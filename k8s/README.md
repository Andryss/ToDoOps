# Kubernetes – ToDoOps

Deploys the ToDoOps app (backend, frontend) and PostgreSQL in a Kubernetes cluster. PostgreSQL runs as a StatefulSet in the same namespace.

## Prerequisites

- `kubectl` configured for your cluster (e.g. after `terraform apply`, use `yc managed-kubernetes cluster get-credentials <cluster_id> --external`).
- Docker images for backend and frontend in a registry.

## Backend and PostgreSQL

PostgreSQL runs in-cluster as a **StatefulSet** (single replica, persistent volume). The backend connects to it via the Service `postgres:5432`.

The Secret `todoops-secrets` must contain:
- **POSTGRES_USER**, **POSTGRES_PASSWORD**, **POSTGRES_DB** — used by the Postgres container.
- **SPRING_DATASOURCE_URL** — `jdbc:postgresql://postgres:5432/<POSTGRES_DB>`
- **SPRING_DATASOURCE_USERNAME**, **SPRING_DATASOURCE_PASSWORD** — same as POSTGRES_USER / POSTGRES_PASSWORD.

Create the secret first, then apply postgres and backend so the DB is ready before the app starts.

## Configuration

Copy the example files and set your values:

```bash
cp secret.example.yaml secret.yaml
# Edit secret.yaml: set POSTGRES_PASSWORD and SPRING_DATASOURCE_PASSWORD (same value)
cp backend.example.yaml backend.yaml
cp frontend.example.yaml frontend.yaml
# Edit backend.yaml and frontend.yaml: replace YOUR_DOCKERHUB_USER with your image registry path (e.g. youruser/todoops-backend:latest)
```

## Run

From this directory:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres.yaml
# Wait for postgres pod to be Ready, then:
kubectl apply -f backend.yaml
kubectl apply -f hpa-backend.yaml
kubectl apply -f frontend.yaml
```

Or apply all at once (backend may restart until postgres is ready):

```bash
kubectl apply -f .
```

## What the manifests create

- **namespace** – `todoops`
- **secret** – `todoops-secrets` (POSTGRES_* and SPRING_DATASOURCE_* for in-cluster DB)
- **postgres** – StatefulSet (1 replica) + headless Service `postgres:5432` + PVC for data
- **backend** – Deployment (2 replicas) + Service on port 8080
- **backend-hpa** – HorizontalPodAutoscaler: scales backend on CPU > 15% (min 1, max 10 replicas); apply `hpa-backend.yaml`
- **frontend** – Deployment + Service on port 80 (env: BACKEND_URL, API_LOCATION inlined)
- **ingress** – Ingress `todoops` (ingressClassName: nginx) routing `/` to frontend. Requires the NGINX Ingress Controller to be installed first.

## Port forwarding (local access)

To access the frontend (and optionally the backend) from your machine without LoadBalancer or Ingress, use `kubectl port-forward`:

**Frontend** (browser at http://localhost:8080):

```bash
kubectl port-forward -n todoops svc/frontend 8080:80
```

**Backend API** (e.g. for debugging, on port 8081):

```bash
kubectl port-forward -n todoops svc/backend 8081:8080
```

Run each command in a separate terminal; they block while the tunnel is active. Stop with Ctrl+C.

## Ingress controller (NGINX)

To expose the app via a single external URL, do this **after** the app is running (see Run above). Follow this order.

**Yandex Cloud:** The cluster’s service account must have IAM roles `k8s.clusters.agent`, `vpc.publicAdmin`, `container-registry.images.puller`, and **`load-balancer.admin`** so the controller’s LoadBalancer can get an external IP. These are set in `terraform/iam.tf`. See [Creating a network load balancer using an NGINX ingress controller](https://yandex.cloud/en/docs/managed-kubernetes/operations/create-load-balancer-with-ingress-nginx).

### 1. Install the NGINX Ingress Controller (once per cluster)

**Option A — kubectl (no Helm):**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.2/deploy/static/provider/cloud/deploy.yaml
```

**Option B — Helm (recommended in [Yandex docs](https://yandex.cloud/ru/docs/managed-kubernetes/operations/create-load-balancer-with-ingress-nginx)):**

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
```

For an **internal** load balancer or **port forwarding** (TCP/UDP), use a custom `values.yaml` and install with `helm install ... -f values.yaml`. See [Port forwarding](https://yandex.cloud/en/docs/managed-kubernetes/operations/create-load-balancer-with-ingress-nginx#port-forwarding) and [Internal network load balancer](https://yandex.cloud/en/docs/managed-kubernetes/operations/create-load-balancer-with-ingress-nginx#internal).

### 2. Wait for the LoadBalancer to get an external IP

```bash
kubectl get svc -n ingress-nginx -w
```

If EXTERNAL-IP stays `<pending>`, check that the cluster service account has the `load-balancer.admin` role (Terraform: `terraform/iam.tf`).

### 3. Apply the ToDoOps Ingress

```bash
kubectl apply -f ingress.yaml
```

### 4. Use the app

Open `http://<EXTERNAL-IP>` in a browser. To use a hostname, set `spec.rules[].host` in `ingress.yaml` and point DNS to the same IP.
