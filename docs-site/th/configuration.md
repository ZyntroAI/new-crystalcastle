# การตั้งค่า

ระบบอ่านค่าตั้งต้นจาก environment ไฟล์ `.env.example` ที่ root ของ repository
ระบุตัวแปรทั้งหมดพร้อมค่าตัวอย่าง ให้คัดลอกเป็น `.env` แล้วใส่ค่าจริง

## แอปพลิเคชัน

| ตัวแปร | หน้าที่ | ตัวอย่าง |
|---|---|---|
| `APP_NAME` | ชื่อที่แสดง | `New Crystal Castle` |
| `APP_ENV` | ป้ายบอก environment | `production` |
| `NODE_ENV` | Node environment | `production` |
| `NEXT_PUBLIC_APP_URL` | URL หลักของ frontend | `https://your-domain.com` |
| `NEXT_PUBLIC_API_URL` | URL ของ API (ฝั่งเบราว์เซอร์) | `https://your-domain.com/api` |
| `API_URL` | URL ของ API (ฝั่งเซิร์ฟเวอร์) | `https://your-domain.com/api` |

## การยืนยันตัวตนและความปลอดภัย

| ตัวแปร | หน้าที่ |
|---|---|
| `API_KEY` | คีย์สำหรับเข้าใช้ API |
| `API_SECRET` | ซีเคร็ตของไคลเอนต์ — ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น |
| `JWT_SECRET` | ซีเคร็ตสำหรับเซ็น access token |
| `JWT_EXPIRES_IN` | อายุของ access token เช่น `24h` |
| `REFRESH_TOKEN_SECRET` | ซีเคร็ตสำหรับเซ็น refresh token |
| `REFRESH_TOKEN_EXPIRES_IN` | อายุของ refresh token เช่น `7d` |
| `DOLA_JWT_SECRET` | ซีเคร็ตแยกสำหรับงาน integration กับ DOLA |

!!! danger "ห้าม commit ซีเคร็ตจริง"
    ทุกค่าข้างต้นเป็น credential ทั้งหมด ไฟล์ `.env` ถูก ignore ไว้แล้ว
    ให้คงไว้เช่นนั้น ถ้าเคย commit ซีเคร็ตลงไป **ต้อง rotate** —
    การลบไฟล์ไม่อาจลบออกจากประวัติ git ได้

## ฐานข้อมูล

| ตัวแปร | หน้าที่ |
|---|---|
| `DATABASE_URL` | connection string ของ PostgreSQL แบบ async |

แอปพลิเคชันสร้างตารางให้เองตอนสตาร์ทผ่าน SQLAlchemy metadata
ดังนั้นฐานข้อมูลใหม่ที่ยังว่างเปล่าก็ใช้งานได้

## Scheduler

| ตัวแปร | หน้าที่ |
|---|---|
| `SCHEDULER_ENABLED` | สตาร์ท scheduler เบื้องหลังตอนบูต |

เมื่อ `SCHEDULER_ENABLED` เป็นจริง scheduler จะเริ่มทำงานใน lifespan hook ของ
FastAPI และหยุดอย่างเรียบร้อยตอนปิดระบบ

## การ build เอกสารชุดนี้

dependencies หลัก:

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

### การ export เป็น PDF (ทางเลือก)

การ export PDF ต้องใช้ WeasyPrint ซึ่งพึ่งพาไลบรารีของระบบ:

```bash
# Debian / Ubuntu
sudo apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 \
  libgdk-pixbuf-2.0-0 libffi-dev

pip install -r requirements-pdf.txt
```

เราแยกการ export PDF ออกจาก `requirements-docs.txt` โดยตั้งใจ
เพื่อให้การ build เอกสารไม่ล้มเพราะขาดไลบรารีของระบบ
