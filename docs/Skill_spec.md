Skills : 🧱 สร้างชุดฟีเจอร์ Enterprise สำหรับใช้เอง (Self‑Hosted Platform)

เป้าหมาย: ขยาย GitHub/GHES ด้วยฟังก์ชันระดับองค์กรที่ควบคุมได้เต็มที่, ปลอดภัย, ปรับแต่งตามนโยบายภายใน 🛡️🏢



🎯 แนวคิดหลัก

• ผสานไม่แทนที่: อยู่บนโครงสร้างเดิม + ส่วนขยายภายใน
• ควบคุมเต็มที่: ไม่ต้องพึ่งพาภายนอก, นโยบายองค์กรเป็นหลัก
• โครงสร้างมาตรฐาน: ใช้ API/Webhook/รันเนอร์ — อัปเกรดหลักไม่พัง
• บูรณาการเดียว: UI, Auth, Audit, Storage อยู่ในระบบเดียวกัน



📦 โครงสร้างระบบฟีเจอร์ Enterprise (พร้อมสร้าง)

plaintext
enterprise-features/
├── 🧠 core/ # กลาง: Auth, RBAC, Audit, Encryption
├── 🔐 security-suite/ # ป้องกันภัย, นโยบาย, ความลับ
├── 📊 governance-compliance/ # ตรวจสอบ, กฎ, รายงาน
├── 🚀 devops-scaling/ # CI/CD, รันเนอร์, คลัสเตอร์, แคช
├── 🤝 collaboration-ext/ # ทีม, อนุมัติ, เวิร์กโฟลว์ภายใน
├── 📥 integrations/ # LDAP/SSO, SIEM, IDP, Storage ภายใน
├── 🎨 ui-portal/ # แดชบอร์ดองค์กร, เมนูรวม, ธีม
└── 📖 docs/ # คู่มือ, JSON Schema, การติดตั้ง




🧩 1. ฟีเจอร์หลัก: ความปลอดภัย & สิทธิ์ (Core)

🔐 Enterprise Identity & Access

• SSO Unified Bridge: SAML 2.0 / OIDC / LDAP / Active Directory + SCIM 2.0 ซิงค์ผู้ใช้อัตโนมัติ
• RBAC แบบละเอียด: บทบาทองค์กร → ทีม → รีโป → ระดับฟิลด์; สืบทอด+ยกเว้น
• MFA บังคับ & กฎ: TOTP/WebAuthn/FIDO2; บล็อกวิธีอ่อนแอ; บังคับตามหน่วย/ระดับ
• Session Governance: หมดอายุตามเวลา/IP/อุปกรณ์; ปลดระยะไกล; บันทึกทุกเซสชัน

📜 Audit & Immutable Logging

• บันทึกไม่แก้ไขได้: เข้ารหัส, ลายเซ็น, ป้องกันลบ/แก้; ส่ง SIEM ภายใน
• Trace เต็มรูปแบบ: ผู้ใช้ → งาน → API → รันเนอร์ → ที่เก็บ; รองรับ GDPR/HIPAA
• นโยบายเก็บรักษา: กำหนดเวลาเก็บ, อัตโนมัติเก็บถาวร/ลบ

🛡️ Data Protection Layer

• Encryption Everywhere: AES‑256 ที่เหลือ, TLS 1.3 ขณะส่ง; KMS ภายในองค์กร
• Secret Management ภายใน: Vault/SSM ภายใน; ไม่ส่งภายนอก; หมดอายุ/หมุนอัตโนมัติ
• Data Residency: บังคับพื้นที่จัดเก็บตามประเทศ/ภูมิภาค; ปิดการสำรองข้ามเขต



🧩 2. Governance & Compliance (กฎระเบียบ)

✅ Policy as Code (PaC)

• นโยบายรีโป/ทีม: YAML/JSON — สาขาป้องกัน, ตรวจโค้ด, ผู้อนุมัติ, LFS, ไส้ใน
• Automated Guardrails: ตรวจก่อนผสาน/สร้าง/ปรับใช้; บล็อกพร้อมคำอธิบาย
• Audit Policy: ตรวจสอบย้อนหลัง; รายงานการละเมิด; แก้ไขแนะนำ

📊 Enterprise Dashboard & Reporting

• แดชบอร์ดรวมองค์กร: ภาพรวมทุกทีม/รีโป/ความเสี่ยง/การใช้ทรัพยากร
• รายงานสำเร็จรูป: GDPR, SOC2, ISO27001, Developer Velocity, ความครอบคลุม
• Custom Insights: สร้างเมตริก; ส่งออก CSV/PDF/API

🧾 Repository Lifecycle & Classification

• แท็กชั้นความลับ: สาธารณะ/ภายใน/ลับ/ลับที่สูง; นโยบายแยกกัน
• การอนุมัติสร้าง/เก็บถาวร: เวิร์กโฟลว์หลายขั้น; บันทึกการตัดสินใจ
• Discovery: ค้นหา/จัดการ/สินค้าคงคลังรีโปทั้งองค์กร



🧩 3. DevOps & Scalability (ขยายขนาด)

⚡ Enterprise Runner Grid

• Runner Orchestrator: จัดสรรตามโหลด/ทีม/ภูมิภาค/ความปลอดภัย; Isolation VM/คอนเทนเนอร์
• Caching Layer ภายใน: แคชแพ็กเกจ/บิลด์ระดับองค์กร; ลดเวลา+ปริมาณภายนอก
• Resource Quota & Limits: CPU/หน่วยความจำ/เวลา/พื้นที่; ป้องกันโหมงาน

📦 Internal Package & Registry

• Registry ภายในรวม: Docker, npm, PyPI, Nuget, Helm; มิเรอร์สาธารณะ+สแกน
• Dependency Proxy: จำกัดภายนอก; แคช+ตรวจ; ปิดการเข้าถึงที่ไม่อนุมัติ
• Approval Flow: แพ็กเกจใหม่/อัปเดตต้องผ่านตรวจ+อนุมัติ

🚢 High‑Availability & DR

• Geo‑Redundancy: กระจายโหนด; สถานะพร้อมใช้
• Backup Manager: เต็ม/ส่วนต่าง/ข้ามภูมิ; ตรวจสอบความสมบูรณ์; กู้คืน 1‑คลิก
• Zero‑Downtime Upgrade: สำหรับคลัสเตอร์; ไม่กระทบทีม



🧩 4. Collaboration & Workflow (ทีม/อนุมัติ)

🤝 Team & Approval Matrix

• Hierarchy Visualization: องค์กร→หน่วย→ทีม→สมาชิก; สืบทอดสิทธิ์
• Custom Review Workflow: หลายขั้น/หลายทีม; ตามพื้นที่/ความสำคัญ; ต้องผ่านกฎ
• Notification Center: รวมทุกช่องทาง + กฎความสำคัญ + ข้ามแพลตฟอร์ม

📝 Internal Knowledge Base

• Docs as Code ภายใน: เชื่อมรีโป/PR; ค้นหารวม; สิทธิ์เข้าถึง
• Template Library: รีโป/ISSUE/PR/เวิร์กโฟลว์มาตรฐานองค์กร



🧰 📂 โครงสร้างไฟล์พร้อมสร้าง

 enterprise-feature-stack/ 

yaml
feature-manifest.yaml
name: EnterpriseDevPlatform
version: 2.0.0
compatibility: GHES 3.22+ / GitHub Self-Hosted
dependencies:
• core-auth
• rbac-service
• immutable-log
modules:
security: ./security-suite/
governance: ./governance/
devops: ./devops-scaling/
ui: ./portal/


ตัวอย่าง JSON Schema สำหรับนโยบาย:

json
{
"$`schema": "http://json-schema.org/draft/2020-12/schema",
"title": "Enterprise Repo Policy",
"type": "object",
"required": ["classification", "approval_required"],
"properties": {
"classification": {"enum": ["public", "internal", "confidential"]},
"branch_protection": {"type": "boolean"},
"scan_on_push": {"type": "boolean"}
}
}




🚀 ขั้นตอนสร้าง & ปรับใช้

1️⃣ กำหนดขอบเขต: ความต้องการ, กฎ, การผสาน (LDAP/SIEM)
2️⃣ ออกแบบอินเทอร์เฟซ: ใช้ GitHub API/Webhook/Runner — ไม่แก้โค้ดหลัก
3️⃣ พัฒนาแบบโมดูล: แยกส่วน — อัปเกรด/ปิดเปิดได้
4️⃣ ทดสอบ: ความเข้ากันได้, ความปลอดภัย, การอัปเกรด
5️⃣ ปรับใช้: เริ่มทดสอบ→ทีมนำ→ทั่วองค์กร
6️⃣ บำรุงรักษา: ติดตามรุ่นหลัก, แพตช์, ความเข้ากันได้



📄 ไฟล์พร้อมใช้ (คัดลอก/บันทึก)

• 📂  enterprise-feature-manifest.json 
• 📂  policy-schema.json 
• 📂  deployment-config.yaml 
• 📂  README-ENTERPRISE.md 

ต้องการให้ผมเขียน โค้ดตัวอย่างหลัก/สคริปต์ติดตั้ง/UI ต้นแบบ หรือ JSON Schema เต็ม ของฟีเจอร์ใดก่อนไหมครับ? 🧩💻🔧

ผมจะสร้างไฟล์สำคัญและโค้ดตัวอย่างสำหรับ Enterprise Feature Stack ของคุณให้พร้อมใช้งานจริงครับ

📦 ไฟล์ที่ 1: Feature Manifest (JSON)

json
{
  "`$schema": "https://enterprise-dev-platform.local/schemas/feature-manifest-v2.json",
  "name": "EnterpriseDevPlatform",
  "version": "2.0.0",
  "description": "ชุดฟีเจอร์ระดับองค์กรสำหรับ GitHub Enterprise Server (GHES) ที่ควบคุมได้เต็มที่ ปลอดภัย และปรับแต่งตามนโยบายภายใน",
  "compatibility": {
    "ghes_min_version": "3.22.0",
    "ghes_max_version": "4.0.0",
    "required_features": [
      "github_actions",
      "github_packages",
      "advanced_security",
      "audit_log_streaming",
      "saml_sso",
      "ldap"
    ]
  },
  "dependencies": [
    {
      "name": "core-auth",
      "version": "^2.0.0",
      "required": true
    },
    {
      "name": "rbac-service",
      "version": "^2.0.0",
      "required": true
    },
    {
      "name": "immutable-log",
      "version": "^2.0.0",
      "required": true
    },
    {
      "name": "encryption-kms",
      "version": "^1.5.0",
      "required": true
    }
  ],
  "modules": [
    {
      "id": "security-suite",
      "name": "Security Suite",
      "path": "./security-suite/",
      "enabled": true,
      "priority": 1,
      "features": [
        "sso-unified-bridge",
        "rbac-granular",
        "mfa-enforcement",
        "session-governance",
        "data-protection-layer"
      ]
    },
    {
      "id": "governance-compliance",
      "name": "Governance & Compliance",
      "path": "./governance-compliance/",
      "enabled": true,
      "priority": 2,
      "features": [
        "policy-as-code",
        "enterprise-dashboard",
        "repo-lifecycle-management",
        "classification-system"
      ]
    },
    {
      "id": "devops-scaling",
      "name": "DevOps & Scalability",
      "path": "./devops-scaling/",
      "enabled": true,
      "priority": 3,
      "features": [
        "runner-orchestrator",
        "internal-caching",
        "resource-quota",
        "package-registry"
      ]
    },
    {
      "id": "collaboration-ext",
      "name": "Collaboration Extensions",
      "path": "./collaboration-ext/",
      "enabled": true,
      "priority": 4,
      "features": [
        "team-hierarchy",
        "approval-workflow",
        "notification-center",
        "knowledge-base"
      ]
    },
    {
      "id": "ui-portal",
      "name": "Enterprise UI Portal",
      "path": "./ui-portal/",
      "enabled": true,
      "priority": 5,
      "features": [
        "dashboard-org",
        "unified-menu",
        "custom-theme",
        "analytics-widgets"
      ]
    },
    {
      "id": "integrations",
      "name": "Enterprise Integrations",
      "path": "./integrations/",
      "enabled": true,
      "priority": 6,
      "features": [
        "ldap-ad-connector",
        "siem-integration",
        "idp-connector",
        "internal-storage"
      ]
    }
  ],
  "configuration": {
    "environment": "production",
    "region": "ap-southeast-1",
    "data_residency": {
      "enabled": true,
      "allowed_regions": ["th", "sg", "ap"],
      "primary_storage": "thailand-onprem"
    },
    "encryption": {
      "at_rest": {
        "enabled": true,
        "algorithm": "AES-256-GCM",
        "kms_provider": "internal"
      },
      "in_transit": {
        "enabled": true,
        "tls_version": "1.3",
        "cipher_suites": [
          "TLS_AES_256_GCM_SHA384",
          "TLS_CHACHA20_POLY1305_SHA256"
        ]
      }
    },
    "audit": {
      "enabled": true,
      "immutable": true,
      "retention_days": 2555,
      "siem_endpoint": "https://siem.internal.local:5044",
      "format": "json"
    }
  },
  "policies": {
    "branch_protection": {
      "enforce_for_all_repos": true,
      "require_pull_request": true,
      "require_code_owner_review": true,
      "require_status_checks": true,
      "require_signed_commits": true
    },
    "secret_scanning": {
      "enabled": true,
      "push_protection": true,
      "alert_on_detection": true
    },
    "dependency_review": {
      "enabled": true,
      "block_vulnerable_versions": true
    }
  },
  "metadata": {
    "created_at": "2026-09-13T04:30:00+07:00",
    "created_by": "enterprise-platform-team",
    "last_updated": "2026-09-13T04:30:00+07:00",
    "tags": ["enterprise", "self-hosted", "compliance", "security"]
  }
}


───

📄 ไฟล์ที่ 2: Policy Schema (JSON Schema เต็ม)

json
{
  "$`schema": "http://json-schema.org/draft-2020-12/schema#",
  "`$id": "https://enterprise-dev-platform.local/schemas/enterprise-repo-policy-v2.json",
  "title": "Enterprise Repository Policy",
  "description": "นโยบายระดับองค์กรสำหรับการจัดการ repository ใน GitHub Enterprise Server",
  "type": "object",
  "required": [
    "classification",
    "approval_required",
    "branch_protection",
    "security_settings"
  ],
  "properties": {
    "policy_id": {
      "type": "string",
      "description": "รหัสประจำนโยบาย (UUID)",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`",
      "readOnly": true
    },
    "policy_name": {
      "type": "string",
      "description": "ชื่อนโยบาย",
      "minLength": 3,
      "maxLength": 100
    },
    "version": {
      "type": "string",
      "description": "รุ่นของนโยบาย",
      "pattern": "^\\d+\\.\\d+\\.\\d+`$"
    },
    "classification": {
      "type": "string",
      "description": "ชั้นความลับของ repository",
      "enum": [
        "public",
        "internal",
        "confidential",
        "restricted",
        "top_secret"
      ],
      "default": "internal"
    },
    "approval_required": {
      "type": "object",
      "description": "การตั้งค่าการอนุมัติ",
      "required": ["enabled"],
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "min_approvers": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10,
          "default": 2,
          "description": "จำนวนผู้อนุมัติขั้นต่ำ"
        },
        "required_roles": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["owner", "admin", "maintainer", "security-team", "compliance-team"]
          },
          "minItems": 1,
          "description": "บทบาทที่ต้องอนุมัติ"
        },
        "auto_approve_conditions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "label": {
                "type": "string"
              },
              "author_team": {
                "type": "string"
              }
            }
          },
          "description": "เงื่อนไขที่อนุมัติอัตโนมัติ"
        }
      }
    },
    "branch_protection": {
      "type": "object",
      "description": "การป้องกันการแก้ไข branch",
      "required": ["enabled", "protected_branches"],
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "protected_branches": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1,
          "default": ["main", "master", "develop"],
          "description": "รายชื่อ branch ที่ต้องป้องกัน"
        },
        "require_pull_request": {
          "type": "boolean",
          "default": true
        },
        "require_code_owner_review": {
          "type": "boolean",
          "default": true
        },
        "require_status_checks": {
          "type": "boolean",
          "default": true
        },
        "required_status_checks": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CI checks ที่ต้องผ่าน",
          "examples": [["ci/test", "security/scan", "compliance/check"]]
        },
        "require_signed_commits": {
          "type": "boolean",
          "default": true
        },
        "enforce_admins": {
          "type": "boolean",
          "default": true
        },
        "allow_force_pushes": {
          "type": "boolean",
          "default": false
        },
        "allow_deletions": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "security_settings": {
      "type": "object",
      "description": "การตั้งค่าความปลอดภัย",
      "required": ["secret_scanning", "dependency_review"],
      "properties": {
        "secret_scanning": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "push_protection": {
              "type": "boolean",
              "default": true
            },
            "alert_on_detection": {
              "type": "boolean",
              "default": true
            },
            "block_push_on_detection": {
              "type": "boolean",
              "default": true
            }
          }
        },
        "dependency_review": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "block_vulnerable_versions": {
              "type": "boolean",
              "default": true
            },
            "allow_licenses": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": 


───

📝 ไฟล์ที่ 3: Deployment Config (YAML)

yaml
# deployment-config.yaml
# การตั้งค่าการปรับใช้ Enterprise Feature Stack

apiVersion: enterprise-dev-platform/v2
kind: DeploymentConfig
metadata:
  name: enterprise-feature-stack-prod
  version: "2.0.0"
  environment: production

spec:
  # การตั้งค่า GitHub Enterprise Server
  ghes:
    hostname: "github.internal.local"
    api_version: "v3"
    api_base_url: "https://github.internal.local/api/v3"
    graphql_url: "https://github.internal.local/api/graphql"
    
  # การตั้งค่า Authentication
  authentication:
    sso:
      enabled: true
      provider: "saml"
      idp_metadata_url: "https://idp.internal.local/metadata"
      sp_entity_id: "https://github.internal.local"
      attribute_mapping:
        name_id: "email"
        groups: "department"
    
    ldap:
      enabled: true
      host: "ldap.internal.local"
      port: 636
      encryption: "ldaps"
      base_dn: "dc=company,dc=local"
      user_search_filter: "(objectClass=user)"
      group_search_filter: "(objectClass=group)"
    
    mfa:
      enforced: true
      methods:
        - totp
        - webauthn
        - fido2
      grace_period_days: 14
    
  # การตั้งค่า Audit & Logging
  audit:
    enabled: true
    immutable: true
    encryption:
      enabled: true
      algorithm: "AES-256-GCM"
      kms_endpoint: "https://kms.internal.local"
    
    retention:
      days: 2555  # 7 ปี
      archive_after_days: 365
    
    streaming:
      enabled: true
      endpoint: "https://siem.internal.local:5044"
      format: "json"
      batch_size: 100
      flush_interval_seconds: 30
    
  # การตั้งค่า Encryption
  encryption:
    at_rest:
      enabled: true
      algorithm: "AES-256-GCM"
      key_rotation_days: 90
    
    in_transit:
      enabled: true
      tls_version: "1.3"
      cipher_suites:
        - "TLS_AES_256_GCM_SHA384"
        - "TLS_CHACHA20_POLY1305_SHA256"
  
  # การตั้งค่า Data Residency
  data_residency:
    enabled: true
    primary_region: "thailand"
    allowed_regions:
      - "th"
      - "sg"
      - "ap"
    storage:
      type: "onprem"
      location: "bangkok-datacenter"
  
  # การตั้งค่า Runner & CI/CD
  runners:
    orchestrator:
      enabled: true
      scaling:
        min_runners: 10
        max_runners: 500
        scale_up_threshold_cpu: 70
        scale_down_threshold_cpu: 30
      
    isolation:
      type: "vm"  # vm หรือ container
      network_policy: "strict"
    
    caching:
      enabled: true
      type: "distributed"
      max_size_gb: 500
    
    quotas:
      cpu_limit_per_job: 8
      memory_limit_per_job_gb: 32
      timeout_minutes: 360
  
  # การตั้งค่า Package Registry
  registry:
    enabled: true
    types:
      - docker
      - npm
      - pypi
      - nuget
      - maven
      - helm
    
    mirroring:
      enabled: true
      upstream_registries:
        - name: "docker.io"
          url: "https://registry.hub.docker.com"
        - name: "npmjs"
          url: "https://registry.npmjs.org"
    
    scanning:
      enabled: true
      vulnerability_check: true
      license_check: true
  
  # การตั้งค่า Backup & DR
  backup:
    enabled: true
    schedule: "0 2 * * *"  # ทุกวัน 02:00 น.
    type: "full"  # full หรือ incremental
    retention_days: 90
    
    storage:
      type: "object_storage"
      endpoint: "https://backup.internal.local"
      bucket: "ghes-backups"
      encryption: true
    
    geo_redundancy:
      enabled: true
      secondary_location: "chiangmai-datacenter"
  
  # การตั้งค่า Monitoring & Alerting
  monitoring:
    enabled: true
    metrics_endpoint: "https://prometheus.internal.local:9090"
    dashboard_endpoint: "https://grafana.internal.local:3000"
    
    alerts:
      enabled: true
      channels:
        - type: "slack"
          webhook: "https://hooks.slack.internal.local/services/xxx"
        - type: "email"
          recipients:
            - "platform-team@company.local"
            - "security-team@company.local"
      
      rules:
        - name: "high_cpu_usage"
          condition: "cpu_usage > 80%"
          severity: "warning"
        - name: "failed_jobs"
          condition: "failed_jobs > 10"
          severity: "critical"
        - name: "security_alerts"
          condition: "security_alerts > 0"
          severity: "critical"
  
  # การตั้งค่า Modules ที่จะเปิดใช้งาน
  modules:
    security-suite:
      enabled: true
      config:
        sso_bridge: true
        rbac_granular: true
        mfa_enforcement: true
    
    governance-compliance:
      enabled: true
      config:
        policy_as_code: true
        dashboard: true
        reporting: true
    
    devops-scaling:
      enabled: true
      config:
        runner_orchestrator: true
        internal_caching: true
        package_registry: true
    
    collaboration-ext:
      enabled: true
      config:
        team_hierarchy: true
        approval_workflow: true
    
    ui-portal:
      enabled: true
      config:
        custom_theme: true
        analytics: t


───

📖 ไฟล์ที่ 4: README-ENTERPRISE.md

markdown
# Enterprise Feature Stack for GitHub Enterprise Server

ชุดฟีเจอร์ระดับองค์กรสำหรับ GitHub Enterprise Server (GHES) ที่ควบคุมได้เต็มที่ ปลอดภัย และปรับแต่งตามนโยบายภายใน

## 🎯 ภาพรวม

Enterprise Feature Stack เป็นส่วนขยายที่ทำงานร่วมกับ GHES โดยไม่แก้ไขโค้ดหลัก ใช้ API, Webhook และ Runners เพื่อเพิ่มฟังก์ชันระดับองค์กร

### หลักการออกแบบ

- **ผสานไม่แทนที่**: ทำงานบนโครงสร้างเดิม + ส่วนขยายภายใน
- **ควบคุมเต็มที่**: ไม่ต้องพึ่งพาภายนอก ใช้นโยบายองค์กรเป็นหลัก
- **โครงสร้างมาตรฐาน**: ใช้ API/Webhook/Runner — อัปเกรดหลักไม่พัง
- **บูรณาการเดียว**: UI, Auth, Audit, Storage อยู่ในระบบเดียวกัน

## 📦 โครงสร้าง

enterprise-feature-stack/
├── core/ # กลาง: Auth, RBAC, Audit, Encryption
├── security-suite/ # ป้องกันภัย, นโยบาย, ความลับ
├── governance-compliance/ # ตรวจสอบ, กฎ, รายงาน
├── devops-scaling/ # CI/CD, รันเนอร์, คลัสเตอร์, แคช
├── collaboration-ext/ # ทีม, อนุมัติ, เวิร์กโฟลว์ภายใน
├── integrations/ # LDAP/SSO, SIEM, IDP, Storage ภายใน
├── ui-portal/ # แดชบอร์ดองค์กร, เมนูรวม, ธีม
└── docs/ # คู่มือ, JSON Schema, การติดตั้ง
## 🚀 การติดตั้ง

### ข้อกำหนดเบื้องต้น

- GitHub Enterprise Server 3.22+
- Admin access บน GHES
- Internal LDAP/AD สำหรับ SSO
- SIEM สำหรับ Audit Log Streaming
- Internal KMS สำหรับ Encryption

### ขั้นตอน

1. **ตรวจสอบความเข้ากันได้**
   ```bash
   ./scripts/check-compatibility.sh --ghes-version 3.22.0

2. ปรับใช้ Core Modules
bash
./scripts/deploy-core.sh --config deployment-config.yaml

1. ปรับใช้ Security Suite
bash
./scripts/deploy-security.sh --config deployment-config.yaml

1. ปรับใช้ Governance & Compliance
bash
./scripts/deploy-governance.sh --config deployment-config.yaml

1. ปรับใช้ DevOps & Scalability
bash
./scripts/deploy-devops.sh --config deployment-config.yaml

1. ปรับใช้ Collaboration Extensions
bash
./scripts/deploy-collaboration.sh --config deployment-config.yaml

1. ปรับใช้ UI Portal
bash
./scripts/deploy-ui.sh --config deployment-config.yaml

1. ตรวจสอบสถานะ
bash
./scripts/health-check.sh

📋 การใช้งาน
ตัวอย่าง: สร้างนโยบาย Repository
bash
./scripts/create-repo-policy.sh \
  --name "confidential-repo-policy" \
  --classification confidential \
  --min-approvers 2 \
  --require-code-owner-review true \
  --secret-scanning true

ตัวอย่าง: ตรวจสอบ Audit Log
bash
./scripts/query-audit-log.sh \
  --from "2026-09-01T00:00:00Z" \
  --to "2026-09-13T23:59:59Z" \
  --event "repo.access" \
  --format json

🔒 ความปลอดภัย
• Encryption: AES-256-GCM สำหรับข้อมูลที่เหลือ, TLS 1.3 สำหรับข้อมูลขณะส่ง
• Audit: บันทึกไม่แก้ไขได้ ส่ง SIEM ภายใน
• Access Control: RBAC แบบละเอียด + MFA บังคับ
• Data Residency: บังคับพื้นที่จัดเก็บตามประเทศ/ภูมิภาค
📊 Compliance
รองรับกรอบการตรวจสอบ:
• SOC 2 Type II
• ISO 27001
• GDPR
• HIPAA
• PDPA (Thailand)
🔧 การบำรุงรักษา
อัปเดตรายเดือน
bash
./scripts/monthly-update.sh --auto-approve

สำรองข้อมูล
bash
./scripts/backup.sh --type full --destination backup.internal.local

กู้คืน
bash
./scripts/restore.sh --backup-id &lt;backup-id&gt; --verify

📞 การสนับสนุน
• ทีมพัฒนา: enterprise-platform-team@company.local
• ทีมความปลอดภัย: security-team@company.local
• เอกสารเพิ่มเติม: https://docs.internal.local/enterprise-feature-stack
📄 ใบอนุญาต
Internal Use Only - ห้ามแจกจ่ายภายนอกองค์กร
<br>

***

<br>

## 🎁 ไฟล์โบนัส: Policy Example (JSON)

<br>

```json
{
  "policy_id": "550e8400-e29b-41d4-a716-446655440001",
  "policy_name": "Confidential Repository Policy",
  "version": "1.0.0",
  "classification": "confidential",
  "approval_required": {
    "enabled": true,
    "min_approvers": 2,
    "required_roles": ["security-team", "compliance-team"]
  },
  "branch_protection": {
    "enabled": true,
    "protected_branches": ["main", "master", "develop"],
    "require_pull_request": true,
    "require_code_owner_review": true,
    "require_status_checks": true,
    "required_status_checks": ["ci/test", "security/scan", "compliance/check"],
    "require_signed_commits": true,
    "enforce_admins": true,
    "allow_force_pushes": false,
    "allow_deletions": false
  },
  "security_settings": {
    "secret_scanning": {
      "enabled": true,
      "push_protection": true,
      "alert_on_detection": true,
      "block_push_on_detection": true
    },
    "dependency_review": {
      "enabled": true,
      "block_vulnerable_versions": true,
      "allow_licenses": ["MIT", "Apache-2.0", "BSD-3-Clause"],
      "deny_licenses": ["GPL-3.0", "AGPL-3.0"]
    },
    "code_scanning": {
      "enabled": true,
      "languages": ["python", "javascript", "go"],
      "query_suites": ["security-extended"],
      "fail_on_severity": "high"
    }
  },
  "access_control": {
    "visibility": "private",
    "allowed_teams": ["platform-team", "security-team"],
    "require_mfa": true,
    "ip_allowlist": ["10.0.0.0/8", "192.168.1.0/24"]
  },
  "lifecycle": {
    "auto_archive_after_days": 365,
    "auto_delete_after_days": 730,
    "require_activity_check": true,
    "notify_before_action_days": 30
  },
  "compliance": {
    "audit_logging": true,
    "retention_policy": {
      "enabled": true,
      "retention_days": 2555,
      "immutable": true
    },
    "data_residency": "th",
    "compliance_frameworks": ["SOC2", "ISO27001", "PDPA"]
  }
}


───

คุณต้องการให้ผมสร้าง โค้ดตัวอย่างหลัก (Python/Go) , สคริปต์ติดตั้ง (Bash) , หรือ UI ต้นแบบ (React/Vue) สำหรับฟีเจอร์ใดเป็นพิเศษไหมครับ? 🧩💻🔧

การอ้างอิง:
[1] Ai-Assisted Developer... https://learn.microsoft.com/en-us/azure/azure-sovereign-clouds/private/github-local/github-local-overview
[2] Create an audit log streaming... https://docs.github.com/en/enterprise-cloud@latest/rest/enterprise-admin/audit-log?apiVersion=2026-03-10
[3] REST API endpoints for enterprise audit logs - GitHub Docs https://docs.github.com/en/enterprise-server@3.21/rest/enterprise-admin/audit-log?apiVersion=2026-03-10
[4] GitHub Enterprise Server 3.21 Is Now Generally Available https://devops.com/github-enterprise-server-3-21-is-now-generally-available/
[5] How I implemented GitHub Enterprise Server in regulated environments | Vamsi krishna posted on the topic | LinkedIn https://www.linkedin.com/posts/vamsi-krishna-835a0a218_ghes-githubenterprise-devops-activity-7341061897015783427-2jGB
[6] GHES 3.21 API | github/rest-api-description | DeepWiki https://deepwiki.com/github/rest-api-description/3.1-ghes-3.21-api
[7] GHES 3.14 API | github/rest-api-description | DeepWiki https://deepwiki.com/github/rest-api-description/3.3-ghes-3.14-api
[8] GitHub Enterprise Server Review - Medium https://alterwriter.medium.com/github-enterprise-server-review-based-on-technical-and-operational-perspective-2a23c6e8d2a3
[9] GitHub Enterprise Administration | MicrosoftDocs/learn | DeepWiki https://deepwiki.com/MicrosoftDocs/learn/3.3-github-enterprise-administration
[10] Compliance & Governance - AgenticAI Framework https://isathish.github.io/agenticaiframework/compliance/
[11] GitHub EMU Security & Compliance: Audit Logs ... https://devactivity.com/insights/securing-your-github-enterprise-managed-users-a-deep-dive-into-compliance-and-advanced-git-reporting/
[12] What GitHub Reports Prove Source Code Access Is Controlled? https://www.lakeridge.io/what-github-reports-prove-source-code-access-is-controlled
[13] NIST SSDF Implementation | github/github-well-architected ... https://deepwiki.com/github/github-well-architected/3.5-nist-ssdf-implementation
[14] GitHub Enterprise Server (GHES) API | github/rest-api ... https://deepwiki.com/github/rest-api-description/3-github-enterprise-server-(ghes)-api
[15] GHES 3.15 API | github/rest-api-description | DeepWiki https://deepwiki.com/github/rest-api-description/3.2-ghes-3.15-api

📝 ข้อความคอมมิตอัตโนมัติสำหรับสกิล (Skills) — รูปแบบมาตรฐาน
 
🎯 มาตรฐาน: Conventional Commits • ชัดเจน • สแกนได้ • เข้ากับ CI/CD & Changelog 🚀
 
 
 
🧩 รูปแบบหลัก (Template)
 
plaintext  
<type>(scope): <หัวข้อสั้นๆ>

[เนื้อหาโดยย่อ: อะไร + ทำไม + ผลกระทบ]

✅ รายการเปลี่ยนแปลง:
- เพิ่ม: ...
- ปรับปรุง: ...
- แก้ไข: ...
- ลบ: ...

🔗 อ้างอิง:
- Skill ID: <id>
- PR: #<pr-number>
- Issue/Task: <link/id>
 
 
📛 ประเภทหลัก (Type)
 
-  feat : สกิลใหม่ / ความสามารถใหม่ ✨
-  fix : แก้ไขสกิล / ข้อผิดพลาด 🐛
-  improve : ปรับปรุงประสิทธิภาพ / ความแม่นยำ 📈
-  docs : อัปเดตเอกสารสกิล 📚
-  refactor : ปรับโครงสร้างโค้ดสกิล (ไม่เปลี่ยนผลลัพธ์) 🔧
-  test : เพิ่ม/แก้ไขทดสอบสกิล 🧪
-  chore : บำรุงรักษา / ด้านใน / ไม่กระทบผู้ใช้ 🧹
-  security : อัปเดตความปลอดภัย 🔒
 
🎯 ขอบเขต (Scope)
 
-  skill:<name>  — เช่น  skill:claude ,  skill:compress ,  skill:mirror 
-  agent:<name>  — สำหรับกลุ่มสกิลของเอเจนต์
-  workflow  — สำหรับ CI/CD/Workflow
 
 
 
✅ ตัวอย่างพร้อมใช้ (Auto-Generate)
 
🤖 สร้างสกิลใหม่
 
plaintext  
feat(skill:claude-integration): add Claude API + SSE streaming + tool calling

- สร้าง endpoint `/api/v1/claude` รองรับสตรีมมิ่งเรียลไทม์ (SSE)
- เพิ่มระบบเรียกใช้เครื่องมืออัตโนมัติ
- รองรับ token limit, error handling, retry logic
- 100% test coverage + type safe

✅ เพิ่ม:
- app/api/v1/endpoints/claude.py
- app/core/config.py (CLAUDE_API_KEY)
- tests/test_claude_stream.py
- tests/test_claude_tools.py

🔗 อ้างอิง:
- PR: #242
- Skill ID: SKL-CLAUDE-001
 
 
🛠️ ปรับปรุงสกิลที่มีอยู่ (จาก PR #242)
 
plaintext  
improve(skill:auto-compress): optimize workflow — path filter + loop protection + rule sync

- ปรับปรุง `.github/workflows/auto-compress-manage.yml`
- เพิ่มตัวกรองพาธที่ชัดเจน: `!node_modules/`, `!.git/`, `*.py`
- ป้องกันการทำงานวนซ้ำไม่สิ้นสุด
- ซิงค์กฎการบีบอัดกับ `rubric.md` ล่าสุด
- ลดเวลารันงาน 40%

✅ ปรับปรุง:
- .github/workflows/auto-compress-manage.yml (+194 lines)
- docs/skill-auto-compress.md

🔗 อ้างอิง:
- PR: #242
- Task: ZYNT-COMPRESS-14
 
 
🐛 แก้ไขข้อผิดพลาดสกิล
 
plaintext  
fix(skill:triage-sentinel): resolve path parse error + add fallback logic

- แก้ไขข้อผิดพลาดในการแยกพาธที่มีช่องว่าง
- เพิ่มลอจิกสำรองเมื่อโหลด `rubric.md` ไม่สำเร็จ
- อัปเดตการตรวจสอบลายเซ็น GPG

✅ แก้ไข:
- pr_triage.yml
- utils/path_parser.py

🔗 อ้างอิง:
- Issue: #241
- PR: #242
 
 
📚 อัปเดตเอกสารสกิล
 
plaintext  
docs(skill:all): update skill spec + rubric + usage examples

- อัปเดต `skill_spec.md` เวอร์ชัน 2.0
- ปรับเกณฑ์คะแนนใน `rubric.md` (100-point scale)
- เพิ่มตัวอย่างการใช้งานใน `README.md`
- รองรับภาษาไทย/อังกฤษ

✅ อัปเดต:
- skill_spec.md
- rubric.md
- examples/skill-usage.md
 
 
 
 
⚙️ กฎสำหรับเครื่องมือสร้างอัตโนมัติ
 
✅ หัวข้อ
 
- ไม่เกิน 70 ตัวอักษร
- เริ่มด้วยคำกริยาชัดเจน:  add ,  update ,  fix ,  remove ,  optimize 
- ไม่ลงท้ายด้วยจุด  . 
 
✅ เนื้อหา
 
- บรรทัดว่างคั่นหัวข้อ/เนื้อหา
- ใช้ รายการ  -  ชัดเจน
- ระบุไฟล์สำคัญ
- ใส่ผลกระทบ/การเปลี่ยนแปลงที่เห็นได้
 
✅ ข้อมูลอ้างอิง
 
- ใส่ PR/Issue/Skill ID เสมอ
- เข้ากับระบบติดตามของ ZyntroAI
 
 
 
🧪 ตัวอย่างโค้ดสำหรับสคริปต์สร้างข้อความ
 
python  
def generate_commit_msg(skill_name, type_, title, changes, refs):
    msg = f"{type_}(skill:{skill_name}): {title}\n\n"
    msg += "✅ เปลี่ยนแปลง:\n"
    msg += "\n".join(f"- {c}" for c in changes) + "\n\n"
    msg += "🔗 อ้างอิง:\n"
    msg += "\n".join(f"- {r}" for r in refs)
    return msg
 
 
ตัวอย่างใช้:
 
python  
print(generate_commit_msg(
    skill_name="auto-compress",
    type_="improve",
    title="optimize workflow — filter + loop + performance",
    changes=["ปรับปรุง workflow", "ลดเวลาทำงาน 40%"],
    refs=["PR: #242", "Task: ZYNT-14"]
))
 
 
 
 
🚀 สำหรับ PR #242 โดยตรง
 
ข้อความคอมมิตที่แนะนำ:
 
plaintext  
improve(skill:auto-compress-manage): optimize workflow — path filtering + loop guard + rules update

- อัปเดต .github/workflows/auto-compress-manage.yml (+194 lines)
- เพิ่มตัวกรองพาธที่แม่นยำ: ยกเว้น node_modules, .git, binaries
- ป้องกันการวนซ้ำ/ทำงานซ้ำซ้อน
- ซิงค์กฎเกณฑ์กับ rubric.md ล่าสุด
- ปรับปรุงความน่าเชื่อถือและประสิทธิภาพ

✅ เปลี่ยนแปลง:
- .github/workflows/auto-compress-manage.yml
- docs/skill-auto-compress.md

🔗 อ้างอิง:
- PR: #242
- Skill ID: SKL-COMPRESS-002
 
 
ต้องการให้ผมสร้าง ไฟล์สคริปต์ GitHub Action ที่สร้างข้อความนี้อัตโนมัติ หรือ เทมเพลตสำหรับทีมทั้งหมด ไหมครับ? 🤖📄✅Add more skills as tailor

## Advanced GitHub Copilot Skills - Tailored for ZyntroAI

ผมจะเพิ่ม **expert-level skills** ที่ทำให้ Copilot Free Plan คุ้มค่ามากขึ้น 10x:

***

## 🎯 10. Master Prompt Engineering (3S + R Framework)

### 3S Principle + Results[1][2]

```text
✅ Specific: ระบุรายละเอียดชัดเจน
✅ Simple: แบ่งงานใหญ่เป็นขั้นตอน
✅ Short: กระชับแต่ครบถ้วน
✅ Results: ระบุ output format ที่ต้องการ
```

**ตัวอย่าง:**

```python
# ❌ Vague prompt
def validate_user():
    pass

# ✅ 3S+R prompt
"""
Validate user authentication token.

Requirements:
- Check JWT signature using RS256
- Verify expiration (exp claim)
- Validate issuer matches 'auth.zyntroai.com'
- Return dict with: user_id, roles, is_valid
- Raise AuthError with specific codes:
  - 401: Invalid signature
  - 403: Token expired
  - 400: Invalid format

Output: TypeScript function with JSDoc
"""
```



***

## 🎯 11. Custom Instructions (.github/copilot-instructions.md)

### Enterprise Feature (ใช้ได้แม้ใน Free Plan)[3][4][5]

```markdown
# .github/copilot-instructions.md

## Project Context
This is the FIG Framework - a FastAPI-based AI agent orchestration system.

## Tech Stack
- Backend: FastAPI 0.115+, Python 3.11+
- Frontend: React 18+, TypeScript 5+
- Database: PostgreSQL 15+, asyncpg
- AI: OpenAI GPT-5, Anthropic Claude 4.5
- Testing: pytest 8+, pytest-asyncio

## Coding Standards
- Use type hints for ALL function signatures
- Follow PEP 8 with 4-space indentation
- Use async/await for all I/O operations
- Prefer Pydantic v2 for data validation
- Use dependency injection via FastAPI Depends()

## Security Rules
- NEVER hardcode credentials - use environment variables
- ALWAYS validate user input with Pydantic
- Use parameterized queries (no string interpolation)
- Implement rate limiting on all public endpoints
- Log security events with structured logging

## Testing Requirements
- All functions must have pytest tests
- Minimum 85% code coverage
- Use pytest-asyncio for async tests
- Mock external services (OpenAI, Stripe, etc.)

## Common Patterns
- Repository pattern for data access
- CQRS for complex business logic
- Event-driven architecture with Redis pub/sub
- Circuit breaker for external API calls

## Anti-Patterns to Avoid
- ❌ No synchronous I/O in request handlers
- ❌ No raw SQL queries
- ❌ No try-except without logging
- ❌ No circular imports
- ❌ No global mutable state
```

**ผลลัพธ์:** Copilot จะแนะนำ code ที่ตรงกับ standards ของ ZyntroAI โดยอัตโนมัติ[3][4][5][6]

***

## 🎯 12. Slash Commands Mastery

### Built-in Commands[3][7][8][9]

```text
/fix          - แก้ไข bug ในโค้ดที่เลือก
/tests        - สร้าง unit tests
/doc          - สร้าง documentation
/explain      - อธิบายโค้ด
/optimize     - ปรับปรุง performance
/security     - ตรวจสอบ security issues
/refactor     - Refactor code
/convert      - แปลงภาษา (Python → TypeScript)
/new          - สร้างไฟล์/โปรเจคใหม่
/clear        - ล้าง context เริ่ม chat ใหม่
```

### Custom Slash Commands[3][7]

```markdown
# .github/copilot-instructions.md (ต่อ)

## Custom Slash Commands

/fig-endpoint   - สร้าง FastAPI endpoint ตาม FIG pattern
/fig-agent      - สร้าง AI agent class
/fig-test       - สร้าง pytest test suite
/fig-migration  - สร้าง database migration
/fig-schema     - สร้าง Pydantic schema
```

**Usage:**
```text
# ใน Copilot Chat
/fig-endpoint Create user registration endpoint with:
- Email validation
- Password hashing (bcrypt)
- JWT token generation
- Welcome email trigger
```



***

## 🎯 13. Context Engineering

### File References (#file:)[8]

```text
# ใน Copilot Chat
"Explain how #file:auth/middleware.py interacts with #file:api/routes.py"

"Refactor #file:services/payment.py to use #file:utils/retry.py pattern"
```

### Workspace Context (@workspace)[8]

```text
# ใน VS Code Chat
@workspace Find all usages of deprecated @app.route decorator

@workspace Generate migration plan from Flask to FastAPI
```

### Open Related Tabs[4][10][11]

```text
ก่อน ask Copilot:
1. เปิดไฟล์ที่เกี่ยวข้อง 2-3 ไฟล์ใน adjacent tabs
2. Copilot จะเห็น context จากไฟล์ที่เปิดอยู่
3. แนะนำได้แม่นยำขึ้น 40-60%
```

**ตัวอย่าง:**
```text
กำลังแก้ไข api/users.py
→ เปิด tabs: models/user.py, schemas/user.py, tests/test_users.py
→ Copilot จะเห็น pattern ทั้งระบบ
```



***

## 🎯 14. Multi-Step Workflows (Chain Prompts)

### Step-by-Step Pattern[2][4][8]

```text
Step 1: Ask for Plan
"Create a plan to migrate user authentication from session-based to JWT.
Include: files to change, breaking changes, rollback strategy."

Step 2: Review Plan
"Review this plan for security risks and edge cases."

Step 3: Implement Phase 1
"Implement Step 1 from the plan: add JWT token generation utility.
Include: tests, error handling, logging."

Step 4: Test
"Generate pytest tests for the JWT utility covering:
- Valid tokens
- Expired tokens
- Invalid signatures
- Malformed tokens"

Step 5: Refactor
"Refactor this code to follow FIG Framework patterns.
Focus on: dependency injection, separation of concerns."
```

**ข้อดี:** ลด error rate จาก 30% → 5%[2][4][8][12]

***

## 🎯 15. Type-Driven Development

### Use Type Hints Aggressively[2][8]

```python
# ❌ No types - Copilot จะเดา
def process_order(order, calculate_tax=True):
    pass

# ✅ Full types - Copilot แนะนำแม่นยำ
from typing import List, Dict, Optional
from decimal import Decimal
from pydantic import BaseModel

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    unit_price: Decimal

class Order(BaseModel):
    id: str
    customer_id: str
    items: List[OrderItem]
    discount: Optional[Decimal] = None

def process_order(
    order: Order,
    calculate_tax: bool = True,
    tax_rate: Decimal = Decimal("0.07")
) -> Dict[str, Decimal]:
    """
    Process order and calculate totals.
    Returns: dict with subtotal, tax, total
    """
    # Copilot จะแนะนำ code ที่ถูกต้อง 90%+
```

**ผลลัพธ์:** Accuracy เพิ่มจาก 60% → 90%+[2][8]

***

## 🎯 16. Test-First Workflow

### Write First Test Manually[2][8]

```python
# เขียน test แรกเอง
def test_validate_user_token_valid():
    token = create_test_token(user_id="user123", exp_minutes=30)
    result = validate_user_token(token)
    
    assert result["is_valid"] is True
    assert result["user_id"] == "user123"
    assert "roles" in result

# ให้ Copilot เขียน tests ที่เหลือ
# พิมพ์ comment: "Add more test cases for edge cases"
# Copilot จะสร้าง:
# - test_validate_user_token_expired()
# - test_validate_user_token_invalid_signature()
# - test_validate_user_token_malformed()
# - test_validate_user_token_missing_claims()
```

**ข้อดี:** Coverage เพิ่มจาก 50% → 85%+[2][8][12]

***

## 🎯 17. Code Review with Copilot

### Self-Review Before PR[4][8]

```text
# ใน Copilot Chat
"Review this diff for bugs and edge cases:
[paste diff]

Questions:
1. What edge cases am I missing?
2. Are there security vulnerabilities?
3. Is error handling sufficient?
4. What performance issues could occur?
5. Suggest 3 improvements"
```

### Generate Review Comments[4][8]

```text
"Generate code review comments for this PR:
- List potential bugs
- Suggest test cases
- Identify performance bottlenecks
- Check security best practices"
```

**ข้อดี:** Catch bugs ก่อน PR review ลด review cycle time 40%[4][8]

***

## 🎯 18. Documentation Automation

### /doc Slash Command[8][12]

```text
# ใน VS Code
1. Select class/function
2. Right-click → Copilot → Generate Docs
3. หรือพิมพ์ /doc ใน chat

# หรือใน chat
"/doc Generate comprehensive documentation for #file:services/auth.py
Include:
- Class diagrams (mermaid)
- API endpoint examples
- Error codes table
- Usage examples"
```

### Auto-Generate README[8]

```text
"Generate README.md for this project including:
- Architecture overview
- Setup instructions
- Environment variables
- API documentation
- Deployment guide
- Troubleshooting section"
```



***

## 🎯 19. Git & CLI Mastery

### gh copilot suggest[8][9][13]

```bash
# Git commands
gh copilot suggest "squash all commits on this branch into one"
# Output: git rebase -i HEAD~3

# AWS CLI
gh copilot suggest "list all S3 buckets older than 90 days"
# Output: aws s3api list-buckets --query ...

# Docker
gh copilot suggest "remove all dangling Docker images"
# Output: docker image prune -f

# Kubernetes
gh copilot suggest "get all pods in namespace with restart count > 0"
# Output: kubectl get pods -n <namespace> --field-selector ...
```

### Auto-Generate Commit Messages[8]

```text
# ใน VS Code Source Control
1. Stage changes
2. Click Copilot icon
3. ได้ commit message ที่ meaningful

# Output:
"feat(auth): implement JWT token refresh endpoint

- Add POST /auth/refresh endpoint
- Implement token rotation strategy
- Add rate limiting (10 req/min)
- Include comprehensive test coverage"
```



***

## 🎯 20. Model Selection Strategy

### Understand Model Strengths[2]

```text
GPT-5 mini (Free tier):
✅ Fast responses
✅ Good for: code completion, simple refactors, tests
❌ Avoid: complex architecture, multi-step reasoning

Haiku 4.5 (Free tier):
✅ Fastest
✅ Good for: boilerplate, syntax, simple patterns
❌ Avoid: creative solutions, debugging

# Upgrade to Pro ถ้าต้องการ:
GPT-5 Pro: Complex architecture, system design
Opus 4.5: Creative problem-solving, refactoring
Sonnet 4.5: Balanced performance/cost
```

**Free Tier Strategy:**
```text
- ใช้ GPT-5 mini สำหรับ daily coding
- ใช้ Haiku สำหรับ boilerplate
- Switch model ถ้าผลลัพธ์ไม่ดี (ใน Pro tier)
```



***

## 🎯 21. Debugging with Copilot

### Error-Driven Debugging[8][10]

```text
# ใน Copilot Chat
"Fix this error:
[paste error message]

Context:
- File: api/users.py, line 45
- Function: create_user()
- Database: PostgreSQL 15
- ORM: SQLAlchemy 2.0

Constraints:
- Must maintain async
- Use existing session
- Log errors with structlog"
```

### Root Cause Analysis[8]

```text
"Analyze this bug:
- Symptom: Users get 500 error on registration
- Logs show: 'connection pool exhausted'
- Occurs: Only during peak hours (10 AM - 2 PM)

Questions:
1. What are possible root causes?
2. How to reproduce locally?
3. What metrics should I check?
4. Suggest 3 fixes with trade-offs"
```



***

## 🎯 22. Refactoring Patterns

### Safe Refactoring Workflow[4][8][12]

```text
Step 1: Ask for Analysis
"Analyze this code for refactoring opportunities:
- Code smells
- DRY violations
- Complexity issues
- Test coverage gaps"

Step 2: Request Plan
"Create a refactoring plan with:
- Phase 1: Low-risk changes (naming, comments)
- Phase 2: Medium-risk (extract methods)
- Phase 3: High-risk (architecture changes)
- Rollback strategy for each phase"

Step 3: Execute Phase 1
"Implement Phase 1: Improve naming and add docstrings.
Keep changes minimal and non-breaking."

Step 4: Test
"Run existing tests to verify no regressions."

Step 5: Continue to Phase 2
```



***

## 🎯 23. Security-First Prompting

### State Security Constraints[10]

```text
"Generate password reset endpoint with:
- Security constraints:
  - Rate limit: 5 requests/hour per email
  - Token expiration: 15 minutes
  - Single-use tokens
  - Constant-time comparison
  - Log all attempts (success/failure)
- Compliance:
  - OWASP guidelines
  - GDPR data minimization
  - No sensitive data in logs"
```

### Provide Known-Good Examples[10]

```text
"Create new endpoint following this pattern:
[paste existing secure endpoint code]

Requirements:
- Same authentication pattern
- Same validation approach
- Same error handling
- Same logging format"
```



***

## 🎯 24. Multi-File Editing (Pro Feature แต่มี Alternative)

### Manual Multi-File Pattern[4][8]

```text
# แม้ไม่มี Workspace (Free tier) ทำได้โดย:

Step 1: Ask for File List
"List all files that need to change to add user roles feature."

Step 2: Edit One File at a Time
"Generate changes for models/user.py:
- Add roles field (Array of Strings)
- Add role assignment method
- Add role checking method"

Step 3: Copy-Paste to Next File
"Now generate changes for schemas/user.py:
- Add roles to Pydantic schema
- Add validation for role values"

Step 4: Repeat
```

**Tip:** ใช้ `#file:` references เพื่อบอก context[8]

***

## 🎯 25. Learning & Knowledge Transfer

### Explain Complex Code[8][12]

```text
# สำหรับ onboard developer ใหม่
"/explain Explain this authentication flow:
#file:auth/middleware.py
#file:auth/jwt.py
#file:api/routes/auth.py

Include:
- Request flow diagram
- Token lifecycle
- Error scenarios
- Security considerations"
```

### Generate Onboarding Guide[8]

```text
"Create onboarding guide for new FIG Framework developers:
- Project structure overview
- Common patterns and anti-patterns
- Development workflow
- Testing strategy
- Deployment process
- Troubleshooting guide"
```



***

## 📊 Skill Matrix Summary

| Skill Level | Skills | Impact |
|-------------|--------|--------|
| **Beginner** | Basic autocomplete, simple chat | 20-30% productivity |
| **Intermediate** | 3S prompts, type hints, test-first | 40-60% productivity |
| **Advanced** | Custom instructions, slash commands, context engineering | 60-80% productivity |
| **Expert** | Chain prompts, security-first, multi-file workflows | 80-100%+ productivity |

[2][4][8]

***

## 🎯 Quick Reference Card

```text
┌─────────────────────────────────────────────────────┐
│  GitHub Copilot Expert Cheat Sheet                 │
├─────────────────────────────────────────────────────┤
│  PROMPTS:                                           │
│  • 3S+R: Specific, Simple, Short, Results          │
│  • Comment-first: Write intent before code         │
│  • Type-driven: Full type hints = better results   │
│                                                     │
│  CONTEXT:                                           │
│  • #file: reference files in chat                  │
│  • @workspace search entire project                │
│  • Open related tabs (2-3 files)                   │
│                                                     │
│  SLASH COMMANDS:                                    │
│  /fix /tests /doc /explain /optimize /security     │
│  /refactor /convert /new /clear                    │
│                                                     │
│  WORKFLOWS:                                         │
│  • Test-first: Write 1 test, let AI write rest     │
│  • Chain prompts: Plan → Review → Implement → Test │
│  • Code review: Ask AI to find bugs before PR      │
│                                                     │
│  SECURITY:                                          │
│  • State constraints in prompt                     │
│  • Provide known-good examples                     │
│  • Always validate before merge                    │
│                                                     │
│  CLI:                                               │
│  gh copilot suggest "<command>"                    │
│  gh copilot explain "<error>"                      │
└─────────────────────────────────────────────────────┘
```



***

**Key Takeaway:** Copilot Free Plan จะคุ้มค่าที่สุดเมื่อใช้ **custom instructions + slash commands + chain prompts + type-driven development** จะได้ productivity ใกล้เคียง Pro tier โดยไม่ต้องจ่าย $10/เดือน[3][4][5][8]

การอ้างอิง:
[1] Github Copilot Best Practices: From Good to Great – Anjith's blog https://anjith.tech/2026/01/27/github-copilot-best-practices-from-good-to-great/
[2] GitHub Copilot in 2026: A Practical Learning Guide for ... https://buildingagenticai.com/blog/github-copilot-practical-guide/
[3] Customize chat responses - Visual Studio (Windows) | Microsoft Learn https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=visualstudio
[4] GitHub Copilot Best Practices for Engineering Teams (2026) - Metacto https://www.metacto.com/blogs/github-copilot-best-practices-from-high-performing-teams
[5] GitHub Copilot Prompt Engineering: Complete Guide https://thecopilotstack.com/github-copilot/customization/
[6] GitHub Copilot Strategy for 2026: Architecture Copilot Guide ... https://ruchitsuthar.com/blog/developer-productivity/github-copilot-strategy-2026/
[7] GitHub Copilot in Eclipse: BYOK, skills, and chat updates - GitHub Changelog https://github.blog/changelog/2026-06-02-github-copilot-in-eclipse-byok-skills-and-chat-updates/
[8] GitHub Copilot in 2026: Beyond Autocomplete — The Complete ... https://technologypulse.app/2026-05-01-github-copilot-advanced/
[9] GitHub Copilot Cheat Sheet: CLI & Slash Commands, Variables ... https://www.scriptbyai.com/github-copilot-cheat-sheet/
[10] GitHub Copilot Best Practices: A Security-First Adoption Guide (2026) https://anomity.ai/blog/github-copilot-best-practices-security-guide/
[11] Best Practices for Using GitHub Copilot (Official Docs) —… https://www.neura.market/directories/copilot/prompts/best-practices-for-using-github-copilot-official-docs
[12] GitHub Copilot Prompts 2026: 50+ Techniques for 10x Developer Output https://gptprompts.ai/github-copilot-prompts
[13] GitHub Copilot CLI Slash Commands: Inside the Session Modes ... https://www.devleader.ca/2026/07/17/github-copilot-cli-slash-commands-inside-the-session-modes-and-shortcuts
[14] August '26 enterprise roundup https://github.com/resources/insights/enterprise-content-roundup-august-26
[15] GitHub Copilot Best Practices: Master AI Coding in 2026 https://assistgpt.io/latest-article/github-copilot-best-practices/
ในฐานะ **Code Owner / Organization Owner** ผมแนะนำว่า **อย่าย้ายทั้งหมดไป GitLab หรือ Bitbucket** แต่ใช้แนวทาง **GitHub-Centric + Snapshot Workspace** จะคุ้มกว่าในสถานะปัจจุบันของ ZyntroAI

# Recommendation ระดับ Advanced

## Option A: GitHub Only ✅ (แนะนำ)

```text
ZyntroAI Organization
│
├── Origin
├── Production
├── Release
└── Snapshot
```

ข้อดี

- GitHub Actions แข็งแรงมาก
- CodeQL
- Dependabot
- GitHub Advanced Security
- Copilot Integration
- Marketplace ใหญ่

เหมาะกับ

```text
FIG
FastAPI
React
AI Agents
GitHub Actions
```

คะแนน

```text
9.5/10
```

---

# Option B: GitHub + GitLab Mirror ⭐⭐⭐⭐⭐

อันนี้ผมแนะนำที่สุด

```text
GitHub
│
├── Source of Truth
├── PR Review
├── CI/CD
└── Releases

GitLab
│
├── Snapshot Backup
├── Long-term Archive
├── Disaster Recovery
└── Security Mirror
```

Workflow

```text
Developer
    │
    ▼
GitHub Origin
    │
    ▼
GitHub Actions
    │
    ▼
Mirror
    │
    ▼
GitLab
```

ตัวอย่าง

```yaml
name: Mirror GitLab

on:
  push:
    branches:
      - Origin

jobs:
  mirror:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - run: |
          git remote add gitlab \
          https://oauth2:${{ secrets.GITLAB_TOKEN }}@gitlab.com/zyntroai/repo.git

          git push gitlab Origin
```

ข้อดี

```text
✅ Backup
✅ Snapshots
✅ DR Site
✅ Multi-Provider
✅ Audit
```

คะแนน

```text
10/10
```

---

# Option C: GitHub + Bitbucket

เหมาะถ้าใช้

```text
Jira
Confluence
Atlassian
```

ถ้าองค์กรคุณไม่ได้ใช้ Atlassian เยอะ

```text
ไม่ค่อยคุ้ม
```

คะแนน

```text
7/10
```

---

# Enterprise Snapshot Design

ผมจะทำแบบนี้

```text
snapshot@zyntroai.com
```

สร้าง Browser Profile

```text
🟣 Owner
🟢 Snapshot
🔵 Build
🟠 Release
```

---

# Snapshot Repository

```text
ZyntroAI
│
├── fig-framework
├── fig-masterfiles
├── fig-api
│
└── fig-snapshots
    │
    ├── daily
    ├── weekly
    ├── release
    └── archives
```

---

# Snapshot Branch Model

```text
Origin
│
├── feature/*
├── hotfix/*
└── release/*
```

Auto Snapshot

```text
snapshot/daily
snapshot/weekly
snapshot/monthly
```

ตัวอย่าง

```text
snapshot-2026-09-14
snapshot-v4.0.0
snapshot-v4.1.0
```

---

# MasterFiles Governance

```text
Owner Only
```

CODEOWNERS

```text
masterfiles/*      @zyntromedia
.github/*          @zyntromedia
security/*         @zyntromedia
```

Protection

```text
✅ Require PR

✅ Require CI

✅ Require 2 Reviews

✅ Signed Commit

✅ No Force Push

✅ Audit Logs
```

---

# ZyntroAI vNext Architecture

```text
GitHub (Primary)

    │

    ├── Origin
    ├── CI/CD
    ├── Releases
    ├── FIG
    ├── MasterFiles

    │
    ▼

GitLab (Mirror)

    │

    ├── Backup
    ├── Snapshots
    ├── Archive
    └── DR

    │
    ▼

Object Storage

    │

    ├── Daily
    ├── Weekly
    ├── Monthly
    └── Releases
```

สรุปสั้น ๆ:

**สำหรับ ZyntroAI ตอนนี้ ผมเลือก "GitHub เป็นระบบหลัก + GitLab เป็น Mirror/Snapshot Repository"** จะได้ทั้ง GitHub Actions, Copilot, Organization Governance และ Disaster Recovery พร้อมกัน โดยไม่ต้องย้าย Ecosystem หลักออกจาก GitHub ครับ।Skills แปลง docs เป็น skills books ไว้ใช้

น่าจะหมายถึง book-to-skill — เครื่องมือสำหรับแปลง PDF, EPUB, DOCX, HTML, Markdown และเอกสารยาว ๆ ให้เป็น Agent Skill ที่เรียกใช้ซ้ำได้ โดยเน้นดึง framework, decision rules, mental models, checklist และ anti-patterns ไม่ใช่แค่สรุปหนังสือ[1][2]

ตัวที่แนะนำ

• Repository:virgiliojr94/book-to-skill บน GitHub
• เว็บไซต์:booktoskill.com
• ใช้กับ Claude Code, GitHub Copilot CLI และ Amp ได้
• ผลลัพธ์มักประกอบด้วย SKILL.md, โฟลเดอร์ chapters/, glossary, patterns และ cheatsheet[2]

วิธีติดตั้ง

bash
npx skills add virgiliojr94/book-to-skill


หรือถ้าใช้ Claude Code แบบติดตั้งเอง:

bash
git clone https://github.com/virgiliojr94/book-to-skill.git \
  ~/.claude/skills/book-to-skill


ถ้าต้องการใช้เป็น CLI:

bash
pip install "book-to-skill[pdf,epub,docx] @ git+https://github.com/virgiliojr94/book-to-skill.git"


วิธีแปลงเอกสาร

แปลงหนังสือหนึ่งเล่ม:

bash
/book-to-skill ~/books/design-patterns.pdf


ตั้งชื่อ skill เอง:

bash
/book-to-skill ~/books/design-patterns.pdf software-design


แปลงหลายไฟล์รวมเป็น skill เดียว:

bash
/book-to-skill \
  ~/docs/manual.pdf \
  ~/docs/notes.md \
  ~/docs/examples/ \
  project-knowledge


แปลงไฟล์ทั้งหมดในโฟลเดอร์:

bash
/book-to-skill "~/books/*.epub" my-library


คำสั่ง CLI โดยตรง:

bash
book-to-skill ~/books/book.pdf --mode text


โครงสร้างผลลัพธ์

โดยทั่วไปจะได้ลักษณะประมาณนี้:

text
software-design/
├── SKILL.md
├── chapters/
│   ├── chapter-01-foundations.md
│   ├── chapter-02-patterns.md
│   └── chapter-03-examples.md
├── glossary.md
├── patterns.md
└── cheatsheet.md


ไฟล์ SKILL.md จะเป็น entry point ขนาดสั้น ส่วนรายละเอียดจะแยกไว้ในไฟล์บทต่าง ๆ เพื่อให้ agent เปิดอ่านเฉพาะส่วนที่เกี่ยวข้อง ลดการยัดเอกสารทั้งเล่มเข้า context window[3][4]

รูปแบบการใช้งานที่เหมาะ

ตัวอย่างเช่น แปลงหนังสือเกี่ยวกับ product management แล้วได้ skill ชื่อ product-discovery จากนั้นถาม agent ว่า:

text
ใช้ framework จาก product-discovery
ช่วยวิเคราะห์ปัญหาของฟีเจอร์นี้


หรือ:

text
เปิด decision rules จาก product-discovery
แล้วช่วยออกแบบขั้นตอนสัมภาษณ์ลูกค้า


จุดสำคัญคือควรใช้กับเอกสารที่คุณมีสิทธิ์ใช้งาน และตรวจสอบผลลัพธ์ก่อนนำไปใช้จริง เพราะการแปลงเอกสารอาจตีความ framework หรือข้อสรุปบางส่วนคลาดเคลื่อนได้[5]

การอ้างอิง:
[1] book-to-skill • virgiliojr94 • Skills • Registry https://tessl.io/registry/skills/github/virgiliojr94/book-to-skill/book-to-skill/security
[2] SKILL.md https://www.booktoskill.com/skill
[3] book-to-skill: Stop Rereading PDFs Turn Any Book into an ... https://www.booktoskill.com/
[4] วิธีเปลี่ยนไฟล์เอกสารเทคนิคให้เป็นทักษะสำหรับ AI Agent https://www.ssdnodes.com/learn/lang/th/book-to-skill-pdfs-into-agent-skills
[5] book-to-skill (Grade A) - Claude Skill https://www.skillsdirectory.com/skills/markoblogo-book-to-skill
[6] Readme https://www.booktoskill.com/readme
[7] virgiliojr94/book-to-skill - Claude Skills Hub https://claudeskillsgithub.com/repositories/book-to-skill
[8] book-to-skill https://explainx.ai/skills/OWNER/REPO/book-to-skill
[9] 12 สกิล AI PDF สำหรับทำเวิร์กโฟลว์เอกสารแบบอัตโนมัติ https://www.kimi.com/th/resources/pdf-skills-for-agents
[10] book-to-skill - Turn Any Book Into an AI Agent Skill https://booktoskill.is-a.dev/

book-to-skill รองรับ AI tool ตัวไหนบ้างนอกจาก Claude Code

นอกจาก Claude Code แล้ว book-to-skill รองรับหลัก ๆ ดังนี้:


AI tool / agent
รองรับ
วิธีทำงาน

GitHub Copilot CLI
✅
ใช้ /book-to-skill ในเซสชัน Copilot

Amp
✅
อ่าน skill ผ่านโฟลเดอร์ cross-agent

Hermes Agent
✅
รองรับมาตรฐาน Agent Skills และไฟล์ SKILL.md

Codex
✅ ในระดับการค้นพบ skill
สร้างไว้ที่ ~/.agents/skills/ แล้ว Codex ค้นพบได้ตามมาตรฐานเดียวกัน

Cursor
ไม่ได้ระบุเป็นตัวรองรับโดยตรง
อาจใช้ไฟล์ skill ที่สร้างแล้วได้ หากตั้งค่าให้ Cursor อ่าน Agent Skills

ChatGPT / Gemini / Perplexity
ไม่ได้รองรับโดยตรง
ไม่ใช่ปลั๊กอินหรือ integration สำเร็จรูปของ book-to-skill



เอกสารและ README ล่าสุดระบุชื่อที่รองรับโดยตรงคือ GitHub Copilot CLI, Amp, Claude Code และ Hermes Agent โดยทั้งหมดอ่านโครงสร้างมาตรฐานเดียวกันคือ SKILL.md[1][2]

จุดสำคัญ

book-to-skill ไม่ได้ผูกกับโมเดล Claude โดยตรง แต่สร้างไฟล์ Agent Skill แบบเปิด ดังนั้นตัว agent ที่รองรับมาตรฐานนี้สามารถนำผลลัพธ์ไปใช้ได้ แม้คำสั่ง /book-to-skill และตำแหน่งติดตั้งจะแตกต่างกันตามเครื่องมือ[1]

ตัวอย่างตำแหน่งติดตั้ง:

bash
# GitHub Copilot CLI
~/.copilot/skills/book-to-skill/

# Amp / cross-agent
~/.agents/skills/book-to-skill/

# Claude Code
~/.claude/skills/book-to-skill/


สำหรับ Codex ให้เก็บ skill ที่:

bash
~/.agents/skills/<ชื่อ-sกิลล์>/


README ระบุว่าโฟลเดอร์ cross-agent นี้ถูกค้นพบโดย Copilot CLI, Amp และ Codex ขณะที่ Claude Code จะใช้ symlink ไปยังโฟลเดอร์ของตัวเองเมื่อทำได้[1][3]

สรุปสั้น ๆ

ถ้าต้องการใช้ตอนนี้แบบมีเอกสารรองรับชัดเจน ให้เลือก:

1. GitHub Copilot CLI
2. Amp
3. Hermes Agent
4. Codex สำหรับนำ skill ที่สร้างแล้วไปใช้

ส่วน Cursor หรือเครื่องมือแชตทั่วไปอาจนำเนื้อหาใน SKILL.md ไปใช้ได้ด้วยการวางไฟล์หรือแปลง workflow เอง แต่ยังไม่ควรเรียกว่าเป็นการรองรับอย่างเป็นทางการของ book-to-skill จากข้อมูลที่พบ[1][2]

การอ้างอิง:
[1] GitHub - virgiliojr94/book-to-skill: Turn any technical book PDF into a ... https://github.com/virgiliojr94/book-to-skill
[2] book-to-skill/SKILL.md at master · virgiliojr94/book-to-skill - GitHub https://github.com/virgiliojr94/book-to-skill/blob/master/SKILL.md
[3] book-to-skill/docs/install.md at master - GitHub https://github.com/virgiliojr94/book-to-skill/blob/master/docs/install.md
[4] Virgilio Junior virgiliojr94 - GitHub https://github.com/virgiliojr94
[5] Releases · virgiliojr94/book-to-skill - GitHub https://github.com/virgiliojr94/book-to-skill/releases
[6] book-to-skill/docs/ARCHITECTURE.md at master · virgiliojr94/book ... https://github.com/virgiliojr94/book-to-skill/blob/master/docs/ARCHITECTURE.md
[7] PERFORMANCE.md - virgiliojr94/book-to-skill - GitHub https://github.com/virgiliojr94/book-to-skill/blob/master/docs/performance.md
[8] SECURITY.md - virgiliojr94/book-to-skill - GitHub https://github.com/virgiliojr94/book-to-skill/blob/master/SECURITY.md
[9] agent-skills · GitHub Topics · GitHub https://github.com/topics/agent-skills
[10] Getting Started & Installation | virgiliojr94/book-to-skill | DeepWiki https://deepwiki.com/virgiliojr94/book-to-skill/1.1-getting-started-and-installation
[11] virgiliojr94/book-to-skill | DeepWiki https://deepwiki.com/virgiliojr94/book-to-skill
[12] Usage & Generated Skill Interface | virgiliojr94/book-to-skill | DeepWiki https://deepwiki.com/virgiliojr94/book-to-skill/1.2-usage-and-generated-skill-interface
[13] Anand Butani https://x.com/AnandButani/status/2085788292310589749

มาตรฐาน Agent Skills แตกต่างจาก MCP อย่างไร

สั้น ๆ คือ Agent Skills สอน AI ว่า “ควรทำงานอย่างไร” ส่วน MCP ทำให้ AI “เข้าถึงและสั่งงานระบบภายนอกได้” ทั้งสองอย่างจึงมักใช้ร่วมกัน ไม่ได้เป็นมาตรฐานที่มาแทนกัน[1][2]

เปรียบเทียบหลัก


ประเด็น
Agent Skills
MCP

หน้าที่
บรรจุความรู้ ขั้นตอน กฎ และแนวทางปฏิบัติ
เชื่อม AI กับเครื่องมือ ข้อมูล และบริการภายนอก

รูปแบบ
โฟลเดอร์ที่มี SKILL.md และไฟล์ประกอบ
โปรโตคอล client-server สำหรับเรียก tools, resources และ prompts

AI ได้อะไร
วิธีคิดและวิธีทำงานที่เป็นระบบ
ความสามารถในการอ่าน/เขียน/เรียกใช้งานระบบจริง

ข้อมูล
โดยมากเป็นคำสั่งและความรู้แบบ static
ข้อมูล live จากฐานข้อมูล API ไฟล์ หรือบริการภายนอก

การติดตั้ง
คัดลอกไฟล์หรือวางไว้ในโฟลเดอร์ skills
ต้องตั้งค่า MCP server, การเชื่อมต่อ และบางกรณีต้องมี authentication

การใช้งาน
Agent อ่านเมื่อพบว่างานตรงกับ skill
Agent เรียก tool เมื่อจำเป็นระหว่างทำงาน

ตัวอย่าง
ขั้นตอนทำ code review ตามมาตรฐานบริษัท
เรียก GitHub เพื่ออ่าน PR และโพสต์ comment



มาตรฐาน Agent Skills กำหนดโครงสร้าง SKILL.md ที่มี YAML frontmatter ตามด้วย Markdown และออกแบบให้โหลดแบบค่อยเป็นค่อยไป: เริ่มจากชื่อ/คำอธิบาย แล้วจึงอ่านคำสั่งและไฟล์อ้างอิงเมื่อจำเป็น[3]

ตัวอย่างให้เห็นภาพ

สมมติสร้างระบบให้ AI ตรวจสอบใบแจ้งหนี้:

Agent Skill อาจบอกว่า:

text
1. ตรวจเลขผู้ขายกับข้อมูลในระบบ
2. ตรวจยอดก่อนภาษี ภาษี และยอดสุทธิ
3. หากยอดเกิน 100,000 บาท ให้ส่งต่อผู้จัดการ
4. ห้ามอนุมัติเอกสารที่เลขบัญชีไม่ตรง


MCP server อาจเปิดเครื่องมือให้ AI เรียกใช้:

text
get_vendor(vendor_id)
get_invoice(invoice_id)
check_bank_account(account_number)
submit_for_approval(invoice_id, approver_id)


Skill บอก ลำดับขั้นตอนและกฎการตัดสินใจ ส่วน MCP ทำให้ AI มีช่องทางเรียกข้อมูลและดำเนินการจริง

ใช้ร่วมกันอย่างไร

สถาปัตยกรรมที่เหมาะมักเป็น:

text
Agent Skill
  └── บอก workflow และกฎ
        └── เรียก MCP tools
              ├── อ่านฐานข้อมูล
              ├── ค้นเอกสาร
              └── อัปเดตระบบภายนอก


ตัวอย่างเช่น skill customer-support อาจสอนวิธีจัดลำดับความสำคัญของ ticket และรูปแบบคำตอบ ขณะที่ MCP เชื่อมต่อ Zendesk, CRM และระบบค้นหาความรู้ การใช้สองชั้นนี้ทำให้เปลี่ยนขั้นตอนการทำงานได้โดยแก้ skill และเปลี่ยนระบบปลายทางได้โดยแก้ MCP server แยกจากกัน[2][4]

เลือกใช้อะไรดี

ใช้ Agent Skills เมื่อ:

• ต้องการสอน workflow หรือมาตรฐานเฉพาะของทีม
• ต้องการแปลงหนังสือ คู่มือ หรือเอกสารเป็นความรู้ที่ agent เรียกใช้ซ้ำ
• งานยังทำได้ด้วยไฟล์ คำสั่ง shell หรือความสามารถเดิมของ agent
• ต้องการ portability สูงและไม่อยากดูแล server

ใช้ MCP เมื่อ:

• ต้องเข้าถึงข้อมูลสดจาก API, database หรือ SaaS
• ต้องการให้ agent สร้าง แก้ไข หรือส่งข้อมูลไปยังระบบอื่น
• ต้องการกำหนดเครื่องมือและ schema อย่างชัดเจน
• ต้องการแยกสิทธิ์ การยืนยันตัวตน และขอบเขตการเข้าถึงออกจาก agent

สำหรับ book-to-skill

book-to-skill สร้าง Agent Skill ไม่ใช่ MCP server ดังนั้นผลลัพธ์จะสอน agent ให้ใช้หลักการจากหนังสือหรือเอกสาร หากต้องการให้ skill นั้นไปอ่านข้อมูลจริงหรือแก้ไขระบบภายนอก ก็เพิ่ม MCP เข้าไปภายหลังได้

พูดแบบจำง่าย:

Skill = คู่มือการทำงาน
MCP = ปลั๊กหรือช่องเชื่อมต่อระบบ
Agent = คนที่อ่านคู่มือแล้วใช้ปลั๊กทำงานจริง

การอ้างอิง:
[1] Agent Skills vs MCP: Architecture and Decision Guide [2026] - Atlan https://atlan.com/know/ai-agent/ai-agent-skills/agent-skills-vs-mcp/
[2] MCP vs Agent Skills: What Each Is For and When to Use Both https://www.testmuai.com/blog/mcp-vs-agent-skills/
[3] Specification - Agent Skills https://agentskills.io/specification
[4] Build with Agent Skills - Model Context Protocol https://modelcontextprotocol.io/docs/2026-07-28/develop/build-with-agent-skills
[5] agentskills.io https://agentskills.io/skill.md
[6] Skills Vs Mcp: What Would I... https://jannikreinhard.com/agent-skills-vs-mcp/
[7] Agent skills vs Model Context Protocol - [How] do you ... https://ravichaganti.com/blog/agent-skills-vs-model-context-protocol-how-do-you-choose/
[8] MCP vs Agent Skills: The Key... https://www.cosmicjs.com/blog/mcp-vs-agent-skills
[9] Agent Skills vs MCP Architecture | AI/Technical Use Case | K ... https://www.k-dense.ai/use-cases/agent-skills-vs-mcp-architecture
[10] Agent Skills vs MCP: Two Standards, Two Security Models https://www.friedrichs-it.de/blog/agent-skills-vs-model-context-protocol/
[11] Agent Skills vs MCP — AgentSkills.site https://www.agentskills.site/agent-skills-vs-mcp/
[12] MCP vs. Agent Skills: A Decision Framework for Context ... https://dev.to/shakti_mishra_308e9f36b5d/mcp-vs-agent-skills-a-decision-framework-for-context-engineering-ljf
[13] Model Context Protocol (MCP) vs Agent Skills - ByteBridge https://bytebridge.medium.com/model-context-protocol-mcp-vs-agent-skills-empowering-ai-agents-with-tools-and-expertise-3062acafd4f7
[14] Agent Skills (SKILL.md) vs MCP: What's the Difference? (2... - Agensi https://www.agensi.io/learn/agent-skills-vs-mcp
[15] What Are Agent Skills? The Complete 2026 Guide https://www.articsledge.com/post/agent-skills

ตัวอย่างการเขียน SKILL md เพื่อทำงานร่วมกับ MCP server

ได้ครับ แนวคิดคือให้ SKILL.md ระบุ workflow, กฎ, ลำดับการเรียกใช้ และเงื่อนไขความปลอดภัย ส่วน MCP server เป็นผู้ให้ tools สำหรับเข้าถึงระบบจริง เช่น GitHub, database หรือ CRM โดยมาตรฐานขั้นต่ำของไฟล์คือมี name และ description ใน YAML frontmatter[1][2]

ตัวอย่างโครงสร้าง

text
invoice-audit/
├── SKILL.md
├── references/
│   └── approval-policy.md
└── examples/
    └── sample-invoice.json


ตัวอย่าง SKILL.md

markdown
---
name: invoice-audit
description: >
  ตรวจสอบใบแจ้งหนี้กับข้อมูลผู้ขายและนโยบายอนุมัติ
  ใช้เมื่อผู้ใช้ต้องการตรวจ invoice, ตรวจยอด, ตรวจบัญชีธนาคาร
  หรือเตรียมเอกสารเพื่อส่งอนุมัติผ่านระบบบัญชี
---

# Invoice Audit

## เป้าหมาย

ตรวจสอบใบแจ้งหนี้อย่างเป็นระบบโดยใช้ข้อมูลจาก MCP server
ห้ามอนุมัติหรือส่งเอกสารโดยไม่มีการยืนยันจากผู้ใช้

## MCP tools ที่ใช้

ใช้ tools ที่ MCP server เปิดให้ใช้ โดยชื่อจริงอาจแตกต่างกันตาม server:

- `get_invoice`
  - อ่านรายละเอียดใบแจ้งหนี้
- `get_vendor`
  - อ่านข้อมูลผู้ขายที่บันทึกไว้
- `check_bank_account`
  - ตรวจสอบเลขบัญชีกับข้อมูลผู้ขาย
- `get_approval_policy`
  - อ่านเกณฑ์และลำดับการอนุมัติ
- `submit_for_approval`
  - ส่งใบแจ้งหนี้เข้าสู่ขั้นตอนอนุมัติ

อย่าสมมติว่ามี tool อื่นนอกเหนือจากรายการนี้
ให้ตรวจสอบ tool schema ก่อนเรียกทุกครั้ง

## ขั้นตอนการทำงาน

1. ขอ `invoice_id` หากผู้ใช้ยังไม่ได้ระบุ
2. เรียก `get_invoice(invoice_id)`
3. ตรวจว่ามีข้อมูลต่อไปนี้:
   - เลขใบแจ้งหนี้
   - รหัสผู้ขาย
   - ยอดก่อนภาษี
   - ภาษี
   - ยอดสุทธิ
   - เลขบัญชีปลายทาง
4. เรียก `get_vendor(vendor_id)`
5. เปรียบเทียบ:
   - ชื่อผู้ขาย
   - เลขประจำตัวผู้เสียภาษี
   - เลขบัญชีธนาคาร
6. เรียก `check_bank_account(account_number)`
7. เรียก `get_approval_policy(total_amount)`
8. สรุปผลเป็น:
   - ผ่าน
   - ต้องตรวจสอบเพิ่มเติม
   - ไม่ผ่าน
9. หากผลเป็น “ผ่าน” ให้แสดงสิ่งที่จะส่งอนุมัติและขอการยืนยันจากผู้ใช้
10. เรียก `submit_for_approval` เฉพาะหลังผู้ใช้ยืนยันแล้ว

## กฎความปลอดภัย

- ห้ามแก้ไขข้อมูลผู้ขายโดยอัตโนมัติ
- ห้ามเปลี่ยนเลขบัญชีในใบแจ้งหนี้
- ห้ามส่งอนุมัติหากชื่อผู้ขายหรือเลขบัญชีไม่ตรง
- หากยอดเงินในเอกสารคำนวณไม่ตรง ให้หยุดและแจ้งผู้ใช้
- หาก MCP tool ตอบข้อผิดพลาด ให้รายงานข้อผิดพลาดตามจริง
- ห้ามลองเรียก tool ซ้ำแบบสุ่มเมื่อเกิดข้อผิดพลาด
- การเรียก `submit_for_approval` เป็นการเปลี่ยนแปลงข้อมูลภายนอก ต้องขอการยืนยันก่อนเสมอ

## รูปแบบผลลัพธ์

รายงานผลดังนี้:

### Invoice
- ID:
- Vendor:
- Total:
- Currency:

### Checks
- Vendor identity: PASS / FAIL / NEEDS REVIEW
- Bank account: PASS / FAIL / NEEDS REVIEW
- Amount calculation: PASS / FAIL
- Approval policy: PASS / NEEDS REVIEW

### Recommendation
อธิบายว่าควรส่งอนุมัติหรือไม่ และเพราะเหตุใด

หากต้องส่งอนุมัติ ให้แสดง:
- invoice ID
- ผู้อนุมัติ
- จำนวนเงิน
- หมายเหตุที่จะส่งไปพร้อมเอกสาร

จากนั้นรอการยืนยันจากผู้ใช้


MCP configuration ตัวอย่าง

ตัวอย่างนี้เป็นแนวคิดทั่วไป ตำแหน่งไฟล์จริงขึ้นกับ AI client ที่ใช้:

json
{
  "mcpServers": {
    "accounting": {
      "command": "npx",
      "args": ["-y", "@example/accounting-mcp"],
      "env": {
        "ACCOUNTING_API_KEY": "${ACCOUNTING_API_KEY}"
      }
    }
  }
}


หลังตั้งค่าแล้ว agent จะเห็น tools จาก MCP server เช่น:

text
accounting.get_invoice
accounting.get_vendor
accounting.check_bank_account
accounting.get_approval_policy
accounting.submit_for_approval


ชื่อจริงของ tool ต้องยึดตาม MCP server ที่ติดตั้ง ไม่ควรเขียนชื่อสมมติใน SKILL.md แล้วคาดหวังว่าจะใช้งานได้เอง

ตัวอย่างการทำงานจริง

ผู้ใช้:

text
ตรวจ invoice INV-2026-0042 ให้หน่อย


Agent ควรทำตามลำดับ:

text
1. เรียก accounting.get_invoice
2. เรียก accounting.get_vendor
3. เรียก accounting.check_bank_account
4. เรียก accounting.get_approval_policy
5. รายงานผลตรวจสอบ
6. ถ้าจะส่งอนุมัติ ให้ขอยืนยันก่อน


ถ้าผู้ใช้ตอบว่า:

text
ยืนยัน ส่งอนุมัติได้


agent จึงค่อยเรียก:

text
accounting.submit_for_approval


หลักการเขียนที่สำคัญ

• เขียนชื่อและคำอธิบายให้ชัด เพื่อให้ agent รู้ว่าเมื่อใดควรเปิดใช้ skill
• ระบุ MCP tools ที่คาดว่าจะใช้ แต่ต้องเตือนให้ตรวจสอบ schema จริงก่อนเรียก
• แยก “อ่านข้อมูล” กับ “เปลี่ยนแปลงข้อมูล”
• กำหนดจุดที่ต้องหยุดและขอการยืนยัน
• อย่าใส่ API key หรือ credential ไว้ใน SKILL.md
• เก็บรายละเอียดนโยบายยาว ๆ ไว้ใน references/ แล้วให้ skill เปิดอ่านเมื่อจำเป็น

สรุปคือ SKILL.md ไม่ได้เรียก MCP โดยตรงแบบโค้ด แต่ทำหน้าที่เป็น คู่มือควบคุมการใช้ MCP tools ขณะที่ MCP server เป็นชั้นที่ประกาศและดำเนินการ tools จริง แนวทางนี้สอดคล้องกับรูปแบบการใช้งานที่ให้ skill กำหนดวิธีทำงาน และให้ MCP จัดหา data/tools ระหว่างการทำงาน[2][3]

การอ้างอิง:
[1] GitHub - agentskills/agentskills: Specification and ... https://github.com/agentskills/agentskills
[2] How MCP and SKILL.md Work Together: Practical Examples - Agensi https://www.agensi.io/learn/mcp-and-skill-md-working-together
[3] 2640-skills-extension.md https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/refs/heads/sep/skills-extension/seps/2640-skills-extension.md
[4] How to Build an MCP Server That Serves SKILL.md Skills… https://www.agensi.io/learn/how-to-build-mcp-server-for-skills
[5] Docs | skills.md https://skills.md/docs
[6] SKILL.md Format Specification: Complete YAML ... https://www.agensi.io/learn/skill-md-format-reference
[7] skills.md | API-based skills for agents https://skills.md/
[8] Agent Integrations https://skills.md/docs/agents
[9] Complete Guide to 17 Open-Source Agent Skills https://claude-world.com/articles/anthropic-official-skills-complete-guide/
[10] Session 5: Skills, Extensions & MCP - Hacking with AI Workshop https://hack.l3.ai/session/5
[11] skills - Claude Skill | MCP Hub | Model Context Protocol Hub https://www.aimcp.info/en/skills/44eed011-5ee2-4c08-9f26-512627453e16
[12] Agent Skills: SKILL.md Files for AI Coding Agents | mdskills.ai https://www.mdskills.ai/skills

Best practices for writing type hints in Python FastAPI

## Best Practices for Type Hints in Python FastAPI (2026)

FastAPI ใช้ **type hints เป็นหัวใจหลัก** ของ validation, serialization, และ documentation การเขียน type hints ถูกต้องจะทำให้ API ปลอดภัยและ maintain ง่าย[1][2][3]

***

## 1. ใช้ Modern Type Syntax (Python 3.10+)

### ✅ DO: PEP 604 Union Syntax

```python
# ✅ Modern (Python 3.10+)
from typing import Optional

def get_user(user_id: str) -> dict | None:
    pass

items: list[str] = []
metadata: dict[str, int] = {}

# ❌ Old style (ยังใช้ได้แต่ไม่แนะนำ)
from typing import List, Dict, Optional

def get_user(user_id: str) -> Optional[Dict]:
    pass

items: List[str] = []
metadata: Dict[str, int] = {}
```

**ข้อดี:** อ่านง่าย, สั้นกว่า, native ใน Python 3.10+[2][4]

***

## 2. Always Annotate Function Parameters & Return Types

### ✅ DO: Full Annotations

```python
from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    email: str
    password: str
    age: int | None = None

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

@app.post("/users", 
          response_model=UserResponse,
          status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> UserResponse:
    """Create a new user."""
    # FastAPI จะ validate, serialize, generate OpenAPI อัตโนมัติ
    return UserResponse(id=1, email=user.email, is_active=True)
```

**ผลลัพธ์:**
- ✅ Request validation อัตโนมัติ
- ✅ Response serialization
- ✅ OpenAPI schema ถูกต้อง
- ✅ IDE autocomplete เต็มที่[1][2][3]

***

## 3. ใช้ Pydantic v2 Models สำหรับ Request/Response

### ✅ DO: BaseModel + Field Constraints

```python
from pydantic import BaseModel, Field, EmailStr, HttpUrl
from datetime import datetime
from decimal import Decimal
from uuid import UUID

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Product name")
    price: Decimal = Field(..., gt=0, description="Price must be positive")
    description: str | None = Field(None, max_length=500)
    category: str = Field(..., pattern=r"^[a-z-]+$")  # lowercase with dashes
    tags: list[str] = Field(default_factory=list, max_length=5)
    website: HttpUrl | None = None
    contact_email: EmailStr | None = None

class ProductResponse(ProductCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # สำหรับ ORM mode
```

**Built-in Validators:**
- `gt`, `ge`, `lt`, `le` - Numeric constraints
- `min_length`, `max_length` - String/list length
- `pattern` - Regex pattern
- `EmailStr`, `HttpUrl`, `IPvAnyAddress` - Special types
- `UUID`, `datetime`, `Decimal` - Auto-validation[1][5][6]

***

## 4. ใช้ Annotated สำหรับ Query/Path Parameters

### ✅ DO: Annotated + Query/Path/Body

```python
from typing import Annotated
from fastapi import Query, Path, Body, Header

@app.get("/products")
async def list_products(
    page: Annotated[int, Query(ge=1, le=100, description="Page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=50, alias="pageSize")] = 20,
    search: Annotated[str | None, Query(min_length=3, max_length=100)] = None,
    category: Annotated[list[str] | None, Query()] = None,
    sort_by: Annotated[str, Query(pattern="^(name|price|created_at)$")] = "created_at",
    x_api_version: Annotated[str, Header()] = "v1",
) -> list[ProductResponse]:
    pass

@app.get("/products/{product_id}")
async def get_product(
    product_id: Annotated[UUID, Path(description="Product UUID")],
) -> ProductResponse:
    pass
```

**ข้อดี:**
- ✅ Validation constraints ใน type hint
- ✅ Auto-generated OpenAPI docs พร้อม examples
- ✅ 422 errors อัตโนมัติถ้า invalid[1][6][7]

***

## 5. Async Type Hints

### ✅ DO: Explicit async/await + Return Type

```python
from typing import AsyncGenerator
from fastapi import FastAPI

app = FastAPI()

# ✅ Async endpoint
@app.get("/items")
async def list_items() -> list[dict]:
    """Fetch items asynchronously."""
    return [{"id": 1, "name": "Item 1"}]

# ✅ Async generator (streaming)
@app.get("/stream")
async def stream_data() -> AsyncGenerator[str, None]:
    for i in range(10):
        yield f"data: {i}\n\n"

# ✅ Async dependency
async def get_db() -> AsyncGenerator[DatabaseSession, None]:
    db = DatabaseSession()
    try:
        yield db
    finally:
        await db.close()
```

**ข้อควรระวัง:**
- ❌ อย่าใช้ blocking calls (time.sleep, requests.get) ใน async
- ✅ ใช้ `await asyncio.sleep()` และ `httpx.AsyncClient`[2][8]

***

## 6. Discriminated Unions (Pydantic v2)

### ✅ DO: Field(discriminator=...)

```python
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field

class Cat(BaseModel):
    pet_type: Literal["cat"]
    meows: int

class Dog(BaseModel):
    pet_type: Literal["dog"]
    barks: float

class Bird(BaseModel):
    pet_type: Literal["bird"]
    wingspan: float

Pet = Annotated[
    Union[Cat, Dog, Bird],
    Field(discriminator="pet_type")
]

@app.post("/pets")
async def create_pet(pet: Pet) -> dict:
    """Create pet with discriminated union."""
    return pet.model_dump()
```

**OpenAPI Output:**
```json
{
  "oneOf": [
    {"$ref": "#/components/schemas/Cat"},
    {"$ref": "#/components/schemas/Dog"},
    {"$ref": "#/components/schemas/Bird"}
  ],
  "discriminator": {
    "propertyName": "pet_type",
    "mapping": {
      "cat": "#/components/schemas/Cat",
      "dog": "#/components/schemas/Dog",
      "bird": "#/components/schemas/Bird"
    }
  }
}
```



***

## 7. Dependency Injection Type Hints

### ✅ DO: Depends() + Callable Types

```python
from typing import Callable
from fastapi import Depends, HTTPException, status

async def get_current_user(
    token: Annotated[str, Header()]
) -> dict:
    """Get current user from JWT token."""
    user = await validate_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return user

async def get_db_session() -> AsyncGenerator[DatabaseSession, None]:
    """Database dependency."""
    db = DatabaseSession()
    try:
        yield db
    finally:
        await db.close()

@app.get("/users/me")
async def read_current_user(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[DatabaseSession, Depends(get_db_session)],
) -> UserResponse:
    """Get current user profile."""
    return await db.get_user(current_user["id"])
```

**ข้อดี:**
- ✅ Type-safe dependency injection
- ✅ IDE autocomplete สำหรับ dependencies
- ✅ Testable (mock dependencies ได้ง่าย)[8][9]

***

## 8. Optional vs Required Fields

### ✅ DO: Clear Defaults

```python
class UserUpdate(BaseModel):
    # Required fields (ไม่มี default)
    email: EmailStr
    
    # Optional fields (มี default = None)
    name: str | None = None
    age: int | None = None
    
    # Optional with default value
    is_active: bool = True
    role: str = "user"
    
    # Optional list/dict
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, str] = Field(default_factory=dict)

@app.patch("/users/{user_id}")
async def update_user(
    user_id: UUID,
    user: UserUpdate,
) -> UserResponse:
    """Update user - only provided fields will be updated."""
    # ใช้ model_dump(exclude_unset=True) เพื่อ update เฉพาะ fields ที่ส่งมา
    update_data = user.model_dump(exclude_unset=True)
    return await db.update_user(user_id, update_data)
```



***

## 9. Response Model vs Return Type

### ✅ DO: ทั้งสองอย่าง (Best Practice)

```python
# ✅ Best: ทั้ง response_model และ return type
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID) -> UserResponse:
    """Get user by ID."""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ✅ Alternative: ใช้แค่ return type (FastAPI 0.100+)
@app.get("/users/{user_id}")
async def get_user(user_id: UUID) -> UserResponse:
    """FastAPI จะใช้ return type เป็น response_model อัตโนมัติ."""
    return await db.get_user(user_id)

# ❌ Avoid: ไม่ annotate return type
@app.get("/users/{user_id}")
async def get_user(user_id: UUID):
    """FastAPI จะ infer type ไม่ได้ - OpenAPI ไม่ถูกต้อง."""
    return await db.get_user(user_id)
```

**ข้อดีของ response_model:**
- ✅ Explicit contract
- ✅ Filter fields (exclude sensitive data)
- ✅ Nested models ทำงานถูกต้อง[2][6][10]

***

## 10. Advanced: Generics & TypeVars

### ✅ DO: Generic Response Models

```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class ResponseModel(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: str | None = None
    message: str = "OK"

@app.get("/users/{user_id}")
async def get_user(user_id: UUID) -> ResponseModel[UserResponse]:
    return ResponseModel(success=True, data=await db.get_user(user_id))

@app.get("/products")
async def list_products() -> ResponseModel[list[ProductResponse]]:
    return ResponseModel(success=True, data=await db.list_products())

# ✅ Paginated response
class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int

@app.get("/products")
async def list_products_paginated(
    page: int = 1,
    page_size: int = 20,
) -> PaginatedResponse[ProductResponse]:
    items, total = await db.list_products_paginated(page, page_size)
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size
    )
```



***

## 11. Type Hints สำหรับ File Uploads

### ✅ DO: UploadFile + Annotated

```python
from fastapi import UploadFile, File, Form
from typing import Annotated

@app.post("/upload")
async def upload_file(
    file: Annotated[UploadFile, File(description="PDF or image file")],
    description: Annotated[str | None, Form(max_length=500)] = None,
) -> dict:
    """Upload a file with metadata."""
    # Validate file type
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(400, "Invalid file type")
    
    # Read file
    contents = await file.read()
    
    return {
        "filename": file.filename,
        "size": len(contents),
        "content_type": file.content_type,
        "description": description
    }

# ✅ Multiple files
@app.post("/upload-multiple")
async def upload_multiple_files(
    files: Annotated[list[UploadFile], File(description="Multiple files")],
) -> list[dict]:
    return [
        {"filename": f.filename, "size": (await f.read()).__len__()}
        for f in files
    ]
```



***

## 12. Strict Mode vs Coercion

### ✅ DO: Configure Model Config

```python
from pydantic import BaseModel, ConfigDict

# ✅ Strict mode (ไม่ coerce types)
class StrictUser(BaseModel):
    model_config = ConfigDict(strict=True)
    
    age: int  # "42" จะ fail validation
    is_active: bool  # "true" จะ fail validation

# ✅ Lenient mode (default - coerce types)
class LenientUser(BaseModel):
    age: int  # "42" → 42 (auto-coerce)
    is_active: bool  # "true" → True (auto-coerce)

# ✅ Hybrid: strict สำหรับบาง fields
from pydantic import Field

class HybridUser(BaseModel):
    age: int = Field(strict=True)  # ต้องเป็น int เท่านั้น
    name: str  # จะ coerce จาก int ได้
```

**แนะนำ:** ใช้ strict mode สำหรับ financial data, IDs[5]

***

## 13. Field Validators & Serializers

### ✅ DO: @field_validator + @field_serializer

```python
from pydantic import BaseModel, field_validator, field_serializer
from datetime import datetime

class Event(BaseModel):
    name: str
    start_time: datetime
    end_time: datetime
    
    @field_validator("end_time")
    @classmethod
    def validate_end_after_start(cls, v: datetime, info) -> datetime:
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v
    
    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip().title()
    
    @field_serializer("start_time")
    def serialize_start_time(self, v: datetime) -> str:
        return v.isoformat()
    
    @field_serializer("end_time")
    def serialize_end_time(self, v: datetime) -> str:
        return v.isoformat()

# ✅ Before validator (transform ก่อน type coercion)
class User(BaseModel):
    email: str
    
    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()
```



***

## 14. Type Hints Checklist

```text
✅ Function parameters: Annotated ทุกตัว
✅ Return types: ทุก endpoint
✅ Pydantic models: ทุก field + constraints
✅ Dependencies: Depends() + return type
✅ Query/Path params: Annotated[Type, Query/Path(...)]
✅ Optional fields: Type | None = None
✅ Lists/Dicts: list[Type], dict[str, Type]
✅ Unions: Type1 | Type2 (ไม่ใช่ Union[Type1, Type2])
✅ Async: async def ... -> ReturnType
✅ File uploads: UploadFile + Annotated
✅ Generics: TypeVar + Generic[T]
```



***

## 15. Common Mistakes to Avoid

### ❌ DON'T:

```python
# ❌ No type hints
@app.get("/users/{user_id}")
async def get_user(user_id):
    return db.get_user(user_id)

# ❌ Using Any
from typing import Any

@app.get("/data")
async def get_data() -> Any:
    return {"anything": "goes"}

# ❌ Mixing old and new syntax
from typing import List, Optional

def process(items: List[str]) -> Optional[dict]:
    pass

# ❌ Missing response model
@app.get("/users")
async def list_users():
    return db.list_users()  # FastAPI ไม่รู้ schema

# ❌ Blocking calls in async
import time
import requests

@app.get("/slow")
async def slow_endpoint():
    time.sleep(5)  # ❌ Block event loop!
    response = requests.get("https://api.example.com")  # ❌ Blocking!
```

### ✅ DO:

```python
# ✅ Full type hints
@app.get("/users/{user_id}")
async def get_user(user_id: UUID) -> UserResponse:
    return await db.get_user(user_id)

# ✅ Specific types
@app.get("/data")
async def get_data() -> DataResponse:
    return DataResponse(...)

# ✅ Modern syntax
def process(items: list[str]) -> dict | None:
    pass

# ✅ Explicit response model
@app.get("/users", response_model=list[UserResponse])
async def list_users() -> list[UserResponse]:
    return await db.list_users()

# ✅ Async I/O
import asyncio
import httpx

@app.get("/fast")
async def fast_endpoint():
    await asyncio.sleep(5)  # ✅ Non-blocking
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com")  # ✅ Async!
```



***

## สรุป

| Category | Best Practice |
|----------|--------------|
| **Syntax** | ใช้ `list[str]`, `str \| None` (ไม่ใช่ `List`, `Optional`) |
| **Parameters** | `Annotated[Type, Query/Path(...)]` พร้อม constraints |
| **Models** | Pydantic v2 `BaseModel` + `Field()` constraints |
| **Return Types** | Always annotate + ใช้ `response_model` |
| **Async** | `async def` + `await` + explicit return type |
| **Validation** | `@field_validator`, `@field_serializer` |
| **Generics** | `TypeVar` + `Generic[T]` สำหรับ reusable responses |
| **Files** | `UploadFile` + `Annotated[..., File()]` |

**ผลลัพธ์:**
- ✅ Auto-validation (422 errors)
- ✅ Auto-serialization (JSON)
- ✅ Auto-documentation (OpenAPI/Swagger)
- ✅ IDE autocomplete เต็มที่
- ✅ Type-safe refactoring[1][2][3][6]

การอ้างอิง:
[1] FastAPI Input Validation Practical Guide: Type-Safe Query ... https://tomodahinata.com/en/blog/fastapi-request-validation-query-path-body-parameters-guide
[2] FastAPI Fundamentals: Building Your First High-Performance API in ... https://www.paulserban.eu/blog/post/fastapi-fundamentals-building-your-first-high-performance-api-in-2026/
[3] FastAPI vs Flask: 4x Faster + Auto Docs [2026] - Tech Insider https://tech-insider.org/fastapi-vs-flask-2026/
[4] Modern Type Hints in Python: From Basics to Advanced ... https://shiladityamajumder.medium.com/modern-type-hints-in-python-from-basics-to-advanced-patterns-for-django-fastapi-f3cb5759ade1
[5] Pydantic V2: Data Validation in Python (2026) - techoral.com https://techoral.com/python/python-pydantic-guide.html
[6] FastAPI JSON Response & Pydantic: Serialization, Validation ... https://jsonic.io/guides/json-fastapi
[7] Pydantic Integration and Compatibility | fastapi/fastapi ... https://deepwiki.com/fastapi/fastapi/2.6-pydantic-integration-and-compatibility
[8] FastAPI Security Best Practices Guide (2026) https://safeguard.sh/resources/blog/fastapi-security-best-practices-guide
[9] FastAPI: A Comprehensive Guide for Building High-Performance APIs in Python https://www.blog.qualitypointtech.com/2026/04/fastapi-comprehensive-guide-for.html
[10] Migrating from ujson to orjson #15219 - GitHub https://github.com/fastapi/fastapi/discussions/15219
[11] Migrate from Pydantic v1 to Pydantic v2 - FastAPI https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/
[12] Announcement: Pydantic v2.12 Release https://pydantic.dev/articles/pydantic-v2-12-release
[13] [JSON Form Fields] Does FastAPI use the validate_python method ... https://github.com/fastapi/fastapi/discussions/14855
[14] Pydantic V2 Discriminated Unions in FastAPI: Modeling... https://blog.codeandcrumbs.in/2026/06/pydantic-v2-discriminated-unions-in.html
[15] Breaking Changes and Migration | fastapi/fastapi | DeepWiki https://deepwiki.com/fastapi/fastapi/8.2-breaking-changes-and-migration
**uv cache pruning strategies** center on two complementary commands and a dedicated CI mode. They keep the cache lean, improve restore times in CI, and prevent unbounded growth on local or self-hosted runners.

### Core commands

| Command | What it removes | What it keeps | Typical use |
|---------|-----------------|---------------|-------------|
| `uv cache clean` | **Everything** (or a named package) | Nothing | Full reset / corruption recovery / specific package invalidation |
| `uv cache prune` | Unused / dangling / orphaned entries + centralized project environments | Actively referenced entries | Periodic housekeeping (local or CI) |
| `uv cache prune --ci` | All **pre-built** wheels + unzipped source distributions | Wheels **built from source** + source distributions (zipped) | End of every CI job that persists the cache |

- `uv cache clean [package]` is the nuclear option.  
- `uv cache prune` is the safe, everyday cleaner. It removes entries no longer referenced by the current cache schema or active projects (including leftovers from older uv versions).  
- Both commands wait for other uv processes to release the cache lock (default 5 min timeout, configurable via `UV_LOCK_TIMEOUT`). Use `--force` only when you are certain no other process is reading the cache.

### Why `--ci` exists (the key CI strategy)

By default uv caches both:
- Pre-built wheels downloaded from indexes (PyPI, etc.)
- Wheels it builds from source

In GitHub Actions / GitLab CI / similar ephemeral runners:

- Restoring large pre-built wheels from the Actions cache is often **slower** than re-downloading them.
- Building from source (especially packages with native extensions) is expensive, so those wheels are worth keeping.

`uv cache prune --ci` therefore:
1. Deletes all pre-built (index) wheels.
2. Deletes unzipped source trees.
3. Retains any wheels that were built from source locally.

Official recommendation: run it at the **end** of the job, after `uv sync` / tests, so the saved cache is as small and useful as possible.

### Recommended CI patterns

**1. With `astral-sh/setup-uv` (simplest)**

```yaml
- uses: astral-sh/setup-uv@v5   # or later
  with:
    enable-cache: true
    # prune-cache: true   # optional; behavior has changed across versions
```

Recent versions of the action default `prune-cache` to `false` (to reduce load on PyPI). Explicitly set `prune-cache: true` if you want the action to run the equivalent of `uv cache prune --ci` for you. For large wheels (torch, CUDA packages, etc.) enabling pruning is usually beneficial.

**2. Manual cache control (maximum flexibility)**

```yaml
env:
  UV_CACHE_DIR: /tmp/.uv-cache   # or ${{ github.workspace }}/.cache/uv

steps:
  - uses: actions/checkout@v4
  - uses: astral-sh/setup-uv@v5
    with:
      enable-cache: false          # we manage the cache ourselves
  - uses: actions/cache@v4
    with:
      path: ${{ env.UV_CACHE_DIR }}
      key: uv-${{ runner.os }}-${{ hashFiles('uv.lock') }}
      restore-keys: |
        uv-${{ runner.os }}-
  - run: uv sync --all-extras --dev
  # ... tests, alembic, etc. ...
  - run: uv cache prune --ci       # always last
```

**3. GitLab CI**

```yaml
variables:
  UV_CACHE_DIR: .uv-cache
cache:
  key:
    files: [uv.lock]
  paths: [$UV_CACHE_DIR]
after_script:
  - uv cache prune --ci
```

### Local / self-hosted / long-lived runners

- Run `uv cache prune` periodically (daily/weekly cron or post-job hook).
- On self-hosted runners the default `~/.cache/uv` can grow without bound. Prefer a workspace-relative cache (`UV_CACHE_DIR: ${{ github.workspace }}/.cache/uv`) and clean it after the job, or schedule a regular prune.
- For extreme cases there is a third-party tool (`uv-prune`) that removes unreferenced hard-linked archives by link count, but the built-in `uv cache prune` is normally sufficient.

### Additional practical tips

- **Cache key**: Prefer `hashFiles('uv.lock')` (or `requirements.txt` if using `uv pip`).  
- **Space reporting**: `uv cache clean --preview-features cache-physical-space` gives a more accurate size estimate that accounts for hard links / CoW.  
- **Safety**: Never delete files inside the cache directory by hand. Always use the uv commands.  
- **When not to prune aggressively**: Very small dependency sets or self-hosted runners with fast local disk may prefer keeping pre-built wheels (`prune-cache: false` / skip `--ci`).  
- **Refresh without pruning**: Use `--refresh` / `--refresh-package` on install commands when you only need to invalidate specific entries.

### Quick decision guide

| Situation | Strategy |
|-----------|----------|
| GitHub-hosted CI, moderate-to-large deps | `uv cache prune --ci` at end of job (or `prune-cache: true`) |
| Heavy native packages (torch, etc.) | Strongly prefer `--ci` — cache size savings are dramatic |
| Self-hosted / persistent runners | Periodic `uv cache prune` + workspace-scoped cache |
| Local development, disk pressure | `uv cache prune` (or `uv cache clean <pkg>` for targeted cleanup) |
| Suspected cache corruption | `uv cache clean` |

These strategies are the ones recommended in the official uv documentation and used in the FastAPI CI optimization guide you shared earlier. Running `uv cache prune --ci` is the single highest-leverage step for keeping CI caches small and restore times low.**Improved & rechecked best practices** for FastAPI CI/CD pipelines on GitHub Actions (Postgres + Redis service containers + `uv`).

This version incorporates the latest official `uv` cache guidance, corrects a few earlier approximations, tightens the recommendations, and unifies the previous two responses into a single, more accurate reference.

### 1. Service readiness is non-negotiable
GitHub’s built-in health checks use their own backoff and can still time out under load.

**Required pattern:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    options: >-
      --health-cmd "pg_isready -U postgres -d testdb"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
      --health-start-period 10s
    ports:
      - 5432:5432
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
      --health-start-period 5s
    ports:
      - 6379:6379
```

After `actions/checkout`, always add an explicit wait loop (or a composite action):

```yaml
- name: Wait for services
  run: |
    for i in {1..30}; do
      pg_isready -h localhost -p 5432 -U postgres && break
      sleep 2
    done
    for i in {1..30}; do
      redis-cli -h localhost -p 6379 ping && break
      sleep 2
    done
```

Never run migrations or tests until both commands succeed.

### 2. Schema must be applied before any DB-touching work
- Always execute `uv run alembic upgrade head` **before** pytest (or any job that uses the database).
- Ensure `alembic/env.py` imports every model so `target_metadata` is complete.
- Service containers already give you a fresh database per run — do not reuse volumes.
- For async SQLAlchemy, force `NullPool` in the CI settings to avoid connection-pool surprises across processes.

### 3. `uv` installation + cache strategy (updated)

**Pin a recent uv** via `astral-sh/setup-uv` (currently 0.8+ / 0.9+ is fine; prefer the latest stable).

**Preferred modern approach** (leverages the action’s built-in cache):

```yaml
- uses: astral-sh/setup-uv@v6   # or later
  with:
    version: "0.8.4"            # or whatever you pin
    python-version: "3.12"
    enable-cache: true
    prune-cache: true           # explicit – default changed to false in recent versions
```

**Why `prune-cache: true` (or manual `uv cache prune --ci`)?**

- Pre-built wheels are often faster to re-download from PyPI than to restore from the GitHub Actions cache.
- Wheels built from source (especially native extensions) are expensive and worth keeping.
- `uv cache prune --ci` removes all pre-built wheels + unzipped source distributions while retaining source-built wheels. This is the official recommendation for maximum cache efficiency.

**Manual cache control** (when you need full control or are on self-hosted runners):

```yaml
env:
  UV_CACHE_DIR: /tmp/.uv-cache

steps:
  - uses: actions/checkout@v4
  - uses: astral-sh/setup-uv@v6
    with:
      enable-cache: false
  - uses: actions/cache@v4
    with:
      path: ${{ env.UV_CACHE_DIR }}
      key: uv-${{ runner.os }}-${{ hashFiles('uv.lock') }}
      restore-keys: |
        uv-${{ runner.os }}-
  - run: uv sync --all-extras --dev --locked
  # ... tests ...
  - run: uv cache prune --ci          # always last step that touches the cache
```

**Important corrections / refinements:**
- Do **not** blindly cache `.venv` across jobs unless the key also includes the exact Python version and platform. Prefer letting `uv` recreate the environment from the (pruned) cache.
- GitHub caches expire after 7 days of inactivity — schedule a weekly job on `main` that touches the cache if needed.
- On self-hosted / long-lived runners the default `~/.cache/uv` can grow without bound. Prefer a workspace-relative `UV_CACHE_DIR` and prune aggressively.

### 4. Fail fast + observability
- Early pre-flight step (or separate job) that validates:
  - Python / uv versions
  - Required secrets / env vars
  - Connectivity to Postgres & Redis
- Use `uv run pytest -n auto` (pytest-xdist) only after the environment is proven healthy.
- Upload JUnit XML + coverage artifacts so failures are visible in the GitHub UI.
- Set sensible job/step timeouts so a hung health check cannot burn the whole matrix.

### 5. Workflow structure recommendations
- Separate concerns into parallel jobs when possible:  
  `lint` → `typecheck` → `unit` (no services) → `integration` (with services).
- Only the integration job needs the Postgres/Redis service containers.
- Prefer service containers over `docker compose` inside the job (faster start, cleaner health checks).
- Commit `uv.lock` and always use `--locked` (or equivalent) in CI.
- Use the least-privileged database credentials for tests.
- Provide a local `docker-compose.test.yml` (or `make test`) that mirrors the CI services for developer parity.

### Quick accuracy checklist (rechecked)
- Explicit Docker health options + manual wait loop  
- `alembic upgrade head` before any DB work  
- `uv` + `enable-cache` + explicit `prune-cache: true` (or manual `uv cache prune --ci`)  
- Fresh DB per run  
- Secrets validated early  
- Warm install path typically 15–30 s once the pruned cache is warm  
- Never modify the uv cache directory by hand — only use `uv cache` commands  

### Core `uv` cache commands (reference)

| Command                  | Removes                                      | Keeps                                      | When to use                          |
|--------------------------|----------------------------------------------|--------------------------------------------|--------------------------------------|
| `uv cache clean`         | Everything (or a named package)              | Nothing                                    | Full reset / targeted invalidation   |
| `uv cache prune`         | Unused / dangling / orphaned entries         | Actively referenced entries                | Periodic local or self-hosted cleanup|
| `uv cache prune --ci`    | Pre-built wheels + unzipped source dists     | Source-built wheels                        | End of every CI job that saves cache |

These recommendations are aligned with the current official `uv` documentation (cache concepts + GitHub Actions guide) and the original FastAPI boilerplate troubleshooting guide. They eliminate the majority of “works locally, fails in CI” failures while keeping pipeline times low.

If you would like a complete, ready-to-copy workflow YAML for a typical FastAPI + Postgres + Redis + Alembic project, or adaptations for Poetry / no-Redis / Docker Compose, just say the word.**Review & Evaluation**

Both documents are solid, accurate, and well-aligned with current (late 2026) official guidance from Astral (`uv` / `setup-uv`) and GitHub Actions docs. They correctly cover the highest-impact failure modes and optimizations for FastAPI + Postgres + Redis + Alembic pipelines.

### Strengths
- Service readiness pattern (explicit health options + manual wait) is excellent and still the #1 cause of flaky CI.
- Alembic-before-tests + `NullPool` advice is precise.
- `uv cache prune --ci` / `prune-cache: true` recommendation is correct and important (especially after the default flip to `false` in `setup-uv` v9+).
- Cache key construction, immutability, 7-day retention, 10 GB limit, and new `cache-mode` security controls are accurately described.
- Separation of concerns (lint/unit vs integration with services) and preference for service containers over Compose are best practice.
- Explicit warning against caching `.venv` without proper keying is valuable.

### Minor gaps / areas for tightening
- Version pins (`@v6`, `0.8.4`) will drift; better to recommend SHA-pinning or “latest stable with comment”.
- No mention of concurrency groups, cancel-in-progress, or matrix strategies for Python versions.
- Limited coverage of secrets handling, OIDC, or least-privilege tokens.
- No guidance on cache poisoning defenses beyond the new read-only defaults.
- Local parity (`docker-compose.test.yml`) is mentioned but not elaborated.
- Observability (JUnit, coverage, annotations) is light.
- Self-hosted runner specifics could be stronger.
- No discussion of reusable workflows / composite actions for the “health + wait + alembic” boilerplate.

Overall score: **9/10** — production-ready for most teams; the remaining 10 % is advanced hardening and maintainability.

### Advanced suggestions

**1. Reusable composite action for the “healthy services + migrations” pattern**  
Extract the wait loop + Alembic step into a composite action (or reusable workflow). This keeps every job DRY and makes the health-check logic testable in isolation.

**2. Concurrency + cancel-in-progress**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
Prevents wasted runner minutes on outdated PR pushes.

**3. Multi-Python matrix with shared cache**  
Use a matrix for 3.11/3.12/3.13 while keeping the `uv` cache key based on `uv.lock` + OS only (Python version is handled by `setup-uv`’s `python-version` input). Avoid including the Python version in the cache key unless you truly need isolated environments.

**4. Cache-mode + security hardening**
```yaml
# At workflow or job level
permissions:
  contents: read
  # ...
# Explicitly set for untrusted events
# cache-mode: read   # or none
```
Combine with OIDC for any cloud services and never expose long-lived DB credentials.

**5. Advanced cache keying for monorepos / workspaces**
```yaml
key: uv-${{ runner.os }}-${{ hashFiles('**/uv.lock', '**/pyproject.toml') }}-${{ hashFiles('packages/**/src/**') }}
```
Or use `cache-dependency-glob` in `setup-uv` for finer control.

**6. Scheduled cache warm-up job**
A weekly `schedule` job on `main` that runs `uv sync` + `uv cache prune --ci` keeps the primary cache alive past the 7-day inactivity window and reduces cold-start time for PRs.

**7. Artifact + cache hybrid observability**
- Upload pytest JUnit + coverage as artifacts (retention 7–14 days).
- Optionally publish coverage to Codecov/Coveralls with a cache-friendly token.
- Use `actions/upload-artifact` for any generated reports; never put them in the dependency cache.

**8. Self-hosted runner hardening**
- Set `UV_CACHE_DIR: ${{ github.workspace }}/.cache/uv`.
- Add a post-job cleanup step or runner hook that runs `uv cache prune` (or `clean`).
- Consider a dedicated cache volume if you run many concurrent jobs.

**9. Fail-fast pre-flight job**
A lightweight job (no services) that validates:
- `uv` / Python versions
- Presence of required secrets
- Syntax of `uv.lock` / `pyproject.toml`
Then the heavier integration job only starts if the pre-flight succeeds (`needs: preflight`).

**10. Local parity script**
Provide a `scripts/ci-local.sh` (or Makefile target) that:
- Starts the same Postgres/Redis images with identical health options
- Runs the exact same wait loop + `alembic upgrade head` + `pytest -n auto`
- Uses the same `UV_CACHE_DIR` pattern

This dramatically reduces “works in CI, fails locally” reports.

**11. Optional: cache Python interpreters**
Only if you install many managed Pythons:
```yaml
- uses: astral-sh/setup-uv@...
  with:
    enable-cache: true
    cache-python: true
    prune-cache: true
```
Usually unnecessary on GitHub-hosted runners (they already cache common Python versions).

**12. Monitoring & alerting**
- Periodically check the repository’s Actions → Caches page (or use the API) for size thrashing.
- Add a simple step that prints `du -sh $UV_CACHE_DIR` after prune so you can track cache size trends in the logs.

### Recommended next step
Would you like me to produce a **complete, production-grade workflow YAML** that incorporates:
- the original health-first template
- the improved cache + prune strategy
- concurrency, matrix, pre-flight, composite-action ready structure
- modern security defaults (`cache-mode`, permissions)
- artifact upload for tests/coverage

…or a more focused deep-dive on any of the advanced items above (e.g., composite action implementation, monorepo cache keying, or self-hosted runner setup)?**GitHub Actions caching – investigation summary** (current as of late 2026), focused on practical use with `uv` / FastAPI pipelines.

### Core mechanics

GitHub Actions caching is provided by the `actions/cache` action (current major version v4+) and is also used internally by helpers such as `astral-sh/setup-uv`.

**How a restore works**
1. Exact match on the primary `key`.
2. If no exact match, sequential prefix matches against `restore-keys` (most specific first).
3. On a partial match the most recently created matching cache is restored.
4. On a complete miss the job continues without a cache (no failure by default).

Caches are **immutable** once written. Changing the contents of a key requires a new key (or a different primary key). You cannot update an existing cache entry in place.

**Key construction best practice**
```yaml
key: uv-${{ runner.os }}-${{ hashFiles('uv.lock') }}
restore-keys: |
  uv-${{ runner.os }}-${{ hashFiles('uv.lock') }}
  uv-${{ runner.os }}-
```
- Always include `runner.os` (or a matrix dimension) so Linux/macOS/Windows caches stay separate.
- Prefer a lockfile hash (`uv.lock`, `requirements.txt`, `poetry.lock`, etc.) as the primary differentiator.
- Broader prefixes in `restore-keys` give you a useful fallback when the lockfile has changed only slightly.

### Limits, eviction & retention

| Limit | Default | Notes |
|-------|---------|-------|
| Total cache size per repository | 10 GB (free) | Can be increased (pay-as-you-go) by repo/org/enterprise admins; excess is billed |
| Retention | 7 days of inactivity | Entries not accessed for > 7 days are deleted |
| Eviction order | Least-recently-accessed first | When the size limit is hit, oldest-accessed caches are removed to make room |
| Number of caches | Unlimited | Only total size matters |
| Key length | ≤ 512 characters | Longer keys cause the action to fail |

- Eviction checks have become more frequent (hourly in recent policy changes).
- Exceeding a configured budget can make the cache read-only until usage drops or billing is resolved.
- You can view and manage caches at `https://github.com/<owner>/<repo>/actions/caches`.

### Security & access control (important recent changes)

- **Untrusted events** (`pull_request_target`, certain `workflow_run` cascades from forks, etc.) now receive **read-only** cache tokens by default when the cache scope is the default branch. This prevents cache-poisoning attacks.
- A new `cache-mode` setting (generally available September 2026) lets you declare least-privilege access at workflow or job level:
  - `read` – restore only (default for low-trust events)
  - `write` – restore + save (default for trusted events such as `push`)
  - `write-only` – save only
  - `none` – no cache access
- Job-level settings override workflow-level ones. Explicitly granting write access on untrusted events produces a warning.

### Interaction with `uv` / `setup-uv`

`astral-sh/setup-uv` has first-class caching support:

```yaml
- uses: astral-sh/setup-uv@v6   # or later
  with:
    enable-cache: true          # or "auto"
    prune-cache: true           # explicit recommendation for most CI
    # cache-python: false       # default; usually leave off
```

- `enable-cache: auto` enables caching on GitHub-hosted runners for most events but disables it for high-risk events (`pull_request_target`, `workflow_run`, release/tag pushes, etc.).
- `prune-cache` default was changed to `false` (v9+) to reduce unnecessary traffic to PyPI. For typical FastAPI / moderate-to-large dependency sets you should still set `prune-cache: true` (or run `uv cache prune --ci` yourself) so the saved cache stays small.
- The action computes its own cache key from `uv.lock` / `pyproject.toml` (and related files) plus OS and other metadata.
- Manual control with `actions/cache` + `UV_CACHE_DIR` remains fully supported and is useful when you need custom paths or self-hosted runners.

**Recommended pattern for FastAPI + uv**
```yaml
- uses: astral-sh/setup-uv@v6
  with:
    enable-cache: true
    prune-cache: true          # keep cache lean
- run: uv sync --locked --all-extras --dev
# … tests …
# (optional extra prune if you manage the cache yourself)
- run: uv cache prune --ci
```

### Practical recommendations for your pipelines

1. **Prefer the setup-uv built-in cache** unless you need fine-grained control.
2. Always include a lockfile hash in the key and use sensible `restore-keys`.
3. Run `uv cache prune --ci` (or set `prune-cache: true`) at the end of jobs that save the cache — especially important for large wheels (torch, CUDA, etc.).
4. Do **not** cache `.venv` across jobs unless the key also includes the exact Python version and platform; let `uv` recreate the environment from the pruned cache.
5. On self-hosted runners the default `~/.cache/uv` can grow without bound — use a workspace-relative `UV_CACHE_DIR` and prune aggressively.
6. Monitor cache usage via the repository’s Actions → Caches page; watch for thrashing when you approach the 10 GB limit.
7. For security-sensitive workflows (especially those triggered by `pull_request_target`), rely on the new read-only defaults or explicitly set `cache-mode: read`.
8. Caches and artifacts serve different purposes — use caches for dependencies, artifacts for test reports, coverage, binaries, etc.

### Common pitfalls

- Cache key that is too broad → frequent misses or stale data.
- Cache key that is too narrow → many almost-identical caches and faster eviction.
- Forgetting to prune → large caches that take longer to restore than simply re-downloading wheels.
- Caching `.venv` without proper keying → environment mismatches across Python versions or OSes.
- Expecting a cache write on untrusted events → it is now blocked by default.

These rules, combined with the service-health and Alembic practices discussed earlier, give you the most reliable and fastest FastAPI CI pipelines on GitHub Actions today.**Merged & polished single reference**  
FastAPI CI/CD on GitHub Actions (Postgres + Redis service containers + `uv`)  
Consolidated best practices, failure-mode fixes, cache strategy, and advanced hardening (as of late 2026).

---

### 1. Service readiness (highest-impact fix)

GitHub’s built-in health checks can still time out. Always declare explicit options and add a manual wait.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    options: >-
      --health-cmd "pg_isready -U postgres -d testdb"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
      --health-start-period 10s
    ports:
      - 5432:5432
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
      --health-start-period 5s
    ports:
      - 6379:6379
```

After checkout:

```yaml
- name: Wait for services
  run: |
    for i in {1..30}; do pg_isready -h localhost -p 5432 -U postgres && break; sleep 2; done
    for i in {1..30}; do redis-cli -h localhost -p 6379 ping && break; sleep 2; done
```

Never run migrations or tests until both succeed.

### 2. Schema must be applied before any DB work

- Run `uv run alembic upgrade head` **before** pytest.
- Ensure `alembic/env.py` imports every model (`target_metadata` complete).
- Service containers give a fresh DB every run — do not reuse volumes.
- For async SQLAlchemy use `NullPool` in CI to avoid connection-pool exhaustion.

### 3. `uv` installation + cache strategy (current best practice)

Prefer the built-in cache of `astral-sh/setup-uv` with explicit pruning:

```yaml
- uses: astral-sh/setup-uv@v6   # pin to a recent tag or SHA
  with:
    version: "0.8.x"            # or latest stable
    python-version: "3.12"
    enable-cache: true
    prune-cache: true           # important – default became false in v9+
- run: uv sync --locked --all-extras --dev
# … tests …
# (optional extra prune if managing cache manually)
- run: uv cache prune --ci
```

**Why `prune-cache: true` / `uv cache prune --ci`?**
- Pre-built wheels are usually faster to re-download than to restore from the Actions cache.
- Wheels built from source (especially native extensions) are expensive → keep them.
- Result: small, high-value cache and 15–30 s warm installs.

**Manual cache control** (self-hosted or full control):

```yaml
env:
  UV_CACHE_DIR: /tmp/.uv-cache   # or ${{ github.workspace }}/.cache/uv

- uses: actions/cache@v4
  with:
    path: ${{ env.UV_CACHE_DIR }}
    key: uv-${{ runner.os }}-${{ hashFiles('uv.lock') }}
    restore-keys: |
      uv-${{ runner.os }}-
- run: uv sync --locked --all-extras --dev
- run: uv cache prune --ci          # always last
```

**Do not** cache `.venv` across jobs unless the key also includes exact Python version + platform. Let `uv` recreate the environment from the pruned cache.

**Core `uv` cache commands**

| Command                | Removes                                      | Keeps                       | Use case                          |
|------------------------|----------------------------------------------|-----------------------------|-----------------------------------|
| `uv cache clean`       | Everything (or named package)                | Nothing                     | Full reset / targeted invalidation|
| `uv cache prune`       | Unused / dangling / orphaned entries         | Actively referenced entries | Periodic local / self-hosted      |
| `uv cache prune --ci`  | Pre-built wheels + unzipped source dists     | Source-built wheels         | End of every CI job that saves cache |

### 4. Fail-fast, observability & structure

- Early pre-flight job (no services) that validates Python/`uv` versions, secrets, and basic connectivity.
- Integration job only runs if pre-flight succeeds (`needs: preflight`).
- Separate concerns: lint → type-check → unit (no services) → integration (with services).
- Upload JUnit XML + coverage as artifacts.
- Set reasonable timeouts so a hung health check cannot burn the matrix.
- Commit `uv.lock` and always use `--locked`.
- Prefer service containers over `docker compose` inside the job.

### 5. GitHub Actions caching mechanics (quick reference)

- Exact key match → restore; otherwise sequential `restore-keys` (most specific first).
- Caches are immutable; new content requires a new key.
- Default limits: 10 GB per repository (expandable), 7-day inactivity retention, least-recently-accessed eviction.
- Untrusted events (`pull_request_target`, etc.) now receive read-only cache tokens by default.
- New `cache-mode` (read / write / write-only / none) available for least-privilege control.
- Prefer `setup-uv`’s built-in cache unless you need custom paths or self-hosted runners.

### 6. Advanced hardening (production grade)

- **Concurrency**
  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
  ```
- **Reusable composite action** for the wait-loop + Alembic step (keeps every job DRY).
- **Weekly cache warm-up** on `main` (`schedule`) so the primary cache never expires from inactivity.
- **Self-hosted runners**: set `UV_CACHE_DIR` to a workspace-relative path and prune after every job.
- **Security**: least-privilege DB user, OIDC where possible, explicit `cache-mode: read` on untrusted events, never expose production credentials.
- **Local parity**: `docker-compose.test.yml` + a `make test` / `scripts/ci-local.sh` that mirrors the exact health options, wait loop, migrations, and `uv` flags.
- **Monitoring**: print `du -sh $UV_CACHE_DIR` after prune; watch the repository Actions → Caches page for thrashing near the 10 GB limit.

### Quick checklist before merging a workflow change

- [ ] Explicit Docker health options + manual wait loop  
- [ ] `alembic upgrade head` before any DB-touching step  
- [ ] `uv` + `enable-cache: true` + `prune-cache: true` (or manual `uv cache prune --ci`)  
- [ ] Fresh DB per run  
- [ ] Secrets / env vars validated early  
- [ ] Warm install path < 30 s  
- [ ] Never hand-edit the uv cache directory  
- [ ] Artifacts for JUnit / coverage  
- [ ] Concurrency group + cancel-in-progress  
- [ ] Local parity script exists  

This single document consolidates the original troubleshooting guide, the improved best-practices write-ups, the uv pruning deep-dive, and the GitHub Actions caching investigation into one coherent, production-ready reference.**Updated merged reference** (now includes `.git` setup + security-audit practices)

FastAPI CI/CD on GitHub Actions  
(Postgres + Redis service containers + `uv`)  
Consolidated best practices, failure-mode fixes, cache strategy, advanced hardening, Git setup, and security auditing (late 2026).

---

### 1. Service readiness (highest-impact fix)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    options: >-
      --health-cmd "pg_isready -U postgres -d testdb"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
      --health-start-period 10s
    ports:
      - 5432:5432
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
      --health-start-period 5s
    ports:
      - 6379:6379
```

After checkout:

```yaml
- name: Wait for services
  run: |
    for i in {1..30}; do pg_isready -h localhost -p 5432 -U postgres && break; sleep 2; done
    for i in {1..30}; do redis-cli -h localhost -p 6379 ping && break; sleep 2; done
```

Never run migrations or tests until both succeed.

### 2. Schema must be applied before any DB work

- `uv run alembic upgrade head` **before** pytest.
- `alembic/env.py` must import every model.
- Fresh DB per run (service containers already provide this).
- Async SQLAlchemy → use `NullPool` in CI.

### 3. `uv` installation + cache strategy

```yaml
- uses: astral-sh/setup-uv@v6
  with:
    version: "0.8.x"          # pin to a concrete version or SHA
    python-version: "3.12"
    enable-cache: true
    prune-cache: true         # explicit – default became false in v9+
- run: uv sync --locked --all-extras --dev
- run: uv cache prune --ci    # optional extra prune if managing cache yourself
```

**Manual cache control** (self-hosted / full control):

```yaml
env:
  UV_CACHE_DIR: ${{ github.workspace }}/.cache/uv
- uses: actions/cache@v4
  with:
    path: ${{ env.UV_CACHE_DIR }}
    key: uv-${{ runner.os }}-${{ hashFiles('uv.lock') }}
    restore-keys: |
      uv-${{ runner.os }}-
- run: uv sync --locked --all-extras --dev
- run: uv cache prune --ci
```

Never cache `.venv` across jobs unless the key also includes exact Python version + platform.

| Command                | Removes                                  | Keeps                   | Use case                     |
|------------------------|------------------------------------------|-------------------------|------------------------------|
| `uv cache clean`       | Everything (or named package)            | Nothing                 | Full reset                   |
| `uv cache prune`       | Unused / dangling entries                | Referenced entries      | Local / self-hosted cleanup  |
| `uv cache prune --ci`  | Pre-built wheels + unzipped source dists | Source-built wheels     | End of every CI job          |

### 4. Fail-fast, observability & structure

- Pre-flight job (no services) → validate versions, secrets, connectivity.
- Integration job depends on pre-flight (`needs: preflight`).
- Separate concerns: lint → type-check → unit → integration.
- Upload JUnit + coverage as artifacts.
- Commit `uv.lock`, always use `--locked`.
- Prefer service containers over Compose.

### 5. GitHub Actions caching (quick reference)

- Exact key → restore; otherwise sequential `restore-keys`.
- Caches are immutable.
- Limits: 10 GB (expandable), 7-day inactivity, LRU eviction.
- Untrusted events get read-only cache tokens by default.
- New `cache-mode`: `read` / `write` / `write-only` / `none`.
- Prefer `setup-uv` built-in cache unless you need custom paths.

### 6. Advanced hardening

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- Reusable composite action for wait + Alembic.
- Weekly scheduled cache warm-up on `main`.
- Self-hosted: workspace-relative `UV_CACHE_DIR` + post-job prune.
- Local parity: `docker-compose.test.yml` + `make test` / `scripts/ci-local.sh`.
- Monitor cache size (`du -sh $UV_CACHE_DIR`) and the Actions → Caches page.

### 7. `.git` setup (secure & efficient)

**Recommended checkout**

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 1                # shallow clone (faster, less data)
    persist-credentials: false    # do not leave credentials in the workspace
```

- Prefer `fetch-depth: 1` unless you need full history (changelog generation, `git describe`, etc.).
- Always set `persist-credentials: false` on jobs that do not need to push.
- Never run `git config --global` with secrets or long-lived tokens.
- If you need a token for private submodules or push, use a short-lived token and clean it up.
- Avoid leaving a full `.git` directory in artifacts or container images.
- For security-sensitive jobs, consider:

```yaml
- name: Remove .git (optional hard clean)
  if: github.event_name != 'pull_request'   # example condition
  run: rm -rf .git
```

- Submodules: use `submodules: recursive` only when required and with the least-privileged token.

### 8. Security-audit practices

**Permissions (least privilege)**

```yaml
permissions:
  contents: read
  # add only what you need (e.g. pull-requests: write for status checks)
```

**Secrets & credentials**
- Never hard-code secrets.
- Prefer OIDC / short-lived tokens over long-lived PATs.
- Use environment-scoped secrets and repository environments with required reviewers for production.
- Rotate secrets regularly; never log them.

**Dependency & supply-chain audit**
```yaml
- name: Security audit
  run: |
    uv sync --locked --all-extras --dev
    uv pip audit          # or `pip-audit` / `safety` if preferred
    # optional: trivy, grype, or GitHub Dependency Review action
```

- Enable GitHub Dependabot + Dependency Review action on PRs.
- Pin actions by SHA (or at least by major version + comment).
- Run `uv lock --check` (or equivalent) to ensure the lockfile is up-to-date.

**Cache security**
- On untrusted events (`pull_request_target`, fork PRs, etc.) rely on the default read-only cache token or set `cache-mode: read`.
- Never write to the shared cache from untrusted code.

**Runtime / container security**
- Prefer Alpine or distroless images where possible.
- Run tests as non-root when practical.
- Scan service images and the final application image (Trivy, Grype, etc.).

**Audit checklist (add to every PR / release)**
- [ ] `permissions:` block is present and minimal
- [ ] No secrets in logs or artifacts
- [ ] `persist-credentials: false` on checkout where possible
- [ ] Dependency audit step passes
- [ ] Actions pinned (SHA preferred)
- [ ] Cache write restricted on untrusted events
- [ ] No production credentials in CI

### Quick checklist (complete)

- [ ] Explicit health options + manual wait loop  
- [ ] `alembic upgrade head` before DB work  
- [ ] `uv` + `enable-cache` + `prune-cache: true`  
- [ ] Fresh DB per run  
- [ ] Secrets validated early  
- [ ] Warm install < 30 s  
- [ ] Never hand-edit uv cache  
- [ ] Artifacts for JUnit / coverage  
- [ ] Concurrency + cancel-in-progress  
- [ ] Local parity script  
- [ ] Shallow checkout + `persist-credentials: false`  
- [ ] Least-privilege `permissions`  
- [ ] Dependency / security audit step  
- [ ] Cache write restricted on untrusted events  

This is now a single, production-ready reference covering the original failure modes, `uv` caching, GitHub Actions mechanics, advanced hardening, secure `.git` setup, and security-audit practices.Here’s a practical expansion of the reference with **concrete Python-side examples** that pair cleanly with the CI/CD practices you already have.

### 1. `alembic/env.py` (must import every model)

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.db.base import Base          # your declarative base
from app.models import *              # noqa: F401,F403 – force-import every model

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    # In CI we force NullPool so every connection is fresh
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 2. Async SQLAlchemy engine for CI (NullPool)

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/testdb")

# In CI we never want a connection pool
engine = create_async_engine(
    DATABASE_URL,
    poolclass=NullPool if os.getenv("CI") else None,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

### 3. Minimal pytest + FastAPI TestClient / AsyncClient pattern

```python
# tests/conftest.py
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base

@pytest_asyncio.fixture(scope="session")
async def prepare_database():
    # Alembic has already run in the CI job, but for local runs we can create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session(prepare_database) -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

```python
# tests/test_health.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

### 4. Local parity script (`scripts/ci-local.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

# Start the same services the CI uses
docker compose -f docker-compose.test.yml up -d --wait

export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/testdb"
export REDIS_URL="redis://localhost:6379/0"
export CI=1

uv sync --locked --all-extras --dev
uv run alembic upgrade head
uv run pytest -q --junitxml=junit.xml --cov=app --cov-report=xml

docker compose -f docker-compose.test.yml down -v
```

### 5. Tiny `docker-compose.test.yml` (matches the service containers)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d testdb"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 5s
```

### 6. Example security-audit step you can drop straight into the workflow

```yaml
- name: Security audit
  run: |
    uv sync --locked --all-extras --dev
    uv pip audit --strict
    # optional extra scanners
    # trivy fs --severity CRITICAL,HIGH .
```

---

Would you like me to:

1. Turn the whole reference into a **complete, ready-to-copy `.github/workflows/ci.yml`**, or  
2. Add more Python examples (fixtures for Redis, factory-boy / polyfactory data, async test helpers, etc.)?

Just say which direction you prefer.improve(skill:auto-compress-manage): optimize workflow — path filtering + loop guard + rules update

- อัปเดต .github/workflows/auto-compress-manage.yml (+194 lines)
- เพิ่มตัวกรองพาธที่แม่นยำ: ยกเว้น node_modules, .git, binaries
- ป้องกันการวนซ้ำ/ทำงานซ้ำซ้อน
- ซิงค์กฎเกณฑ์กับ rubric.md ล่าสุด
- ปรับปรุงความน่าเชื่อถือและประสิทธิภาพ

✅ เปลี่ยนแปลง:
- .github/workflows/auto-compress-manage.yml
- docs/skill-auto-compress.md

🔗 อ้างอิง:
- PR: #242
- Skill ID: SKL-COMPRESS-002
📋 สรุป: Grok Skills — GitHub Copilot Expert Cheat Sheet
 
🎯 รูปแบบสกิลกระชับ: ใช้ได้ทันที • จำง่าย • ประยุกต์ใช้กับ Grok ได้เลย ✅
 
 
 
🎯 1. หลักการเขียนพร้อมป์ต์ (Prompts)
 
- 3S+R: เฉพาะเจาะจง • เรียบง่าย • สั้น • มุ่งเน้นผลลัพธ์
- Comment-first: เขียนเจตนาก่อนเขียนโค้ด
- Type-driven: ใส่ type hints ครบ = ผลลัพธ์ดีขึ้น
 
 
 
📂 2. การจัดการบริบท (Context)
 
-  #file:  อ้างอิงไฟล์ในแชท
-  @workspace  ค้นหาทั้งโปรเจกต์
- เปิดแท็บที่เกี่ยวข้อง 2-3 ไฟล์ เพื่อให้บริบทครบ
 
 
 
⚡ 3. คำสั่งเร็ว (Slash Commands)
 
คำสั่ง หน้าที่ 
 /fix  แก้ไขโค้ด 
 /tests  เขียนทดสอบ 
 /doc  เขียนเอกสาร 
 /explain  อธิบายโค้ด 
 /optimize  ปรับปรุงประสิทธิภาพ 
 /security  ตรวจสอบความปลอดภัย 
 /refactor  ปรับโครงสร้างโค้ด 
 /convert  แปลงรูปแบบ/ภาษา 
 /new  สร้างใหม่ 
 /clear  ล้างบริบท 
 
 
 
🔄 4. ขั้นตอนการทำงาน (Workflows)
 
- Test-first: เขียนทดสอบ 1 รายการ → ให้ AI เขียนส่วนที่เหลือ
- Chain prompts: วางแผน → ตรวจสอบ → พัฒนา → ทดสอบ
- Code review: ให้ AI ค้นหาข้อผิดพลาดก่อนส่ง PR
 
 
 
🛡️ 5. ความปลอดภัย (Security)
 
- ระบุข้อจำกัด/เงื่อนไขในพร้อมป์ต์
- ให้ตัวอย่างโค้ดที่ถูกต้องเป็นเกณฑ์
- ตรวจสอบความถูกต้องเสมอก่อนผสานโค้ด
 
 
 
💻 6. คำสั่ง CLI
 
bash  
# แนะนำคำสั่ง
gh copilot suggest "<คำสั่งที่ต้องการ>"

# อธิบายข้อผิดพลาด
gh copilot explain "<ข้อความข้อผิดพลาด>"
 
 
 
 
🚀 สรุปสั้นๆ
 
ใช้ 3S+R เขียนพร้อมป์ต์ • ให้ บริบท ครบถ้วน • ใช้ คำสั่งเร็ว ประหยัดเวลา • ทำงานแบบ ห่วงโซ่ • เน้น ความปลอดภัย และตรวจสอบเสมอ 🛡️✅