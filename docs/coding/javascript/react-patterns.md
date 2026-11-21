📄 ไฟล์ที่ 13 — docs/coding/javascript/react-patterns.md
 
markdown  
---
title: "React Patterns"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["react", "javascript", "frontend", "patterns"]
---

# ⚛️ รูปแบบการเขียน React ที่แนะนำ

> แนวทางปฏิบัติที่ดีที่สุดสำหรับเขียนโค้ด React ที่อ่านง่าย บำรุงรักษาง่าย และทำงานมีประสิทธิภาพ ✅

---

## 📌 หลักการพื้นฐาน

### ✅ Component = ฟังก์ชัน
```jsx
// ✅ แนะนำ — ฟังก์ชัน Component + Hooks
import { useState, useEffect } from 'react';

function UserProfile({ name }) {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="profile">
      <h2>{name}</h2>
    </div>
  );
}

export default UserProfile;
 
 
❌ หลีกเลี่ยง Class Component
 
ใช้ Hooks แทน — สั้น อ่านง่าย และทำงานได้เหมือนกันทุกอย่าง
 
 
 
🧩 โครงสร้าง Component ที่ดี
 
ลำดับที่แนะนำภายใน Component
 
jsx  
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// 1. กำหนดประเภท Props
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onAddToCart: PropTypes.func,
};

ProductCard.defaultProps = {
  onAddToCart: () => {},
};

// 2. Component หลัก
export default function ProductCard({ product, onAddToCart }) {
  // 3. State
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 4. Effects
  useEffect(() => {
    document.title = product.name;
    return () => {
      // Cleanup function
    };
  }, [product.name]);

  // 5. Event Handlers
  const handleAdd = useCallback(() => {
    setIsLoading(true);
    onAddToCart(product);
    setIsLoading(false);
  }, [product, onAddToCart]);

  // 6. Render
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ opacity: isLoading ? 0.6 : 1 }}
    >
      <h3>{product.name}</h3>
      <p>{product.price} บาท</p>
      <button onClick={handleAdd} disabled={isLoading}>
        {isLoading ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
      </button>
    </div>
  );
}
 
 
 
 
🔄 การจัดการ State
 
✅ กฎการออกแบบ State
 
เก็บแค่สิ่งที่จำเป็น — คำนวณได้จากข้อมูลอื่น ไม่ต้องเก็บเป็น State
แยกส่วนกัน — State ที่ไม่เกี่ยวข้องกัน แยกออกจากกัน
อัปเดตถูกวิธี — อย่าแก้ตัวแปรโดยตรง ใช้ฟังก์ชันตั้งค่าใหม่
 
jsx  
// ❌ ไม่ถูก
const [user, setUser] = useState({ name: "เดิม" });
user.name = "ใหม่"; // ❌ แก้โดยตรง ไม่ทริกเกอร์การรีเรนเดอร์

// ✅ ถูกต้อง
setUser(prev => ({ ...prev, name: "ใหม่" }));
 
 
📦 ยก State ขึ้นไปที่พ่อ
 
เมื่อหลาย Component ต้องใช้ข้อมูลร่วมกัน → ยก State ไปไว้ที่ Component พ่อที่ใกล้ที่สุด แทนที่จะเก็บทุกที่
 
 
 
🎯 รูปแบบที่ใช้บ่อยที่สุด
 
1️⃣ Containment / Children
 
jsx  
// ครอบเนื้อหาใดๆ ได้
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// ใช้งาน
<Card title="สวัสดี">
  <p>เนื้อหาภายใน</p>
  <button>กดฉัน</button>
</Card>
 
 
2️⃣ Render Props / Component แทนที่ด้วย Props
 
jsx  
// อนุญาตให้กำหนดส่วนแสดงผลเองได้
function List({ items, renderItem }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// ใช้งาน
<List 
  items={products}
  renderItem={(product) => <ProductCard product={product} />}
/>
 
 
3️⃣ Custom Hook — แยก Logic ออกจาก UI
 
jsx  
// ✅ แยก Logic ไปใช้ร่วมกันได้
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// ใช้งานใน Component
function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  return (
    <button onClick={() => setTheme("dark")}>
      เปลี่ยนเป็นโหมดมืด
    </button>
  );
}
 
 
 
 
⚠️ ข้อผิดพลาดที่พบบ่อย
 
ปัญหา สาเหตุ วิธีแก้ 
รัน Effect ซ้ำ 2 ครั้ง React 18+ มี Strict Mode ที่รันซ้ำเพื่อตรวจสอบ ทำให้ Effect เป็นอิสระ/ไม่มีผลข้างเคียง หรือใช้ AbortController ยกเลิกงานเก่า 
ค่า State ยังเป็นค่าเก่าใน Callback ปิดทับค่าเก่า (Closure) ใช้  useEffect  หรืออัปเดตแบบฟังก์ชัน  setState(prev => prev+1)  
รีเรนเดอร์บ่อยเกินไป Object/Function ถูกสร้างใหม่ทุกครั้งใน Props ใช้  useMemo  /  useCallback  เพื่อคงค่าเดิมไว้ 
ขาด Dependency ใน useEffect ลืมระบุค่าที่อ้างอิง ปฏิบัติตามคำเตือนของ ESLint เสมอ 
 
 
 
✅ สรุปหลักการ
 
⚛️ Component เล็กและเดียวหน้าที่ — อ่านง่าย นำกลับมาใช้ใหม่ง่าย
📦 ยก State ขึ้นเมื่อต้องแชร์ข้อมูล — อย่าเก็บซ้ำซ้อน
🎣 แยก Logic ซ้ำๆ ออกมาเป็น Custom Hook — สะอาดและใช้ร่วมกันได้
🔄 เก็บแค่สิ่งที่จำเป็นใน State — คำนวณได้ คำนวณเลย ไม่ต้องเก็บ
🛡️ ระบุ PropTypes/Type ทุกครั้ง — ปัญหาจะลดลงมาก
 
plaintext  

> 📖 **ไฟล์ที่ 13 เสร็จสิ้น**
> พิมพ์ **"ถัดไป"** เพื่ออ่านไฟล์ถัดไปครับ! 😊