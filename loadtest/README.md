# Load testing (`load.yaml`)

This directory holds a **Yandex Tank** job that hits the ToDoOps **backend HTTP API** so you can stress the service and watch behaviour such as **HPA** scaling.

## What the script does (short)

| Piece | Role |
|--------|------|
| **`autostop`** | Stops the run after **`limit(21m)`** and aborts if generator threads stay overloaded (**`instances(90%,5s)`**), so results stay interpretable. |
| **`pandora`** | **Pandora** drives **GET** requests to **`gun.target`** using the listed **`uris`** (task list with two page sizes, then **`/api/v1/tasks/{1,2,3}`**). Headers use Pandora’s **`[Name: value]`** format. |
| **`rps`** | About **20 minutes** of load: **10 min** ramp **5 → 50 RPS**, then **10 min** flat **50 RPS**. |
| **`discard_overflow: true`** | Keeps to the time schedule; requests that miss their slot are dropped instead of stretching the test. |
| **`console` / `core`** | Console output during the run; **`core`** is a minimal stub (Yandex Cloud UI often adds **`uploader`** here). |

Edit **`pandora.config_content.pools[0].gun.target`** (and **`Host`** in **`ammo.headers`** if needed) so they match the host your traffic should use.

---

## Option A — Yandex Cloud Load Testing (recommended with this repo)

The **managed agent** is created by **`terraform/terraform-k8s`** (`yandex_loadtesting_agent`). After **`terraform apply`**:

1. In the [Yandex Cloud console → Load Testing](https://yandex.cloud/docs/load-testing/), create a test and select **your agent** (or use **`terraform output loadtesting_agent_id`** in **`terraform/terraform-k8s`** to identify it).
2. Choose configuration type **YAML** (or paste the tank config as required by the wizard).
3. Paste the contents of **`load.yaml`**, or upload it if the UI supports file attach. Align **`target`** / **`Host`** with a URL **reachable from the agent** (for example **Ingress / NLB** in front of the app — the agent runs in the k8s VPC and cannot reach **`terraform-vm`** unless you connect networks).
4. For cloud runs, the console usually expects an **`uploader`** block pointing at **`loadtesting.api.cloud.yandex.net:443`**; add it next to **`pandora`** per the [Load Testing docs](https://yandex.cloud/docs/load-testing/) if your test fails validation without it.

Reports and history then live in the Load Testing service, not only in local **`phout.log`**.

---

## Option B — Run **yandex-tank** on your laptop

Use this when you want a quick local run (same **`load.yaml`**, no cloud uploader required).

1. Install [Yandex Tank](https://yandextank.readthedocs.io/en/latest/install.html) (e.g. **`pip install yandex-tank`** or Docker **`yandex/yandex-tank`**).
2. Point **`gun.target`** at wherever the backend listens (default in file: **`localhost:8081`**).
3. Example with **kubectl port-forward**:

   ```bash
   kubectl port-forward -n todoops svc/backend 8081:8080
   cd loadtest && yandex-tank -c load.yaml
   ```

4. Watch the cluster: **`kubectl get hpa -n todoops -w`**, **`kubectl get pods -n todoops -l app=backend -w`**.

Artifacts such as **`phout.log`** appear in the tank working directory.

---

## Related

- Terraform agent: **`../terraform/terraform-k8s/`** (outputs include **`loadtesting_agent_id`**).
- Kubernetes manifests: **`../k8s/`**.
