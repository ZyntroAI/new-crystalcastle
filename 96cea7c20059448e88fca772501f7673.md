# Auto-Repair Loop Reference — CrystalCastle X

> โหลดไฟล์นี้เมื่อ: workflow fail, ต้องการรัน/แก้ไข auto-repair, หรือถามเกี่ยวกับ rollback / `scripts/ai_repair.py`

## ภาพรวม

```
workflow (ci / docker-deploy / sandbox) FAIL
        │
        ▼
ai-auto-repair.yml (trigger: workflow_run → completed + failure)
        │
        ├─ checkout failed branch
        ├─ download logs + artifacts ของ run ที่ fail → diagnostics/
        ├─ python3 scripts/ai_repair.py  (LLM วิเคราะห์ → patch.diff)
        ├─ ถ้า patch apply ได้ → branch repair/<run-id> → commit → PR
        └─ trigger workflow_dispatch บน branch นั้น ด้วย repair_attempt+1
        │
        ▼
รันซ้ำบน commit ใหม่ (attempt 1/2/3)
        │
   ┌────┴─────┐
  PASS       FAIL ≥3 ครั้ง / AI patch ไม่ได้
   │          │
   ▼          ▼
 merge PR   ROLLBACK ไป SHA สุดท้ายที่ healthy + แจ้ง human
```

## Circuit Breaker

- `MAX_REPAIR_ATTEMPTS = 3` (กำหนดใน workflow env)
- track ผ่าน input `repair_attempt` ของ `workflow_dispatch` (เริ่มที่ 0)
- ถ้า `repair_attempt >= 3` → repair job **skip** → ไป rollback ทันที
- แต่ละ repair เป็น branch/PR แยก — ไม่กระทบ `develop`/`main` จนกว่าจะ pass ทุก check

## `scripts/ai_repair.py`

**Input:** `diagnostics/` (workflow.log, context.txt, recent-commits, last-diff, trivy results, build artifact)
**Providers:** `LLM_PROVIDER` env → `ollama` (default, local runner) / `openai` / `anthropic`
**Output files:**
- `failure_context.json` — ข้อมูล failure ครบถ้วน
- `repair_prompt.txt` — prompt ที่ส่งให้ LLM (เก็บเพื่อ audit)
- `llm_response.md` — คำตอบ AI (root cause + suggested fix + diff)
- `repair.patch` — unified diff (ถ้า AI เสนอ)
- `repair_result.json` — `{status: applied|failed|skipped, ...}`

**Exit codes:** `0` = patch applied / analyzed; `1` = patch ไม่ apply ได้ (ต้อง manual); ไม่มี API key → skip อย่างปลอดภัย (ไม่ fail workflow)

**วิธีรันมือ (debug):**
```bash
export LLM_PROVIDER=openai OPENAI_API_KEY=sk-...
export GITHUB_SHA=<failed-sha> GITHUB_RUN_ID=<run-id> FAILURE_STEP=health-check
python3 scripts/ai_repair.py
# ดู llm_response.md + repair.patch ก่อนตัดสินใจ apply
```

## Rollback (เมื่อ repair หมดความพยายาม)

```bash
# ดู SHA สุดท้ายที่ healthy (จาก artifact sandbox-history / deploy log)
ssh user@sandbox "cd /opt/sandbox/crystalcastlex && \
  echo 'IMAGE=ghcr.io/ZyntroAI/crystalcastleX:sha-<last-healthy>' > .env.sandbox && \
  docker compose -f docker-compose.sandbox.yml up -d --no-deps api"
# แจ้ง Slack/email + เปิด issue ให้ human ตรวจสอบ
```

## Manual Runbook (เมื่อต้องแทรกแซง)

```bash
# 1. ดู log ของ run ที่ fail
gh run view <run-id>
gh run view <run-id> --log > diagnostics/workflow.log

# 2. ดูว่า sandbox กำลังรัน SHA ไหน
ssh user@sandbox "cat /opt/sandbox/crystalcastlex/.env.sandbox"

# 3. ดู container log จริงบน sandbox
ssh user@sandbox "docker compose -f /opt/sandbox/crystalcastlex/docker-compose.sandbox.yml logs -f --tail=200 api"

# 4. Rollback มือ (ถ้าจำเป็น)
# ดูตามคำสั่งด้านบน

# 5. ดู artifact/diagnostics ทุก run
gh run download <run-id>
```

## กฎสำคัญ

- **ห้าม push repair commit ไป `develop`/`main` โดยตรง** — ต้องเป็น PR + รัน pipeline ให้ pass ก่อน
- **ห้ามให้ AI patch ไฟล์ secret / workflow ที่มี permission สูง** โดยไม่มี human review (auto-merge เฉพาะไฟล์ code ธรรมดา)
- ทุก repair PR ต้องมี label `auto-repair` และ link ไปยัง failed run
- ถ้า AI patch แตะ `.github/workflows/` หรือ `Dockerfile` → ต้อง human approve เสมอ (ไม่ auto-merge)
- เก็บ `diagnostics/` เป็น artifact 30 วันสำหรับ audit
