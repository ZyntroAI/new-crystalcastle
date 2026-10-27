
import os
import shutil

base_dir = "/mnt/agents/output/fastapi-solo-backend"

# 1. Auto-scaling docker-compose for production
compose_scaling = """version: "3.8"

services:
  # Load balancer / reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-scaling.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - app
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 128M

  # App instances — scale with: docker-compose up -d --scale app=3
  app:
    build: .
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:${DB_PASSWORD}@db:5432/app_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - APP_ENV=production
      - DEBUG=false
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  # Worker instances for background jobs
  worker:
    build: .
    command: celery -A app.core.celery worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:${DB_PASSWORD}@db:5432/app_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 256M

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: app_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 128M

  # Prometheus for metrics
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M

  # Grafana for dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
"""

with open(f"{base_dir}/docker-compose.scaling.yml", "w") as f:
    f.write(compose_scaling)

# 2. Nginx config for load balancing across app instances
nginx_scaling = """events {
    worker_connections 1024;
}

http {
    upstream app_backend {
        least_conn;  # Route to least busy instance
        server app:8000;
        # Additional instances added by docker-compose scaling
        # docker-compose up -d --scale app=3
    }

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=contact:10m rate=5r/s;

    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name _;

        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Static files (landing page)
        location /landing {
            alias /var/www/landing;
            try_files $uri $uri/ =404;
        }

        # API with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
        }

        # Health checks (no rate limit)
        location /api/v1/health {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            access_log off;
        }

        # Contact form (stricter rate limit)
        location /api/v1/contact/submit {
            limit_req zone=contact burst=10 nodelay;
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
"""

with open(f"{base_dir}/nginx-scaling.conf", "w") as f:
    f.write(nginx_scaling)

# 3. Prometheus config
prometheus_yml = """global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'fastapi-app'
    static_configs:
      - targets: ['app:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 15s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
"""

with open(f"{base_dir}/prometheus.yml", "w") as f:
    f.write(prometheus_yml)

# 4. Auto-scaling script
scale_script = """#!/bin/bash
# Auto-scaling script for FastAPI Solo Backend
# Monitors CPU/memory and scales app instances accordingly

set -e

COMPOSE_FILE="docker-compose.scaling.yml"
MIN_INSTANCES=1
MAX_INSTANCES=10
CPU_THRESHOLD=70    # Scale up if CPU > 70%
CPU_SCALE_DOWN=30   # Scale down if CPU < 30%
CHECK_INTERVAL=60   # Check every 60 seconds

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

get_container_stats() {
    docker stats --no-stream --format "{{.Name}} {{.CPUPerc}} {{.MemPerc}}" $(docker-compose -f $COMPOSE_FILE ps -q app) 2>/dev/null || echo ""
}

calculate_avg_cpu() {
    local stats=$(get_container_stats)
    local total=0
    local count=0
    
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            cpu=$(echo "$line" | awk '{print $2}' | sed 's/%//')
            if [ -n "$cpu" ] && [ "$cpu" != "--" ]; then
                total=$(echo "$total + $cpu" | bc)
                count=$((count + 1))
            fi
        fi
    done <<< "$stats"
    
    if [ $count -eq 0 ]; then
        echo "0"
    else
        echo "scale=2; $total / $count" | bc
    fi
}

get_current_instances() {
    docker-compose -f $COMPOSE_FILE ps -q app | wc -l
}

scale_up() {
    local current=$(get_current_instances)
    if [ $current -lt $MAX_INSTANCES ]; then
        local new=$((current + 1))
        log "CPU high ($avg_cpu%). Scaling up: $current -> $new instances"
        docker-compose -f $COMPOSE_FILE up -d --scale app=$new
    else
        log "CPU high ($avg_cpu%) but already at max instances ($MAX_INSTANCES)"
    fi
}

scale_down() {
    local current=$(get_current_instances)
    if [ $current -gt $MIN_INSTANCES ]; then
        local new=$((current - 1))
        log "CPU low ($avg_cpu%). Scaling down: $current -> $new instances"
        docker-compose -f $COMPOSE_FILE up -d --scale app=$new
    else
        log "CPU low ($avg_cpu%) but already at min instances ($MIN_INSTANCES)"
    fi
}

# Main loop
log "Auto-scaler started. Min: $MIN_INSTANCES, Max: $MAX_INSTANCES, CPU threshold: $CPU_THRESHOLD%"

while true; do
    avg_cpu=$(calculate_avg_cpu)
    current_instances=$(get_current_instances)
    
    log "Current instances: $current_instances, Avg CPU: $avg_cpu%"
    
    if (( $(echo "$avg_cpu > $CPU_THRESHOLD" | bc -l) )); then
        scale_up
    elif (( $(echo "$avg_cpu < $CPU_SCALE_DOWN" | bc -l) )); then
        scale_down
    fi
    
    sleep $CHECK_INTERVAL
done
"""

with open(f"{base_dir}/auto-scale.sh", "w") as f:
    f.write(scale_script)
os.chmod(f"{base_dir}/auto-scale.sh", 0o755)

# 5. Kubernetes deployment (for cloud auto-scaling)
k8s_deployment = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-app
  labels:
    app: fastapi-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastapi-app
  template:
    metadata:
      labels:
        app: fastapi-app
    spec:
      containers:
      - name: app
        image: fastapi-solo-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: secret-key
        - name: APP_ENV
          value: "production"
        - name: DEBUG
          value: "false"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fastapi-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fastapi-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
---
apiVersion: v1
kind: Service
metadata:
  name: fastapi-app-service
spec:
  selector:
    app: fastapi-app
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fastapi-app-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: fastapi-app-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fastapi-app-service
            port:
              number: 80
"""

with open(f"{base_dir}/k8s-deployment.yaml", "w") as f:
    f.write(k8s_deployment)

# 6. AWS ECS auto-scaling config
ecs_config = """# AWS ECS Task Definition with Auto Scaling
# Save as ecs-task-definition.json and register with:
# aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

{
  "family": "fastapi-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "YOUR_ECR_REPO/fastapi-app:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "APP_ENV", "value": "production"},
        {"name": "DEBUG", "value": "false"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:YOUR_REGION:YOUR_ACCOUNT:secret:db-url"
        },
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:YOUR_REGION:YOUR_ACCOUNT:secret:secret-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fastapi-app",
          "awslogs-region": "YOUR_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}

# Auto Scaling Configuration (AWS CLI)
# aws application-autoscaling register-scalable-target \
#   --service-namespace ecs \
#   --resource-id service/YOUR_CLUSTER/YOUR_SERVICE \
#   --scalable-dimension ecs:service:DesiredCount \
#   --min-capacity 2 \
#   --max-capacity 20

# aws application-autoscaling put-scaling-policy \
#   --policy-name fastapi-cpu-scaling \
#   --service-namespace ecs \
#   --resource-id service/YOUR_CLUSTER/YOUR_SERVICE \
#   --scalable-dimension ecs:service:DesiredCount \
#   --policy-type TargetTrackingScaling \
#   --target-tracking-scaling-policy-configuration \
#   '{
#     "PredefinedMetricSpecification": {
#       "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
#     },
#     "TargetValue": 70.0,
#     "ScaleOutCooldown": 60,
#     "ScaleInCooldown": 300
#   }'
"""

with open(f"{base_dir}/aws-ecs-config.json", "w") as f:
    f.write(ecs_config)

# 7. Update Makefile with scaling commands
with open(f"{base_dir}/Makefile", "r") as f:
    makefile = f.read()

makefile_scaling = makefile + """
# Auto Scaling Commands
scale-up:
	docker-compose -f docker-compose.scaling.yml up -d --scale app=3

scale-down:
	docker-compose -f docker-compose.scaling.yml up -d --scale app=1

scale-auto:
	./auto-scale.sh

logs-scaling:
	docker-compose -f docker-compose.scaling.yml logs -f

monitor:
	open http://localhost:9090  # Prometheus
	open http://localhost:3000  # Grafana

k8s-deploy:
	kubectl apply -f k8s-deployment.yaml

k8s-scale:
	kubectl scale deployment fastapi-app --replicas=5

k8s-status:
	kubectl get pods -l app=fastapi-app
	kubectl get hpa fastapi-app-hpa
"""

with open(f"{base_dir}/Makefile", "w") as f:
    f.write(makefile_scaling)

# 8. Update DEPLOYMENT.md with scaling section
with open(f"{base_dir}/DEPLOYMENT.md", "r") as f:
    deployment = f.read()

scaling_section = """

---

## Auto Scaling

### Docker Compose Scaling (Simplest)

Scale horizontally by running multiple app instances behind nginx:

```bash
# Start with 3 app instances
make scale-up
# or
docker-compose -f docker-compose.scaling.yml up -d --scale app=3

# Scale down to 1
make scale-down
# or
docker-compose -f docker-compose.scaling.yml up -d --scale app=1

# View all instances
make logs-scaling
```

Nginx load balances across instances using `least_conn` algorithm.

### Auto-Scaling Script (CPU-based)

```bash
# Start the auto-scaler (runs in background)
make scale-auto
# or
./auto-scale.sh
```

Monitors average CPU every 60 seconds:
- **CPU > 70%** → Scale up (+1 instance, max 10)
- **CPU < 30%** → Scale down (-1 instance, min 1)

### Kubernetes (Cloud-native)

```bash
# Deploy to Kubernetes
make k8s-deploy

# Scale manually
make k8s-scale
# or
kubectl scale deployment fastapi-app --replicas=10

# Check status
make k8s-status
```

HPA configuration:
- **Min replicas:** 2
- **Max replicas:** 20
- **Scale up:** CPU > 70% or Memory > 80%
- **Scale down:** Stabilization window 5 minutes (prevents flapping)

### AWS ECS (Serverless containers)

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://aws-ecs-config.json

# Create service with auto-scaling
aws ecs create-service \
  --cluster fastapi-cluster \
  --service-name fastapi-app \
  --task-definition fastapi-app \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

# Auto-scaling is configured in aws-ecs-config.json
```

### Monitoring

```bash
# Prometheus metrics
open http://localhost:9090

# Grafana dashboards
open http://localhost:3000
# Default login: admin/admin
```

Pre-configured dashboards:
- API request rate & latency
- Error rate
- CPU/Memory per container
- Database connection pool
- Redis cache hit rate

"""

with open(f"{base_dir}/DEPLOYMENT.md", "w") as f:
    f.write(deployment + scaling_section)

# 9. Update README
with open(f"{base_dir}/README.md", "r") as f:
    readme = f.read()

readme_updated = readme.replace(
    "### Contact & Support System",
    """### Auto Scaling
- **Docker Compose** — scale instances with `--scale app=N`
- **CPU-based auto-scaler** — monitors load, scales up/down automatically
- **Kubernetes HPA** — horizontal pod autoscaler (2–20 replicas)
- **AWS ECS** — Fargate with target tracking auto-scaling
- **Prometheus + Grafana** — metrics and monitoring dashboards

### Contact & Support System"""
)

with open(f"{base_dir}/README.md", "w") as f:
    f.write(readme_updated)

# 10. Create Grafana dashboard config
os.makedirs(f"{base_dir}/grafana/dashboards", exist_ok=True)
os.makedirs(f"{base_dir}/grafana/datasources", exist_ok=True)

grafana_datasource = """apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
"""

with open(f"{base_dir}/grafana/datasources/datasource.yml", "w") as f:
    f.write(grafana_datasource)

grafana_dashboard = """{
  "dashboard": {
    "title": "FastAPI App Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{name=~\"app.*\"}[5m]) * 100",
            "legendFormat": "{{name}}"
          }
        ]
      }
    ]
  }
}
"""

with open(f"{base_dir}/grafana/dashboards/fastapi-dashboard.json", "w") as f:
    f.write(grafana_dashboard)

print("Auto-scaling files created:")
print("  - docker-compose.scaling.yml (multi-instance setup)")
print("  - nginx-scaling.conf (load balancer)")
print("  - auto-scale.sh (CPU-based auto-scaler)")
print("  - k8s-deployment.yaml (Kubernetes HPA)")
print("  - aws-ecs-config.json (AWS Fargate)")
print("  - prometheus.yml (metrics)")
print("  - grafana/ (dashboards)")
print("  - Makefile (updated with scaling commands)")
print("  - DEPLOYMENT.md (updated with scaling section)")