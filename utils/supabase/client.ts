import { createBrowserClient } from "@supabase/ssr";

// ビルド時にエラーを出さないよう、環境変数を直接参照
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ビルドエラー回避のためのガード
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window === 'undefined') {
    // サーバーサイドでのみ警告を出力
    console.warn("Supabase environment variables are missing.");
  }
}

export function createClient() {
  // 環境変数が未設定の場合は警告を出して null を返す（使用側で適切にハンドリング）
  if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== 'undefined') {
      console.warn(
        "Supabase環境変数が設定されていません。保存機能は使用できません。"
      );
    }
    return null as any; // 型エラーを回避するため any にキャスト
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

