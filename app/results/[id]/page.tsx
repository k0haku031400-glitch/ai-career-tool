import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";
import ScoreVisualizer from "@/components/ScoreVisualizer";

// Node.jsランタイムを明示的に指定（Edge Runtimeの警告を回避）
export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

type Assessment = {
  id: string;
  created_at: string;
  industry_result: string;
  score_c: number;
  score_l: number;
  score_t: number;
  strengths: string[];
  weaknesses: string[];
};

type PreviousAssessment = {
  score_c: number;
  score_l: number;
  score_t: number;
  created_at: string;
};

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  // 環境変数が未設定の場合はホームにリダイレクト
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/");
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 診断結果を取得
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !assessment) {
    notFound();
  }

  // 前回の診断結果を取得（比較用）
  const { data: previousAssessment } = await supabase
    .from("assessments")
    .select("score_c, score_l, score_t, created_at")
    .eq("user_id", user.id)
    .lt("created_at", assessment.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const hasPrevious = !!previousAssessment;

  const currentScore = {
    C: assessment.score_c,
    L: assessment.score_l,
    T: assessment.score_t,
  };

  const previousScore = previousAssessment
    ? {
        C: previousAssessment.score_c,
        L: previousAssessment.score_l,
        T: previousAssessment.score_t,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        {/* ヘッダー */}
        <header className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-ai-revolution.jpg"
                alt="サービスロゴ"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                  診断結果
                </h1>
                <p className="mt-1 text-sm text-slate-500 md:text-base leading-relaxed">
                  {new Date(assessment.created_at).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
          <div className="h-px bg-gradient-to-r from-red-100 via-red-200 to-red-100" />
        </header>

        <div className="space-y-12 leading-relaxed">
          {/* ========================================
              サマリーセクション
              ======================================== */}
          <section className="border-t border-red-100 pt-8 mt-8">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-slate-900 md:text-3xl leading-relaxed">
                あなたの強み：一言キャッチコピー
              </h2>
              <p className="text-lg text-slate-700 md:text-xl leading-relaxed">
                {assessment.industry_result}
              </p>
            </div>

            {/* C/L/Tスコア可視化 */}
            <div className="mb-8">
              <h3 className="mb-6 text-xl font-semibold text-slate-900 md:text-2xl leading-relaxed">
                C/L/Tバランス
              </h3>
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 flex justify-center">
                  <ScoreVisualizer
                    currentScore={currentScore}
                    previousScore={previousScore}
                    size={320}
                    showComparison={hasPrevious}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-6">
                  {/* スコア数値表示 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
                      <div className="mb-2 text-sm font-semibold text-blue-700">C</div>
                      <div className="text-4xl font-bold text-blue-600">
                        {assessment.score_c}%
                      </div>
                      <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                        Communication
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-6 text-center">
                      <div className="mb-2 text-sm font-semibold text-rose-700">L</div>
                      <div className="text-4xl font-bold text-rose-600">
                        {assessment.score_l}%
                      </div>
                      <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                        Leadership
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
                      <div className="mb-2 text-sm font-semibold text-emerald-700">T</div>
                      <div className="text-4xl font-bold text-emerald-600">
                        {assessment.score_t}%
                      </div>
                      <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                        Thinking
                      </div>
                    </div>
                  </div>

                  {/* 比較表示 */}
                  {hasPrevious && previousAssessment && (
                    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
                      <p className="mb-4 text-base font-semibold text-slate-700 leading-relaxed">
                        前回診断（
                        {new Date(previousAssessment.created_at).toLocaleDateString(
                          "ja-JP",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                        ）との比較
                      </p>
                      <div className="space-y-3 text-sm leading-relaxed">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">C:</span>
                          <span className="font-semibold text-slate-900">
                            {previousAssessment.score_c}% → {assessment.score_c}%
                            {assessment.score_c - previousAssessment.score_c > 0 && (
                              <span className="ml-2 text-green-600">
                                ↑ +{assessment.score_c - previousAssessment.score_c}
                              </span>
                            )}
                            {assessment.score_c - previousAssessment.score_c < 0 && (
                              <span className="ml-2 text-red-600">
                                ↓ {assessment.score_c - previousAssessment.score_c}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">L:</span>
                          <span className="font-semibold text-slate-900">
                            {previousAssessment.score_l}% → {assessment.score_l}%
                            {assessment.score_l - previousAssessment.score_l > 0 && (
                              <span className="ml-2 text-green-600">
                                ↑ +{assessment.score_l - previousAssessment.score_l}
                              </span>
                            )}
                            {assessment.score_l - previousAssessment.score_l < 0 && (
                              <span className="ml-2 text-red-600">
                                ↓ {assessment.score_l - previousAssessment.score_l}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">T:</span>
                          <span className="font-semibold text-slate-900">
                            {previousAssessment.score_t}% → {assessment.score_t}%
                            {assessment.score_t - previousAssessment.score_t > 0 && (
                              <span className="ml-2 text-green-600">
                                ↑ +{assessment.score_t - previousAssessment.score_t}
                              </span>
                            )}
                            {assessment.score_t - previousAssessment.score_t < 0 && (
                              <span className="ml-2 text-red-600">
                                ↓ {assessment.score_t - previousAssessment.score_t}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ========================================
              職種分析セクション
              ======================================== */}
          <section className="border-t border-red-100 pt-8 mt-8">
            <h2 className="mb-8 text-2xl font-bold text-slate-900 md:text-3xl leading-relaxed">
              職種分析
            </h2>

            <div className="space-y-8">
              {/* 推薦職種 */}
              <div>
                <h3 className="mb-4 text-xl font-semibold text-slate-900 leading-relaxed">
                  あなたに向いていそうな職種
                </h3>
                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
                  <p className="text-xl font-semibold text-red-600 leading-relaxed">
                    {assessment.industry_result}
                  </p>
                  <p className="mt-3 text-base text-slate-700 leading-relaxed">
                    この職種は、あなたのC/L/Tバランスと高い適合性があります。
                  </p>
                </div>
              </div>

              {/* 強み */}
              {assessment.strengths && assessment.strengths.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-slate-900 leading-relaxed">
                    あなたの強み
                  </h3>
                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
                    <ul className="space-y-3">
                      {assessment.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-slate-700 leading-relaxed"
                        >
                          <span className="mt-1 text-xl text-green-600">✓</span>
                          <span className="text-base leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 弱み・注意ポイント */}
              {assessment.weaknesses &&
                assessment.weaknesses.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xl font-semibold text-slate-900 leading-relaxed">
                      弱み・注意ポイント
                    </h3>
                    <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6">
                      <ul className="space-y-3">
                        {assessment.weaknesses.map((weakness, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-slate-700 leading-relaxed"
                          >
                            <span className="mt-1 text-xl text-yellow-600">⚠</span>
                            <span className="text-base leading-relaxed">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* ========================================
              行動アドバイスセクション
              ======================================== */}
          <section className="border-t border-red-100 pt-8 mt-8">
            <h2 className="mb-8 text-2xl font-bold text-slate-900 md:text-3xl leading-relaxed">
              行動アドバイス
            </h2>

            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-8">
              <p className="mb-4 text-base text-slate-700 leading-relaxed">
                この診断結果は、あなたの「現時点での選択・経験」に基づいた傾向です。
                <br />
                経験や行動が変わることで、C/L/Tバランスも変化していきます。
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                キャリアデザインは継続的なプロセスです。定期的に診断を受けることで、自分の成長を可視化できます。
              </p>
            </div>

            {/* 次のステップ */}
            <div className="mt-8">
              <h3 className="mb-6 text-xl font-semibold text-slate-900 leading-relaxed">
                次のステップ
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
                  <p className="font-semibold text-slate-900 text-lg leading-relaxed">
                    1. 推奨職種について調べる
                  </p>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    {assessment.industry_result}
                    について、実際の業務内容や必要なスキルを調べてみましょう。
                  </p>
                </div>
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
                  <p className="font-semibold text-slate-900 text-lg leading-relaxed">
                    2. 強みを活かす機会を探す
                  </p>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    あなたの強みを活かせる環境やプロジェクトを見つけましょう。
                  </p>
                </div>
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
                  <p className="font-semibold text-slate-900 text-lg leading-relaxed">
                    3. 定期的に診断を受ける
                  </p>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    新しい経験を積んだら、再度診断を受けて自分の変化を確認しましょう。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* アクション */}
          <section className="flex justify-center gap-4 pb-8 pt-8 border-t border-red-100">
            <a
              href="/dashboard"
              className="rounded-lg bg-red-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-red-700 text-base"
            >
              マイページに戻る
            </a>
            <a
              href="/"
              className="rounded-lg border-2 border-red-600 bg-white px-8 py-4 font-semibold text-red-600 transition-colors hover:bg-red-50 text-base"
            >
              もう一度診断する
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
