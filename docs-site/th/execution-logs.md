# Execution log

ทุกครั้งที่ workflow หรือ job ทำงาน ระบบจะบันทึกไว้ endpoint ของ log คือวิธีที่
ทำให้รู้ว่าเกิดอะไรขึ้น โดยไม่ต้องไปอ่าน stdout ของเซิร์ฟเวอร์

## การอ่าน log

```bash
curl -s "http://localhost:8000/api/execution/logs?limit=10"
```

| Parameter | ชนิด | ค่าเริ่มต้น | หมายเหตุ |
|---|---|---|---|
| `limit` | integer | `50` | จำนวน record ที่จะคืน |

ผลลัพธ์เป็น array ของ `ExecutionLogResponse` เรียงจากใหม่ไปเก่า

## การกรองฝั่งไคลเอนต์

ตอนนี้ยังไม่มีตัวกรองฝั่งเซิร์ฟเวอร์ จึงต้องกรองเองในเครื่อง:

```python
import httpx

with httpx.Client(base_url="http://localhost:8000") as client:
    logs = client.get("/api/execution/logs", params={"limit": 200}).json()

failures = [row for row in logs if row.get("status") not in ("success", "completed")]
for row in failures:
    print(row.get("job_id"), row.get("status"), row.get("message"))
```

!!! warning "`limit` คือเพดาน ไม่ใช่การแบ่งหน้า"
    `limit` ควบคุมจำนวนแถวที่คืนกลับ ไม่ใช่ cursor ถ้าต้องไล่ประวัติทั้งหมด
    ให้เพิ่ม `limit` แล้วตัดเป็นช่วงฝั่งไคลเอนต์ หรือเพิ่ม parameter
    สำหรับแบ่งหน้าฝั่งเซิร์ฟเวอร์

## การใช้ log เพื่อหาสาเหตุ

1. ทำซ้ำปัญหา ด้วยการเรียก execute ด้วยมือ
2. อ่าน log รายการใหม่สุดก่อน — การรันล่าสุดอยู่บนสุด
3. สังเกต status และ message เพราะสองค่านี้คือสิ่งที่ scheduler บันทึกไว้

ถ้า log ว่างเปล่าทั้งที่รู้ว่ามีการรันเกิดขึ้น ให้ตรวจว่า scheduler เปิดอยู่
(`SCHEDULER_ENABLED`) และการเชื่อมต่อฐานข้อมูลชี้ไปที่ที่คิดไว้จริง
