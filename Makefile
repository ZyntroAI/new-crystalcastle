# ====================================================
# 🐳 Docker — Build & Security Scan
# ตรงกับ Dockerfile Multi-stage & CI Pipeline
# ====================================================
.PHONY: docker-build docker-scan docker-clean docker-all

# ตัวแปรตรงกับ CI
IMAGE_NAME := ghcr.io/zyntroai/new-crystalcastle/new-crystalcastle
IMAGE_TAG := latest
FULL_IMAGE := $(IMAGE_NAME):$(IMAGE_TAG)
TARGET_STAGE := production

## 📦 สร้างภาพตามขั้นตอนเดียวกับ CI
docker-build:
	@echo "🐳 Building → stage: $(TARGET_STAGE)"
	docker build \
		--target $(TARGET_STAGE) \
		-t $(FULL_IMAGE) \
		-f Dockerfile .
	@echo "✅ Build เสร็จ — $(FULL_IMAGE)"
	@docker images $(IMAGE_NAME)

## 🔍 สแกนช่องโหว่ (เหมือนใน CI ทุกประการ)
docker-scan:
	@command -v trivy >/dev/null 2>&1 || { \
		echo ""; \
		echo "⚠️  ไม่พบ Trivy — ติดตั้งก่อนใช้ครับ:"; \
		echo "   macOS:   brew install aquasecurity/trivy/trivy"; \
		echo "   Ubuntu:  sudo apt install trivy"; \
		echo "   Docker:  alias trivy='docker run --rm -v \$$HOME/.trivy:/root/.trivy aquasec/trivy'"; \
		echo ""; exit 1; \
	}
	@echo "🔍 สแกน: $(FULL_IMAGE)"
	trivy image \
		--scanners vuln \
		--severity CRITICAL,HIGH \
		--exit-code 1 \
		--format table \
		$(FULL_IMAGE)
	@echo "✅ ไม่พบช่องโหว่ระดับ CRITICAL/HIGH — ผ่าน!"

## 🧹 ล้างภาพ
docker-clean:
	@echo "🧹 ลบภาพ $(IMAGE_NAME)..."
	-docker rmi $(FULL_IMAGE) 2>/dev/null || true
	-docker rmi -f $(shell docker images -q $(IMAGE_NAME)) 2>/dev/null || true
	@echo "✅ ล้างเรียบร้อย"

## 🚀 ครบชุด: สร้าง → สแกน → พร้อมส่ง PR
docker-all: docker-build docker-scan
	@echo ""
	@echo "🎉 ทุกขั้นตอนผ่าน!"
	@echo "✅ ตรงกับ CI Pipeline ทุกประการ"
	@echo "👉 git commit → push → เปิด PR ได้เลยครับ"

# ====================================================
# 📖 คู่มือการใช้งาน
# ====================================================
# make docker-build   # สร้างภาพ
# make docker-scan     # สแกนความปลอดภัย
# make docker-all      # ทำทั้งสองขั้นตอน
# make docker-clean    # ลบภาพ
