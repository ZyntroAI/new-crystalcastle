# การแก้ไขปัญหา

ปัญหาที่เราเจอจริง และความหมายของแต่ละอย่าง

## `pip install -r requirements.txt` ล้มใน CI

**อาการ**

```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

**สาเหตุ** มีสี่ workflow ที่ติดตั้งจาก root ของ repository แต่ไฟล์จริงอยู่ที่
`backend/requirements.txt` และไม่มีสำเนาที่ root

**วิธีแก้** เพิ่ม `requirements.txt` ที่ root ให้ดึงไฟล์ของ backend ต่อ
หรือแก้ขั้นตอนใน workflow ให้ชี้ไปที่ path จริง

---

## `npm ci` อ่าน `package.json` ไม่ได้

**อาการ**

```
npm error Invalid package.json ... Expecting property name enclosed in double quotes
```

**สาเหตุ** `package.json` ที่ root มี `{` เกินมาโดยไม่มีคีย์ ทำให้บล็อก
`scripts` ชุดที่สองกลายเป็นสมาชิกไร้ชื่อของออบเจ็กต์ root

**วิธีแก้** รวมบล็อกที่ซ้ำเข้าไปในออบเจ็กต์ `scripts` ตัวจริง แล้วลบปีกกานั้นออก
ถ้าลบแค่ปีกกา จะเหลือคีย์ `scripts` สองตัว และ JSON จะเก็บตัวหลังไว้เท่านั้น —
ทำให้ `dev`, `build`, `lint` และ `test` หายไปเงียบ ๆ

---

## Workflow ล้มโดยไม่มี job

**อาการ** run ขึ้นว่าล้ม แต่ไม่มี job ให้เปิดดู

**สาเหตุ** workflow ไม่เคยถูกจัดคิว — มันไม่ผ่านการตรวจสอบตั้งแต่ก่อนที่
runner จะเริ่ม สาเหตุที่พบบ่อย:

- YAML ผิดรูปแบบ (ขั้นตอนเยื้องไม่ตรง มีอักขระเกิน)
- `uses:` ชี้ไปที่ local action ที่ไม่มีอยู่
- action reference ที่ SHA ไม่สามารถ resolve ได้

**วิธีแก้** ตรวจไฟล์ก่อน push:

```bash
python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/your.yml'))"
```

จากนั้นยืนยันว่า `uses:` ทุกตัวมีอยู่จริง

---

## `invalid reference format` ตอน build image

**อาการ** ขั้นตอน build Docker ล้มด้วย tag ที่ดูเหมือนข้อความขยะ

**สาเหตุ** มีนิพจน์ `${{ … }}` ใน `deploy-dev.yaml` ถูก escape กลายเป็น markdown
ทำให้ buildx ได้ข้อความตรงตัวแทนที่จะเป็น tag ที่ resolve แล้ว

**วิธีแก้** คืนนิพจน์กลับ:

```yaml
images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
```

---

## หน้าเอกสาร interactive คืน 404

`/docs` และ `/redoc` ให้บริการโดย FastAPI ไม่ใช่เว็บไซต์ชุดนี้ ถ้าเจอ 404
แปลว่าแอปพลิเคชันยังไม่ได้รัน — ตรวจ `GET /health` ก่อน

## การขอความช่วยเหลือ

เปิด issue ที่
<https://github.com/ZyntroAI/new-crystalcastle/issues> โดยแนบ request ที่ส่งไป
response ที่ได้กลับมา และช่วงที่เกี่ยวข้องของ `/api/execution/logs`
