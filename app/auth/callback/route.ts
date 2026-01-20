import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Node.jsランタイムを明示的に指定（Edge Runtimeの警告を回避）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // 環境変数のバリデーションを使用
  const { getEnvConfig } = await import("@/lib/env");
  const envConfig = getEnvConfig();

  // 環境変数が未設定の場合はホームにリダイレクト
  if (!envConfig.isSupabaseEnabled) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (code) {
    try {
      const supabase = await createClient();
      // createClient が null を返した場合（念のため）
      if (!supabase) {
        console.warn("Supabase環境変数が設定されていません。");
        return NextResponse.redirect(new URL("/", request.url));
      }
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Auth callback error:", error);
      // エラー時もホームにリダイレクト
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}

