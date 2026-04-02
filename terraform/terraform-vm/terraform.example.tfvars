# Copy to terraform.tfvars in this directory. Key file: ../service-account-key.example.json

cloud_id  = "your-cloud-id"
folder_id = "your-folder-id"

# Path relative to this directory (parent terraform folder is typical)
service_account_key_file = "../service-account-key.json"

default_zone = "ru-central1-a"

ssh_public_key_path = "~/.ssh/id_ed25519.pub"
