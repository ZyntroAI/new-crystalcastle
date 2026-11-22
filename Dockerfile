# ==========================================
# 🐳 Dockerfile — New CrystalCastle API
# ==========================================
# Stage 1: Builder — ติดตั้งแพ็กเกจ
FROM python:3.11-slim AS builder

# ติดตั้งระบบพื้นฐาน
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ตั้งค่า Working Directory
WORKDIR /app

# ติดตั้ง Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ==========================================
# Stage 2: Runtime — ภาพสุดท้าย ขนาดเล็ก
# ==========================================
FROM python:3.11-slim AS runtime

# ตั้งค่า Environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/root/.local/bin:$PATH" \
    HOST=0.0.0.0 \
    PORT=8000

WORKDIR /app

# คัดลอกแพ็กเกจจาก Builder
COPY --from=builder /root/.local /root/.local

# คัดลอกโค้ดแอปพลิเคชัน
COPY . .

# เปิดพอร์ต
EXPOSE ${PORT}

# สร้างผู้ใช้ที่ไม่ใช่รูท เพื่อความปลอดภัย
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# คำสั่งเริ่มระบบ
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
