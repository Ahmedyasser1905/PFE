-- ==========================================
-- SUPABASE POSTGRESQL SCHEMA FOR PFE
-- Copy this into the Supabase SQL Editor
-- ==========================================

-- 1. PROFILES (Extends Auth Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROJECTS
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget_type TEXT DEFAULT 'ESTIMATED',
  total_cost NUMERIC DEFAULT 0,
  leaf_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ESTIMATIONS
CREATE TABLE public.estimations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  budget_type TEXT DEFAULT 'ESTIMATED',
  total_budget NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CATEGORIES
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'LEAF',
  formulas JSONB DEFAULT '[]'::jsonb, -- Array of formula configs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MATERIALS
CREATE TABLE public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'BASIC',
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  waste_factor_default NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. LEAF_CALCULATIONS (Extracted from embedded array in NoSQL)
CREATE TABLE public.leaf_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimation_id UUID REFERENCES public.estimations(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  formula_id TEXT NOT NULL,
  inputs JSONB DEFAULT '{}'::jsonb,
  outputs JSONB DEFAULT '{}'::jsonb,
  material_lines JSONB DEFAULT '[]'::jsonb,
  total_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CHAT_MESSAGES
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security so users only see their own data
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaf_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own estimations" ON public.estimations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own estimations" ON public.estimations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estimations" ON public.estimations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaf calcs of their estimation" ON public.leaf_calculations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.estimations WHERE estimations.id = leaf_calculations.estimation_id AND estimations.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert leaf calcs to their estimation" ON public.leaf_calculations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.estimations WHERE estimations.id = leaf_calculations.estimation_id AND estimations.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete leaf calcs from their estimation" ON public.leaf_calculations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.estimations WHERE estimations.id = leaf_calculations.estimation_id AND estimations.user_id = auth.uid()
  )
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Catalog tables are Public/Read-Only
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Materials are public read" ON public.materials FOR SELECT USING (true);
