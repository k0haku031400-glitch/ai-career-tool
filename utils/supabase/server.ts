import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ビルド時にエラーを出さないよう、環境変数を直接参照
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ビルドエラー回避のためのガード
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables are missing.");
}

export async function createClient() {
  // 環境変数が未設定の場合は警告を出して null を返す（使用側で適切にハンドリング）
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase環境変数が設定されていません。保存機能は使用できません。"
    );
    return null as any; // 型エラーを回避するため any にキャスト
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseKey,
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

