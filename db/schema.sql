-- Lumipath Database Schema
-- Supabase の SQL Editor で実行してください

-- profiles テーブル
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- assessments テーブル
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  industry_result TEXT NOT NULL,
  score_c INT NOT NULL,
  score_l INT NOT NULL,
  score_t INT NOT NULL,
  strengths JSONB NOT NULL,
  weaknesses JSONB NOT NULL
);

-- RLS (Row Level Security) を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- profiles のポリシー
-- 本人のみ select/insert/update
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- assessments のポリシー
-- 本人のみ select/insert/delete
CREATE POLICY "Users can view own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS assessments_user_id_idx ON assessments(user_id);
CREATE INDEX IF NOT EXISTS assessments_created_at_idx ON assessments(created_at DESC);

