# SonarQube (ToDoOps lab)

This folder holds **Docker Compose** and **Ansible** for self-hosted **SonarQube Community** on Yandex Cloud. Follow the steps below in order; GitHub-specific steps use the official **SonarQube Community Build** docs.

---

## 1. Set up the VM (Terraform + Ansible)

1. **Infrastructure (VPC, VM, firewall for port 9000):** follow **`terraform/terraform-cicd/README.md`**.
2. **Docker, host tuning, and Compose on that VM:** follow **`sonarqube/ansible/README.md`**.
3. Open the SonarQube UI at **`http://<VM public IP>:9000`** (IP from Terraform output, as in the Terraform README). First login: **`admin` / `admin`**, then change the password when prompted.

---

## 2. Set up the GitHub App (instance ↔ GitHub)

Configure integration **once per SonarQube instance** so SonarQube can talk to GitHub (and optionally enrich PRs / Actions).

Follow SonarSource’s **global-level** GitHub integration:

- Overview: [GitHub integration](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration.md)
- Background: [Introduction to GitHub integration](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/introduction.md)
- Global setup: [Setting up GitHub integration at global level](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/setting-up-at-global-level.md)
- **Create and register the GitHub App:** [Setting up a GitHub App](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/setting-up-at-global-level/setting-up-github-app.md)

You will need sufficient rights in GitHub (org or user) to create the app and install it on the target repositories.

---

## 3. Set up the GitHub project in SonarQube

After the GitHub App (and global settings) are in place, **import** or bind your repository as a SonarQube project:

- [Importing GitHub repositories](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/importing-github-repositories.md)

This replaces manual “create empty project + paste URL” flows when you want the project **linked to GitHub** as described there.

---

## 4. Set up GitHub Actions (CI analysis)

Run analysis from GitHub on each push/PR using a workflow and secrets.

1. **Global parameters** SonarQube expects for GitHub Actions (URLs, etc.):  
   [Setting parameters for GitHub Actions](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/setting-up-at-global-level/setting-parameters-for-github-actions.md)

2. **Workflow YAML** and scanner setup:  
   [Adding analysis to GitHub Actions workflow](https://docs.sonarsource.com/sonarqube-community-build/devops-platform-integration/github-integration/adding-analysis-to-github-actions-workflow.md)

3. **Secrets** (e.g. `SONAR_TOKEN`): generate a token in SonarQube under **My Account → Security** (or a dedicated user), add it as a **GitHub Actions secret** in the repository. The Sonar docs above describe the expected names and variables.

You can align token and variable names with the official workflow snippet first, then adjust for this repo’s **backend**/**frontend** jobs if you split analyses.

---

## Layout in this repo

| Path | Purpose |
|------|---------|
| **`terraform/terraform-cicd/README.md`** | VM and network for SonarQube |
| **`ansible/conf/docker-compose.yml`** | SonarQube + PostgreSQL |
| **`ansible/README.md`** | Playbooks (Docker + Compose) |
| **`.env.example`** | JDBC password template for manual Compose runs |
