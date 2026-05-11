# Argo CD Applications (ToDoOps)

Child **`Application`** manifests synced by the root app-of-apps **`../application.yaml`** (**`todoops-gitops`**) via **`directory.include: "*.yaml"`** ( **`README.md`** is ignored). Alternatively apply these files one by one.

| Manifest | Application | Deploys |
|----------|-------------|---------|
| **`postgres.yaml`** | **`todoops-postgres`** | **`k8s/postgres.yaml`** |
| **`backend.yaml`** | **`todoops-backend`** | **`k8s/backend.yaml`** + **`hpa-backend.yaml`** ([`spec.sources`](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple-sources/), Argo CD **≥ 2.6**) |
| **`frontend.yaml`** | **`todoops-frontend`** | **`k8s/frontend.yaml`** |
| **`monitoring.yaml`** | **`todoops-monitoring`** | Helm **kube-prometheus-stack** + **`k8s/monitoring-values.yaml`** (Argo CD **≥ 2.6**) |
| **`monitoring-extension.yaml`** | **`todoops-monitoring-extension`** | **`servicemonitor-backend.yaml`** + Kustomize **`k8s/grafana-dashboard/`** (Argo CD **≥ 2.6**) |
| **`ingress.yaml`** | **`todoops-ingress`** | Helm **ingress-nginx** + **`k8s/ingress.yaml`** (Argo CD **≥ 2.6**) |

Apply **`../repository.yaml`** first (see **`../README.md`**). From the **`argocd/`** directory:

```bash
kubectl apply -f applications/postgres.yaml
kubectl apply -f applications/backend.yaml -f applications/frontend.yaml
kubectl apply -f applications/monitoring.yaml
kubectl apply -f applications/monitoring-extension.yaml
kubectl apply -f applications/ingress.yaml
```

**`todoops-secrets`** must exist in **`todoops`** before Postgres/backend/Grafana admin work (see **`../README.md`** § Secrets). Apply **`monitoring-extension.yaml`** after **`todoops-monitoring`** (sync waves **`2`** vs **`1`**). **`ingress.yaml`** needs the **frontend** Service (wave **`3`**).

Bootstrap all children: **`kubectl apply -f ../application.yaml`** (from **`argocd/`**). See **`../README.md`** § App of apps.
