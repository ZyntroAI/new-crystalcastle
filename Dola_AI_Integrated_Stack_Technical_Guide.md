# Dola AI Integrated Stack — Technical Guide

**Version:** 1.0  
**Date:** 2026-09-07  
**Location:** Samut Prakan, Thailand  
**Status:** Production-Ready

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Core Architecture Overview](#2-core-architecture-overview)
3. [Model Routing Strategy](#3-model-routing-strategy)
4. [useScope Hook — TypeScript Implementation](#4-usescope-hook-typescript-implementation)
5. [API Security Framework](#5-api-security-framework)
6. [Thread Model & Observability](#6-thread-model--observability)
7. [Obsidian REST API Integration](#7-obsidian-rest-api-integration)
8. [Deployment & Operations](#8-deployment--operations)
9. [References](#9-references)

---

## 1. Introduction

### 1.1 Purpose

This document serves as the comprehensive technical guide for the **Dola AI Integrated Stack** — a production-ready system that unifies GitHub workflows, AI model orchestration, Obsidian knowledge management, and FastAPI backend services. The stack is designed to automate software development lifecycle tasks while maintaining high security standards and cost efficiency.

### 1.2 Scope

The guide covers the following key components:

- System architecture and data flow
- AI model routing strategy (GPT-6 Astra, Gemini Flash, Claude Fable 5.1)
- React state management with the `useScope` hook
- API security best practices and implementation
- Thread model for distributed tracing
- Obsidian REST API integration patterns
- Deployment and operational procedures

### 1.3 Audience

This document is intended for:

- Software engineers implementing or maintaining the stack
- DevOps engineers responsible for deployment and monitoring
- Security engineers reviewing the architecture
- Technical managers understanding the system capabilities

---

## 2. Core Architecture Overview

### 2.1 System Flow

The Dola AI Integrated Stack follows a unified data flow pattern that connects all major components:

```
GitHub ←→ Dola AI (5 Roles) ←→ Obsidian Vault ←→ FastAPI Backend ←→ AI Providers
   ↓ PR/Issue/Release       ↓ Docs/Logs/KB       ↓ Auth/API/DB       ↓ Cost/Performance
```

### 2.2 Component Description

**Table 2-1: System Components**

| Component | Primary Responsibility | Key Technologies |
|---|---|---|
| Dola AI | Automation of PR reviews, issue triage, releases, docs, oncall | GitHub Actions, Node.js, Python |
| Obsidian Vault | Knowledge base, documentation, templates, logs | Markdown, Local REST API, Dataview |
| FastAPI Backend | API layer, authentication, data management, AI orchestration | Python, PostgreSQL, Redis, Prisma |
| AI Providers | Large language models for code generation and analysis | GPT-6 Astra, Gemini Flash, Claude Fable 5.1 |

### 2.3 Dola AI Five Roles

Dola AI operates through five specialized roles, each handling specific GitHub-native tasks:

1. **PR Manager:** Reviews pull requests, validates CI/CodeQL/coverage (≥80%), approves or rejects, and auto-merges when criteria are met.
2. **Issue Triager:** Automatically labels, prioritizes, and assigns issues based on type (bug, feature, docs, question).
3. **Release Manager:** Manages semantic versioning, generates changelogs, creates releases, and syncs release notes to Obsidian.
4. **Docs Maintainer:** Validates README updates, checks links, and ensures documentation version synchronization.
5. **Oncall Bot:** Monitors Vercel deployments and health endpoints, sends Slack alerts, and logs incidents to Obsidian.

---

## 3. Model Routing Strategy

### 3.1 Model Comparison

**Table 3-1: AI Model Characteristics**

| Model | Profile | Speed | Cost | Context | Best For |
|---|---|---|---|---|---|
| Gemini 3.8 Flash | Fastest, Light, Cheap | Highest | Lowest | Medium | Snippets, quick edits, CLI commands |
| Claude Fable 5.1 | Balanced, Smart, Value | High | Medium | Large | Code quality, docs, review, daily tasks |
| GPT-6 Astra | Powerful, Agentic, Thorough | Standard | Full | Very Large | Planning, multi-step, verification, PRs |

### 3.2 Routing Rules

The system implements intelligent model routing based on task complexity and requirements:

**Route to Gemini 3.8 Flash when:**

- Task requires speed over depth
- Lines of code changed are fewer than 50
- Task type: completion, syntax fix, CLI help, labeling
- File types: JSON, YAML, Markdown, plain text

**Route to Claude Fable 5.1 when (default for 80% of tasks):**

- Lines of code changed between 50 and 500
- Task type: code review, component writing, refactoring, test writing, documentation
- File types: TypeScript, Python, JavaScript, Prisma schema
- General daily development tasks requiring quality and efficiency

**Route to GPT-6 Astra when:**

- Lines of code changed exceed 500
- Task spans more than 3 files
- Task type: architecture design, security audit, full PR review, incident analysis, planning
- Keywords present: security, auth, migrate, breaking, deploy, production

### 3.3 Dola AI Role Assignments

**Table 3-2: Model Assignment by Role**

| Dola Role | Recommended Model | Rationale |
|---|---|---|
| PR Manager (Standard) | Claude Fable 5.1 | Fast review with good suggestions |
| PR Manager (Complex) | GPT-6 Astra | Multi-file verification with self-check |
| Issue Triager | Gemini Flash | Quick categorization and labeling |
| Release Manager | Claude Fable 5.1 | Balanced quality for changelogs and docs |
| Docs Maintainer | Claude Fable 5.1 | Writing quality and speed |
| Oncall Bot / Incident | GPT-6 Astra | Deep analysis and verified fix recommendations |
| Architecture Planning | GPT-6 Astra | Comprehensive planning and validation |
| Quick Snippets / Fixes | Gemini Flash | Instant response |

---

## 4. useScope Hook — TypeScript Implementation

### 4.1 Overview

The `useScope` hook provides efficient information scope management for React applications. It enables isolated state boundaries, automatic cleanup, memoized selectors, and optional persistence to localStorage.

### 4.2 Core Features

- **Type-safe:** Full TypeScript generics support
- **Scope isolation:** Prevents cross-scope data leakage
- **Memoized selectors:** Redux-style selector pattern for optimized re-renders
- **Persistence:** Optional localStorage persistence
- **Event-based subscription:** Cross-component communication
- **Shallow equality:** Prevents unnecessary re-renders when data is unchanged

### 4.3 Usage Examples

**Basic scope with persistence:**

```typescript
type AuthData = {
  user: { id: string; name: string } | null;
  token: string | null;
  isAuthenticated: boolean;
};

const { data, update, reset } = useScope<AuthData>('auth', {
  user: null,
  token: null,
  isAuthenticated: false
}, { persist: true });
```

**Redux-style selectors:**

```typescript
const isAuthenticated = useSelector<AuthData, boolean>(
  'auth',
  s => s.isAuthenticated
);

const userName = useSelector<AuthData, string>(
  'auth',
  s => s.user?.name ?? 'Guest'
);
```

**Dynamic scope per component instance:**

```typescript
function PRCard({ prId }: { prId: string }) {
  const { data } = useScope(`dola:pr:${prId}`, {
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    checks: [] as string[]
  });
  return <div>Status: {data.status}</div>;
}
```

### 4.4 Performance Characteristics

**Table 4-1: Performance Advantages**

| Feature | Benefit |
|---|---|
| Shallow diff comparison | Skips re-renders when data is identical |
| Scope isolation | Clean state boundaries, no interference |
| Memoized functions | Stable references, safe for dependency arrays |
| Auto-cleanup | No memory leaks (unless persist flag is set) |
| Registry-based | Single source of truth, no data duplication |

---

## 5. API Security Framework

### 5.1 Security Layers

The API security framework implements defense in depth through multiple layers:

1. **Authentication:** Verifies identity using JWT tokens, API keys, or OAuth 2.0
2. **Authorization:** Controls access via RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control)
3. **Data Protection:** Encrypts data in transit (TLS 1.3) and at rest
4. **Input Validation:** Validates and sanitizes all inputs to prevent injection attacks
5. **Rate Limiting:** Prevents abuse and DoS attacks
6. **Monitoring:** Logs security events and monitors for anomalies

### 5.2 Authentication Methods

**JWT Authentication Flow:**

1. Client sends credentials to `/token` endpoint
2. Server validates credentials and returns signed JWT
3. Client includes JWT in `Authorization: Bearer <token>` header
4. Server validates token signature and expiration on each request

**API Key Authentication:**

- Used for server-to-server communication
- Key passed in `X-API-Key` header
- Keys stored as hashed values, never in plain text

### 5.3 Security Headers

The FastAPI middleware applies the following security headers:

- **Strict-Transport-Security:** `max-age=31536000; includeSubDomains`
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `DENY`
- **X-XSS-Protection:** `1; mode=block`

### 5.4 Rate Limiting Implementation

Rate limiting is implemented using Redis with the following specifications:

- Default limit: 100 requests per minute per client
- Client identification: API key or IP address
- Algorithm: Token bucket with sliding window
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## 6. Thread Model & Observability

### 6.1 Concept

The Thread Model provides distributed tracing capabilities through a single trace ID that travels through every service, log entry, and processing step. This enables full lifecycle traceability for requests, builds, incidents, and deployments.

### 6.2 Data Model

**Trace Object:**

```json
{
  "trace_id": "tr_01HXY8ZABC123DEF456",
  "thread_type": "deployment",
  "parent_id": null,
  "root_id": "tr_01HXY8ZABC123DEF456",
  "status": "active",
  "created_at": "2026-09-07T10:00:00+07:00",
  "source": "github_webhook",
  "owner": "team/devsecops",
  "context": {
    "repo": "org/project",
    "branch": "main",
    "env": "production"
  }
}
```

**Span Object (Sub-step):**

```json
{
  "span_id": "sp_001XYZ",
  "trace_id": "tr_01HXY8ZABC123DEF456",
  "name": "security_scan",
  "status": "pass",
  "start_time": "2026-09-07T10:00:01+07:00",
  "end_time": "2026-09-07T10:00:12+07:00",
  "duration_ms": 11000,
  "logs": ["Rule loaded", "Dependency check OK"],
  "error": null
}
```

### 6.3 ID Format Rules

- Prefix: `tr_` for threads, `sp_` for spans
- Body: Base32 or Hex encoding (16-24 characters)
- Unpredictable: Cryptographically generated to prevent enumeration

### 6.4 Header Propagation

Every service must propagate the following headers:

```http
X-Trace-ID: tr_01HXY8ZABC123DEF456
X-Span-ID: sp_001XYZ
```

If a header is missing, the entry service generates a new trace ID.

---

## 7. Obsidian REST API Integration

### 7.1 Plugin Configuration

The integration uses the **Local REST API** plugin for Obsidian (author: coddingtonbear):

- **Port:** 27124 (default)
- **Host:** 127.0.0.1 (local only)
- **Authentication:** Bearer token
- **Protocol:** HTTPS with self-signed certificate

### 7.2 Key Endpoints

**Table 7-1: Obsidian REST API Endpoints**

| Method | Path | Purpose |
|---|---|---|
| GET | `/vault/` | List vault information |
| GET | `/vault/{path}` | Read note content |
| POST | `/vault/{path}` | Create or update note |
| PATCH | `/vault/{path}` | Partial note update |
| DELETE | `/vault/{path}` | Delete note |

### 7.3 Python Client Implementation

```python
import requests
from typing import Optional, Tuple

OBSIDIAN_URL = "https://127.0.0.1:27124"
API_KEY = "your-api-key-here"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "text/markdown"
}
VERIFY_SSL = False

def write_note(path: str, content: str) -> Tuple[int, dict]:
    res = requests.post(
        f"{OBSIDIAN_URL}/vault/{path}",
        headers=HEADERS,
        data=content,
        verify=VERIFY_SSL
    )
    return res.status_code, res.json()

def read_note(path: str) -> Optional[str]:
    res = requests.get(
        f"{OBSIDIAN_URL}/vault/{path}",
        headers=HEADERS,
        verify=VERIFY_SSL
    )
    return res.text if res.status_code == 200 else None
```

### 7.4 Security Considerations

- **Never expose publicly:** The API should only be accessible locally or through VPN
- **Token management:** Store tokens in environment variables or secret managers
- **CORS policy:** Restrict origins to trusted services only
- **Access logging:** All API access logged to `Obsidian/Logs/API.md`

---

## 8. Deployment & Operations

### 8.1 Docker Deployment

The FastAPI backend is containerized with Docker and orchestrated using docker-compose:

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/skills_db
      REDIS_URL: redis://cache:6379/0
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: skills_db

  cache:
    image: redis:7-alpine
```

### 8.2 CI/CD Pipeline

GitHub Actions implement the following pipeline stages:

1. **Lint:** Code style and static analysis
2. **Test:** Unit tests, integration tests, coverage validation
3. **Build:** Docker image build and push to registry
4. **Security Scan:** CodeQL analysis, dependency scanning, container scanning
5. **Deploy:** Automated deployment to staging and production

### 8.3 Secret Management

Secrets are managed through:

- **GitHub Secrets:** For CI/CD pipeline variables
- **Environment files:** `.env` files (never committed to Git)
- **HashiCorp Vault:** For production secret management
- **Obsidian REST API key:** Stored as encrypted environment variable

### 8.4 Monitoring & Alerting

Key metrics monitored:

- API response time and error rates
- Authentication failures and permission denied events
- Rate limit violations
- System health and resource utilization
- AI provider costs and cache hit rates

Alerts are sent to Slack `#oncall` channel for P1 incidents and via email for P2 issues.

---

## 9. References

1. GitHub Blog. (2026). *GPT-6 Astra is Generally Available in GitHub Copilot*. Retrieved from https://github.blog/changelog/2026-09-04-gpt-6-astra-is-generally-available-in-github-copilot/

2. FastAPI Documentation. *Security - First Steps*. Retrieved from https://fastapi.tiangolo.com/tutorial/security/

3. OpenTelemetry Specification. *Trace Context*. Retrieved from https://www.w3.org/TR/trace-context/

4. OWASP. *API Security Top 10*. Retrieved from https://owasp.org/API-Security/

5. Obsidian Local REST API Plugin. *Documentation*. Retrieved from https://github.com/coddingtonbear/obsidian-local-rest-api

---

**Document End**
