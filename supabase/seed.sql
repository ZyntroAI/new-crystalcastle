-- =====================================================
-- 🌱 OnSpace.AI — Seed Data
-- =====================================================
-- 📌 รันอัตโนมัติเมื่อสร้าง Preview Branch / ทดสอบในเครื่อง
-- ⚠️ จะไม่รันบน Production โดยอัตโนมัติ
-- =====================================================

-- 🔐 ผู้ใช้ทดสอบ
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@onspace.test', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'user@onspace.test', crypt('User123!', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- กำหนดสิทธิ์ Admin
INSERT INTO auth.admin_users (user_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 📋 บทบาท
INSERT INTO public.roles (code, name, permissions, description)
VALUES
  ('admin', 'ผู้ดูแลระบบ', '["read","write","delete","admin"]', 'สิทธิ์เต็มที่'),
  ('developer', 'นักพัฒนา', '["read","write"]', 'สร้างและแก้ไขได้'),
  ('viewer', 'ผู้ดู', '["read"]', 'ดูได้อย่างเดียว')
ON CONFLICT (code) DO NOTHING;

-- ⚙️ การตั้งค่าระบบ
INSERT INTO public.settings (key, value, description)
VALUES
  ('app_name', '"OnSpace.AI"', 'ชื่อแอปพลิเคชัน'),
  ('theme_default', '"light"', 'ธีมเริ่มต้น'),
  ('registration_enabled', 'true', 'เปิดให้ลงทะเบียน'),
  ('max_preview_days', '7', 'อายุสาขา Preview (วัน)')
ON CONFLICT (key) DO NOTHING;

-- 🧑‍💼 โปรเจกต์ตัวอย่าง
INSERT INTO public.projects (id, name, description, owner_id, status)
VALUES
  ('proj-001', 'Demo Dashboard', 'แดชบอร์ดตัวอย่างสำหรับทดสอบ', '00000000-0000-0000-0000-000000000001', 'active'),
  ('proj-002', 'CRM Demo', 'ระบบจัดการลูกค้าตัวอย่าง', '00000000-0000-0000-0000-000000000001', 'active')
ON CONFLICT (id) DO NOTHING;

-- 📝 รายการข้อมูลตัวอย่าง
INSERT INTO public.items (id, project_id, title, description, status)
VALUES
  ('item-001', 'proj-001', 'ยอดขายรวม', 'แสดงยอดขายแยกตามเดือน', 'completed'),
  ('item-002', 'proj-001', 'สมาชิก', 'จำนวนผู้ใช้งานระบบ', 'active'),
  ('item-003', 'proj-002', 'รายชื่อลูกค้า', 'ตารางข้อมูลลูกค้า', 'draft')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 🔑 ข้อมูลเข้าสู่ระบบทดสอบ
--   admin@onspace.test   / Admin123!  (ผู้ดูแลระบบ)
--   user@onspace.test    / User123!   (ผู้ใช้ทั่วไป)
-- ⚠️ ใช้เฉพาะสภาพแวดล้อมทดสอบเท่านั้น!
-- =====================================
