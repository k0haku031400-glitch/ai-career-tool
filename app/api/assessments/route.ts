import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/safeJson";

// Node.jsランタイムを明示的に指定（Edge Runtimeの警告を回避）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AssessmentRequest = {
  industry_result: string;
  score_c: number;
  score_l: number;
  score_t: number;
  strengths: string[];
  weaknesses: string[];
};

export async function POST(request: Request) {
  try {
    // 環境変数が未設定の場合は保存をスキップ（診断処理は続行）
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase環境変数が設定されていません。保存機能は使用できません。");
      return NextResponse.json(
        { ok: false, skipped: true },
        { status: 200 }
      );
    }

    const supabase = await createClient();

    // 認証ユーザーを確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 未ログインの場合は保存せず、エラーにしない（静かにスキップ）
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, skipped: true, message: "未ログインのため保存をスキップしました" },
        { status: 200 }
      );
    }

    // リクエストボディを取得（安全なJSONパースを使用）
    const requestText = await request.text();
    const body = safeJsonParse<AssessmentRequest>(requestText);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "無効なリクエストです" },
        { status: 400 }
      );
    }

    // バリデーション
    if (
      !body.industry_result ||
      typeof body.industry_result !== "string" ||
      typeof body.score_c !== "number" ||
      typeof body.score_l !== "number" ||
      typeof body.score_t !== "number" ||
      !Array.isArray(body.strengths) ||
      !Array.isArray(body.weaknesses)
    ) {
      return NextResponse.json(
        { ok: false, error: "無効なリクエストです" },
        { status: 400 }
      );
    }

    // スコアを整数化
    const scoreC = Math.round(body.score_c);
    const scoreL = Math.round(body.score_l);
    const scoreT = Math.round(body.score_t);

    // strengths/weaknesses が空配列の場合は空配列を設定
    const strengths = Array.isArray(body.strengths) ? body.strengths : [];
    const weaknesses = Array.isArray(body.weaknesses) ? body.weaknesses : [];

    // プロフィールが無ければ作成（upsert）
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id" });

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      // プロフィール作成エラーは続行（assessments は保存可能）
    }

    // assessments に insert
    const { data, error } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        industry_result: body.industry_result,
        score_c: scoreC,
        score_l: scoreL,
        score_t: scoreT,
        strengths: strengths,
        weaknesses: weaknesses,
      })
      .select()
      .single();

    if (error) {
      console.error("Assessment insert error:", error);
      return NextResponse.json(
        { ok: false, error: "診断結果の保存に失敗しました", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "サーバーエラーが発生しました", details: error.message },
      { status: 500 }
    );
  }
}

