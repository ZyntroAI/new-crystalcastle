# ====================================================
# 🐳 Docker — Build & Security Scan
# ====================================================
.PHONY: docker-build docker-scan docker-clean docker-all

# ตัวแปร
IMAGE_NAME := zyntroai/new-crystalcastle
IMAGE_TAG := latest
FULL_IMAGE := $(IMAGE_NAME):$(IMAGE_TAG)

## 📦 สร้าง Docker Image แบบเดียวกับ CI
docker-build:
	@echo "🐳 Building $(FULL_IMAGE)..."
	docker build \
		--target production \
		-t $(FULL_IMAGE) \
		-f Dockerfile .
	@echo "✅ Build เสร็จเรียบร้อย — $(FULL_IMAGE)"
	@docker images $(IMAGE_NAME)

## 🔍 สแกนช่องโหว่ด้วย Trivy (เหมือนใน CI)
docker-scan:
	@command -v trivy >/dev/null 2>&1 || { \
		echo "⚠️  ไม่พบ Trivy — ติดตั้งก่อน: https://trivy.dev/getting-started/"; \
		echo "   macOS: brew install aquasecurity/trivy/trivy"; \
		echo "   Ubuntu: sudo apt install trivy"; \
		exit 1; \
	}
	@echo "🔍 สแกนภาพ $(FULL_IMAGE) — รอสักครู่..."
	trivy image \
		--scanners vuln \
		--severity CRITICAL,HIGH \
		--exit-code 1 \
		--format table \
		$(FULL_IMAGE)
	@echo "✅ ไม่พบปัญหาระดับสูง — ผ่าน!"

## 🧹 ลบภาพที่สร้างไว้
docker-clean:
	@echo "🧹 ลบภาพ $(IMAGE_NAME)..."
	-docker rmi $(FULL_IMAGE) 2>/dev/null || true
	-docker rmi -f $(shell docker images -q $(IMAGE_NAME)) 2>/dev/null || true
	@echo "✅ ลบเรียบร้อย"

## 🚀 ทั้งหมด: สร้าง → สแกน (คำสั่งเดียว)
docker-all: docker-build docker-scan
	@echo "🎉 ทุกขั้นตอนผ่าน — พร้อมส่ง PR!"

# ====================================================
# ✅ ตัวอย่างการใช้งาน
# ====================================================
# make docker-build   # สร้างภาพ
# make docker-scan     # สแกนความปลอดภัย
# make docker-all      # ทำทั้งสองขั้นตอน
# make docker-clean    # ลบภาพ
