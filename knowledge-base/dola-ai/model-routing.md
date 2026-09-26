# 🧠 การเลือกโมเดล (Model Routing)

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. โมเดลที่มีในระบบ

**ตาราง 3-1: ลักษณะของโมเดล**

| โมเดล | ลักษณะ | ความเร็ว | ค่าใช้จ่าย | Context | เหมาะกับ |
|---|---|---|---|---|---|
| Gemini 3.8 Flash | เร็ว เบา ถูก | สูงสุด | ต่ำสุด | กลาง | Snippet, แก้เร็ว, CLI command |
| Claude Fable 5.1 | สมดุล ฉลาด คุ้มค่า | สูง | กลาง | ใหญ่ | คุณภาพโค้ด, เอกสาร, review, งานประจำ |
| GPT-6 Astra | ทรงพลัง เป็น agentic ละเอียด | ปกติ | เต็ม | ใหญ่มาก | วางแผน, หลายขั้นตอน, ตรวจสอบ, PR |

---

## 2. กฎการเลือก

**→ Gemini 3.8 Flash**

- ต้องการความเร็วมากกว่าความลึก
- แก้โค้ด **น้อยกว่า 50 บรรทัด**
- งาน: completion, แก้ syntax, CLI help, ติด label
- ไฟล์: JSON, YAML, Markdown, plain text

**→ Claude Fable 5.1 (ค่าเริ่มต้น 80% ของงาน)**

- แก้โค้ด **50–500 บรรทัด**
- งาน: code review, เขียน component, refactor, เขียน test, เขียนเอกสาร
- ไฟล์: TypeScript, Python, JavaScript, Prisma schema
- งานพัฒนาทั่วไปที่ต้องการทั้งคุณภาพและความเร็ว

**→ GPT-6 Astra**

- แก้โค้ด **เกิน 500 บรรทัด**
- งานแตะ **มากกว่า 3 ไฟล์**
- งาน: ออกแบบสถาปัตยกรรม, security audit, review PR ทั้งใบ, วิเคราะห์ incident, วางแผน
- มีคำเหล่านี้: `security`, `auth`, `migrate`, `breaking`, `deploy`, `production`

---

## 3. ผังการตัดสิน

```
งานเข้ามา
   ↓
แก้เกิน 500 บรรทัด หรือ แตะ >3 ไฟล์ ?
   ├── ใช่ → GPT-6 Astra
   └── ไม่ → มี keyword เสี่ยง (security/auth/deploy) ?
              ├── มี → GPT-6 Astra
              └── ไม่ → แก้เกิน 50 บรรทัด ?
                        ├── ใช่ → Claude Fable 5.1
                        └── ไม่ → Gemini 3.8 Flash
```

---

## 4. จับคู่บทบาท → โมเดล

**ตาราง 3-2: โมเดลตามบทบาท**

| บทบาท Dola | โมเดลที่แนะนำ | เหตุผล |
|---|---|---|
| PR Manager (ปกติ) | Claude Fable 5.1 | Review เร็ว พร้อมข้อเสนอแนะ |
| PR Manager (ซับซ้อน) | GPT-6 Astra | ตรวจหลายไฟล์ พร้อม self-check |
| Issue Triager | Gemini Flash | จัดหมวดและติด label เร็ว |
| Release Manager | Claude Fable 5.1 | คุณภาพสมดุลสำหรับ changelog และเอกสาร |
| Docs Maintainer | Claude Fable 5.1 | คุณภาพการเขียนและความเร็ว |
| Oncall Bot / Incident | GPT-6 Astra | วิเคราะห์ลึก เสนอวิธีแก้ที่ตรวจสอบแล้ว |
| Architecture Planning | GPT-6 Astra | วางแผนและตรวจสอบครบถ้วน |
| Quick Snippet / Fix | Gemini Flash | ตอบทันที |

---

## 5. อ่านต่อ

- บทบาททั้ง 5 → [architecture.md](architecture.md)
- ต้นทุนและ monitoring → [deployment.md](deployment.md)
