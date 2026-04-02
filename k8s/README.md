# Kubernetes

Manifests deploy **PostgreSQL** (StatefulSet), **backend**, **frontend**, **HPA** on the backend (CPU target used for autoscaling), optional **Ingress**, in namespace **`todoops`**.

## Cluster access

After **`terraform/terraform-k8s`** has been applied:

```bash
cd terraform/terraform-k8s
terraform output -raw k8s_cluster_id
yc managed-kubernetes cluster get-credentials <cluster_id> --external
```

You need **container images** for backend and frontend in a registry the cluster can pull from.

## Configure and apply

```bash
cp secret.example.yaml secret.yaml
cp backend.example.yaml backend.yaml
cp frontend.example.yaml frontend.yaml
```

**`secret.yaml`** must define Postgres credentials and matching **`SPRING_DATASOURCE_*`** for the backend. **`backend.yaml`** / **`frontend.yaml`** need your image references instead of placeholders.

```bash
kubectl apply -f namespace.yaml -f secret.yaml -f postgres.yaml
# Wait until the postgres pod is Ready, then:
kubectl apply -f backend.yaml -f hpa-backend.yaml -f frontend.yaml
```

Applying everything at once is possible; the backend may restart until Postgres is up.

## Ingress and local access

- **Ingress (`ingress.yaml`):** requires an **NGINX Ingress Controller** in the cluster and a LoadBalancer-capable setup; see [Yandex: Ingress + NLB](https://yandex.cloud/en/docs/managed-kubernetes/operations/create-load-balancer-with-ingress-nginx). IAM for the cluster SA is already set in Terraform **`iam.tf`** for LB use.
- **Without Ingress:** **`kubectl port-forward -n todoops svc/frontend 8080:80`** (UI) and **`svc/backend 8081:8080`** (API).

Load tests from the repo: **`../loadtest/`**.
