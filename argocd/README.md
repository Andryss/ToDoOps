# Argo CD (GitOps)

[Argo CD](https://argo-cd.readthedocs.io/en/stable/) is a declarative GitOps controller: it continuously compares the live cluster state with manifests (and Helm/Kustomize sources) in Git and reconciles drift.

A practical introduction in Russian is in [«Путь в GitOps или как мы перевели кластер Kubernetes под управление Argo CD»](https://habr.com/ru/articles/842934/) on Habr. For operating Argo CD as code, see [Declarative setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/) and [Cluster bootstrapping](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/).

## Prerequisites

- **`kubectl`** configured for your cluster.
- For **Yandex Managed Kubernetes** (**`terraform/terraform-k8s`**), after apply:

  ```bash
  cd terraform/terraform-k8s
  terraform output -raw k8s_cluster_id
  yc managed-kubernetes cluster get-credentials <cluster_id> --external
  ```

  More context: **`../k8s/README.md`** (cluster access).

- Permissions to create namespaces, CRDs, cluster-scoped resources, and workloads in **`argocd`** (cluster admin or equivalent).

## 1. Create the `argocd` namespace

```bash
kubectl apply -f namespace.yaml
```

(`namespace.yaml` in this directory is equivalent to `kubectl create namespace argocd`.)

## 2. Install Argo CD (official manifest)

From [Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/) (server-side apply for large CRDs):

```bash
kubectl apply -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait until pods are **Running**:

```bash
kubectl get pods -n argocd -w
```

For production, pin a **release tag** instead of **`stable`** ([releases](https://github.com/argoproj/argo-cd/releases)).

## 3. Access the UI (port-forward)

```bash
kubectl port-forward -n argocd svc/argocd-server 8080:443
```

Open **https://localhost:8080**. For a **public IP**, use step 4.

## 4. Expose Argo CD with a LoadBalancer (optional)

```bash
kubectl patch svc argocd-server -n argocd \
  -p '{"spec":{"type":"LoadBalancer"}}'
kubectl get svc -n argocd argocd-server -o wide -w
```

Then **https://\<EXTERNAL-IP\>** (port **443**). See [TLS configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/tls/) and [Ingress configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/ingress/).

Log in with the CLI if needed:

```bash
argocd login <EXTERNAL-IP> --grpc-web
```

## 5. Initial `admin` password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath='{.data.password}' | base64 -d
echo
```

Follow [security](https://argo-cd.readthedocs.io/en/stable/operator-manual/security/) guidance beyond demos.

## 6. CLI (optional)

Install **`argocd`** from [releases](https://github.com/argoproj/argo-cd/releases).

## Register the ToDoOps Git repository

Register **[Andryss/ToDoOps](https://github.com/Andryss/ToDoOps)** in Argo CD so it appears under **Settings → Repositories** and uses a single declarative credential set if you make the repo private later. From the **`argocd/`** directory:

```bash
kubectl apply -f repository.yaml
```

The manifest is a **`Secret`** with label **`argocd.argoproj.io/secret-type: repository`** ([declarative repositories](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories)). **`repoURL`** in **`Application`** manifests must match **`https://github.com/Andryss/ToDoOps.git`**.

## App of apps (bootstrap all child Applications)

**`application.yaml`** defines **`Application/todoops-gitops`**, which syncs every **`*.yaml`** under **`applications/`** (each file is another **`Application`**). This is the [app-of-apps](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern) / [cluster bootstrapping](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/) pattern. Child apps keep **`argocd.argoproj.io/sync-wave`** annotations so Argo CD orders them during sync.

From the **`argocd/`** directory, after **`repository.yaml`** and **`todoops-secrets`** (see § Secrets):

```bash
kubectl apply -f application.yaml
```

Do **not** put this root manifest inside **`applications/`**, or it would recurse. To adopt apps piecemeal instead, apply files under **`applications/`** individually (§7–§10).

## Secrets and Applications

Argo CD distinguishes:

1. **Credentials to clone Git**: declarative repo **`Secret`** in **`repository.yaml`** (see **Register the ToDoOps Git repository** above) or UI. For **private** repos, add **`username`** / **`password`** (or SSH keys) to that **`Secret`** per the [docs](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories). A **public** repo does not need credentials, but registering it is still useful.

2. **Workload secrets** (e.g. **`todoops-secrets`** for Postgres): Argo CD does **not** provide built-in encryption for arbitrary app secrets in Git. The project’s [Secret management](https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/) guide **strongly recommends** populating secrets **on the cluster** (or via operators) so Argo CD does not need plaintext values in the manifest pipeline — for example [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets), [External Secrets Operator](https://external-secrets.io/), or the CSI [Secrets Store](https://secrets-store-csi-driver.sigs.k8s.io/). It **cautions against** injecting secrets only at **manifest generation** time (plugins such as **argocd-vault-plugin**): generated manifests are cached (e.g. in Redis), which increases exposure if secrets are embedded there.

For demos only, you can create **`todoops-secrets`** out of band (never commit real values). From the **repository root** (not **`argocd/`**):

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml   # local file from secret.example.yaml; k8s/secret.yaml is gitignored
```

## 7. Application: PostgreSQL (`k8s/postgres.yaml`)

The **`Application`** manifest **`applications/postgres.yaml`** syncs only **`k8s/postgres.yaml`** into **`todoops`**. The StatefulSet expects Secret **`todoops-secrets`** with keys **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**, **`POSTGRES_DB`** (see § Secrets above).

From the **`argocd/`** directory (from repo root: **`cd argocd`**):

```bash
kubectl apply -f applications/postgres.yaml
```

The manifest sets **`metadata.namespace: argocd`**, so **`-n argocd`** is not required. In the Argo CD UI, open **`todoops-postgres`** and sync if auto-sync is disabled. Check pods:

```bash
kubectl get pods -n todoops -l app=postgres
```

More manifests: **`applications/README.md`**.

## 8. Applications: backend (+ HPA), frontend

**`applications/backend.yaml`** syncs **`k8s/backend.yaml`** and **`k8s/hpa-backend.yaml`** in one **`Application`** using **`spec.sources`** ([multiple sources](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple-sources/), Argo CD **≥ 2.6**). **`applications/frontend.yaml`** syncs **`k8s/frontend.yaml`**. They expect **`todoops-secrets`** (see § Secrets) and a healthy Postgres if the backend should reach the database immediately.

From the **`argocd/`** directory:

```bash
kubectl apply -f applications/backend.yaml -f applications/frontend.yaml
```

Details: **`applications/README.md`**.

## 9. Applications: monitoring, ServiceMonitor, Grafana dashboard

**`applications/monitoring.yaml`** installs **[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)** into **`todoops`** using **`k8s/monitoring-values.yaml`** (Helm release **`monitoring`**). It uses **`spec.sources`** ([multiple sources](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple-sources/), Argo CD **≥ 2.6**): chart index + Git ref for values. **`ServerSideApply=true`** avoids oversized CRD apply issues.

**`applications/monitoring-extension.yaml`** combines **`k8s/servicemonitor-backend.yaml`** (label **`release: monitoring`** must match the Helm release name) and Kustomize **`k8s/grafana-dashboard/`** in one **`Application`** via **`spec.sources`**.

From the **`argocd/`** directory (after **`todoops-secrets`** exists in **`todoops`**):

```bash
kubectl apply -f applications/monitoring.yaml
kubectl apply -f applications/monitoring-extension.yaml
```

Chart version is pinned in **`monitoring.yaml`** (**`targetRevision`**); bump when you intend to upgrade. If you change the Helm release name, update **`servicemonitor-backend.yaml`** in **`k8s/`** to the same **`release`** label.

If you previously applied **`todoops-servicemonitor-backend`** and **`todoops-grafana-dashboard`**, remove them so one app owns those resources: **`kubectl delete application todoops-servicemonitor-backend todoops-grafana-dashboard -n argocd`**.

## 10. Application: Ingress (NGINX + `ingress.yaml`)

**`applications/ingress.yaml`** installs the **[ingress-nginx](https://kubernetes.github.io/ingress-nginx/)** chart ( **`ingress-nginx`** release, LoadBalancer, namespace-scoped to **`todoops`**) and applies **`k8s/ingress.yaml`** in one **`Application`** via **`spec.sources`** (Argo CD **≥ 2.6**). Chart version is pinned as **`targetRevision`**; values match **`k8s/README.md`** §3.

Apply after **frontend** (and **backend**) exist so the Ingress backend service resolves:

```bash
kubectl apply -f applications/ingress.yaml
```

Wait for the controller Service external address (same as **`../k8s/README.md`** §3):

```bash
kubectl get svc -n todoops ingress-nginx-controller -o wide -w
```

Press Ctrl+C when **EXTERNAL-IP** is set. Check controller pods:

```bash
kubectl get pods -n todoops -l app.kubernetes.io/name=ingress-nginx
```

## External IP: ingress-nginx (app + Grafana)

After **`todoops-monitoring`** and **`todoops-ingress`** are healthy, use the same checks as **`../k8s/README.md`** §2–§3.

**Ingress (NGINX)** — controller Service **`ingress-nginx-controller`**:

```bash
kubectl get svc -n todoops ingress-nginx-controller -o wide -w
```

Open **`http://<INGRESS_CONTROLLER_EXTERNAL_IP>`** for the app (**`ingress.yaml`** routes **`/`** to the frontend) and **`http://<INGRESS_CONTROLLER_EXTERNAL_IP>/grafana/`** for Grafana (ClusterIP **`monitoring-grafana`**; subpath configured in **`monitoring-values.yaml`**). Sign in with **`GRAFANA_ADMIN_USER`** / **`GRAFANA_ADMIN_PASSWORD`** from **`todoops-secrets`**.

## Port forwarding (unified pattern)

When you do not use a cloud LoadBalancer (or for debugging), forward a **Service** port to localhost:

```bash
kubectl port-forward -n <namespace> svc/<service-name> <local-port>:<service-port>
```

| What | Example |
|------|---------|
| **Argo CD UI** (HTTPS on the Service) | `kubectl port-forward -n argocd svc/argocd-server 8080:443` → **https://localhost:8080** |
| **Grafana** (direct Service; use **`/grafana/`** subpath) | `kubectl port-forward -n todoops svc/monitoring-grafana 3000:80` → **http://localhost:3000/grafana/** |
| **Frontend** (Service **`frontend`**, port **80** → pods on **8080**) | `kubectl port-forward -n todoops svc/frontend 8081:80` → **http://localhost:8081** |
| **ingress-nginx** (app + Grafana via Ingress) | `kubectl port-forward -n todoops svc/ingress-nginx-controller 8082:80` → **http://localhost:8082** and **http://localhost:8082/grafana/** |

If a Service name differs (e.g. custom Helm release), run **`kubectl get svc -n todoops`** and substitute **`service-name`** / **`service-port`** from the **`PORT(S)`** column. Stop with Ctrl+C.

## Uninstall (destructive)

```bash
kubectl delete -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl delete -f namespace.yaml
```

If you pinned an install manifest URL, use the same URL for **`kubectl delete`**.

## See also

- App-of-apps root: **`application.yaml`**
- Git repo **`Secret`**: **`repository.yaml`**
- [Argo CD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [Declarative setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
- [Secret management](https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/)
- [Application manifests](applications/README.md)
- [ToDoOps Kubernetes manifests](../k8s/README.md)
