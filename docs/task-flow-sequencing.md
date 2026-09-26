---
Title: Task-Flow Sequencing — CI/CD First
Subtitle: Implementation order for docs · compliance · OCR · CI/CD
Kicker: Decision Record
Author: Nattapong Pornlumfah · v1.0
Date: 2026-09-26
Theme: professional
Genre: reference
Font: plex
---

# 🔀 Task-Flow Sequencing — CI/CD First

## 1. Decision

**CI/CD ต้องมาก่อน** — เป็น flow แรกที่ implement รองลงมาคือ `docs` → `compliance` → `OCR`

CI/CD ไม่ใช่งานที่ใหญ่ที่สุดในสี่ข้อ แต่เป็นงานเดียวที่ **ปลดล็อกอีกสาม flow** — ทุก flow ที่ตามมาวิ่งบน pipeline ชุดเดียวกันได้ทันที

| ลำดับ | Flow | ขอบเขต |
|:---:|---|---|
| **01** | **CI/CD** | automated test · build · deploy pipeline |
| 02 | docs | documentation pipeline (build + publish + index) |
| 03 | compliance | policy & control evidence collection |
| 04 | OCR | document ingestion |

---

## 2. เหตุผลที่ CI/CD มาก่อน

**Feedback loop สั้นที่สุด** — ตรวจทุก commit แทนการรวม batch แล้วตรวจด้วยมือ ทำให้ข้อผิดพลาดถูกจับตอนที่ยังแก้ราคาถูก

**เป็น enabler ของ flow อื่น** — `docs`, `compliance` และ `OCR` ใช้ pipeline เดียวกันได้ทั้งสามตัว: build → test → artifact → publish จึงไม่ต้องสร้างกลไกใหม่ซ้ำ

**Time-to-value ทันที** — วัดผลได้ตั้งแต่วันแรกด้วยจำนวน commit ที่ผ่าน gate ไม่ต้องรอ `data model` (OCR) หรือ `policy owner` (compliance)

---

## 3. สิ่งที่ยังไม่พร้อมสำหรับ flow อื่น

การเลื่อน flow เหล่านี้ไม่ใช่เรื่องความสำคัญ แต่เป็นเรื่อง **เงื่อนไขที่ยังค้างอยู่**

| Flow | ตัวบล็อกที่แท้จริง |
|---|---|
| `compliance` | รอ policy owner ยืนยันชุด control ที่ต้องเก็บหลักฐาน |
| `OCR` | รอ dataset และ ingestion spec ที่ตกลงแล้ว |

ถ้าเริ่มสอง flow นี้ก่อน จะกลายเป็นงานที่ค้างรอ dependency ภายนอก ไม่ใช่ความคืบหน้า

---

## 4. ลำดับการ rollout

### Wave 1 · CI/CD — สัปดาห์นี้
`test` + `build` + `deploy` pipeline พร้อม gate ที่ SHA-pin แล้ว

### Wave 2 · docs — ต่อจาก Wave 1
`documentation pipeline` ใช้ build artifact จาก Wave 1

### Wave 3 · compliance — หลัง policy owner ยืนยัน
`policy` & `control evidence` collection ผูกกับ CI gate

### Wave 4 · OCR — หลัง dataset พร้อม
`document ingestion` ต่อท้าย pipeline เป็นปลายทางของ artifact

> **เริ่ม Wave 1 ได้ทันที** — CI/CD pipeline คือตัวปลดล็อกของสาม flow ที่เหลือ ไม่มี dependency ค้าง

---

## 5. เกณฑ์ตัดสินใจ

- [x] Flow ที่มี dependency ภายนอกน้อยที่สุดก่อน
- [x] Flow ที่เป็น enabler ของ flow อื่นก่อน
- [x] Flow ที่วัดผลได้ทันทีโดยไม่ต้องรอ data ก่อน
- [ ] ยังไม่ตัดสิน: ระยะเวลา Wave 2–4 (รอประเมินหลัง Wave 1 ปิด)

---

*ที่มา: ลำดับที่เลือก CI/CD first · 2026-09-26 · ZyntroAI*
