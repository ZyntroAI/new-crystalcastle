📄 ไฟล์ที่ 10 — docs/coding/python/testing.md
 
markdown  
---
title: "Python Testing Guide"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["python", "testing", "quality"]
---

# 🧪 คู่มือการเขียนทดสอบ Python

> ทดสอบดี = มั่นใจได้ว่าโค้ดทำงานถูกต้อง และแก้ไขได้โดยไม่กลับมาพังอีก ✅

---

## 📌 ทำไมต้องเขียนทดสอบ?

- ✅ มั่นใจได้ว่าฟีเจอร์ทำงานถูกต้อง
- ✅ แก้ไขโค้ดได้อย่างมั่นใจ — ถ้าพังจะบอกทันที
- ✅ เป็นเอกสารที่แสดงวิธีใช้งานโค้ด
- ✅ ค้นหาปัญหาได้เร็วขึ้น
- ✅ ช่วยออกแบบโค้ดให้ดีขึ้น

---

## 🧩 1. Unit Test พื้นฐานด้วย `unittest`

### โครงสร้างพื้นฐาน
```python
import unittest
from mymodule import add  # นำเข้าฟังก์ชันที่จะทดสอบ

class TestMathFunctions(unittest.TestCase):
    """ทดสอบฟังก์ชันทางคณิตศาสตร์"""

    def test_add_positive_numbers(self):
        """บวกตัวเลขบวก"""
        result = add(2, 3)
        self.assertEqual(result, 5)

    def test_add_negative_numbers(self):
        """บวกตัวเลขลบ"""
        result = add(-1, -2)
        self.assertEqual(result, -3)

    def test_add_zero(self):
        """บวกกับศูนย์"""
        result = add(0, 5)
        self.assertEqual(result, 5)

if __name__ == "__main__":
    unittest.main()
 
 
✅ คำสั่งตรวจสอบที่ใช้บ่อย
 
คำสั่ง ตรวจสอบว่า 
 assertEqual(a, b)  a == b 
 assertNotEqual(a, b)  a != b 
 assertTrue(x)  x เป็น True 
 assertFalse(x)  x เป็น False 
 assertIn(item, list)  item อยู่ในรายการ 
 assertRaises(Exception)  ฟังก์ชันเกิดข้อผิดพลาดตามที่คาดหวัง 
 
🏃‍♂️ รันทดสอบ
 
bash  
# รันทั้งหมด
python -m unittest test_mymodule.py

# หรือค้นหาทุกไฟล์ที่เป็น test
python -m unittest discover
 
 
 
 
🧪 2. ทดสอบที่สะดวกและนิยมกว่าด้วย  pytest 
 
ติดตั้ง:  pip install pytest 
 
เขียนง่ายกว่า — ไม่ต้องคลาส
 
python  
# test_mymodule.py
from mymodule import add

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -2) == -3

def test_add_zero():
    assert add(0, 5) == 5
 
 
🏃‍♂️ รันทดสอบ
 
bash  
pytest                    # รันทดสอบทุกไฟล์ที่ขึ้นต้น test_
pytest -v                 # แสดงรายละเอียดมากขึ้น
pytest --maxfail=1        # หยุดเมื่อเจอครั้งแรกที่ล้มเหลว
pytest -xvs test_file.py  # รันเฉพาะไฟล์ แสดงละเอียด
 
 
� ทดสอบกรณีหลายแบบด้วย Parameterize
 
python  
import pytest
from mymodule import add

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (-1, -2, -3),
    (0, 5, 5),
    (100, 200, 300),
])
def test_add_various_cases(a, b, expected):
    assert add(a, b) == expected
 
 
⚠️ ทดสอบข้อผิดพลาด
 
python  
import pytest
from mymodule import divide

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(5, 0)
 
 
 
 
🏗️ 3. จัดเตรียมและทำความสะอาด (Fixture)
 
ด้วย unittest
 
python  
class TestDatabase(unittest.TestCase):
    def setUp(self):
        """ทำก่อนทุกการทดสอบ"""
        self.db = Database()
        self.db.connect()

    def tearDown(self):
        """ทำหลังทุกการทดสอบ"""
        self.db.close()
 
 
ด้วย pytest
 
python  
import pytest

@pytest.fixture
def temp_file():
    """สร้างไฟล์ชั่วคราว และลบเมื่อเสร็จ"""
    path = "temp_test.txt"
    yield path  # ส่งค่าให้ทดสอบ
    import os
    if os.path.exists(path):
        os.remove(path)

def test_write_file(temp_file):
    with open(temp_file, "w") as f:
        f.write("hello")
    assert open(temp_file).read() == "hello"
 
 
 
 
📋 4. เช็คลิสต์การเขียนทดสอบที่ดี
 
✅ คุณสมบัติของทดสอบที่ดี
 
อิสระ — ทดสอบหนึ่งไม่ขึ้นกับอีกอันหนึ่ง
ชัดเจน — ชื่อบอกว่าทำอะไร และคาดหวังอะไร
รวดเร็ว — ไม่ควรรันนานเกินไป
ซ้ำได้ — ทุกครั้งที่รัน ผลต้องเหมือนเดิม
ครอบคลุม — ทั้งกรณีปกติ และกรณีขอบเขต/ข้อผิดพลาด
 
📝 ชื่อที่ดี
 
✅  test_calculate_total_with_discount_applied 
❌  test_calculate  — บอกไม่ได้ว่าทดสอบอะไรจริงๆ
 
🎯 สิ่งที่ควรทดสอบ
 
- ✅ กรณีปกติ — อินพุตที่ถูกต้อง คืนค่าถูกต้อง
- ✅ ขอบเขต — ค่าน้อยสุด/มากสุด, ค่าว่าง, ค่าเป็นศูนย์
- ✅ ข้อผิดพลาด — อินพุตผิดพลาด ต้องจัดการถูกต้อง
- ✅ กฎธุรกิจ — ตรวจสอบว่าทำตามกฎจริงหรือไม่
 
 
 
📊 5. ดูว่าทดสอบครอบคลุมแค่ไหน (Coverage)
 
ติดตั้ง:  pip install pytest-cov 
 
bash  
# ดูว่ามีโค้ดกี่เปอร์เซ็นต์ที่ถูกทดสอบ
pytest --cov=./ --cov-report=html
# เปิดไฟล์ htmlcov/index.html ดูรายงานแบบสวยๆ
 
 
💡 เป้าหมายไม่ใช่ 100% เสมอไป — แต่รู้ว่าส่วนไหนยังไม่มีทดสอบ สำคัญกว่าตัวเลขครับ
 
 
 
🔄 ประเภทของการทดสอบ
 
ประเภท ที่ทำอะไร ขนาด ความเร็ว เขียนยาก 
Unit Test ทดสอบฟังก์ชัน/คลาส ทีละอันเล็กๆ เล็ก ⚡ เร็วมาก ง่าย 
Integration Test ทดสอบการทำงานร่วมกันระหว่างส่วนต่างๆ กลาง 🐢 ปานกลาง ปานกลาง 
End-to-End Test ทดสอบระบบทั้งหมดเหมือนผู้ใช้จริง ใหญ่ 🐌 ช้า ยาก 
 
💡 กระจายให้ถูกต้อง: Unit Test เยอะๆ, E2E เฉพาะจุดสำคัญ ✅
 
 
 
✅ สรุปหลักการ
 
🧪 ทดสอบก่อน หรือ พร้อมกับเขียนโค้ด — ไม่ใช่ทีหลัง
✅ ทดสอบสิ่งที่สำคัญ — ไม่ต้องทดสอบทุกบรรทัด
🔄 รันทดสอบบ่อยๆ — ทุกครั้งก่อนส่งโค้ด
📝 ชัดเจนและอ่านง่าย — ทดสอบก็เป็นโค้ดเหมือนกัน ต้องบำรุงรักษา
🎯 ทดสอบพฤติกรรม ไม่ใช่การนำไปใช้ — สนใจว่ามันทำอะไรได้ ไม่สนใจว่าทำอย่างไร
 
plaintext  

> 📖 **ไฟล์ที่ 10 เสร็จสิ้น — จบหมวด Python ✅**
> พิมพ์ **"ถัดไป"** เพื่อเข้าสู่หมวด **JavaScript / TypeScript** ครับ! 😊