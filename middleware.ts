import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getEnvConfig } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 環境変数の存在チェック（開発中の事故防止）
  const envConfig = getEnvConfig();

  // 認証不要なパス（公開ページ）
  const publicPaths = [
    '/login',
    '/signup',
    '/auth/callback',
    '/privacy',
    '/terms',
    '/_next',
    '/api/auth',
  ];

  // 公開パスの場合は認証チェックをスキップ
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // 環境変数が未設定の場合は素通り（認証チェックなし）
  if (!envConfig.isSupabaseEnabled) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    envConfig.supabaseUrl!,
    envConfig.supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションを更新
  const { data: { user } } = await supabase.auth.getUser();

  // 診断ページ（/）へのアクセス時、未ログインならログインページへリダイレクト
  if (pathname === '/' && !isPublicPath && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ダッシュボードや結果ページへのアクセス時、未ログインならログインページへリダイレクト
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/results')) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

