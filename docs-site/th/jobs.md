# Cron job

**cron job** คือหน่วยงานที่ตั้งเวลาไว้หนึ่งหน่วย สั่งรันแยกได้อิสระ
ไม่ผูกกับ workflow ที่อาจอ้างถึงมัน

## การสั่งรัน job เดี๋ยวนี้

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/execute
```

คืนค่าเป็น `ExecutionResult`

## การหยุดและกลับมาทำงานต่อ

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/toggle
```

คืน `CronJobResponse` ที่อัปเดตแล้ว โดยสถานะสะท้อนค่าใหม่

## Job ต่างจาก Workflow อย่างไร

| | Workflow | Cron job |
|---|---|---|
| ขอบเขต | automation หลายขั้นตอน | หน่วยงานที่ตั้งเวลาเดียว |
| Endpoint สำหรับสั่งรัน | `/api/workflows/{id}/execute` | `/api/jobs/{id}/execute` |
| Response model | `WorkflowResponse` | `CronJobResponse` |
| Endpoint toggle | `/api/workflows/{id}/toggle` | `/api/jobs/{id}/toggle` |

## ตัวอย่างครบวงจร

```python
import httpx

BASE = "http://localhost:8000"

with httpx.Client(base_url=BASE, timeout=30) as client:
    # สั่งรัน
    result = client.post("/api/jobs/1/execute").json()
    print("executed:", result)

    # หยุดไว้ก่อนจนกว่าจะสั่งอีกครั้ง
    paused = client.post("/api/jobs/1/toggle").json()
    print("state now:", paused)

    # อ่านว่าเกิดอะไรขึ้น
    for entry in client.get("/api/execution/logs", params={"limit": 5}).json():
        print(entry)
```
