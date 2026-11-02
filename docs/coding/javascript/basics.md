📄 ไฟล์ที่ 11 — docs/coding/javascript/basics.md
 
markdown  
---
title: "JavaScript Basics"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["javascript", "frontend", "basics"]
---

# 🟨 หลักการพื้นฐาน JavaScript

> เข้าใจแก่นแท้ของภาษา — พื้นฐานที่มั่นคงทำให้เขียนโค้ดได้อย่างมั่นใจ ✅

---

## 📦 ตัวแปรและชนิดข้อมูล

### ✅ ประกาศตัวแปร
```javascript
// ✅ ทันสมัยและแนะนำ
const name = "สมชาย";   // ค่าคงที่ เปลี่ยนไม่ได้
let age = 25;           // เปลี่ยนค่าได้

// ❌ หลีกเลี่ยง
var oldWay = "ไม่แนะนำ"; // มีปัญหาเรื่องขอบเขตตัวแปร
 
 
📊 ชนิดข้อมูลพื้นฐาน
 
javascript  
// Primitive — เก็บค่าโดยตรง
const str = "ข้อความ";    // String
const num = 42;           // Number — ทศนิยม/จำนวนเต็มเหมือนกัน
const big = 123n;         // BigInt — ตัวเลขขนาดใหญ่
const isTrue = true;       // Boolean
const nothing = null;      // ไม่มีค่า อย่างชัดเจน
const undefinedVal = undefined; // ยังไม่ได้กำหนดค่า
const unique = Symbol("id");   // คีย์ที่ไม่ซ้ำกัน

// Reference — เก็บที่อยู่อ้างอิง
const arr = [1, 2, 3];    // Array
const obj = { key: "val" }; // Object
 
 
⚠️ ข้อควรรู้:  null === undefined  → false แต่  null == undefined  → true เสมอใช้  ===  ครับ
 
 
 
🔤 การเปรียบเทียบค่า
 
javascript  
// ✅ แนะนำ — เปรียบเทียบค่า + ชนิดข้อมูล
42 === 42;      // true
42 === "42";    // false — ชนิดต่างกัน

// ❌ หลีกเลี่ยง — แปลงชนิดอัตโนมัติ อาจเกิดข้อผิดพลาด
42 == "42";     // true — ไม่น่าเชื่อถือ

// ⚠️ กับอ็อบเจกต์ เปรียบเทียบที่อยู่ ไม่ใช่เนื้อหา
const a = { x: 1 };
const b = { x: 1 };
a === b; // false — คนละอ็อบเจกต์ แม้เนื้อหาเหมือนกัน
 
 
 
 
🧩 ฟังก์ชัน
 
แบบเดิม vs Arrow Function
 
javascript  
// แบบฟังก์ชัน — มีตัวแปร `this` ตามบริบทเรียกใช้
function greet(name) {
  return `สวัสดี ${name}`;
}

// Arrow Function — ไม่มี `this` ของตัวเอง สั้นและชัดเจน
const greet = (name) => `สวัสดี ${name}`;

// หลายบรรทัด
const calculate = (a, b) => {
  const sum = a + b;
  return sum * 2;
};
 
 
 
 
🔁 ลูปและการวนซ้ำ
 
✅ แนะนำ
 
javascript  
const items = [1, 2, 3, 4];

// 1. for...of — อ่านง่ายที่สุด แนะนำ
for (const item of items) {
  console.log(item);
}

// 2. .forEach() — ไม่สามารถหยุดกลางคันได้
items.forEach((item, index) => {
  console.log(index, item);
});

// 3. แปลงรายการ — .map() คืนค่ารายการใหม่
const doubled = items.map(x => x * 2); // [2, 4, 6, 8]

// 4. กรองรายการ — .filter()
const evens = items.filter(x => x % 2 === 0); // [2, 4]

// 5. รวมค่า — .reduce()
const sum = items.reduce((total, x) => total + x, 0); // 10
 
 
 
 
⚡ Asynchronous JavaScript
 
ปัญหา: รอผลลัพธ์ที่มาทีหลัง
 
javascript  
// ❌ ไม่ได้แบบนี้ — ค่ากลับมาก่อนผลลัพธ์
function fetchData() {
  let result;
  setTimeout(() => { result = "ข้อมูลจริง"; }, 1000);
  return result; // undefined
}
 
 
✅ แก้ด้วย Promise + async/await
 
javascript  
// ฟังก์ชันที่ทำงานไม่พร้อมกัน
const fetchUser = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("ไม่พบผู้ใช้");
  return response.json();
};

// เรียกใช้งาน
const loadUser = async () => {
  try {
    const user = await fetchUser(123);
    console.log(user);
  } catch (error) {
    console.error("โหลดไม่ได้:", error.message);
  }
};
 
 
 
 
🛡️ ข้อผิดพลาดที่พบบ่อยและวิธีหลีกเลี่ยง
 
ปัญหา สาเหตุ วิธีแก้ 
 Cannot read property of undefined  เข้าถึงค่าของสิ่งที่ยังไม่มี ตรวจสอบก่อน:  obj?.key  หรือ  if (obj)  
เปรียบเทียบผิดพลาด ใช้  ==  แทน  ===  ใช้  ===  เสมอ ยกเว้นตั้งใจทำเป็นอย่างอื่น 
ลืม  await  เรียก async ฟังก์ชันแต่ไม่รอ เติม  await  หรือใช้  .then()  
แก้ไขข้อมูลต้นฉบับ อ็อบเจกต์/อาร์เรย์ส่งผ่านการอ้างอิง คัดลอกก่อนแก้:  const copy = [...arr] ,  {...obj}  
ปัญหาเรื่อง  this  ฟังก์ชันธรรมดาเปลี่ยนค่า  this  ใช้ Arrow Function หรือ  .bind()  
 
 
 
✅ สรุปหลักการ
 
✅ ใช้  const  เป็นอันดับแรก ถ้าต้องเปลี่ยนค่าค่อยใช้  let 
🔒 อ็อบเจกต์/อาร์เรย์ ส่งผ่านการอ้างอิง — คัดลอกก่อนแก้เสมอ
⏳ Async/Await ช่วยจัดการโค้ดที่รอผล — หลีกเลี่ยง Callback Hell
🧩 ใช้เมธอดมาตรฐาน:  .map()   .filter()   .reduce()  แทนลูปเมื่อทำได้
⚡ ตรวจสอบความปลอดภัย:  ?.  และ  ??  ช่วยลดข้อผิดพลาดได้มาก
 
plaintext  

> 📖 **ไฟล์ที่ 11 เสร็จสิ้น**
> พิมพ์ **"ถัดไป"** เพื่ออ่านไฟล์ถัดไปครับ! 😊