# Copy to terraform.tfvars and fill in.

# Yandex Cloud
cloud_id  = "your-cloud-id"
folder_id = "your-folder-id"

# Path to service account key JSON.
# Create a key: https://yandex.cloud/ru/docs/iam/operations/authentication/manage-authorized-keys#create-authorized-key
# See service-account-key.example.json for the expected file structure.
service_account_key_file = "path/to/your/service-account-key.json"

# Default availability zone for resources
default_zone = "ru-central1-a"

# Path to SSH public key for VM access
ssh_public_key_path = "~/.ssh/id_ed25519.pub"
