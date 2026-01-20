import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnvConfig } from "@/lib/env";

export async function createClient() {
  const envConfig = getEnvConfig();

  // 環境変数が未設定の場合は警告を出して null を返す（使用側で適切にハンドリング）
  if (!envConfig.isSupabaseEnabled) {
    console.warn(
      "Supabase環境変数が設定されていません。保存機能は使用できません。"
    );
    return null as any; // 型エラーを回避するため any にキャスト
  }

  const cookieStore = await cookies();

  return createServerClient(
    envConfig.supabaseUrl!,
    envConfig.supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

