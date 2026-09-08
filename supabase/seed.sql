-- =====================================================
-- 🌱 OnSpace.AI — Seed Data
-- =====================================================
-- 📌 ใช้สำหรับ: Preview Branch / Dev Environment / CI Test
-- ⚠️ จะไม่ถูกรันบน Production โดยอัตโนมัติ
-- =====================================================

-- =====================================
-- 🔐 Auth & Profiles
-- =====================================

-- สร้างบทบาทผู้ใช้
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@onspace.test', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'user@onspace.test', crypt('User123!', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- โปรไฟล์ผู้ใช้
INSERT INTO public.profiles (id, email, full_name, role, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@onspace.test', 'Admin User', 'admin', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'user@onspace.test', 'Test User', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 🧑‍💼 ตัวอย่างข้อมูลทั่วไป
-- =====================================

-- ตัวอย่างโปรเจกต์
INSERT INTO public.projects (id, name, description, owner_id, status, created_at)
VALUES
  ('proj-001', 'Demo Dashboard', 'แดชบอร์ดตัวอย่างสำหรับทดสอบ', '00000000-0000-0000-0000-000000000001', 'active', NOW()),
  ('proj-002', 'CRM Demo', 'ระบบจัดการลูกค้าตัวอย่าง', '00000000-0000-0000-0000-000000000001', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- ตัวอย่างรายการข้อมูล
INSERT INTO public.items (id, project_id, title, description, status, created_at)
VALUES
  ('item-001', 'proj-001', 'ยอดขายรวม', 'แสดงยอดขายแยกตามเดือน', 'completed', NOW()),
  ('item-002', 'proj-001', 'สมาชิก', 'จำนวนผู้ใช้งานระบบ', 'active', NOW()),
  ('item-003', 'proj-002', 'รายชื่อลูกค้า', 'ตารางข้อมูลลูกค้า', 'draft', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 📋 ค่าตั้งต้นระบบ
-- =====================================

-- การตั้งค่าระบบ
INSERT INTO public.settings (key, value, description, updated_at)
VALUES
  ('app_name', '"OnSpace.AI"', 'ชื่อแอปพลิเคชัน', NOW()),
  ('theme_default', '"light"', 'ธีมเริ่มต้น', NOW()),
  ('registration_enabled', 'true', 'เปิดให้ลงทะเบียน', NOW()),
  ('max_preview_days', '7', 'อายุสาขา Preview (วัน)', NOW())
ON CONFLICT (key) DO NOTHING;

-- ประเภทบทบาท
INSERT INTO public.roles (code, name, permissions, description)
VALUES
  ('admin', 'ผู้ดูแลระบบ', '["read","write","delete","admin"]', 'สิทธิ์เต็มที่'),
  ('developer', 'นักพัฒนา', '["read","write"]', 'สร้างและแก้ไขได้'),
  ('viewer', 'ผู้ดู', '["read"]', 'ดูได้อย่างเดียว')
ON CONFLICT (code) DO NOTHING;

-- =====================================
-- ✅ สรุป
-- =====================================
-- ผู้ใช้ทดสอบ:
--   📧 admin@onspace.test  /  Admin123!
--   📧 user@onspace.test   /  User123!
--
-- ⚠️ รหัสผ่านนี้ใช้เฉพาะสภาพแวดล้อมทดสอบเท่านั้น
--    ห้ามใช้ใน Production!
-- =====================================
