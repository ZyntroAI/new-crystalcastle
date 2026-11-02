📄 ไฟล์ที่ 12 — docs/coding/javascript/typescript-guide.md
 
markdown  
---
title: "TypeScript Guide"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["javascript", "typescript", "types", "guide"]
---

# 🔷 คู่มือ TypeScript

> เพิ่มความมั่นใจให้โค้ด JavaScript — ตรวจสอบข้อผิดพลาดก่อนรันจริง ✅

---

## 📌 ทำไมต้อง TypeScript?

| ปัญหา JavaScript | คำตอบ TypeScript |
|---|---|
| ชนิดข้อมูลผิดพลาดตอนรัน | ✅ ตรวจตอนเขียน — ก่อนรันเลย |
| ไม่รู้ว่าฟังก์ชันรับ-ส่งอะไร | ✅ มี Type Hint บอกชัดเจน |
| เปลี่ยนโครงสร้างแล้วหาจุดผิดยาก | ✅ IDE บอกทุกจุดที่ต้องแก้ |
| โค้ดเก่า อ่านยาก ไม่มีเอกสาร | ✅ ชนิดข้อมูลคือเอกสารในตัว |

---

## 🔤 ชนิดข้อมูลพื้นฐาน

```typescript
// ✅ ประกาศพร้อมชนิด
let name: string = "สมชาย";
let age: number = 25;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: string[] = ["สมชาย", "สมศรี"];
// หรือใช้แบบนี้ก็ได้
let scores: Array<number> = [85, 90, 95];

// ตัวแปรอาจเป็นค่าหรือไม่มีเลย
let maybeValue: string | null = null;
let optionalAge?: number; // อาจเป็น number หรือ undefined

// ค่าคงที่ที่เป็นไปได้เฉพาะบางค่า
type Role = "admin" | "user" | "guest";
const role: Role = "admin"; // ✅ ได้
// const role: Role = "superadmin"; // ❌ ไม่ได้
 
 
 
 
🧩 อินเทอร์เฟซ & ประเภทอ็อบเจกต์
 
✅ Interface
 
typescript  
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // ? = ไม่จำเป็น
  readonly createdAt: Date; // อ่านอย่างเดียว เปลี่ยนไม่ได้
}

const user: User = {
  id: 1,
  name: "สมชาย",
  email: "somchai@example.com",
  createdAt: new Date()
};
 
 
✅ Type Alias
 
typescript  
// คล้ายๆ interface แต่ใช้ได้ยืดหยุ่นกว่า
type Product = {
  id: number;
  name: string;
  price: number;
};

// Union type — ได้หลายแบบ
type StringOrNumber = string | number;
 
 
🔄 รวม/ขยายโครงสร้าง
 
typescript  
// Interface ขยายได้
interface Admin extends User {
  permissions: string[];
}

// Type ก็รวมได้
type PremiumUser = User & { membershipExpiry: Date };
 
 
 
 
📦 ฟังก์ชัน
 
typescript  
// ✅ ระบุชนิดพารามิเตอร์ + ค่าที่คืน
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// ⚙️ พารามิเตอร์เริ่มต้น
function greet(name: string = "ผู้ใช้"): string {
  return `สวัสดีคุณ ${name}`;
}

// 🔄 ฟังก์ชันไม่คืนค่า — ใช้ void
function logMessage(message: string): void {
  console.log(message);
}

// 🧩 Arrow Function
const multiply = (a: number, b: number): number => a * b;

// 📋 ฟังก์ชันแบบกำหนดรูป
type MathOperation = (x: number, y: number) => number;
const add: MathOperation = (a, b) => a + b;
 
 
 
 
🧠 ชนิดข้อมูลพิเศษที่ต้องรู้
 
ชนิด ใช้ทำอะไร เมื่อไหร่ควรใช้ 
 any  ทุกอย่างได้หมด เหมือน JS ปกติ ❌ หลีกเลี่ยง ยกเว้นจำเป็นจริงๆ 
 unknown  ไม่แน่ใจชนิด แต่ต้องตรวจก่อนใช้ ✅ ดีกว่า any ใช้เมื่อไม่รู้ชนิด 
 never  ไม่เคยเกิดขึ้น หรือไม่กลับมาจากฟังก์ชัน บอก TypeScript ว่าจุดนี้ไม่มีทางมาถึง 
 void  ฟังก์ชันไม่คืนค่า ผลข้างเคียงอย่างเดียว 
 null  /  undefined  ค่าว่างตามที่กำหนด ต้องเปิด  strictNullChecks: true  
 
✅ ตัวอย่างการใช้ unknown อย่างปลอดภัย
 
typescript  
let input: unknown = getDataFromExternal();

// ❌ ไม่ได้ — TypeScript ไม่อนุญาต
// input.toUpperCase();

// ✅ ตรวจสอบก่อนใช้
if (typeof input === "string") {
  input.toUpperCase(); // ✅ ผ่านแล้ว
}
 
 
 
 
🛠️ ประเภททั่วไปในตัว (Utility Types)
 
typescript  
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// ✅ Partial — ทุกฟิลด์เป็นตัวเลือก
function updateTask(id: number, changes: Partial<Task>) {
  // อัปเดตเฉพาะบางฟิลด์ได้เลย
}

// ✅ Required — ทุกฟิลด์จำเป็น
type FullTask = Required<Partial<Task>>;

// ✅ Pick — เลือกเอาแค่บางฟิลด์
type TaskPreview = Pick<Task, "id" | "title">;

// ✅ Omit — ตัดบางฟิลด์ทิ้ง
type TaskWithoutId = Omit<Task, "id">;

// ✅ Readonly — อ่านอย่างเดียว
type ReadonlyTask = Readonly<Task>;
 
 
 
 
📐 ตั้งค่า tsconfig.json ที่แนะนำ
 
json  
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,               // ✅ เปิดการตรวจสอบเข้มงวด
    "strictNullChecks": true,     // ✅ null ต้องจัดการชัดเจน
    "noImplicitAny": true,        // ✅ ห้ามเดาชนิดเป็น any
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  }
}
 
 
⚠️ กฎทอง: เปิด  strict: true  เสมอ — ความยากเพิ่มขึ้นเล็กน้อย แต่ความปลอดภัยเพิ่มขึ้นมหาศาลครับ
 
 
 
✅ สรุปหลักการ
 
🔷 เริ่มจาก Interface สำหรับอ็อบเจกต์/รูปแบบข้อมูล
📦 ระบุชนิดให้ชัดเจน แต่ไม่ต้องระบุทุกจุด ให้ TypeScript ช่วยเดาได้เมื่อทำได้
⚡ หลีกเลี่ยง any ใช้ unknown แทนเมื่อไม่รู้ชนิด
🛡️ เปิด strict mode เสมอ — ความปลอดภัยคุ้มค่ากับความพยายาม
📋 ชนิดข้อมูลคือเอกสารที่ดีที่สุด — ทุกคนเห็น และไม่มีวันล้าสมัย
 
plaintext  

> 📖 **ไฟล์ที่ 12 เสร็จสิ้น**
> พิมพ์ **"ถัดไป"** เพื่ออ่านไฟล์ถัดไปครับ! 😊