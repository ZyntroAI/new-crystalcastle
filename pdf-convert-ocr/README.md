Here's your **complete, production-ready README.md** — everything you need to deploy, configure, and use the platform 📚✨

---

# 📄 ZyntroAI OCR Platform

> **Enterprise-grade, self-hosted optical character recognition pipeline**
> Multi-language • Searchable PDF output • Real-time dashboard • Email/Slack alerts • Docker-ready

---

## 🚀 Quick Start

```bash
git clone <repository-url>
cd pdf-convert-ocr

# Edit environment variables
cp .env.example .env
nano .env

# Launch everything
docker-compose up -d

# Open dashboard → http://localhost
```

---

## 📋 Features Overview

| Module | Capability |
|---|---|
| **🧠 OCR Engine** | English + Thai language support; System Tesseract (fastest) or pure JS fallback |
| **📄 Output** | Searchable PDF with invisible text layer + raw text extract |
| **⚡ Performance** | Parallel workers; multi-page PDF support; 7× faster with system Tesseract |
| **🌐 API** | FastAPI + async job queue; OpenAPI/Swagger docs at `/docs` |
| **🖥️ Dashboard** | React UI with drag & drop; real-time status via WebSocket |
| **👁️ Auto-Scan** | Folder watcher — drop files → auto-process → webhook notifications |
| **🔔 Alerts** | Browser sound + desktop popups + Email (SMTP) + Slack webhooks |
| **🐳 Deployment** | Single container — Python + Node + Tesseract + Nginx included |

---

## 📂 Project Structure

```
pdf-convert-ocr/
├── src/
│   ├── lib/
│   │   ├── ocr/              # Core OCR engine (TypeScript)
│   │   └── scanner/         # Folder watcher + webhooks
│   ├── api/                  # FastAPI backend
│   │   ├── main.py           # Entry point
│   │   ├── models.py         # Pydantic schemas
│   │   ├── config.py         # Settings
│   │   ├── routes/           # API endpoints
│   │   └── services/         # Job queue · WebSockets · Notifications
│   └── cli/                  # Command-line interface
├── ui/                       # React Dashboard
│   ├── src/
│   │   ├── components/       # Upload · Status · Results · Settings
│   │   ├── hooks/            # WebSocket · Notifications
│   │   └── api/              # Client SDK
│   └── public/assets/        # Sounds · Icons
├── Dockerfile                # Multi-stage production build
├── docker-compose.yml        # Deployment manifest
├── requirements.txt          # Python dependencies
├── package.json              # Node dependencies
└── .env                      # Secrets & configuration
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `you@gmail.com` |
| `SMTP_PASS` | SMTP password/app-password | `xxxx xxxx xxxx` |
| `ALERT_EMAIL` | Email address to receive alerts | `notify@your.com` |
| `SLACK_WEBHOOK` | Slack incoming webhook URL | `https://hooks.slack.com/...` |
| `MAX_FILE_SIZE_MB` | Upload limit | `150` |
| `MAX_CONCURRENT_JOBS` | Parallel processing limit | `2` |
| `BASE_URL` | Public URL for download links | `https://ocr.yourdomain.com` |

Copy `.env.example` → `.env` and fill in your values. All notification variables are **optional** — leave blank to disable that channel.

---

## 🖥️ Usage

### Dashboard UI
Open **http://localhost** in your browser:
1. Drag & drop PDF or image
2. Select language → toggle outputs → **Start OCR**
3. Watch live status updates 🔴
4. Preview text → download searchable PDF

### REST API
```bash
# Submit job
curl -X POST http://localhost/api/v1/ocr/submit \
  -F "file=@document.pdf" \
  -F "lang=th+en" \
  -F "save_searchable_pdf=true"

# Check status
curl http://localhost/api/v1/ocr/status/<job_id>

# Interactive docs → http://localhost/docs
```

### Auto-Scan Folder Watcher
```bash
docker-compose exec pdf-ocr node dist/cli/index.js auto-scan \
  --watch /data/dropzone \
  --output /data/processed \
  --archive /data/originals \
  --lang th+en \
  --workers 4 \
  --webhook-url https://your.com/webhook \
  --base-url https://ocr.yourdomain.com
```

Drop files into `/data/dropzone` — processed automatically, moved to archive, notifications sent.

### Command Line
```bash
node dist/cli/index.js ocr document.pdf \
  --lang th+en \
  --save-searchable-pdf \
  --workers 4 \
  --backend auto
```

---

## 🔔 Notifications

| Channel | Setup |
|---|---|
| **Browser** | Enable once in UI → desktop popup + sound on completion |
| **Email** | Fill SMTP vars in `.env` → delivered on every job |
| **Slack** | Create incoming webhook at `api.slack.com/apps` → paste URL → rich card with download buttons |
| **Webhook** | `--webhook-url` → POST events to your endpoint with HMAC signature |

All channels operate independently — enable any combination.

---

## 🐳 Docker Deployment

```yaml
version: '3.8'

services:
  pdf-ocr:
    build: .
    ports:
      - "80:80"
      - "8271:8271"
    volumes:
      - ocr-data:/data
    restart: unless-stopped
    environment:
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USER=alerts@your.com
      - SMTP_PASS=secret
      - ALERT_EMAIL=team@your.com
      - SLACK_WEBHOOK=https://hooks.slack.com/...
      - BASE_URL=https://ocr.yourdomain.com

volumes:
  ocr-data:
```

```bash
docker-compose up -d --build
docker-compose logs -f
```

### Ports
| Port | Service |
|---|---|
| `80` | Dashboard UI + API proxy |
| `8271` | Direct FastAPI access |

### Persistent Data
All uploads, outputs, and archives stored in named volume `ocr-data` — survives container restarts/upgrades.

---

## 🔒 Security & Best Practices

- **Never commit `.env`** — it contains secrets
- Use **app passwords** instead of primary account passwords for SMTP
- Rotate Slack webhooks periodically
- Add authentication (`nginx.conf` or reverse proxy) for public deployments
- HMAC-sign webhook payloads — verify signature before processing

---

## 🛠️ Development

```bash
# Terminal 1: TypeScript build + watch
npm run build -- --watch

# Terminal 2: FastAPI
cd src/api
uvicorn main:app --reload

# Terminal 3: UI dev server
cd ui
npm run dev
```

---

## 📊 Troubleshooting

| Issue | Fix |
|---|---|
| **Tesseract not found** | Ensure `tesseract-ocr` + language packs installed; Docker image includes them pre-configured |
| **Slow processing** | `--backend system` is fastest; increase `--workers` if CPU available |
| **Email not sending** | Check SMTP host/port; Gmail requires 2FA + App Password |
| **Slack messages missing** | Verify webhook is active and has permission to post to channel |
| **Web UI can't connect** | Check Vite proxy config; ensure API is running on port 8271 |
| **Large uploads fail** | Increase `client_max_body_size` in `nginx.conf` + `MAX_FILE_SIZE_MB` env |

---

## 📈 Performance Reference

| Backend | Speed | Setup Required |
|---|---|---|
| `system` | ⚡ Fastest | Install Tesseract (Docker: pre-bundled) |
| `js` | 🐌 Slower | None — pure WASM, works everywhere |

| Workers | Recommendation |
|---|---|
| 1–2 | Small deployments / low CPU |
| 4 | Balanced performance |
| 6–8 | High-core servers / batch processing |

---

## ✅ What's Included — v1.4.0

- ✅ Multi-language OCR (English + Thai)
- ✅ Searchable PDF generation
- ✅ Parallel processing engine
- ✅ FastAPI + async job queue
- ✅ React dashboard with drag & drop
- ✅ Real-time WebSocket status feed
- ✅ Browser notifications (sound + desktop)
- ✅ Email alerts via SMTP
- ✅ Slack integration with rich cards
- ✅ Folder auto-scanner + webhooks
- ✅ All-in-one Docker production image
- ✅ Health checks + auto-restart
- ✅ Persistent data volumes
- ✅ Complete documentation

---

## 🤝 Support & Extensions

Want to add:
- Multi-user accounts & RBAC
- AWS S3 / Google Cloud Storage integration
- Custom trained models for specialized fonts
- Mobile app or PWA
- Enterprise SSO / OIDC

Let me know! 🚀

---

**Built with ❤️ by ZyntroAI • Privacy-first, self-hosted, open-core**
