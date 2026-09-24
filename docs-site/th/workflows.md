# Workflow

**workflow** คือ automation ที่มีชื่อและมีสถานะเปิด/ปิด สั่งทำงานได้ทั้งตาม
ตารางเวลาและตามคำสั่ง

## การดูรายการ workflow

```bash
curl -s http://localhost:8000/api/workflows/
```

ผลลัพธ์เป็น array ของออบเจ็กต์ `WorkflowResponse` แต่ละรายการมี identifier
ที่ใช้กับ endpoint ระดับรายตัว

## การสั่งรัน workflow เดี๋ยวนี้

ใช้ `POST` ไปที่ endpoint `execute` ของ workflow นั้น:

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/execute
```

คืนค่าเป็น `ExecutionResult` ที่อธิบายการรันครั้งนั้น ระบบจะไม่รอให้ workflow
ที่ใช้เวลานานทำงานจบ — scheduler จะบันทึกความคืบหน้าไว้ใน execution log

## การเปิดและปิด

การ toggle จะสลับสถานะ active ของ workflow และคืน `WorkflowResponse`
ที่อัปเดตแล้ว:

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/toggle
```

การ toggle ให้ผลเป็น idempotent ในเชิงผลลัพธ์ แต่ไม่ใช่ในเชิงการเรียก —
เรียกหนึ่งครั้งสลับสถานะ เรียกสองครั้งจึงกลับมาที่เดิม

## การเรียกจากโค้ด

=== "Python"

    ```python
    import httpx

    BASE = "http://localhost:8000"

    with httpx.Client(base_url=BASE) as client:
        workflows = client.get("/api/workflows/").json()
        for wf in workflows:
            print(wf["id"], wf["name"])

        result = client.post("/api/workflows/1/execute").json()
        print(result)
    ```

=== "JavaScript"

    ```javascript
    const BASE = "http://localhost:8000";

    const workflows = await fetch(`${BASE}/api/workflows/`).then((r) => r.json());
    console.log(workflows);

    const result = await fetch(`${BASE}/api/workflows/1/execute`, {
      method: "POST",
    }).then((r) => r.json());
    console.log(result);
    ```
