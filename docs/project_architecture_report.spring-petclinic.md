# 📊 รายงานสถาปัตยกรรมโครงการ — Spring PetClinic

> **วันที่:** 2026-09-09
> **สาขา/Commit:** main @ f4a382c
> **วิเคราะห์โดย:** Antigravity Pattern
> **ไฟล์ที่อ่าน:** 8 ไฟล์

---

## 1. สรุปผู้บริหารและภาพรวม

> **วัตถุประสงค์โครงการ:** แอปพลิเคชันตัวอย่างมาตรฐานของ Spring Framework — ระบบบริหารคลินิกสัตว์เลี้ยง
>
> **คำอธิบายสั้น:** สาธิตสถาปัตยกรรมแบบหลายชั้น (Multi-tier) ใช้ Spring Boot 3.x, JPA, Thymeleaf — จัดการเจ้าของ, สัตว์เลี้ยง, การเข้ารักษา, และสัตวแพทย์
>
> **สถานะปัจจุบัน:** ✅ พร้อมใช้งาน — Reference Application ที่ได้รับการดูแลอย่างดี

---

## 2. สแต็กเทคโนโลยีและเครื่องมือ

### 🧩 ภาษาและเฟรมเวิร์ก
- **ภาษา:** Java 17+
- **เฟรมเวิร์ก:** Spring Boot 3.4.x, Spring MVC, Spring Data JPA
- **การตรวจสอบ:** Jakarta Validation

### 💾 ข้อมูลและการจัดเก็บ
- **ฐานข้อมูล:** H2 (หน่วยความจำ) / MySQL / PostgreSQL
- **ORM:** Spring Data JPA + Hibernate
- **แคช:** JCache (JSR-107) + Caffeine

### 🎨 ส่วนติดต่อผู้ใช้และการนำเสนอ
- **เทมเพลต:** Thymeleaf
- **UI:** Bootstrap 5, Font Awesome 4.7

### 🔧 เครื่องมือสร้างและการพัฒนา
- **ระบบสร้าง:** Maven (`pom.xml`) และ Gradle (`build.gradle`)
- **คอมไพล์เนทีฟ:** GraalVM — รองรับภาพเนทีฟผ่าน `GraalVMNativeImageHint`

---

## 3. โมเดลโดเมนและโครงสร้างข้อมูล

### 📦 คลาส/เอนทิตีหลัก
| ชื่อคลาส/เอนทิตี | ความรับผิดชอบ | สืบทอดจาก |
|---|---|---|
| `Owner` | ข้อมูลเจ้าของสัตว์เลี้ยง | `Person` → `BaseEntity` |
| `Pet` | ข้อมูลสัตว์เลี้ยงและวันเกิด | `NamedEntity` → `BaseEntity` |
| `Visit` | บันทึกการเข้ารักษา | `BaseEntity` |
| `Vet` | ข้อมูลสัตวแพทย์และความเชี่ยวชาญ | `Person` → `BaseEntity` |
| `PetType` | ประเภทสัตว์ | `NamedEntity` → `BaseEntity` |
| `Specialty` | ความเชี่ยวชาญของสัตวแพทย์ | `NamedEntity` → `BaseEntity` |

### 🔗 ความสัมพันธ์