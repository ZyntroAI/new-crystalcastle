รับทราบครับ ✅ ขอดูภาพที่คุณส่งมาก่อนนะครับ 🔍

เข้าใจแล้วครับ ✅ ภาพคือแอป Go PDF (แอปอ่าน/แปลง PDF บนมือถือ) และคุณพิมพ์  python  — หมายถึงต้องการ เขียนสคริปต์ Python ทำงานกับ PDF แทนการใช้แอป นี่ครับ สร้าง Python PDF Toolkit ครบทุกฟีเจอร์เหมือนแอปเลย 🐍📄
 
 
 
🐍 Python PDF Toolkit — ทำงาน PDF ด้วยโค้ด
 
📦 ติดตั้งไลบรารี
 
bash  
pip install pypdf reportlab Pillow pdf2image
# สำหรับแปลงรูปภาพ → PDF ใช้ Pillow ได้เลย
# สำหรับแปลง PDF → รูป ต้องติดตั้ง poppler-utils ด้วย
 
 
 
 
📄 สคริปต์  pdf_toolkit.py  — ครบทุกฟีเจอร์
 
python  
#!/usr/bin/env python3
"""
🐍 Python PDF Toolkit — ทำงานกับ PDF ด้วยโค้ดแทนแอป Go PDF
ฟีเจอร์: รวม, แยก, ดึงข้อความ, ล็อก/ปลดล็อก, ลดขนาด, แปลงรูป→PDF, เพิ่มลายน้ำ
วิธีใช้: python pdf_toolkit.py <คำสั่ง> <พารามิเตอร์>
"""
import sys
import os
from pathlib import Path
from pypdf import PdfReader, PdfWriter, PdfMerger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from PIL import Image

def info(pdf_path: str):
    """📋 ดูข้อมูลไฟล์ PDF"""
    reader = PdfReader(pdf_path)
    meta = reader.metadata
    print(f"📄 {pdf_path}")
    print(f"   จำนวนหน้า: {len(reader.pages)}")
    print(f"   ชื่อเรื่อง: {meta.title or '-'}")
    print(f"   ผู้สร้าง: {meta.author or '-'}")
    print(f"   ป้องกันรหัสผ่าน: {'✅ ใช่' if reader.is_encrypted else '❌ ไม่'}")

def merge(output: str, *inputs):
    """🔗 รวมหลายไฟล์ PDF เป็นไฟล์เดียว"""
    merger = PdfMerger()
    for f in inputs:
        merger.append(f)
        print(f"✅ เพิ่ม: {f}")
    merger.write(output)
    merger.close()
    print(f"🎉 รวมเสร็จ: {output}")

def split(pdf_path: str, output_dir: str = "split_output"):
    """✂️ แยก PDF เป็นหน้าๆ ต่อไฟล์"""
    Path(output_dir).mkdir(exist_ok=True)
    reader = PdfReader(pdf_path)
    base = Path(pdf_path).stem
    for i, page in enumerate(reader.pages, 1):
        writer = PdfWriter()
        writer.add_page(page)
        out = f"{output_dir}/{base}_page_{i:03d}.pdf"
        with open(out, "wb") as f:
            writer.write(f)
        print(f"✅ หน้า {i} → {out}")

def extract_text(pdf_path: str, output: str = None):
    """📝 ดึงข้อความจาก PDF ออกมาเป็น .txt"""
    reader = PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages, 1):
        text += f"\n{'='*50}\nหน้า {i}\n{'='*50}\n"
        text += page.extract_text() or ""
    if output:
        Path(output).write_text(text, encoding="utf-8")
        print(f"✅ บันทึกข้อความ: {output}")
    else:
        print(text)

def images_to_pdf(output: str, *image_paths):
    """🖼️ แปลงรูปภาพ (JPG/PNG) หลายรูปเป็น PDF เล่มเดียว"""
    images = []
    for img_path in image_paths:
        img = Image.open(img_path).convert("RGB")
        images.append(img)
    if images:
        images[0].save(output, save_all=True, append_images=images[1:])
        print(f"✅ แปลง {len(images)} รูป → {output}")

def add_watermark(pdf_path: str, watermark_text: str, output: str):
    """💧 เพิ่มลายน้ำข้อความทุกหน้า"""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    # สร้างลายน้ำ
    wm_path = "_watermark_tmp.pdf"
    c = canvas.Canvas(wm_path, pagesize=A4)
    c.saveState()
    c.translate(A4[0]/2, A4[1]/2)
    c.rotate(45)
    c.setFont("Helvetica", 50)
    c.setFillAlpha(0.15)
    c.drawCentredString(0, 0, watermark_text)
    c.restoreState()
    c.save()
    wm_reader = PdfReader(wm_path)
    wm_page = wm_reader.pages[0]
    for page in reader.pages:
        page.merge_page(wm_page)
        writer.add_page(page)
    with open(output, "wb") as f:
        writer.write(f)
    os.remove(wm_path)
    print(f"✅ เพิ่มลายน้ำ: {output}")

def encrypt(pdf_path: str, password: str, output: str):
    """🔒 ล็อก PDF ด้วยรหัสผ่าน"""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    writer.encrypt(password)
    with open(output, "wb") as f:
        writer.write(f)
    print(f"🔒 ล็อกเสร็จ: {output}")

def decrypt(pdf_path: str, password: str, output: str):
    """🔓 ปลดล็อก PDF (ต้องรู้รหัสผ่าน)"""
    reader = PdfReader(pdf_path)
    if reader.is_encrypted:
        reader.decrypt(password)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    with open(output, "wb") as f:
        writer.write(f)
    print(f"🔓 ปลดล็อกเสร็จ: {output}")

def rotate(pdf_path: str, degrees: int, output: str):
    """🔄 หมุนหน้า PDF (90, 180, 270 องศา)"""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    for page in reader.pages:
        page.rotate(degrees)
        writer.add_page(page)
    with open(output, "wb") as f:
        writer.write(f)
    print(f"🔄 หมุน {degrees}° เสร็จ: {output}")

def compress(pdf_path: str, output: str):
    """📦 ลดขนาดไฟล์ (ลบวัตถุที่ไม่จำเป็น)"""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    writer.add_metadata(reader.metadata)
    with open(output, "wb") as f:
        writer.write(f)
    orig = os.path.getsize(pdf_path)
    new = os.path.getsize(output)
    print(f"📦 เดิม: {orig/1024:.1f} KB → ใหม่: {new/1024:.1f} KB (ประหยัด {(1-new/orig)*100:.1f}%)")

# ─── CLI ───
COMMANDS = {
    "info": info,
    "merge": merge,
    "split": split,
    "text": extract_text,
    "img2pdf": images_to_pdf,
    "watermark": add_watermark,
    "lock": encrypt,
    "unlock": decrypt,
    "rotate": rotate,
    "compress": compress,
}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print("🐍 Python PDF Toolkit")
        print("วิธีใช้: python pdf_toolkit.py <คำสั่ง> <พารามิเตอร์>")
        print("\nคำสั่งที่ใช้ได้:")
        for cmd in COMMANDS:
            print(f"  {cmd}")
        print("\nตัวอย่าง:")
        print("  python pdf_toolkit.py info เอกสาร.pdf")
        print("  python pdf_toolkit.py merge รวม.pdf เอกสาร1.pdf เอกสาร2.pdf")
        print("  python pdf_toolkit.py split เอกสาร.pdf")
        print("  python pdf_toolkit.py text เอกสาร.pdf ผลลัพธ์.txt")
        print("  python pdf_toolkit.py img2pdf output.pdf รูป1.jpg รูป2.png")
        print("  python pdf_toolkit.py watermark เอกสาร.pdf \"ลับ\" ลายน้ำ.pdf")
        print("  python pdf_toolkit.py lock เอกสาร.pdf รหัสผ่าน ล็อก.pdf")
        print("  python pdf_toolkit.py compress เอกสาร.pdf เล็ก.pdf")
        sys.exit(1)
    
    cmd = sys.argv[1]
    args = sys.argv[2:]
    COMMANDS[cmd](*args)
 
 
 
 
🚀 วิธีใช้งานจริง
 
bash  
# 1. ดูข้อมูลไฟล์
python pdf_toolkit.py info document-blank.pdf

# 2. รวมหลายไฟล์เป็นไฟล์เดียว
python pdf_toolkit.py merge รวมทั้งหมด.pdf เอกสาร1.pdf เอกสาร2.pdf เอกสาร3.pdf

# 3. แยกเป็นหน้าๆ
python pdf_toolkit.py split เอกสาร.pdf

# 4. ดึงข้อความออกมาเป็น .txt
python pdf_toolkit.py text เอกสาร.pdf ข้อความ.txt

# 5. แปลงรูปภาพเป็น PDF
python pdf_toolkit.py img2pdf อัลบั้ม.pdf รูป1.jpg รูป2.jpg รูป3.png

# 6. เพิ่มลายน้ำ
python pdf_toolkit.py watermark เอกสาร.pdf "ZyntroAI Confidential" ลายน้ำ.pdf

# 7. ล็อกด้วยรหัสผ่าน
python pdf_toolkit.py lock เอกสาร.pdf "รหัส1234" ล็อกแล้ว.pdf

# 8. ลดขนาดไฟล์
python pdf_toolkit.py compress เอกสารใหญ่.pdf เล็กแล้ว.pdf

# 9. หมุนหน้า 90 องศา
python pdf_toolkit.py rotate เอกสาร.pdf 90 หมุนแล้ว.pdf
 
 
 
 
✅ เปรียบเทียบกับแอป Go PDF
 
ฟีเจอร์ แอป Go PDF Python Toolkit 
อ่าน PDF ✅ ✅ ดึงข้อความได้ 
รวมไฟล์ ✅ ✅ 
แยกหน้า ✅ ✅ 
แปลงรูป→PDF ✅ ✅ 
ลายน้ำ ✅ ✅ 
ล็อกรหัสผ่าน ✅ ✅ 
ลดขนาด ✅ ✅ 
หมุนหน้า ✅ ✅ 
ทำเป็นอัตโนมัติทีละหลายไฟล์ ❌ ✅ รันใน Loop 
เชื่อมกับระบบอื่น ❌ ✅ เช่น GitHub Actions 
ฟรีไม่มีโฆษณา ⚠️ มีโฆษณา ✅ โอเพ่นซอร์ส 
 
ต้องการเพิ่มฟีเจอร์ไหนเพิ่มไหมครับ เช่น แปลง PDF → Word/Excel หรือ OCR อ่านข้อความจากรูปใน PDF? บอกได้เลยครับ! 🐍📄✨