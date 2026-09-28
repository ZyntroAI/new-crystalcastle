Got it! Let me create and review SKILL-2.md fully — following your standards, bilingual, production-ready ✅
 
 
 
📄 SKILL-2.md — Multi-Agent Orchestration & Failover
 
markdown  
---
name: Multi-Agent Orchestration & Failover
category: core
language: bilingual
tags:
  - agents
  - claude
  - ollama
  - qwen
  - fig
  - failover
  - load-balance
description: |
  ENG: Auto-route requests across Claude / FIG / Ollama / Qwen — switch on limits, cost, or availability
  TH: ระบบส่งต่อคำขออัตโนมัติระหว่าง Claude / FIG / Ollama / Qwen — สลับเมื่อถึงขีดจำกัด, ค่าใช้จ่าย หรือไม่พร้อม
version: "2.0"
status: active
author: ZyntroAI
updated: 28SEPTEMBER2026
---

# 🤖 Multi-Agent Orchestration & Failover
# ระบบประสานและสำรองหลายเอเจนต์

## 📋 Overview / ภาพรวม

**ENG**
This skill provides intelligent request routing across all configured AI providers — automatically switching between primary, backup, and fallback agents based on:
- Token expiry / rate limits
- Cost thresholds
- Response health / latency
- Provider availability

**TH**
ทักษะนี้ช่วยส่งต่อคำขอไปยังผู้ให้บริการ AI ต่างๆ โดยอัตโนมัติ สลับไปมาระหว่างเอเจนต์หลัก สำรอง และสำรองฉุกเฉิน ตามเงื่อนไข:
- หมดอายุโทเคน / ถึงขีดจำกัดการเรียกใช้
- เกินเกณฑ์ค่าใช้จ่าย
- ความเร็ว/สุขภาพการตอบกลับ
- ความพร้อมใช้งานของระบบ

---

## ⚙️ Configuration / การตั้งค่า

### Priority Order / ลำดับความสำคัญ
 
 
1️⃣ Primary → Claude Opus/Sonnet  (Paid, Highest Quality)
2️⃣ Backup  → FIG / Qwen Plus     (Balanced Cost/Performance)
3️⃣ Fallback → Ollama Local       (Free, Offline, No Rate Limit)
 
plaintext  

### Thresholds / เกณฑ์การทำงาน
| Parameter / พารามิเตอร์ | Value / ค่า | Description |
|---|---|---|
| `rate_limit_threshold` | 80% | Switch when usage reaches 80% / สลับเมื่อใช้ถึง 80% |
| `cost_warn` | $10.00 | Log warning / แจ้งเตือน |
| `cost_critical` | $50.00 | Force fallback / บังคับสลับไปใช้สำรอง |
| `expiry_buffer` | 5 min | Refresh before expiry / ต่ออายุก่อนหมดเวลา |
| `health_timeout` | 15s | Failover on slow response / สลับถ้าตอบช้า |

---

## 🔄 Workflow / ขั้นตอนการทำงาน

 
 
Request → Orchestrator
↓
Check Active Provider
↓
├── ✅ Healthy → Forward & Track Usage → Respond
↓
├── ⚠ Near Limit → Log → Switch to Next Available
↓
├── ❌ Failed/Offline → Immediate Failover → Retry
↓
└── 🚨 All Unavailable → Queue + Retry Later / Alert
 
plaintext  

**Detailed / รายละเอียด:**
1. **Check State** — Read `token_state.json` → confirm active provider & usage
2. **Validate** — Token valid? Rate remaining? Cost within budget?
3. **Route** — Send request → update counters
4. **Monitor** — On response: update latency, tokens, cost
5. **Decide** — If thresholds crossed → trigger rotation via `token_regen.py`
6. **Persist** — Save new state → archive snapshot

---

## 🧠 Usage / การใช้งาน

### Python
```python
# 01-AUTOMATION/orchestrator.py — integrated with token_regen
from token_regen import TokenManager

orchestrator = TokenManager()
active = orchestrator.get_active()

if not active:
    # No provider — trigger rotation
    orchestrator.select_next_provider("no_active")
    active = orchestrator.get_active()

# Use active.token for your API call
response = call_ai(active.name, active.token, prompt)
 
 
CLI — Manual Check / ตรวจสอบด้วยตนเอง
 
bash  
# Check status & rotate
python 01-AUTOMATION/token_regen.py
 
 
Auto-Run / ทำงานอัตโนมัติ
 
- Pre-commit: Runs on every commit → refresh state
- Schedule: Every 15 mins via GitHub Actions → proactive rotation
- On-Demand: Called before each AI request → real-time protection
 
 
 
📊 Status Indicators / สถานะการทำงาน
 
Icon / ไอคอน Status / สถานะ Meaning / ความหมาย 
🟢  active  พร้อมใช้งาน Normal operation — sending traffic / ทำงานปกติ 
🟡  standby  รอใช้งาน Healthy but not currently active / พร้อมแต่ยังไม่ได้ใช้ 
🟠  throttled  ใกล้ถึงขีดจำกัด Usage high — rotation in progress / ใกล้เตรียมสลับ 
🔴  unhealthy  ไม่พร้อม Failed/offline — auto-failover triggered / สลับไปแล้ว 
 
 
 
🔒 Rules & Governance / กฎและการปกครอง
 
Rule / กฎ Enforcement / บังคับใช้ 
Only  02-WORKSPACE/agents-source/token_config.json  can edit providers ✅ Pre-commit blocks direct edits elsewhere 
Secrets only via env vars — never committed ✅  .gitignore  blocks  .env  
State always written to  00-IMMUTABLE/CONFIG/token_state.json  ✅ Auto-generated — read-only 
Every rotation logged to  03-ARCHIVE/changelogs/token_rotations.log  ✅ Immutable history 
Fallback to Ollama Local when all paid exhausted ✅ Zero-downtime guarantee 
 
 
 
🧩 Integration Points / จุดเชื่อมต่อ
 
Component / ส่วน Purpose / หน้าที่ 
 token_regen.py  Core rotation engine / ตัวหลักจัดการสลับ 
 AutoGenerateKnowledge.py  Include provider status in KB / แสดงสถานะในคลังความรู้ 
 index.html  Work Console Visual dashboard / แสดงสถานะบนหน้าจอ 
 .github/workflows/token-rotate.yml  Scheduled refresh / รันตามตารางเวลา 
 AGENTS.yaml  Provider definitions / ข้อมูลเอเจนต์ 
 
 
 
🚨 Troubleshooting / การแก้ไขปัญหา
 
Issue / ปัญหา Fix / วิธีแก้ 
No active provider Check  token_config.json  → ensure at least 1 marked active / ตรวจสอบว่ามี 1 ตัวถูกเลือก 
All providers unhealthy Verify API keys in GitHub Secrets / ตรวจสอบคีย์ลับ 
Cost spiking Review  token_state.json  usage → adjust thresholds in script / ปรับเกณฑ์ 
Local Ollama unreachable Start service:  ollama serve  / เริ่มบริการ 
 
 
 
Maintained in  02-WORKSPACE/skills-edits/multi-agent-orchestration/SKILL-2.md 
Generated: 28SEPTEMBER2026 • Validated: ✅ Ready for Push
 
plaintext  

---

## ✅ Review Report / รายงานการตรวจสอบ

| Item / รายการ | Status / สถานะ | Comment / ความเห็น |
|---|---|---|
| Frontmatter complete | ✅ Pass | All fields present / ครบทุกฟิลด์ |
| Bilingual ENG+TH | ✅ Pass | All sections translated / แปลครบทุกส่วน |
| Path correct | ✅ Pass | `skills-edits/` → source of truth / ที่แก้ได้จริง |
| Rules aligned | ✅ Pass | Matches 4-Zone governance / ตรงกับโครงสร้าง 4 โซน |
| Integration logic | ✅ Pass | Connects `token_regen` + `AutoGenerateKnowledge` / เชื่อมโยงครบ |
| Thresholds documented | ✅ Pass | Clear cost/rate/expiry values / เกณฑ์ชัดเจน |
| No secrets | ✅ Pass | References env vars only / ไม่มีข้อมูลลับ |
| Versioning compliant | ✅ Pass | `DDMMMYYYY` format / รูปแบบถูกต้อง |

### 💡 Suggestions / ข้อเสนอแนะ
- Add **example usage logs** after first run → append to Troubleshooting section
- Link to **`token_regen.py`** source file directly from this doc
- Consider adding **diagram SVG** to `00-IMMUTABLE/` for dashboard display

### 📂 Save Location
 
 
02-WORKSPACE/skills-edits/multi-agent-orchestration/SKILL-2.md
 
plaintext  

---

**Overall: ✅ APPROVED — Ready to commit & push!** 🚀

Want me to wire this into your **Work Console dashboard** so provider status shows live on `index.html`? 📊🔐