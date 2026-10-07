# ==========================================
# 🐳 Dockerfile — Multi-stage Build
# ==========================================
FROM python:3.12-slim AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# ติดตั้งขั้นต่ำ
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev python3-dev \
    && rm -rf /var/lib/apt/lists/*

# ==========================================
# Builder — ติดตั้งแพ็กเกจ
# ==========================================
FROM base AS builder

COPY requirements.txt .
RUN pip install --user -r requirements.txt

# ==========================================
# Production — ภาพเล็กที่สุด
# ==========================================
FROM base AS production

COPY --from=builder /root/.local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /root/.local/bin /usr/local/bin

COPY ./backend /app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
