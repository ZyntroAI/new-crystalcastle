# เอกสาร API ของ ZyntroAI

**Cron Automation System API** ใช้สำหรับจัดการ workflow และ cron job ที่ทำงานตาม
ตารางเวลา เอกสารชุดนี้อธิบาย HTTP API ที่ backend เปิดให้ใช้จริง พร้อมตัวอย่างโค้ดที่
รันได้ในภาษา JavaScript, Python, TypeScript และ cURL

<div class="grid cards" markdown>

-   **เพิ่งเริ่มต้น?**

    เริ่มจากคู่มือ [เริ่มต้นใช้งาน](getting-started.md) — ภายในประมาณ 5 นาที
    คุณจะได้ระบบที่ตอบ request ได้บนเครื่องตัวเอง

-   **จะเรียก API?**

    ไปที่ [เอกสารอ้างอิง API](api-reference.md) ซึ่งรวมทุก endpoint พร้อม
    payload และ response model

-   **มีอะไรพัง?**

    หน้า [การแก้ไขปัญหา](troubleshooting.md) รวมปัญหาที่เราเจอจริง และ
    ความหมายของแต่ละอย่าง

</div>

## API นี้ทำอะไร

ระบบแบ่งทรัพยากรออกเป็นสามกลุ่ม:

| กลุ่ม | Prefix | หน้าที่ |
|---|---|---|
| Workflow | `/api/workflows` | กำหนดและสั่งรัน automation หลายขั้นตอน |
| Cron job | `/api/jobs` | สั่งรันหรือหยุดงานที่ตั้งเวลาไว้ทีละงาน |
| Execution log | `/api/execution` | อ่านประวัติการทำงานที่ผ่านมา |

และมี health probe อยู่ที่ `/health`

## ภาพรวมเร็ว

```bash
# ระบบยังทำงานอยู่ไหม
curl -s http://localhost:8000/health
```

```json
{"status": "healthy", "scheduler_running": true}
```

## ภาษา

เอกสารชุดนี้มีทั้งภาษาอังกฤษและภาษาไทย สลับภาษาได้จากปุ่มในแถบด้านบน
หน้าภาษาไทยอยู่ภายใต้ `/th/` ส่วนภาษาอังกฤษเป็นค่าเริ่มต้นที่ root ของเว็บไซต์
