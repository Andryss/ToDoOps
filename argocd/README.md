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

## Uninstall (destructive)

```bash
kubectl delete -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl delete -f namespace.yaml
```

If you pinned an install manifest URL, use the same URL for **`kubectl delete`**.

## See also

- [Argo CD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [Declarative setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
- [ToDoOps Kubernetes manifests](../k8s/README.md)
