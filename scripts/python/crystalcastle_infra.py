
import os

base = "/mnt/agents/output/crystalcastle-infra"

# Create directory structure
dirs = [
    "app/api", "app/web", "app/worker",
    "docker",
    "k8s/base", "k8s/overlays/dev", "k8s/overlays/staging", "k8s/overlays/production", "k8s/policies",
    "helm/app/templates",
    "infra/terraform/modules/network", "infra/terraform/modules/cluster", "infra/terraform/modules/database", "infra/terraform/modules/redis",
    "infra/terraform/environments/dev", "infra/terraform/environments/staging", "infra/terraform/environments/production",
    "infra/scripts",
    "security/rbac", "security/network", "security/policies", "security/secrets", "security/admission",
    "observability/prometheus", "observability/grafana", "observability/loki", "observability/otel", "observability/alerts",
    "scripts",
    ".github/workflows",
    "ai/router", "ai/cache", "ai/budget", "ai/middleware"
]

for d in dirs:
    os.makedirs(os.path.join(base, d), exist_ok=True)

print("Directory structure created.")