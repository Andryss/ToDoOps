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

Full guide: [Creating a network load balancer using an NGINX ingress controller](https://yandex.cloud/en/docs/managed-kubernetes/operations/create-load-balancer-with-ingress-nginx) (Yandex Managed Kubernetes). The cluster service account needs **`load-balancer.admin`** (already granted in Terraform **`iam.tf`**).

### 1. NGINX Ingress Controller (Helm)

Install [Helm](https://helm.sh/) and **`kubectl`** for the cluster, then run (same commands as in the doc):

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

**External** network load balancer (default chart install):

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx
```

Wait for the controller **LoadBalancer** external IP:

```bash
kubectl --namespace default get services -o wide -w ingress-nginx-controller
```

### 2. ToDoOps `ingress.yaml`

After the controller is up and has an address, apply this repository’s Ingress resource:

```bash
kubectl apply -f ingress.yaml
```
