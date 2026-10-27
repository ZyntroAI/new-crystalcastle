
import os

base = "/mnt/agents/output/crystalcastle-infra"
files = {}

# ============================================================
# K8s Overlays
# ============================================================

files["k8s/overlays/dev/kustomization.yaml"] = """apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: crystalcastle-dev

resources:
  - ../../base

namePrefix: dev-

images:
  - name: ghcr.io/zyntroai/crystalcastle-api
    newTag: latest

replicas:
  - name: api
    count: 1

patches:
  - target:
      kind: ConfigMap
      name: api-config
    patch: |-
      - op: replace
        path: /data/APP_ENV
        value: development
      - op: replace
        path: /data/LOG_LEVEL
        value: debug
  - target:
      kind: HorizontalPodAutoscaler
      name: api
    patch: |-
      - op: replace
        path: /spec/minReplicas
        value: 1
      - op: replace
        path: /spec/maxReplicas
        value: 3
"""

files["k8s/overlays/staging/kustomization.yaml"] = """apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: crystalcastle-staging

resources:
  - ../../base

namePrefix: staging-

images:
  - name: ghcr.io/zyntroai/crystalcastle-api
    newTag: v1.0.0-rc.1

replicas:
  - name: api
    count: 2

patches:
  - target:
      kind: ConfigMap
      name: api-config
    patch: |-
      - op: replace
        path: /data/APP_ENV
        value: staging
      - op: replace
        path: /data/LOG_LEVEL
        value: info
"""

files["k8s/overlays/production/kustomization.yaml"] = """apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: crystalcastle

resources:
  - ../../base

images:
  - name: ghcr.io/zyntroai/crystalcastle-api
    newTag: v1.0.0

replicas:
  - name: api
    count: 5

patches:
  - target:
      kind: ResourceQuota
      name: production-quota
    patch: |-
      - op: replace
        path: /spec/hard/pods
        value: "100"
      - op: replace
        path: /spec/hard/requests.cpu
        value: "20"
      - op: replace
        path: /spec/hard/limits.cpu
        value: "40"
"""

# ============================================================
# K8s Policies (Kyverno-style, compatible with OPA Gatekeeper too)
# ============================================================

files["k8s/policies/require-nonroot.yaml"] = """apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-nonroot
  annotations:
    policies.kyverno.io/title: Require Non-Root
    policies.kyverno.io/category: Security
    policies.kyverno.io/severity: high
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: check-runasnonroot
      match:
        resources:
          kinds:
            - Pod
      validate:
        message: "Running as root is not allowed. Set runAsNonRoot: true"
        pattern:
          spec:
            securityContext:
              runAsNonRoot: true
    - name: check-containers-nonroot
      match:
        resources:
          kinds:
            - Pod
      validate:
        message: "All containers must have allowPrivilegeEscalation: false"
        pattern:
          spec:
            containers:
              - securityContext:
                  allowPrivilegeEscalation: false
"""

files["k8s/policies/require-resources.yaml"] = """apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-resources
  annotations:
    policies.kyverno.io/title: Require Resource Limits
    policies.kyverno.io/category: Best Practices
    policies.kyverno.io/severity: medium
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: check-requests
      match:
        resources:
          kinds:
            - Deployment
            - StatefulSet
            - DaemonSet
      validate:
        message: "CPU and memory requests/limits are required"
        pattern:
          spec:
            template:
              spec:
                containers:
                  - resources:
                      requests:
                        memory: "?*"
                        cpu: "?*"
                      limits:
                        memory: "?*"
                        cpu: "?*"
"""

files["k8s/policies/disallow-latest.yaml"] = """apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-latest-tag
  annotations:
    policies.kyverno.io/title: Disallow Latest Tag
    policies.kyverno.io/category: Best Practices
    policies.kyverno.io/severity: medium
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: validate-image-tag
      match:
        resources:
          kinds:
            - Pod
      validate:
        message: "Using 'latest' tag is not allowed"
        pattern:
          spec:
            containers:
              - image: "!*:latest"
    - name: validate-image-tag-not-empty
      match:
        resources:
          kinds:
            - Pod
      validate:
        message: "Image tag must be specified"
        pattern:
          spec:
            containers:
              - image: "*:*"
"""

files["k8s/policies/require-labels.yaml"] = """apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
  annotations:
    policies.kyverno.io/title: Require Standard Labels
    policies.kyverno.io/category: Best Practices
spec:
  validationFailureAction: Audit
  background: true
  rules:
    - name: check-standard-labels
      match:
        resources:
          kinds:
            - Deployment
            - StatefulSet
            - Service
            - ConfigMap
      validate:
        message: "Missing required labels"
        pattern:
          metadata:
            labels:
              app.kubernetes.io/name: "?*"
              app.kubernetes.io/part-of: "?*"
"""

# ============================================================
# Helm Chart
# ============================================================

files["helm/app/Chart.yaml"] = """apiVersion: v2
name: crystalcastle
description: CrystalCastle Kubernetes application
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - ai
  - api
  - llm
maintainers:
  - name: Zyntro AI
    email: devops@zyntro.ai
dependencies:
  - name: postgresql
    version: 13.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 18.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
"""

files["helm/app/values.yaml"] = """replicaCount: 3

image:
  repository: ghcr.io/zyntroai/crystalcastle-api
  tag: latest
  pullPolicy: IfNotPresent

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  automount: false
  annotations: {}

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8000"
  prometheus.io/path: "/metrics"

podSecurityContext:
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  fsGroup: 10001
  seccompProfile:
    type: RuntimeDefault

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL

service:
  type: ClusterIP
  port: 80
  targetPort: 8000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
    - host: api.crystalcastle.io
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: crystalcastle-tls
      hosts:
        - api.crystalcastle.io

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 1
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 75
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 60

pdb:
  enabled: true
  minAvailable: 2

nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                  - crystalcastle
          topologyKey: kubernetes.io/hostname

config:
  APP_ENV: production
  LOG_LEVEL: info
  REDIS_ENABLED: "true"
  OTEL_ENABLED: "true"
  CACHE_TTL_SECONDS: "300"
  RATE_LIMIT_RPS: "100"

secrets:
  database-url: ""
  redis-url: ""
  openai-api-key: ""

postgresql:
  enabled: false

redis:
  enabled: false
"""

files["helm/app/values-production.yaml"] = """replicaCount: 5

image:
  tag: v1.0.0
  pullPolicy: IfNotPresent

autoscaling:
  enabled: true
  minReplicas: 5
  maxReplicas: 50

resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 2
    memory: 1Gi

pdb:
  minAvailable: 3

config:
  LOG_LEVEL: warn
  RATE_LIMIT_RPS: "500"
"""

files["helm/app/templates/_helpers.tpl"] = """{{/*
Expand the name of the chart.
*/}}
{{- define "crystalcastle.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "crystalcastle.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "crystalcastle.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "crystalcastle.labels" -}}
helm.sh/chart: {{ include "crystalcastle.chart" . }}
{{ include "crystalcastle.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: crystalcastle
{{- end }}

{{/*
Selector labels
*/}}
{{- define "crystalcastle.selectorLabels" -}}
app.kubernetes.io/name: {{ include "crystalcastle.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
"""

files["helm/app/templates/deployment.yaml"] = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "crystalcastle.fullname" . }}
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      {{- include "crystalcastle.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "crystalcastle.labels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "crystalcastle.fullname" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8000
              protocol: TCP
          envFrom:
            - configMapRef:
                name: {{ include "crystalcastle.fullname" . }}-config
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "crystalcastle.fullname" . }}-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "crystalcastle.fullname" . }}-secrets
                  key: redis-url
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          readinessProbe:
            httpGet:
              path: /health/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health/live
              port: http
            initialDelaySeconds: 15
            periodSeconds: 20
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
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
"""

files["helm/app/templates/service.yaml"] = """apiVersion: v1
kind: Service
metadata:
  name: {{ include "crystalcastle.fullname" . }}
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
      name: http
  selector:
    {{- include "crystalcastle.selectorLabels" . | nindent 4 }}
"""

files["helm/app/templates/hpa.yaml"] = """{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "crystalcastle.fullname" . }}
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "crystalcastle.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  {{- if .Values.autoscaling.behavior }}
  behavior:
    {{- toYaml .Values.autoscaling.behavior | nindent 4 }}
  {{- end }}
  metrics:
    {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
    {{- if .Values.autoscaling.targetMemoryUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetMemoryUtilizationPercentage }}
    {{- end }}
{{- end }}
"""

files["helm/app/templates/pdb.yaml"] = """{{- if .Values.pdb.enabled }}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "crystalcastle.fullname" . }}
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
spec:
  minAvailable: {{ .Values.pdb.minAvailable }}
  selector:
    matchLabels:
      {{- include "crystalcastle.selectorLabels" . | nindent 6 }}
{{- end }}
"""

files["helm/app/templates/ingress.yaml"] = """{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "crystalcastle.fullname" . }}
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "crystalcastle.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
"""

files["helm/app/templates/configmap.yaml"] = """apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "crystalcastle.fullname" . }}-config
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
data:
  {{- toYaml .Values.config | nindent 2 }}
"""

files["helm/app/templates/secrets.yaml"] = """apiVersion: v1
kind: Secret
metadata:
  name: {{ include "crystalcastle.fullname" . }}-secrets
  labels:
    {{- include "crystalcastle.labels" . | nindent 4 }}
type: Opaque
stringData:
  {{- toYaml .Values.secrets | nindent 2 }}
"""

# Write all
for path, content in files.items():
    full_path = os.path.join(base, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print(f"Written {len(files)} overlay, policy, and Helm files.")