
import os

base = "/mnt/agents/output/crystalcastle-infra"

# ============================================================
# K8s Base Manifests
# ============================================================

files = {}

files["k8s/base/namespace.yaml"] = """apiVersion: v1
kind: Namespace
metadata:
  name: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
    environment: production
    istio-injection: enabled
"""

files["k8s/base/serviceaccount.yaml"] = """apiVersion: v1
kind: ServiceAccount
metadata:
  name: api
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
automountServiceAccountToken: false
"""

files["k8s/base/configmap.yaml"] = """apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  REDIS_ENABLED: "true"
  OTEL_ENABLED: "true"
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector.monitoring.svc.cluster.local:4317"
  OTEL_SERVICE_NAME: "crystalcastle-api"
  CACHE_TTL_SECONDS: "300"
  RATE_LIMIT_RPS: "100"
"""

files["k8s/base/deployment.yaml"] = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: crystalcastle
  labels:
    app.kubernetes.io/name: api
    app.kubernetes.io/component: backend
    app.kubernetes.io/part-of: crystalcastle
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: api
        app.kubernetes.io/component: backend
        app.kubernetes.io/part-of: crystalcastle
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: api
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          image: ghcr.io/zyntroai/crystalcastle-api:v1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8000
              protocol: TCP
          envFrom:
            - configMapRef:
                name: api-config
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: redis-url
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: openai-api-key
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: "1"
              memory: 512Mi
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          readinessProbe:
            httpGet:
              path: /health/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health/live
              port: http
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health
              port: http
            failureThreshold: 30
            periodSeconds: 5
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: api
"""

files["k8s/base/service.yaml"] = """apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: crystalcastle
  labels:
    app.kubernetes.io/name: api
    app.kubernetes.io/part-of: crystalcastle
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: api
  ports:
    - name: http
      port: 80
      targetPort: http
      protocol: TCP
"""

files["k8s/base/hpa.yaml"] = """apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
        - type: Pods
          value: 4
          periodSeconds: 60
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 60
        - type: Pods
          value: 2
          periodSeconds: 60
      selectPolicy: Min
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
          averageUtilization: 75
"""

files["k8s/base/pdb.yaml"] = """apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: api
"""

files["k8s/base/networkpolicy.yaml"] = """---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-ingress
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              app.kubernetes.io/part-of: ingress-nginx
        - namespaceSelector:
            matchLabels:
              app.kubernetes.io/part-of: istio-system
      ports:
        - protocol: TCP
          port: 8000
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-egress
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: api
  policyTypes:
    - Egress
  egress:
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: redis
      ports:
        - protocol: TCP
          port: 6379
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              app.kubernetes.io/name: otel-collector
      ports:
        - protocol: TCP
          port: 4317
    - to: []
      ports:
        - protocol: TCP
          port: 443
"""

files["k8s/base/resourcequota.yaml"] = """apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
    services: "10"
    persistentvolumeclaims: "10"
    secrets: "20"
    configmaps: "20"
"""

files["k8s/base/limitrange.yaml"] = """apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: crystalcastle
  labels:
    app.kubernetes.io/part-of: crystalcastle
spec:
  limits:
    - type: Container
      default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      max:
        cpu: "4"
        memory: 8Gi
      min:
        cpu: 10m
        memory: 32Mi
    - type: PersistentVolumeClaim
      max:
        storage: 100Gi
      min:
        storage: 1Gi
"""

files["k8s/base/kustomization.yaml"] = """apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: crystalcastle

resources:
  - namespace.yaml
  - serviceaccount.yaml
  - configmap.yaml
  - deployment.yaml
  - service.yaml
  - hpa.yaml
  - pdb.yaml
  - networkpolicy.yaml
  - resourcequota.yaml
  - limitrange.yaml

commonLabels:
  app.kubernetes.io/managed-by: kustomize
  app.kubernetes.io/part-of: crystalcastle
"""

# Write all files
for path, content in files.items():
    full_path = os.path.join(base, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print(f"Written {len(files)} K8s base files.")