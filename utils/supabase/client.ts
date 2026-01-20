import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数が未設定の場合は警告を出して null を返す（使用側で適切にハンドリング）
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase環境変数が設定されていません。保存機能は使用できません。"
    );
    return null as any; // 型エラーを回避するため any にキャスト
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

