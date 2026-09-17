import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}>
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }


🧩 สรุปฉบับสมบูรณ์: Accordion + ระบบพื้นฐาน (Radix + Tailwind +  cn() )
 
 
 
🔹 1. คอมโพเนนต์ Accordion
 
ไฟล์:  @/components/ui/accordion.tsx 
แกนหลัก:  @radix-ui/react-accordion  +  lucide-react  +  cn() 
 
📦 โครงสร้าง & หน้าที่
 
-  Accordion  (Root): ควบคุมทั้งระบบ →  type="single"  (เปิดได้หนึ่งอัน) /  type="multiple"  (เปิดได้หลายอัน)
-  AccordionItem : แต่ละรายการ →  border-b  แยกชัดเจน
-  AccordionTrigger : ปุ่มเปิด/ปิด →  flex justify-between  + ไอคอน  ChevronDown 
- เมื่อเปิด:  [data-state=open]>svg:rotate-180  +  transition-transform 200ms 
-  AccordionContent : พื้นที่เนื้อหา →  overflow-hidden  + อนิเมชัน  accordion-up/down 
 
🎨 สไตล์ & การทำงาน
 
- Accessibility: รองรับ ARIA, คีย์บอร์ด, ผู้อ่านหน้าจอ (จาก Radix)
- อนิเมชัน: ลื่นไหล ไม่กระตุก → กำหนดใน  tailwind.config.js 
- ปรับแต่งได้: รับ  className  ผ่าน  cn()  → ปลอดภัย ไม่ชนกัน
 
🚀 ตัวอย่างใช้งาน
 
tsx
  
<Accordion type="single" collapsible>
  <AccordionItem value="faq-1">
    <AccordionTrigger>คำถามที่ 1</AccordionTrigger>
    <AccordionContent>คำตอบรายละเอียด...</AccordionContent>
  </AccordionItem>
</Accordion>
 
 
 
 
🔹 2. Utility หลัก:  cn()  — หัวใจของ Tailwind + React
 
โค้ด:  @/lib/utils.ts  →  export const cn = (...inputs) => twMerge(clsx(inputs)) 
 
🧠 ทำงานอย่างไร
 
1.  clsx : รวมคลาสแบบมีเงื่อนไข → ตัด  false/null/undefined  ทิ้ง
2.  tailwind-merge : แก้ปัญหาสำคัญ → ลบคลาส Tailwind ที่ขัดแย้งกัน (เช่น  text-sm  +  text-lg  เหลือแค่หลังสุด)
 
⚡ ทำไมต้องใช้?
 
✅ Override ปลอดภัย:  className={cn("text-sm", className)}  → ผู้ใช้แทนที่ได้เลย
✅ ไม่รก DOM: ไม่มีคลาสซ้ำซ้อน → ดีต่อประสิทธิภาพ & ดีบักง่าย
✅ รองรับทุกกรณี:
 
- ✅ Responsive:  md:text-base  +  md:text-xl  → เหลือ  md:text-xl 
- ✅ Dark Mode:  dark:bg-slate-900  +  dark:bg-black  → เหลือ  dark:bg-black 
- ✅ State:  hover:bg-blue-500  +  hover:bg-red-500  → เหลือหลังสุด
 
🆚 เปรียบเทียบกับ  classnames 
 
-  classnames : แค่รวมคลาส → ไม่แก้ Tailwind Conflict
-  cn() : รวม + Merge อัตโนมัติ → เหมาะกับ Tailwind 100%
 
 
 
🔹 3. ระบบร่วมสมัย: Radix + Tailwind + Variants
 
🧱 สถาปัตยกรรมมาตรฐาน
 
plaintext
  
Radix UI → พฤติกรรม + Accessibility
   ↓
Tailwind CSS → สไตล์/เลย์เอาต์
   ↓
cn() → รวมคลาส + แก้ชน
   ↓
CVA / Tailwind Variants → จัดการรูปแบบ/ขนาด
 
 
✅ จุดแข็ง
 
- Radix: ไม่ต้องเขียน Logic เอง → พร้อมใช้งาน, ปลอดภัย, รองรับทุกอุปกรณ์
- Data Attributes:  data-state="open/closed"  → จับคู่กับ Tailwind ได้ตรงๆ ( [data-state=open]:animate-in )
- Variants: ร่วมกับ  cn()  ได้สมบูรณ์ →  cn(buttonVariants({size}), className) 
 
📁 ความต้องการระบบ
 
bash
  
npm install @radix-ui/react-accordion lucide-react clsx tailwind-merge
 
 
Tailwind Config: เพิ่มอนิเมชัน  accordion-up/down 
 
 
 
🔹 4. สรุปสั้นๆ (พร้อมนำไปใช้)
 
- Accordion: ใช้ Radix + Tailwind → พับขยายลื่น, เข้าถึงง่าย, ปรับธีมได้
-  cn() : จำเป็นสำหรับ Tailwind → แก้ชน, ปลอดภัย, Override ได้
- Stack: Radix + Tailwind +  cn()  + Variants → มาตรฐาน Production / ShadCN/UI
 
✅ พร้อมนำไปสร้าง Design System, FAQ, เมนูย่อย หรือแผงข้อมูลได้ทันทีครับ 🚀📂🎨
