<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="OnSpaceAI Cost & Reliability Stack v1">
  <title>OnSpaceAI Cost & Reliability Stack v1</title>
  <style>
    :root {
      --bg: #0b1020;
      --panel: #121a2b;
      --panel-2: #0f172a;
      --text: #e5e7eb;
      --muted: #94a3b8;
      --border: #263247;
      --accent: #7dd3fc;
      --code: #020617;
      --success: #86efac;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family:
        Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.65;
    }

    .container {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 48px 0 80px;
    }

    header {
      margin-bottom: 40px;
      padding: 32px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: linear-gradient(145deg, var(--panel), var(--panel-2));
    }

    h1, h2, h3 {
      line-height: 1.25;
    }

    h1 {
      margin-top: 0;
      font-size: clamp(2rem, 5vw, 3.5rem);
    }

    h2 {
      margin-top: 48px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 10px;
    }

    h3 {
      margin-top: 30px;
    }

    .subtitle {
      color: var(--muted);
      font-size: 1.05rem;
    }

    .badge {
      display: inline-block;
      margin: 4px 6px 4px 0;
      padding: 5px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--accent);
      font-size: .85rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .card {
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--panel);
    }

    .card strong {
      color: var(--accent);
    }

    pre {
      overflow-x: auto;
      padding: 18px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--code);
      color: #dbeafe;
      font-family:
        "SFMono-Regular", Consolas, "Liberation Mono",
        Menlo, monospace;
      font-size: .9rem;
      line-height: 1.55;
    }

    code {
      font-family:
        "SFMono-Regular", Consolas, "Liberation Mono",
        Menlo, monospace;
    }

    .note {
      padding: 18px;
      border-left: 4px solid var(--accent);
      background: var(--panel);
      border-radius: 8px;
    }

    .success {
      color: var(--success);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th, td {
      padding: 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    th {
      background: var(--panel);
      color: var(--accent);
    }

    footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      color: var(--muted);
    }
  </style>
</head>

<body>
<div class="container">

<header>
  <h1>OnSpaceAI Cost &amp; Reliability Stack v1</h1>
  <p class="subtitle">
    Production-oriented implementation combining FastAPI, Redis,
    fallback routing, circuit breaking, Prometheus metrics,
    Docker Compose and pytest.
  </p>

  <span class="badge">FastAPI</span>
  <span class="badge">Redis</span>
  <span class="badge">Fallback API</span>
  <span class="badge">Circuit Breaker</span>
  <span class="badge">Prometheus</span>
  <span class="badge">pytest</span>
  <span class="badge">Docker Compose</span>
</header>

<h2>1. Architecture</h2>

<pre>
                         Client / OnSpaceAI
                                  |
                           Small Cookies
                                  |
                                  v
                         +----------------+
                         |      CDN       |
                         | Edge Cache     |
                         +-------+--------+
                                 |
                                 v
                         +----------------+
                         |  API Gateway   |
                         | Auth / Limits  |
                         +-------+--------+
                                 |
                                 v
                         +----------------+
                         |  Redis Cache   |
                         +-------+--------+
                                 |
                               MISS
                                 |
                                 v
                         +----------------+
                         | Fallback Router|
                         +-------+--------+
                                 |
                    +------------+------------+
                    |                         |
                    v                         v
                 Primary                  Secondary
                    |                         |
                    +------------+------------+
                                 |
                                 v
                         Context Compiler
                                 |
                                 v
                           Token Budget
                                 |
                                 v
                            AI Provider
                                 |
                                 v
                           Result Cache
                                 |
                                 v
                          Self-Healing
                                 |
                                 v
                       Metrics / Cost Logs
</pre>

<div class="note">
  <strong>Cost-first rule:</strong>
  avoid the request before trying to make the request cheaper.
  Cache → reuse context → reduce tokens → fallback → retry.
</div>

<h2>2. Repository Structure</h2>

<pre>
onspace-ai/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── middleware.py
│   ├── cache.py
│   ├── circuit_breaker.py
│   ├── fallback_router.py
│   ├── metrics.py
│   └── providers.py
│
├── tests/
│   ├── conftest.py
│   ├── test_api.py
│   ├── test_cache.py
│   ├── test_circuit_breaker.py
│   └── test_fallback_router.py
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── pytest.ini
├── .env.example
└── README.md
</pre>

<h2>3. Docker Compose</h2>

<pre><code>services:
  api:
    build: .
    container_name: onspaceai-api
    ports:
      - "8000:8000"
    environment:
      REDIS_URL: redis://redis:6379/0
      APP_ENV: development
      CACHE_TTL: "300"
      CIRCUIT_FAILURE_THRESHOLD: "5"
      CIRCUIT_RECOVERY_SECONDS: "30"
    depends_on:
      redis:
        condition: service_healthy

  redis:
    image: redis:7-alpine
    container_name: onspaceai-redis
    command:
      - redis-server
      - --appendonly
      - "yes"
      - --maxmemory
      - 256mb
      - --maxmemory-policy
      - allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  redis_data:</code></pre>

<h2>4. Dockerfile</h2>

<pre><code>FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app",
     "--host", "0.0.0.0",
     "--port", "8000"]</code></pre>

<h2>5. Dependencies</h2>

<pre><code>fastapi&gt;=0.115,&lt;1
uvicorn[standard]&gt;=0.30,&lt;1
redis&gt;=5,&lt;7
httpx&gt;=0.27,&lt;1
prometheus-client&gt;=0.20,&lt;1
pydantic-settings&gt;=2.5,&lt;3
pytest&gt;=8,&lt;9
pytest-asyncio&gt;=0.24,&lt;1</code></pre>

<h2>6. Redis Cache</h2>

<pre><code>from __future__ import annotations

import hashlib
import json
from typing import Any

from redis.asyncio import Redis


def make_cache_key(prefix: str, value: Any) -&gt; str:
    payload = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )

    digest = hashlib.sha256(
        payload.encode()
    ).hexdigest()[:24]

    return f"onspaceai:{prefix}:{digest}"


class RedisCache:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def get_json(
        self,
        key: str,
    ) -&gt; dict | None:

        value = await self.redis.get(key)

        if value is None:
            return None

        return json.loads(value)

    async def set_json(
        self,
        key: str,
        value: dict,
        ttl: int,
    ) -&gt; None:

        await self.redis.set(
            key,
            json.dumps(
                value,
                separators=(",", ":"),
            ),
            ex=ttl,
        )

    async def delete(
        self,
        key: str,
    ) -&gt; None:

        await self.redis.delete(key)</code></pre>

<h2>7. Circuit Breaker</h2>

<pre><code>from __future__ import annotations

import asyncio
import time
from enum import Enum


class CircuitState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitOpenError(RuntimeError):
    pass


class CircuitBreaker:

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_seconds: float = 30.0,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_seconds = recovery_seconds
        self.failures = 0
        self.last_failure_at = 0.0
        self.state = CircuitState.CLOSED
        self._lock = asyncio.Lock()

    async def allow_request(self) -&gt; bool:
        async with self._lock:

            if self.state == CircuitState.CLOSED:
                return True

            if self.state == CircuitState.OPEN:
                elapsed = (
                    time.monotonic()
                    - self.last_failure_at
                )

                if elapsed &gt;= self.recovery_seconds:
                    self.state = CircuitState.HALF_OPEN
                    return True

                return False

            return True

    async def record_success(self) -&gt; None:
        async with self._lock:
            self.failures = 0
            self.state = CircuitState.CLOSED

    async def record_failure(self) -&gt; None:
        async with self._lock:
            self.failures += 1
            self.last_failure_at = time.monotonic()

            if self.failures &gt;= self.failure_threshold:
                self.state = CircuitState.OPEN</code></pre>

<h2>8. Fallback Router</h2>

<pre><code>from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

from .circuit_breaker import CircuitBreaker
from .providers import Provider, ProviderError


RETRYABLE_STATUS = {
    408,
    429,
    502,
    503,
    504,
}


@dataclass
class RouteResult:
    provider: str
    data: dict[str, Any]
    fallback: bool = False
    degraded: bool = False


class FallbackRouter:

    def __init__(
        self,
        providers: Iterable[Provider],
        breakers: dict[str, CircuitBreaker],
    ):
        self.providers = list(providers)
        self.breakers = breakers

    async def execute(
        self,
        payload: dict[str, Any],
    ) -&gt; RouteResult:

        for index, provider in enumerate(
            self.providers
        ):

            breaker = self.breakers[
                provider.name
            ]

            if not await breaker.allow_request():
                continue

            try:
                data = await provider.request(
                    payload
                )

            except ProviderError as exc:

                if exc.status_code not in RETRYABLE_STATUS:
                    raise

                await breaker.record_failure()
                continue

            except Exception:

                await breaker.record_failure()
                continue

            else:

                await breaker.record_success()

                return RouteResult(
                    provider=provider.name,
                    data=data,
                    fallback=index &gt; 0,
                )

        return RouteResult(
            provider="degraded",
            data={
                "message":
                    "All providers unavailable",
                "stale": False,
            },
            degraded=True,
        )</code></pre>

<h2>9. Provider Contract</h2>

<pre><code>from dataclasses import dataclass
from typing import Any


class ProviderError(Exception):

    def __init__(
        self,
        status_code: int,
        message: str,
    ):
        self.status_code = status_code
        super().__init__(message)


@dataclass
class Provider:

    name: str
    response: dict[str, Any] | None = None
    failure_status: int | None = None

    async def request(
        self,
        payload: dict[str, Any],
    ) -&gt; dict[str, Any]:

        if self.failure_status is not None:
            raise ProviderError(
                self.failure_status,
                f"{self.name} failed",
            )

        return self.response or {
            "answer":
                f"response from {self.name}",
            "echo": payload,
        }</code></pre>

<h2>10. FastAPI Middleware</h2>

<pre><code>from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from .metrics import LATENCY, REQUESTS


class RequestContextMiddleware(
    BaseHTTPMiddleware
):

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):

        request_id = (
            request.headers.get(
                "x-request-id"
            )
            or str(uuid.uuid4())
        )

        request.state.request_id = request_id

        started = time.perf_counter()

        response: Response = await call_next(
            request
        )

        LATENCY.labels(
            request.url.path
        ).observe(
            time.perf_counter() - started
        )

        REQUESTS.labels(
            request.url.path
        ).inc()

        response.headers[
            "X-Request-ID"
        ] = request_id

        response.headers[
            "X-Content-Type-Options"
        ] = "nosniff"

        return response</code></pre>

<h2>11. Prometheus Metrics</h2>

<pre><code>from prometheus_client import (
    Counter,
    Histogram,
    make_asgi_app,
)


REQUESTS = Counter(
    "onspaceai_api_requests_total",
    "Total API requests",
    ["route"],
)

CACHE_HITS = Counter(
    "onspaceai_cache_hits_total",
    "Total cache hits",
    ["namespace"],
)

CACHE_MISSES = Counter(
    "onspaceai_cache_misses_total",
    "Total cache misses",
    ["namespace"],
)

FALLBACKS = Counter(
    "onspaceai_fallback_total",
    "Total fallback requests",
    ["provider"],
)

DEGRADED = Counter(
    "onspaceai_degraded_responses_total",
    "Total degraded responses",
)

LATENCY = Histogram(
    "onspaceai_request_latency_seconds",
    "Request latency",
    ["route"],
)


def metrics_app():
    return make_asgi_app()</code></pre>

<h2>12. FastAPI Application</h2>

<pre><code>from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    HTTPException,
    Request,
)
from pydantic import BaseModel, Field
from redis.asyncio import Redis
from starlette.middleware.wsgi import (
    WSGIMiddleware,
)

from .cache import (
    RedisCache,
    make_cache_key,
)
from .circuit_breaker import CircuitBreaker
from .config import settings
from .fallback_router import FallbackRouter
from .metrics import (
    CACHE_HITS,
    CACHE_MISSES,
    DEGRADED,
    FALLBACKS,
    metrics_app,
)
from .middleware import (
    RequestContextMiddleware,
)
from .providers import Provider


class AIRequest(BaseModel):

    prompt: str = Field(
        min_length=1,
        max_length=100_000,
    )

    model: str = "default"
    cache: bool = True


@asynccontextmanager
async def lifespan(app: FastAPI):

    redis = Redis.from_url(
        settings.redis_url,
        decode_responses=True,
    )

    await redis.ping()

    primary = Provider("primary")
    secondary = Provider("secondary")

    breakers = {
        "primary": CircuitBreaker(
            settings.circuit_failure_threshold,
            settings.circuit_recovery_seconds,
        ),
        "secondary": CircuitBreaker(
            settings.circuit_failure_threshold,
            settings.circuit_recovery_seconds,
        ),
    }

    app.state.redis = redis

    app.state.cache = RedisCache(redis)

    app.state.router = FallbackRouter(
        [primary, secondary],
        breakers,
    )

    yield

    await redis.aclose()


app = FastAPI(
    title="OnSpaceAI Cost & Reliability API",
    version="1.0.0",
)

app.add_middleware(
    RequestContextMiddleware
)

app.mount(
    "/metrics",
    WSGIMiddleware(metrics_app()),
)


@app.get("/health")
async def health(request: Request):

    try:
        await request.app.state.redis.ping()
        redis_ok = True

    except Exception:
        redis_ok = False

    return {
        "status":
            "ok" if redis_ok else "degraded",
        "redis": redis_ok,
    }</code></pre>

<h2>13. Configuration</h2>

<pre><code>from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):

    redis_url: str = (
        "redis://localhost:6379/0"
    )

    cache_ttl: int = 300

    circuit_failure_threshold: int = 5

    circuit_recovery_seconds: float = 30.0

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()</code></pre>

<h2>14. Environment</h2>

<pre><code>REDIS_URL=redis://localhost:6379/0
CACHE_TTL=300
CIRCUIT_FAILURE_THRESHOLD=5
CIRCUIT_RECOVERY_SECONDS=30</code></pre>

<h2>15. pytest</h2>

<pre><code>import pytest

from app.circuit_breaker import (
    CircuitBreaker,
    CircuitState,
)


@pytest.mark.asyncio
async def test_success_closes_breaker():

    breaker = CircuitBreaker(
        failure_threshold=2,
        recovery_seconds=1,
    )

    await breaker.record_failure()
    await breaker.record_success()

    assert (
        breaker.state
        == CircuitState.CLOSED
    )

    assert breaker.failures == 0</code></pre>

<h3>Fallback test</h3>

<pre><code>import pytest

from app.circuit_breaker import (
    CircuitBreaker,
)

from app.fallback_router import (
    FallbackRouter,
)

from app.providers import Provider


@pytest.mark.asyncio
async def test_primary_failure_falls_back():

    primary = Provider(
        "primary",
        failure_status=503,
    )

    secondary = Provider(
        "secondary",
        response={"ok": True},
    )

    router = FallbackRouter(
        [primary, secondary],
        {
            "primary":
                CircuitBreaker(),
            "secondary":
                CircuitBreaker(),
        },
    )

    result = await router.execute(
        {"prompt": "test"}
    )

    assert (
        result.provider
        == "secondary"
    )

    assert result.fallback is True

    assert result.data == {
        "ok": True
    }</code></pre>

<h3>Cache-key test</h3>

<pre><code>from app.cache import make_cache_key


def test_cache_key_is_deterministic():

    first = make_cache_key(
        "ai",
        {
            "a": 1,
            "b": 2,
        },
    )

    second = make_cache_key(
        "ai",
        {
            "b": 2,
            "a": 1,
        },
    )

    assert first == second


def test_cache_key_changes():

    first = make_cache_key(
        "ai",
        {"prompt": "one"},
    )

    second = make_cache_key(
        "ai",
        {"prompt": "two"},
    )

    assert first != second</code></pre>

<h2>16. GitHub Actions</h2>

<pre><code>name: OnSpaceAI CI

on:
  push:
    branches:
      - main
      - develop

  pull_request:
    paths:
      - "app/**"
      - "tests/**"
      - "Dockerfile"
      - "docker-compose.yml"
      - "requirements.txt"

jobs:

  test:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run tests
        run: |
          pytest -q</code></pre>

<h2>17. Runtime Flow</h2>

<pre>
REQUEST
   |
   v
Cache HIT?
   |
   +---- YES ----> RETURN
   |
   NO
   |
   v
Validate request
   |
   +---- INVALID --> 4xx
   |
   VALID
   |
   v
Circuit open?
   |
   +---- YES ----> Secondary
   |
   NO
   |
   v
Primary
   |
   +---- SUCCESS ----> Cache -> Return
   |
   +---- RETRYABLE --> Secondary
   |
   +---- NON-RETRYABLE --> Error
                         |
                         v
                    No wasted retry
</pre>

<h2>18. Retry Policy</h2>

<table>
  <thead>
    <tr>
      <th>Status</th>
      <th>Fallback</th>
      <th>Reason</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>408</td>
      <td>Yes</td>
      <td>Timeout</td>
    </tr>
    <tr>
      <td>429</td>
      <td>Yes</td>
      <td>Rate limit</td>
    </tr>
    <tr>
      <td>502</td>
      <td>Yes</td>
      <td>Bad gateway</td>
    </tr>
    <tr>
      <td>503</td>
      <td>Yes</td>
      <td>Service unavailable</td>
    </tr>
    <tr>
      <td>504</td>
      <td>Yes</td>
      <td>Gateway timeout</td>
    </tr>
    <tr>
      <td>400</td>
      <td>No</td>
      <td>Invalid request</td>
    </tr>
    <tr>
      <td>401</td>
      <td>No</td>
      <td>Authentication</td>
    </tr>
    <tr>
      <td>403</td>
      <td>No</td>
      <td>Authorization</td>
    </tr>
    <tr>
      <td>422</td>
      <td>No</td>
      <td>Validation</td>
    </tr>
  </tbody>
</table>

<h2>19. Cache Hierarchy</h2>

<pre>
L0  Request Deduplication
        |
L1  Browser Cache
        |
L2  CDN Cache
        |
L3  Redis/Application Cache
        |
L4  AI Context Cache
        |
L5  AI Result Cache
        |
Origin / AI Provider
</pre>

<h2>20. CDN Headers</h2>

<pre><code># Hashed static assets
Cache-Control:
  public,
  max-age=31536000,
  immutable

# Public dynamic content
Cache-Control:
  public,
  s-maxage=60,
  stale-while-revalidate=300

# Private data
Cache-Control:
  private,
  no-store</code></pre>

<h2>21. Cookie Strategy</h2>

<pre>
www.example.com
    |
    +-- minimal session cookie

app.example.com
    |
    +-- authentication/session

static.example.com
    |
    +-- NO COOKIE

cdn.example.com
    |
    +-- NO COOKIE
</pre>

<div class="note">
  Cookies should carry small identifiers and security attributes,
  not AI context, user profiles, permissions, secrets or large JSON.
</div>

<h2>22. Self-Healing Integration</h2>

<pre>
CI Failure
    |
    v
Fingerprint
    |
    +-- Known failure --> Reuse diagnosis
    |
    +-- New failure
             |
             v
       Context Compiler
             |
             v
        AI Diagnosis
             |
             v
         Safe Patch
             |
             v
       Focused Tests
          /       \
       PASS       FAIL
        |           |
        v           v
       PR        Retry / Rollback
</pre>

<h2>23. Production Hardening</h2>

<div class="grid">

  <div class="card">
    <strong>Security</strong>
    <p>
      Authentication, authorization, secret management,
      Redis authentication/TLS and request isolation.
    </p>
  </div>

  <div class="card">
    <strong>Reliability</strong>
    <p>
      Strict provider timeouts, bounded retries,
      circuit breakers and health checks.
    </p>
  </div>

  <div class="card">
    <strong>Cost</strong>
    <p>
      Token accounting, cache hit ratio,
      AI request avoidance and provider pricing.
    </p>
  </div>

  <div class="card">
    <strong>Observability</strong>
    <p>
      Prometheus metrics, structured logs,
      tracing and request correlation IDs.
    </p>
  </div>

</div>

<h2>24. Production Rules</h2>

<pre>
AUTOMATIC
  + cache
  + bounded retry
  + provider fallback
  + circuit breaker
  + deterministic test repair

HUMAN REVIEW
  + authentication
  + database migrations
  + infrastructure
  + security
  + production changes

NEVER AUTOMATIC
  + secrets
  + credentials
  + IAM escalation
  + security bypass
  + direct production mutation
</pre>

<h2>25. Cost Optimization Priority</h2>

<table>
  <thead>
    <tr>
      <th>Priority</th>
      <th>Component</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>P0</td>
      <td>Context Compiler</td>
      <td>Reduce unnecessary context generation</td>
    </tr>
    <tr>
      <td>P0</td>
      <td>Token Budget</td>
      <td>Prevent oversized requests</td>
    </tr>
    <tr>
      <td>P0</td>
      <td>Redis Cache</td>
      <td>Avoid repeated origin work</td>
    </tr>
    <tr>
      <td>P1</td>
      <td>CDN</td>
      <td>Reduce origin traffic</td>
    </tr>
    <tr>
      <td>P1</td>
      <td>AI Result Cache</td>
      <td>Avoid repeated AI requests</td>
    </tr>
    <tr>
      <td>P1</td>
      <td>Fallback Router</td>
      <td>Maintain availability</td>
    </tr>
    <tr>
      <td>P1</td>
      <td>Circuit Breaker</td>
      <td>Prevent retry storms</td>
    </tr>
    <tr>
      <td>P2</td>
      <td>Prometheus</td>
      <td>Measure reliability and cost</td>
    </tr>
    <tr>
      <td>P2</td>
      <td>Self-Healing</td>
      <td>Automate safe recovery</td>
    </tr>
  </tbody>
</table>

<h2>26. Run</h2>

<pre><code>docker compose up --build</code></pre>

<p>API:</p>

<pre><code>http://localhost:8000/docs
http://localhost:8000/health
http://localhost:8000/metrics</code></pre>

<p>Tests:</p>

<pre><code>python -m pip install -r requirements.txt
pytest -q</code></pre>

<h2>27. Example API Request</h2>

<pre><code>curl -X POST \
  http://localhost:8000/api/ai \
  -H "content-type: application/json" \
  -d '{
    "prompt": "Summarize this repository",
    "model": "default",
    "cache": true
  }'</code></pre>

<h2>28. Final Execution Model</h2>

<pre>
                    +------------------+
                    |      Request     |
                    +--------+---------+
                             |
                             v
                       +-----------+
                       |   Cache   |
                       +-----+-----+
                             |
                      HIT ---+--- MISS
                       |           |
                       v           v
                    Return     Validate
                                   |
                                   v
                            Circuit Breaker
                                   |
                                   v
                               Primary
                              /       \
                         success      failure
                            |            |
                            v            v
                          Cache      Secondary
                                         |
                                    success/fail
                                         |
                                         v
                                  Degraded/Cache
                                         |
                                         v
                                  Self-Healing
                                         |
                                         v
                                   Observability
</pre>

<h2>29. Design Principle</h2>

<div class="note">
  <p>
    <strong class="success">
      Avoid the request before optimizing the request.
    </strong>
  </p>

  <p>
    The system should first reuse cached data, then reuse compiled
    context, then minimize tokens, then route to a reliable provider,
    and only retry when the failure is actually retryable.
  </p>
</div>

<footer>
  <p>
    OnSpaceAI Cost &amp; Reliability Stack v1.0
  </p>
  <p>
    FastAPI + Redis + CDN/Cache + Fallback API +
    Circuit Breaker + Prometheus + pytest
  </p>
</footer>

</div>
</body>
</html>