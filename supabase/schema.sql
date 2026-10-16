-- ==============================================================================
-- ENGLISH MASTERY — SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Jalankan skrip ini melalui Supabase Dashboard -> SQL Editor -> Run
-- Skrip ini idempotent (aman dijalankan berulang kali).

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Sinkronisasi profil belajar pengguna)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'Pelajar',
  avatar_emoji TEXT DEFAULT '🎓',
  daily_goal INTEGER DEFAULT 10,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER WORD PROGRESS TABLE (Status penguasaan per kosakata)
CREATE TABLE IF NOT EXISTS public.user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'learning', 'mastered')),
  consecutive_correct INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ,
  last_correct TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_word UNIQUE (user_id, word_id)
);

-- 4. USER DAILY ACTIVITY TABLE (Rekap aktivitas harian & streak)
CREATE TABLE IF NOT EXISTS public.user_daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  total_attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  incorrect INTEGER DEFAULT 0,
  unique_words_count INTEGER DEFAULT 0,
  new_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_activity_date UNIQUE (user_id, activity_date)
);

-- 5. INDEXES UNTUK PERFORMA
CREATE INDEX IF NOT EXISTS idx_word_progress_user_id ON public.user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_word_id ON public.user_word_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.user_daily_activity(user_id, activity_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. Aktifkan RLS pada seluruh tabel pengguna
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_activity ENABLE ROW LEVEL SECURITY;

-- B. Kebijakan RLS untuk tabel public.profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- C. Kebijakan RLS untuk tabel public.user_word_progress
DROP POLICY IF EXISTS "Users can view their own word progress" ON public.user_word_progress;
CREATE POLICY "Users can view their own word progress"
  ON public.user_word_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own word progress" ON public.user_word_progress;
CREATE POLICY "Users can insert their own word progress"
  ON public.user_word_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own word progress" ON public.user_word_progress;
CREATE POLICY "Users can update their own word progress"
  ON public.user_word_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own word progress" ON public.user_word_progress;
CREATE POLICY "Users can delete their own word progress"
  ON public.user_word_progress FOR DELETE
  USING (auth.uid() = user_id);

-- D. Kebijakan RLS untuk tabel public.user_daily_activity
DROP POLICY IF EXISTS "Users can view their own daily activity" ON public.user_daily_activity;
CREATE POLICY "Users can view their own daily activity"
  ON public.user_daily_activity FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily activity" ON public.user_daily_activity;
CREATE POLICY "Users can insert their own daily activity"
  ON public.user_daily_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own daily activity" ON public.user_daily_activity;
CREATE POLICY "Users can update their own daily activity"
  ON public.user_daily_activity FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own daily activity" ON public.user_daily_activity;
CREATE POLICY "Users can delete their own daily activity"
  ON public.user_daily_activity FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON REGISTRATION (Opsional & Aman)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_emoji, daily_goal, theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Pelajar'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_emoji', '🎓'),
    10,
    'light'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
