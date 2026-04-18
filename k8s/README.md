# Kubernetes

Manifests deploy **PostgreSQL** (StatefulSet), **backend**, **frontend**, **HPA** on the backend, **monitoring** via **[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)** (Prometheus Operator, Prometheus, Grafana, Alertmanager, kube-state-metrics, node-exporter, default rules/dashboards), optional **Ingress**, and the **NGINX Ingress Controller** — app and monitoring run in namespace **`todoops`**.

The stack is the standard **prometheus-community** chart described on [Artifact Hub](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack); it installs cluster-wide **CRDs** (for example `ServiceMonitor`) on first install.

## Cluster access

After **`terraform/terraform-k8s`** has been applied:

```bash
cd terraform/terraform-k8s
terraform output -raw k8s_cluster_id
yc managed-kubernetes cluster get-credentials <cluster_id> --external
```

You need **container images** for backend and frontend in a registry the cluster can pull from. The cluster service account needs **`load-balancer.admin`** for Grafana and Ingress external IPs (see Terraform **`iam.tf`**).

## Configure and apply

```bash
cp secret.example.yaml secret.yaml
cp backend.example.yaml backend.yaml
cp frontend.example.yaml frontend.yaml
```

**`secret.yaml`** must define Postgres credentials, matching **`SPRING_DATASOURCE_*`** for the backend, and **`GRAFANA_ADMIN_USER`** / **`GRAFANA_ADMIN_PASSWORD`** for Grafana (used by the chart via **`monitoring-values.yaml`**). **`backend.yaml`** / **`frontend.yaml`** need your image references instead of placeholders.

### 1. Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Application stack and monitoring (Helm)

```bash
kubectl apply -f secret.yaml -f postgres.yaml
# Wait until the postgres pod is Ready, then:
kubectl apply -f backend.yaml -f hpa-backend.yaml -f frontend.yaml
```

Applying Postgres and backend together is possible; the backend may restart until Postgres is ready.

Add the Helm repo and install **kube-prometheus-stack** into **`todoops`** (release name **`monitoring`**, values in this directory):

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace todoops \
  -f monitoring-values.yaml
```

Register scraping for the ToDoOps backend (**`/actuator/prometheus`**) with a **ServiceMonitor** (after CRDs from the chart are available):

```bash
kubectl apply -f servicemonitor-backend.yaml
kubectl apply -k grafana-dashboard/
```

If you change the Helm release name from **`monitoring`**, edit the **`release`** label in **`servicemonitor-backend.yaml`** to the same name so Prometheus picks up this `ServiceMonitor`.

**Grafana** is exposed as a **LoadBalancer** by **`monitoring-values.yaml`**. List its Service (name is usually **`monitoring-grafana`**, matching the Helm release name) and wait for **EXTERNAL-IP**:

```bash
kubectl get svc -n todoops -l app.kubernetes.io/name=grafana -o wide -w
```

Open **`http://<GRAFANA_EXTERNAL_IP>`** and sign in with **`GRAFANA_ADMIN_USER`** / **`GRAFANA_ADMIN_PASSWORD`** from **`secret.yaml`**. The chart wires Grafana to the in-cluster Prometheus datasource and ships Kubernetes dashboards; the **`grafana-dashboard/`** apply adds **ToDoOps Backend — HTTP (RPS, errors, latency)**.

**Prometheus** in this chart is typically **ClusterIP** (for example **`monitoring-kube-prometheus-stack-prometheus`**); use Grafana or port-forward for the Prometheus UI.

### 3. Ingress (NGINX controller + ToDoOps UI)

Install [Helm](https://helm.sh/) and **`kubectl`** for the cluster. Add the chart repository:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

Install the **NGINX Ingress Controller** into **`todoops`** with an external **LoadBalancer** and scope limited to that namespace (same namespace as this Ingress):

```bash
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace todoops \
  --set controller.service.type=LoadBalancer \
  --set controller.scope.enabled=true \
  --set controller.scope.namespace=todoops
```

Wait until **`ingress-nginx-controller`** has an **EXTERNAL-IP**:

```bash
kubectl get svc -n todoops ingress-nginx-controller -o wide -w
```

Press Ctrl+C when the address appears. Check controller pods:

```bash
kubectl get pods -n todoops -l app.kubernetes.io/name=ingress-nginx
```

Apply the ToDoOps **Ingress** (routes **`/`** to the frontend; frontend proxies **`/api/v1`** to the backend):

```bash
kubectl apply -f ingress.yaml
```

Open **`http://<INGRESS_CONTROLLER_EXTERNAL_IP>`** for the web app. You can set **`rules[].host`** in **`ingress.yaml`** when DNS is available.

## Remove everything in `todoops`

Uninstall Helm releases in this namespace first (otherwise release metadata can linger), then delete the namespace:

```bash
helm uninstall ingress-nginx -n todoops 2>/dev/null || true
helm uninstall monitoring -n todoops 2>/dev/null || true
kubectl delete namespace todoops
```

`kubectl delete namespace todoops` removes workloads, Services (including **`backend`** with **`app: backend`**), Secrets, and other namespaced objects. Cluster-wide **CRDs** installed by **kube-prometheus-stack** (for example **ServiceMonitor**) are not removed.
