# AI Providers Reference — CrystalCastle X

> โหลดไฟล์นี้เมื่อ: แตะ `src/ai/providers/`, เพิ่ม/แก้ LLM integration, หรือถามเกี่ยวกับ API key / failover / cost

## หลักการสำคัญ (ห้ามฝ่าฝืน)

**ห้ามเรียก OpenAI/Gemini/Mistral SDK โดยตรงใน business logic** — ทุกการเรียก LLM ต้องผ่าน `src/ai/providers/` เท่านั้น
เหตุผล: failover, key rotation, cost tracking, rate limiting, prompt versioning — ทำได้ที่จุดเดียว

## Provider Abstraction Pattern

```
src/ai/providers/
├── base.py            # BaseProvider: abstract generate(), embed(), stream()
├── openai_provider.py
├── gemini_provider.py
├── mistral_provider.py
└── router.py          # ProviderRouter: เลือก provider + failover + circuit breaker
```

**วิธีเรียก (ถูก):**
```python
from src.ai.providers.router import get_provider
provider = get_provider(task="caption")   # router ตัดสินใจตาม task + availability + cost
result = await provider.generate(prompt=prompt, max_tokens=1024)
```

**วิธีเรียก (ผิด — ห้าม):**
```python
from openai import AsyncOpenAI   # ❌ ห้าม import SDK โดยตรงนอก providers/
```

## Failover + Circuit Breaker

- **ลำดับ fallback**: OpenAI → Gemini → Mistral (กำหนดได้ตาม task type ใน config)
- **Circuit breaker**: ถ้า provider ใด fail ติดต่อกัน 3 ครั้ง → mark down 5 นาที → ข้ามไป provider ถัดไป
- **Timeout**: แต่ละ provider 30s; หมดเวลา → fallback ทันที
- **Rate limit**: ต่อ provider มี queue + retry with backoff (exponential, max 5 ครั้ง)
- **Key rotation**: key แต่ละอายุ 90 วัน; ถ้าได้ 401/403 → auto-rotate ไป key ถัดไปใน pool (ถ้ามี)

## Env Vars & Secrets

| Var | ใช้ที่ | หมายเหตุ |
|---|---|---|
| `OPENAI_API_KEY` | OpenAIProvider | scoped, budget alert, rotate ทุก 90 วัน |
| `GEMINI_API_KEY` | GeminiProvider | — |
| `MISTRAL_API_KEY` | MistralProvider | — |
| `LLM_PROVIDER_PRIORITY` | router | เช่น `openai,gemini,mistral` |
| `LLM_MAX_COST_PER_DAY` | cost guard | เกินจะ reject task ใหม่ + alert |

- Secrets อยู่ใน **GitHub Environment** (`sandbox`/`production`) + `.env` (local, อยู่ใน .gitignore)
- **ห้าม log API key / prompt ที่มีข้อมูล user** — log แค่ model, tokens, latency, cost
- ถ้า key รั่ว → revoke ทันที + rotate + แจ้งใน security advisory

## Cost & Usage Tracking

ทุก request ผ่าน router จะบันทึกลง Redis (db0) + PostgreSQL:
```json
{ "ts": "...", "task": "caption", "provider": "openai", "model": "gpt-4o-mini",
  "prompt_tokens": 1200, "completion_tokens": 300, "cost_usd": 0.0012, "latency_ms": 842 }
```
- มี daily budget guard (`LLM_MAX_COST_PER_DAY`) — เกินจะ return error ก่อนเรียก provider
- `ai-cost-monitor.yml` (แนะนำให้เพิ่ม) รายงานสรุปย้อน/สัปดาห์ → Slack

## Prompt Templates

- อยู่ใน `src/ai/prompts/` เป็นไฟล์ `.md`/`.txt` (versioned, review ได้) — **ไม่ hardcode ในโค้ด**
- แต่ละ prompt มี `id` + `version`; log prompt version ร่วมกับทุก request เพื่อ trace/rollback
- ทดสอบ prompt ด้วย `pnpm test:prompts` (golden outputs) ก่อนเปลี่ยน

## วิธีเพิ่ม Provider ใหม่ (เช่น Anthropic)

1. สร้าง `src/ai/providers/anthropic_provider.py` สืบทอด `BaseProvider`
2. ลงทะเบียนใน `router.py` + เพิ่ม priority config
3. เพิ่ม `ANTHROPIC_API_KEY` ใน GitHub Environments ทั้ง sandbox + production
4. เพิ่มใน cost tracking + circuit breaker config
5. เขียน unit test mock response + เพิ่มใน `fallback-mistral.yml`-style check (หรือรวมเข้า `ci.yml`)
6. **อย่า** ลบ provider เก่าจนกว่าจะแน่ใจว่าไม่มี task อ้างอิง
