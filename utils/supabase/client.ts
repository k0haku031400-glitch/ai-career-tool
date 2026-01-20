import { createBrowserClient } from "@supabase/ssr";
import { getEnvConfig } from "@/lib/env";

export function createClient() {
  const envConfig = getEnvConfig();

  // 環境変数が未設定の場合は警告を出して null を返す（使用側で適切にハンドリング）
  if (!envConfig.isSupabaseEnabled) {
    console.warn(
      "Supabase環境変数が設定されていません。保存機能は使用できません。"
    );
    return null as any; // 型エラーを回避するため any にキャスト
  }

  return createBrowserClient(
    envConfig.supabaseUrl!,
    envConfig.supabaseAnonKey!
  );
}

