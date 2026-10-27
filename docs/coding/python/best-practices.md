📄 ไฟล์ที่ 7 — docs/coding/python/best-practices.md
 
markdown  
---
title: "Python Best Practices"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["python", "best-practices", "coding", "standards"]
---

# 🐍 แนวทางเขียนโค้ด Python ที่ดี

> มาตรฐานและหลักการสำหรับเขียนโค้ดที่อ่านง่าย บำรุงรักษาง่าย และทำงานได้อย่างมีประสิทธิภาพ

---

## 📏 1. ปฏิบัติตาม PEP 8

> PEP 8 คือคู่มือสไตล์ทางการของ Python

| กฎ | ตัวอย่างที่ถูกต้อง | ไม่ถูกต้อง |
|---|---|---|
| ใช้ตัวพิมพ์เล็ก ขั้นด้วยขีดล่างสำหรับตัวแปร/ฟังก์ชัน | `user_name`, `calculate_total()` | `UserName`, `calculateTotal()` |
| ใช้ตัวพิมพ์ใหญ่สำหรับค่าคงที่ | `MAX_RETRIES = 5` | `max_retries = 5` |
| ใช้ CamelCase สำหรับชื่อคลาส | `class UserProfile:` | `class user_profile:` |
| เว้นวรรครอบเครื่องหมาย | `total = price + tax` | `total=price+tax` |
| ไม่เยื้องด้วยแท็บ — ใช้ 4 ช่องว่าง | `    code()` | `\tcode()` |
| ความยาวบรรทัดไม่เกิน 79 อักขระ | แบ่งบรรทัด | เขียนต่อเนื่องยาวเกินไป |

---

## 📦 2. การนำเข้าโมดูล

### ✅ ถูกวิธี
```python
# นำเข้าโมดูลมาตรฐานก่อน
import os
import sys
from datetime import datetime

# จากนั้นนำเข้าไลบรารีภายนอก
import requests
import numpy as np

# สุดท้ายนำเข้าโมดูลของโปรเจกต์เอง
from .utils import helper
from .models import User
 
 
❌ ไม่ควรทำ
 
python  
# นำเข้าทุกอย่างเข้ามาในเนมสเปซหลัก — หลีกเลี่ยง
from utils import *  # ❌ ไม่ทราบว่ามีอะไรเข้ามาบ้าง

# นำเข้าและเปลี่ยนชื่อโดยไม่จำเป็น
import pandas as pd  # ✅ อันนี้ยอมรับได้ เป็นมาตรฐาน
import mymodule as m  # ❌ ไม่ควร
 
 
 
 
🏗️ 3. โครงสร้างโค้ดที่ชัดเจน
 
ใช้ฟังก์ชัน แทบทุกครั้งที่ทำได้
 
python  
# ❌ ซ้ำซ้อน
print("สวัสดี คุณ A")
print("สวัสดี คุณ B")

# ✅ ใช้ฟังก์ชัน
def greet(name: str) -> None:
    """แสดงข้อความทักทายผู้ใช้"""
    print(f"สวัสดี คุณ {name}")

greet("A")
greet("B")
 
 
เขียน Docstring อธิบาย
 
python  
def calculate_area(width: float, height: float) -> float:
    """
    คำนวณพื้นที่ของสี่เหลี่ยมผืนผ้า
    
    Args:
        width: ความกว้าง (หน่วยเมตร)
        height: ความสูง (หน่วยเมตร)
    
    Returns:
        พื้นที่เป็นตัวเลขทศนิยม
    
    Raises:
        ValueError: ถ้าค่าความกว้างหรือความสูงเป็นลบ
    """
    if width < 0 or height < 0:
        raise ValueError("ความกว้างและความสูงต้องไม่เป็นลบ")
    return width * height
 
 
 
 
⚡ 4. การจัดการข้อมูลและประสิทธิภาพ
 
✅ ใช้ชนิดข้อมูลที่เหมาะสม
 
python  
# รวบรวมข้อมูลที่ไม่ซ้ำกัน → ใช้ set()
unique_items = set(items)  # ⭐ ค้นหาเร็วมาก O(1)

# ตรวจสอบสมาชิกในกลุ่ม
if user_id in active_users:  # ✅ ใช้ set หรือ dict ไม่ใช่ list
    pass

# รวมสตริงหลายชิ้น → ใช้ join()
result = " ".join(words)  # ✅ มีประสิทธิภาพดีกว่า += ในลูป
 
 
✅ ใช้ Context Manager ( with )
 
python  
# ✅ ปิดไฟล์อัตโนมัติ แม้เกิดข้อผิดพลาด
with open("data.txt", encoding="utf-8") as f:
    content = f.read()
 
 
 
 
🛡️ 5. การจัดการข้อผิดพลาด
 
❌ ไม่ควร
 
python  
# จับทุกข้อผิดพลาดโดยไม่เลือก — ซ่อนปัญหา
try:
    process()
except:  # ❌ ห้ามใช้แบบนี้
    pass
 
 
✅ ควรทำ
 
python  
try:
    result = int(user_input)
except ValueError as e:
    print(f"กรุณากรอกตัวเลขเท่านั้น: {e}")
except KeyboardInterrupt:
    print("\nยกเลิกการทำงาน")
    raise  # ส่งต่อสัญญาณให้ระบบจัดการต่อ
else:
    # ทำเมื่อไม่มีข้อผิดพลาด
    save_result(result)
finally:
    # ทำเสมอ ไม่ว่ามี/ไม่มีข้อผิดพลาด
    cleanup()
 
 
💡 กฎทอง: จับเฉพาะข้อผิดพลาดที่คุณรู้วิธีจัดการเท่านั้น ปล่อยให้ส่วนที่ไม่รู้จัดการส่งต่อไปยังระดับที่สูงขึ้น
 
 
 
📝 6. ตรวจสอบชนิดข้อมูล (Type Hints)
 
python  
# ✅ ช่วย IDE ช่วยตรวจสอบก่อนรันจริง
def greet_user(name: str, age: int = 18) -> str:
    return f"สวัสดีคุณ {name} อายุ {age} ปี"

# รายการและพจนานุกรม
from typing import List, Dict, Optional, Union

scores: List[int] = [85, 90, 78]
user_data: Dict[str, Union[str, int]] = {"name": "สมชาย", "age": 25}
maybe_value: Optional[str] = None  # อาจเป็นค่าหรือ None
 
 
 
 
🧹 7. ทำความสะอาดโค้ดเป็นประจำ
 
- ✅ ลบโค้ดที่ไม่ได้ใช้แล้ว
- ✅ อัปเดตความคิดเห็นให้ตรงกับโค้ดเสมอ
- ✅ ใช้เครื่องมือตรวจสอบอัตโนมัติ:
-  black  — จัดรูปแบบโค้ดให้สวยงาม
-  flake8  — ตรวจสอบสไตล์และข้อผิดพลาด
-  mypy  — ตรวจสอบชนิดข้อมูล
-  pylint  — ให้คะแนนและคำแนะนำโค้ด
 
 
 
✅ สรุปหลักการสำคัญ
 
📏 ปฏิบัติตาม PEP 8 — สไตล์ที่ทุกคนคุ้นเคย
📦 จัดระเบียบการนำเข้าโมดูล — ช่วยอ่านและตรวจสอบ
🏗️ แบ่งเป็นฟังก์ชัน/คลาส — โค้ดสั้น อ่านง่าย นำกลับมาใช้ใหม่ได้
🛡️ จัดการข้อผิดพลาดอย่างรับผิดชอบ — ไม่ซ่อนปัญหา
📝 เขียน Docstring + Type Hints — ตัวช่วยที่ดีที่สุดของคุณ
🧹 รักษาความสะอาด — โค้ดเก่าไม่พังง่ายกว่าเสมอ
 
plaintext  

> 📖 **ไฟล์ที่ 7 เสร็จสิ้น**
> พิมพ์ **"ถัดไป"** เพื่ออ่านไฟล์ถัดไปครับ! 😊