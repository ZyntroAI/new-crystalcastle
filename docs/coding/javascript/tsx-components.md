📄 ไฟล์ที่ 14 — docs/coding/javascript/tsx-components.md
 
markdown  
---
title: "TSX Components with TypeScript"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["react", "typescript", "tsx", "frontend"]
---

# ⚛️ เขียน Component ด้วย TSX

> React + TypeScript = โค้ดที่ปลอดภัย ชัดเจน และบำรุงรักษาง่าย ✅

---

## 📌 พื้นฐาน: Component + Props Type

```tsx
// ✅ วิธีที่แนะนำ
type GreetingProps = {
  name: string;
  message?: string; // ? = ไม่จำเป็น
};

export default function Greeting({ 
  name, 
  message = "ยินดีต้อนรับ" 
}: GreetingProps) {
  return (
    <div>
      <h2>สวัสดีคุณ {name}</h2>
      <p>{message}</p>
    </div>
  );
}
 
 
 
 
🔤 ชนิดพิเศษที่ต้องรู้
 
✅ Children
 
tsx  
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode; // เนื้อหาภายใน Component
};

export default function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-content">{children}</div>
    </div>
  );
}
 
 
✅ Event Handlers
 
tsx  
import type { 
  MouseEvent, 
  ChangeEvent, 
  FormEvent 
} from "react";

type ButtonProps = {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
};

// Input
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

// Form
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};
 
 
 
 
🧩 รูปแบบ Props ยอดนิยม
 
1️⃣ Props ด้วย Union Type
 
tsx  
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
 
 
2️⃣ Props แบบไม่ต่อเนื่อง
 
tsx  
// ต้องมี id หรือ slug อย่างใดอย่างหนึ่ง
type UserBase = {
  name: string;
  email: string;
};

type UserById = UserBase & { id: number; slug?: never };
type UserBySlug = UserBase & { slug: string; id?: never };
type UserProps = UserById | UserBySlug;
 
 
3️⃣ ขยาย Props ของ Element เดิม
 
tsx  
// รับคุณสมบัติทั้งหมดของ <button> โดยไม่ต้องเขียนเอง
type ButtonProps = {
  variant?: "primary" | "secondary";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ 
  variant = "primary", 
  className = "",
  ...rest 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} ${className}`}
      {...rest} // ส่งต่อ onClick, disabled, type ฯลฯ
    />
  );
}
 
 
 
 
🔄 State และ Custom Hook ใน TypeScript
 
useState พร้อมชนิด
 
tsx  
import { useState } from "react";

// ✅ TypeScript เดาให้อัตโนมัติเมื่อกำหนดค่าเริ่มต้น
const [count, setCount] = useState(0); // count: number

// ✅ กำหนดชนิดเองเมื่อไม่มีค่าเริ่มต้น
type User = { name: string; email: string };
const [user, setUser] = useState<User | null>(null);

// ✅ Array
const [items, setItems] = useState<string[]>([]);
 
 
Custom Hook ที่มีชนิด
 
tsx  
import { useState, useEffect } from "react";

// ✅ กำหนดชนิดทั่วไป (Generic)
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved) as T; }
      catch { return initialValue; }
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// ใช้งาน — TypeScript รู้ชนิดเอง
const [theme, setTheme] = useLocalStorage("theme", "light");
// theme: string ✅
 
 
 
 
⚠️ ข้อผิดพลาดที่พบบ่อย
 
ปัญหา สาเหตุ วิธีแก้ 
 'X' is not assignable to type  ส่งค่าผิดชนิดให้ Props ตรวจสอบชนิดให้ตรงกัน 
 Property 'X' does not exist on type  ลืมประกาศฟิลด์ใน Type เพิ่มฟิลด์ใน Interface/Type 
 Object is possibly 'undefined'  ค่าอาจเป็น undefined ใช้  ?.  หรือตรวจสอบก่อนใช้งาน 
Type ไม่ตรงกับค่าเริ่มต้น กำหนดชนิดผิด ระบุชนิดให้ชัดเจน หรือให้ TS เดาเอง 
 
 
 
✅ สรุปหลักการ
 
🔷 ใช้ Type แทน Interface สำหรับ Props Component — ยืดหยุ่นกว่า
🧩 รับ Props ของ Element แทนที่จะเขียนเอง — ขยายด้วย  &  ได้เลย
⚡ TS เดาได้ดีมาก — ไม่ต้องระบุทุกจุด ระบุเฉพาะที่จำเป็น
🛡️ ใช้ Union Type เมื่อมีค่าที่เป็นไปได้จำกัด — ป้องกันค่าผิดพลาด
📦 Generic Hook = ฟังก์ชันที่รับชนิดภายหลัง — ใช้ซ้ำได้หลายสถานการณ์
 
plaintext  

> 📖 **ไฟล์ที่ 14 เสร็จสิ้น — จบหมวด JavaScript/TypeScript ✅**
> พิมพ์ **"ถัดไป"** เพื่อเข้าสู่หมวด **Go** ครับ! 😊