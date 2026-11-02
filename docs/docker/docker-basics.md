📁 หมวด: Docker / Containerization — ครบชุด 4 ไฟล์พร้อมใช้งาน 🚀
 
 
 
📄 ไฟล์ที่ 23 — docs/docker/docker-basics.md
 
markdown  
---
title: "Docker — พื้นฐาน"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["docker", "containers", "devops", "basics"]
---

# 🐳 เรียนรู้ Docker ตั้งแต่ต้น

> เขียนครั้งเดียว รันที่ไหนก็ได้ — สภาพแวดล้อมเหมือนกันทุกเครื่อง ✅

---

## 📌 Docker คืออะไร?

- **Container** = แอป + สภาพแวดล้อมที่จำเป็น ทุบลงไปรวมกัน
- **Image** = แม่แบบ (อ่านอย่างเดียว) — ต้นฉบับที่ใช้สร้าง Container
- **Container** = สถานะที่กำลังทำงาน — Instance ของ Image
- **Dockerfile** = สูตรที่บอกวิธีสร้าง Image

> 📦 เหมือน Class กับ Instance ในโปรแกรมมิ่ง: Image = Class, Container = Object

---

## 📝 โครงสร้าง Dockerfile พื้นฐาน

```dockerfile
# 1. ฐานภาพที่ใช้สร้าง
FROM node:20-alpine

# 2. กำหนดโฟลเดอร์ทำงานภายใน Container
WORKDIR /app

# 3. คัดลอกไฟล์ข้อกำหนดก่อน — เพื่อใช้ Cache ได้ดีขึ้น
COPY package*.json ./

# 4. ติดตั้งแพ็กเกจ
RUN npm ci --only=production

# 5. คัดลอกโค้ดส่วนที่เหลือ
COPY . .

# 6. กำหนดพอร์ตที่เปิดให้เข้าถึง
EXPOSE 3000

# 7. คำสั่งเมื่อเริ่ม Container
CMD ["node", "server.js"]
 
 
 
 
🛠️ คำสั่งพื้นฐานที่ต้องรู้
 
📦 จัดการ Image
 
bash  
docker build -t my-app:1.0 .               # สร้าง Image จาก Dockerfile
docker images                               # ดู Image ทั้งหมด
docker rmi my-app:1.0                       # ลบ Image
docker pull node:20-alpine                  # ดึง Image จาก Registry
docker push my-app:1.0                      # ส่ง Image ขึ้น Registry
 
 
🚀 จัดการ Container
 
bash  
docker run -d -p 80:3000 --name my-container my-app:1.0  # รัน Container
docker ps                                    # ดู Container ที่กำลังทำงาน
docker ps -a                                 # ดูทุก Container (รวมที่หยุด)
docker stop my-container                     # หยุดทำงาน
docker start my-container                    # เริ่มใหม่
docker restart my-container                  # รีสตาร์ท
docker rm my-container                       # ลบ Container
docker logs my-container                     # ดูบันทึกเหตุการณ์
docker logs -f my-container                  # ดูแบบติดตามเรียลไทม์
docker exec -it my-container sh              # เข้าไปใช้งานภายใน Container
 
 
 
 
🧠 แนวคิดสำคัญ
 
หลักการ ความหมาย 
Immutable Image Image ที่สร้างแล้ว แก้ไขไม่ได้ — ถ้าต้องเปลี่ยน ให้สร้างใหม่ 
Ephemeral Container Container หาย/รีสตาร์ท ข้อมูลภายในก็หายไป — ใช้ Volume ถ้าต้องการเก็บข้อมูล 
Layers แต่ละบรรทัดใน Dockerfile = 1 ชั้น — Docker Cache ชั้นที่เหมือนเดิม เพื่อสร้างเร็วขึ้น 
Small Image เล็ก = เร็วดาวน์โหลด = ปลอดภัยกว่า — ใช้ Alpine หรือ Distroless เสมอ 
 
 
 
✅ สรุปหลักการ
 
🐳 Dockerfile = สูตรสร้าง Image — เขียนแล้วใช้ซ้ำได้ตลอด
📦 Image = แม่แบบ, Container = สิ่งที่กำลังรัน
💾 ข้อมูลสำคัญ ใช้ Volume — อย่าเก็บภายใน Container
⚡ สร้างทีละขั้น ใช้ Cache ให้เป็นประโยชน์ — คัดลอกไฟล์ที่เปลี่ยนน้อยก่อน
🔒 Image เล็กและเฉพาะที่จำเป็น = ปลอดภัยและเร็วที่สุด
 
plaintext  

> 📖 **ไฟล์ที่ 23 เสร็จสิ้น**

---

# 📄 ไฟล์ที่ 24 — docs/docker/dockerfile-best-practices.md

```markdown
---
title: "Dockerfile Best Practices"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["docker", "dockerfile", "best-practices", "optimization"]
---

# ✅ เขียน Dockerfile ที่ดี — เร็ว เล็ก ปลอดภัย

> Image เล็ก = ดาวน์โหลดเร็ว, พื้นที่น้อย, ผิวสัมผัสความเสี่ยงน้อยลง ✅

---

## 📏 1. เลือก Base Image ให้เหมาะสม

| ประเภท | ขนาด | ใช้เมื่อ |
|---|---|---|
| `alpine` | ~5MB | ส่วนใหญ่ — เล็กและปลอดภัย |
| `slim` | ~100MB | ต้องการความเข้ากันได้มากกว่า Alpine |
| ปกติ | หลายร้อย MB | หลีกเลี่ยงเมื่อทำได้ |
| `distroless` | ขนาดเล็กมาก | ปลอดภัยสูงสุด — ไม่มีเชลล์ ไม่มีเครื่องมือเกินจำเป็น |

```dockerfile
# ✅ แนะนำ
FROM node:20-alpine

# ❌ ไม่แนะนำ — ใหญ่โดยไม่จำเป็น
FROM node:20
 
 
 
 
🗃️ 2. จัดลำดับเพื่อใช้ Cache
 
เปลี่ยนบ่อย → วางทีหลัง เปลี่ยนน้อย → วางก่อน
 
dockerfile  
# ✅ ดี — package เปลี่ยนน้อยกว่าโค้ด
COPY package*.json ./
RUN npm ci
COPY . .

# ❌ ไม่ดี — ทุกครั้งที่แก้โค้ด ต้องติดตั้งแพ็กเกจใหม่
COPY . .
RUN npm ci
 
 
 
 
🧹 3. ลดขนาด Image — Multi-Stage Build
 
สร้างในขั้นที่ 1 → คัดลอกแค่สิ่งที่จำเป็นไปขั้นที่ 2
 
dockerfile  
# ===== ขั้นที่ 1: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== ขั้นที่ 2: Production =====
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
 
 
💡 ผลลัพธ์: Image เล็กลงมาก เพราะไม่มีโค้ดต้นฉบับและเครื่องมือ Dev
 
 
 
🔒 4. ความปลอดภัย — ไม่รันด้วย Root
 
dockerfile  
# ✅ สร้างผู้ใช้ใหม่ และใช้งาน
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# ❌ ไม่ระบุ = รันด้วย Root — มีสิทธิ์ทั้งระบบ
 
 
 
 
⚠️ 5. สิ่งที่ควรรู้
 
.dockerignore — ไม่ต้องสิ่งที่ไม่จำเป็น
 
สร้างไฟล์ชื่อ  .dockerignore  ไว้ที่เดียวกับ Dockerfile:
 
plaintext  
node_modules
.git
.gitignore
.env
.DS_Store
*.log
dist
build
 
 
✅ คำแนะนำเพิ่มเติม
 
- ระบุเวอร์ชันชัดเจน — ไม่ใช่  FROM node:latest 
- ใช้  HEALTHCHECK  เพื่อตรวจสอบว่าแอปยังทำงานอยู่
- อย่าใส่ Secret ใน Dockerfile — ใช้ Environment Variable แทน
- ใช้  LABEL  เพื่อใส่ข้อมูลเมตา: ผู้แต่ง, เวอร์ชัน, คำอธิบาย
 
 
 
✅ สรุปหลักการ
 
🐳 เลือก Base Image ที่เล็กที่สุดเท่าที่ทำได้ — Alpine หรือ Distroless
📦 จัดลำดับไฟล์ให้ถูกต้อง — Cache ทำงานได้เต็มประสิทธิภาพ
🧹 Multi-Stage Build = ขนาดเล็กลง — ส่งแค่สิ่งที่จำเป็น
🔒 อย่ารันด้วย Root — สร้างผู้ใช้สิทธิจำกัด
🚫 .dockerignore = กรองสิ่งที่ไม่จำเป็นต้องส่งเข้า Image
 
plaintext  

> 📖 **ไฟล์ที่ 24 เสร็จสิ้น**

---

# 📄 ไฟล์ที่ 25 — docs/docker/docker-compose.md

```markdown
---
title: "Docker Compose — หลายคอนเทนเนอร์ทำงานร่วมกัน"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["docker", "docker-compose", "devops", "multi-container"]
---

# 🎯 จัดการหลายคอนเทนเนอร์ด้วย Docker Compose

> กำหนดทุกอย่างในไฟล์เดียว — รันทั้งระบบด้วยคำสั่งเดียว ✅

---

## 📌 โครงสร้างไฟล์ docker-compose.yml

```yaml
version: "3.8"

services:
  # แอปพลิเคชันหลัก
  app:
    build: .
    container_name: my-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=database
    depends_on:
      - database
    restart: unless-stopped

  # ฐานข้อมูล
  database:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret123
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

# โวลุ่มสำหรับเก็บข้อมูล
volumes:
  postgres-data:
 
 
 
 
🚀 คำสั่งที่ใช้บ่อย
 
เริ่มและหยุดระบบ
 
bash  
docker compose up -d                    # รันทั้งหมดในโหมดแบ็กกราวด์
docker compose up --build               # สร้างใหม่แล้วรัน
docker compose down                      # หยุดและลบ Container
docker compose down -v                   # หยุด + ลบ Volume (⚠️ ข้อมูลหาย!)
 
 
ตรวจสอบและดูรายละเอียด
 
bash  
docker compose ps                        # ดูสถานะทุก Service
docker compose logs                      # ดูบันทึกทั้งหมด
docker compose logs app                  # ดูเฉพาะแอป
docker compose logs -f                   # ติดตามแบบเรียลไทม์
docker compose restart                   # รีสตาร์ททั้งหมด
docker compose restart app               # รีสตาร์ทเฉพาะแอป
docker compose exec app sh               # เข้าไปใน Container แอป
 
 
 
 
🧠 ความเข้าใจสำคัญ
 
🔗 เครือข่ายภายใน
 
- ทุก Service ใน Compose อยู่ในเครือข่ายเดียวกันโดยอัตโนมัติ
- เรียกใช้ได้ด้วยชื่อ Service แทนที่จะเป็น IP:  database:5432  ✅
- ไม่ต้องเปิดพอร์ตให้ภายนอก ถ้าแค่ Service ภายในคุยกัน
 
💾 Volume = ที่จัดเก็บถาวร
 
- ข้อมูลใน Container หายเมื่อ Container ถูกลบ
- ใช้ Named Volume หรือ Bind Mount เพื่อเก็บข้อมูลถาวร
- Database ควรใช้ Named Volume เสมอ
 
⚙️ Environment Variable
 
- ไม่ควรใส่ข้อมูลลับลงในไฟล์โดยตรง
- ใช้ไฟล์  .env  แทน:
 
yaml  
environment:
  - DB_PASSWORD=${DB_PASSWORD}
 
 
จากนั้นสร้างไฟล์  .env :
 
plaintext  
DB_PASSWORD=secret123
 
 
⚠️ เพิ่ม  .env  เข้าใน  .gitignore  ด้วย — ห้ามส่งขึ้น Git!
 
 
 
✅ สรุปหลักการ
 
🎯 Service = คอนเทนเนอร์หนึ่งอย่าง — แยกแอป, ฐานข้อมูล, แคช ออกจากกัน
🔗 คุยกันด้วยชื่อ Service — ไม่ต้องจำ IP
💾 ข้อมูลสำคัญ ใช้ Volume — อย่าทิ้งไว้ใน Container
🔒 ความลับ ใส่ใน .env — ไม่ยัดลงใน YAML โดยตรง
🚀 รันทั้งระบบด้วยคำสั่งเดียว — docker compose up
 
plaintext  

> 📖 **ไฟล์ที่ 25 เสร็จสิ้น**

---

# 📄 ไฟล์ที่ 26 — docs/docker/docker-troubleshooting.md

```markdown
---
title: "Docker Troubleshooting Guide"
type: "reference"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["docker", "troubleshooting", "devops"]
---

# 🔧 คู่มือแก้ปัญหา Docker ที่พบบ่อย

> เมื่อสิ่งต่างๆ ไม่เป็นไปตามแผน — มาตรวจสอบและแก้ไขกัน ✅

---

## 🔍 ขั้นตอนพื้นฐานก่อนอื่นเสมอ

1. ดูสถานะ: `docker ps -a` — Container รันอยู่ไหม หรือหยุดไปแล้ว
2. ดูบันทึก: `docker logs <ชื่อ>` — ข้อความผิดพลาดบอกอะไร
3. ดูรายละเอียด: `docker inspect <ชื่อ>` — การตั้งค่าถูกต้องไหม

---

## ❌ ปัญหาที่พบบ่อยและวิธีแก้

### 1️⃣ พอร์ตใช้งานอยู่แล้ว
 
 
Error: listen EADDRINUSE: address already in use :::3000
 
plaintext  
✅ วิธีแก้:
- ดูว่าใครใช้พอร์ต: `lsof -i :3000` (Mac/Linux) หรือ `netstat -ano | findstr :3000` (Windows)
- เลือกพอร์ตอื่น: `-p 8080:3000`
- หรือหยุดโปรแกรมที่ใช้พอร์ตนั้นก่อน

### 2️⃣ Container หยุดทำงานทันทีที่เริ่ม
```bash
docker ps -a  # ดูสถานะ — Status = Exited
docker logs <ชื่อ>  # อ่านข้อความผิดพลาด
 
 
สาเหตุที่เป็นไปได้:
 
- แอปพลิเคชันพังทันทีที่เริ่ม
- พอร์ตไม่ตรงกันที่ระบุใน EXPOSE และโค้ด
- สิทธิ์เข้าถึงไฟล์ไม่ถูกต้อง
 
3️⃣ ไม่สามารถเข้าถึงแอปภายใน Container
 
- ตรวจสอบว่าแอปผูกกับ  0.0.0.0  ไม่ใช่  127.0.0.1 
- ตรวจสอบการ Map พอร์ต:  -p ภายนอก:ภายใน 
- ตรวจสอบ Firewall ของเครื่องโฮสต์
 
4️⃣ ข้อมูลหายเมื่อรีสตาร์ท Container
 
✅ ใช้ Volume:
 
yaml  
volumes:
  - my-data:/data
 
 
⚠️ ข้อมูลภายใน Container เป็นชั่วคราวเสมอ
 
5️⃣ Image ดาวน์โหลดช้ามาก
 
- ใช้ Registry Mirror ที่ใกล้ตัว
- ลบ Image เก่าที่ไม่ได้ใช้ออก:  docker image prune -a 
- ล้างระบบทั้งหมด:  docker system prune 
 
6️⃣ Docker Compose — Service คุยกันไม่ได้
 
- ตรวจสอบชื่อ Service ใน compose ให้ตรงกับที่ใช้
- รอให้ Service ปลายทางพร้อม — ใช้  depends_on  เพียงอย่างเดียวไม่พอ ต้องมี Health Check หรือ Retry ในแอป
 
 
 
🧹 ทำความสะอาดระบบ Docker
 
bash  
# ลบทุกอย่างที่ไม่ได้ใช้ — ⚠️ ระวังจะลบของที่ต้องการด้วย
docker system prune -a

# ลบเฉพาะ Resource ที่หยุดทำงานแล้ว
docker system prune

# ลบ Image ที่ไม่มี Container ใช้
docker image prune -a

# ดูพื้นที่ที่ Docker ใช้อยู่
docker system df
 
 
 
 
✅ สรุปหลักการ
 
🔍 ดู Log ก่อนเสมอ — คำตอบอยู่ในนั้น
📋 ตรวจสอบพอร์ต, เส้นทาง, สิทธิ์ — ปัญหาส่วนใหญ่มาจากจุดนี้
💾 ข้อมูลสำคัญ = Volume เสมอ — ไม่ต้องสงสัย
🔄 Service คุยกันด้วยชื่อ — Compose จัดการ DNS ให้แล้ว
🧹 ทำความสะอาดเป็นประจำ — prune ช่วยได้มาก
 
plaintext  

> 📖 **ไฟล์ที่ 23–26 เสร็จสิ้น — จบหมวด Docker ✅**
> พิมพ์ **"ถัดไป"** เพื่อเข้าสู่หมวด **Kubernetes** ครับ! 😊