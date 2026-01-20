import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

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

export default async function DashboardPage() {
  // 環境変数が未設定の場合はログインページにリダイレクト
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login");
  }

  const supabase = await createClient();
  
  // createClient が null を返した場合（念のため）
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィールがなければ作成
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id }, { onConflict: "id" });

  if (profileError) {
    console.error("Profile creation error:", profileError);
  }

  // 診断結果を取得
  const { data: assessments, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Assessments fetch error:", error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <header className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
            <LogoutButton />
          </div>
          <p className="text-sm text-gray-600">
            診断結果の履歴を確認できます
          </p>
          <div className="mt-4 h-px w-full bg-red-100" />
        </header>

        {!assessments || assessments.length === 0 ? (
          <div className="rounded-lg border border-red-100 bg-red-50/30 p-8 text-center">
            <p className="text-gray-700">まだ診断結果が保存されていません。</p>
            <a
              href="/"
              className="mt-4 inline-block text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              診断を開始する →
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {assessments.map((assessment: Assessment) => (
              <div
                key={assessment.id}
                className="rounded-lg border border-red-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {new Date(assessment.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </h2>
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">業種診断結果</h3>
                  <p className="text-gray-900">{assessment.industry_result}</p>
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">C/L/T スコア</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">C:</span>
                      <span className="text-lg font-bold text-red-600">{assessment.score_c}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">L:</span>
                      <span className="text-lg font-bold text-red-600">{assessment.score_l}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">T:</span>
                      <span className="text-lg font-bold text-red-600">{assessment.score_t}%</span>
                    </div>
                  </div>
                </div>

                {assessment.strengths && assessment.strengths.length > 0 && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">強み</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {assessment.strengths.slice(0, 5).map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {assessment.weaknesses && assessment.weaknesses.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">弱み</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {assessment.weaknesses.slice(0, 5).map((weakness, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

