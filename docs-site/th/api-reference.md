# เอกสารอ้างอิง API

Base URL สำหรับการพัฒนาในเครื่อง: `http://localhost:8000`

endpoint ทั้งหมดด้านล่างนี้คัดมาจากนิยาม router จริงใน `backend/routers/`

## Health

### `GET /health`

probe สำหรับตรวจว่าระบบยังทำงานอยู่ ไม่ต้องยืนยันตัวตน

```bash
curl -s http://localhost:8000/health
```

```json
{"status": "healthy", "scheduler_running": true}
```

---

## Workflow

### `GET /api/workflows/`

แสดง workflow ทั้งหมด response model: `list[WorkflowResponse]`

```bash
curl -s http://localhost:8000/api/workflows/
```

### `POST /api/workflows/{workflow_id}/execute`

สั่งรัน workflow ทันที response model: `ExecutionResult`

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/execute
```

### `POST /api/workflows/{workflow_id}/toggle`

เปิดหรือปิด workflow response model: `WorkflowResponse`

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/toggle
```

---

## Cron job

### `POST /api/jobs/{job_id}/execute`

สั่งรัน job ทันที response model: `ExecutionResult`

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/execute
```

### `POST /api/jobs/{job_id}/toggle`

เปิดหรือปิด job response model: `CronJobResponse`

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/toggle
```

---

## Execution log

### `GET /api/execution/logs`

อ่านประวัติการทำงาน เรียงจากใหม่ไปเก่า response model:
`list[ExecutionLogResponse]`

| Query parameter | ชนิด | ค่าเริ่มต้น | หน้าที่ |
|---|---|---|---|
| `limit` | integer | `50` | จำนวน record สูงสุดที่จะคืน |

```bash
curl -s "http://localhost:8000/api/execution/logs?limit=10"
```

---

## Error

FastAPI คืน status code มาตรฐาน:

| Code | ความหมาย |
|---|---|
| `200` | สำเร็จ |
| `404` | ไม่พบ workflow, job หรือ record ที่ระบุ |
| `422` | ข้อมูลไม่ผ่านการตรวจสอบ — ตรวจชนิดข้อมูลใน payload |
| `500` | เซิร์ฟเวอร์ผิดพลาดโดยไม่ได้จัดการ — ตรวจ log |
