-- =====================================================
-- 🗄️ Migration 0 — Initial Schema & Base Tables
-- สร้างโครงสร้างพื้นฐาน + RLS + Trigger
-- =====================================================

-- เปิดใช้งานส่วนขยายที่จำเป็น
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================
-- 📋 Base Tables
-- =====================================

-- โปรไฟล์ผู้ใช้
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- โปรเจกต์
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'draft',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- รายการข้อมูล
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- การตั้งค่าระบบ
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- บทบาท
CREATE TABLE IF NOT EXISTS public.roles (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 🔒 RLS — Row Level Security
-- =====================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- ผู้ใช้เห็น/แก้ไขโปรไฟล์ตัวเองได้
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- เจ้าของโปรเจกต์เข้าถึงได้
CREATE POLICY "Owner access project" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

-- เจ้าของเข้าถึงรายการในโปรเจกต์ได้
CREATE POLICY "Owner access items" ON public.items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

-- การตั้งค่าระบบ — ทุกคนอ่านได้ แต่แก้ไขได้เฉพาะ Admin
CREATE POLICY "Read settings all users" ON public.settings
  FOR SELECT USING (true);

-- บทบาท — ทุกคนอ่านได้
CREATE POLICY "Read roles all users" ON public.roles
  FOR SELECT USING (true);

-- =====================================
-- ⏱️ Auto Update Timestamp
-- =====================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_timestamp_projects BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_timestamp_items BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
