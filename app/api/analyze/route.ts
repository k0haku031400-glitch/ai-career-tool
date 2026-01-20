import { NextResponse } from "next/server";

import { calculateCLT } from "@/lib/calculateCLT";
import { calculateIncrementalCLT, calculateExperienceBonus } from "@/lib/calculateIncrementalCLT";

import { recommendJobs } from "@/lib/recommendJobs";

import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

import { safeJsonParse } from "@/lib/safeJson";
import type { AIResponse, OpenAIResponse, TransformedResult, RecommendedJob } from "@/lib/types";

import { createClient } from "@/utils/supabase/server";

// Node.jsランタイムを明示的に指定（Edge Runtimeの警告を回避）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JSON_ONLY_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

【重要：出力形式の厳格な制約】

- 出力はJSON形式のみ許可します
- 文章・説明・Markdown・コードブロックは一切禁止です
- JSONの前後に文字列・説明文・コメントを付けることは禁止です
- 出力は必ず { で始まり } で終わるJSONオブジェクトのみです
- この形式以外の出力は一切禁止です
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      verbs: string[];
      skills: string[];
      interests?: string[];
      experienceText?: string;
      followupAnswers?: { q: string; a: string }[];
    };

    if (!body.verbs || body.verbs.length < 10) {
      return NextResponse.json(
        { error: "動詞は10個以上選んでください" },
        { status: 400 }
      );
    }

    if (body.verbs.length > 100) {
      return NextResponse.json(
        { error: "動詞は100個以下にしてください" },
        { status: 400 }
      );
    }

    // 前回の診断結果を取得（ログイン済みの場合）
    let previousRatio: { C: number; L: number; T: number } | null = null;
    let isIncremental = false;

    // 環境変数のバリデーションを使用
    const { getEnvConfig } = await import("@/lib/env");
    const envConfig = getEnvConfig();

    if (envConfig.isSupabaseEnabled) {
      const supabase = await createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 最新の診断結果を取得
          const { data: previousAssessment } = await supabase
            .from("assessments")
            .select("score_c, score_l, score_t")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (previousAssessment) {
            previousRatio = {
              C: previousAssessment.score_c,
              L: previousAssessment.score_l,
              T: previousAssessment.score_t,
            };
            isIncremental = true;
          }
        }
      }
    }

    // C/L/T計算（前回値がある場合は上乗せ診断、ない場合は通常計算）
    let clt;
    let experienceBonus = { C: 0, L: 0, T: 0 };
    
    if (previousRatio && isIncremental) {
      // 上乗せ診断: calculateIncrementalCLTを使用
      // 経験テキスト、資格、興味職種を統合して解析
      const combinedText = [
        body.experienceText || "",
        body.skills?.join(", ") || "",
        body.interests?.join(", ") || "",
      ].filter(Boolean).join("\n");
      
      const incrementalResult = calculateIncrementalCLT(
        previousRatio,
        body.verbs,
        combinedText
      );
      clt = incrementalResult.cltScore;
      experienceBonus = incrementalResult.experienceBonus;
    } else {
      // 初回診断: 通常のcalculateCLTを使用
      clt = calculateCLT(body.verbs);
      
      // 経験テキストからボーナスを計算（初回でも適用）
      if (body.experienceText || body.skills?.length || body.interests?.length) {
        const combinedText = [
          body.experienceText || "",
          body.skills?.join(", ") || "",
          body.interests?.join(", ") || "",
        ].filter(Boolean).join("\n");
        
        experienceBonus = calculateExperienceBonus(combinedText);
        
        // ボーナスを適用
        clt.ratio.C = Math.min(100, Math.max(0, clt.ratio.C + experienceBonus.C));
        clt.ratio.L = Math.min(100, Math.max(0, clt.ratio.L + experienceBonus.L));
        clt.ratio.T = Math.min(100, Math.max(0, clt.ratio.T + experienceBonus.T));
        
        // 正規化
        const sum = clt.ratio.C + clt.ratio.L + clt.ratio.T;
        if (sum > 100) {
          const scale = 100 / sum;
          clt.ratio.C = Math.round(clt.ratio.C * scale);
          clt.ratio.L = Math.round(clt.ratio.L * scale);
          clt.ratio.T = Math.round(clt.ratio.T * scale);
        }
      }
    }

    // 必ず3つの職種を推薦（不足する場合は補完）
    const recBase = recommendJobs(clt.ratio, 3) || [];

    // 3つに満たない場合は、C/L/T比率との一致度が高いものから補完
    const rec = recBase.length < 3
      ? [
          ...recBase,
          ...(recommendJobs(clt.ratio, 15) || [])
            .filter((r) => !recBase.some((rb) => rb.job === r.job))
            .slice(0, 3 - recBase.length),
        ]
      : recBase.slice(0, 3); // 3つを超える場合は最初の3つだけ

    // recが空の場合はエラーハンドリング
    if (!rec || rec.length === 0) {
      console.error("No jobs recommended. rec is empty.");
      return NextResponse.json(
        { error: "職種の推薦に失敗しました。データを確認してください。" },
        { status: 500 }
      );
    }

    const recMapped = rec.map((r) => ({
      job: r.job || r.name || "",
      matchScore: r.matchScore || 0,
      description: r.description || "",
      industries: r.industries || [],
      skillsCommon: r.skillsCommon || [],
      skillsDifferentiator: r.skillsDifferentiator || [],
      certifications: r.certifications || [],
    }));

    const userPrompt = buildUserPrompt({
      ratio: clt.ratio,
      counts: clt.counts,
      selectedVerbs: body.verbs,
      selectedByCategory: clt.selectedByCategory,
      skills: body.skills?.length ? body.skills : ["特になし"],
      interests: body.interests ?? [],
      recommendedJobs: recMapped,
      experienceText: body.experienceText || "",
      followupAnswers: body.followupAnswers || [],
      isIncremental,
      previousRatio,
    });

    if (!envConfig.isOpenAIEnabled) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY が未設定です" },
        { status: 500 }
      );
    }

    const apiKey = envConfig.openaiApiKey!;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: JSON_ONLY_SYSTEM_PROMPT },
          { role: "user", content: `${userPrompt}\n\n【重要】出力はJSONのみです。このJSON以外の形式は一切禁止です。JSONの前後に文字列を付けないでください。` },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.text();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "OpenAI API呼び出しに失敗しました", raw: errorData },
        { status: 500 }
      );
    }

    // response.text()で受けてからJSON.parse()する
    const responseText = await resp.text();

    // 安全なJSONパースを使用
    const data = safeJsonParse<OpenAIResponse>(responseText);

    if (!data || typeof data !== "object") {
      console.error("OpenAI API response is not JSON:", responseText);
      return NextResponse.json(
        { error: "OpenAI API response is not valid JSON", raw: responseText },
        { status: 500 }
      );
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("AI output is empty, raw data:", data);
      return NextResponse.json(
        { error: "AIの出力が空でした", raw: data },
        { status: 500 }
      );
    }

    // テキストからJSON部分を抽出（最初の{から最後の}まで）
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.error("AI raw output (no JSON found):", content);
      return NextResponse.json(
        { error: "AI output is not valid JSON", raw: content },
        { status: 500 }
      );
    }

    const jsonText = content.slice(firstBrace, lastBrace + 1);

    // 安全なJSONパースを使用
    const parsed = safeJsonParse<AIResponse>(jsonText, null);

    if (!parsed || typeof parsed !== "object") {
      console.error("AI raw output (JSON parse failed):", content);
      console.error("Extracted JSON text:", jsonText);
      return NextResponse.json(
        { error: "AI output is not valid JSON", raw: content },
        { status: 500 }
      );
    }

    // 職種推薦結果を処理
    const aiRecommendedJobs = parsed.recommendedJobs || [];
    const recommended: RecommendedJob[] = aiRecommendedJobs
      .slice(0, 3)
      .map((job) => ({
        job: job.job || "",
        matchScore: job.matchScore || 0,
        reason: job.reason || "",
        actionPlan: job.actionPlan || "",
      }));

    // 不足分をシステム推薦から補完
    if (recommended.length < 3) {
      const existingJobs = new Set(recommended.map((r) => r.job));
      const additional = recMapped
        .filter((r) => !existingJobs.has(r.job))
        .slice(0, 3 - recommended.length)
        .map((r) => ({
          job: r.job,
          matchScore: r.matchScore,
          reason: `${r.description} あなたのC/L/Tバランスと適合度が高い職種です。`,
          actionPlan: `この職種に向けて、${r.skillsCommon.join("、")}などのスキルを身につけると良いでしょう。`,
        }));
      recommended.push(...additional);
    }

    // 強み・弱みを処理
    const strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
    const weaknesses = Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [];

    const third = Math.ceil(Math.max(strengths.length, weaknesses.length) / 3);

    // 診断結果をSupabaseに保存（ログイン済みの場合）
    let assessmentId: string | null = null;
    const jobResult = recommended[0]?.job || "";
    const strengthsArray = strengths;
    const weaknessesArray = weaknesses;

    if (envConfig.isSupabaseEnabled) {
      const supabase = await createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // プロフィールが無ければ作成（upsert）
          await supabase
            .from("profiles")
            .upsert({ id: user.id }, { onConflict: "id" });

          // assessments に insert
          const { data: insertedData, error: insertError } = await supabase
            .from("assessments")
            .insert({
              user_id: user.id,
              industry_result: jobResult,
              score_c: Math.round(clt.ratio.C),
              score_l: Math.round(clt.ratio.L),
              score_t: Math.round(clt.ratio.T),
              strengths: strengthsArray,
              weaknesses: weaknessesArray,
            })
            .select()
            .single();

          if (!insertError && insertedData) {
            assessmentId = insertedData.id;
          } else {
            console.error("Assessment insert error:", insertError);
          }
        }
      }
    }

    // 既存のUI互換性のため、新しい形式から既存の形式に変換
    const transformed: TransformedResult = {
      clt_summary: {
        ratio: parsed.cltRatio || { C: clt.ratio.C, L: clt.ratio.L, T: clt.ratio.T },
        tendency_text: parsed.summary || "",
        evidence_verbs: [],
      },
      recommended: recommended.map((r) => ({
        name: r.job,
        job: r.job,
        matchScore: r.matchScore,
        reason: r.reason,
        actionPlan: r.actionPlan,
      })),
      skills: {
        universal: [],
        differentiators: [],
        certifications_examples: [],
      },
      strengths_weaknesses: {
        strengths: {
          interpersonal: strengths.slice(0, third),
          thinking: strengths.slice(third, third * 2),
          action: strengths.slice(third * 2),
        },
        weaknesses: {
          interpersonal: weaknesses.slice(0, third),
          thinking: weaknesses.slice(third, third * 2),
          action: weaknesses.slice(third * 2),
        },
        tips: [],
      },
      experience_insights: (parsed.experienceInsights || []).map((insight) => ({
        experience: insight.experience || "",
        insight: insight.insight || "",
        suitable_role: insight.suitable_role || "",
      })),
      mismatch_jobs: (parsed.mismatchJobs || []).map((m) => ({
        job: m.job || "",
        reason: m.reason || "",
        solution: {
          shortTerm: m.solution?.shortTerm || "",
          mediumTerm: m.solution?.mediumTerm || "",
        },
      })),
      action_tips: parsed.actionTips || { C: "", L: "", T: "" },
    };

    return NextResponse.json({
      input: { ...body, clt, recommendedJobs: recMapped },
      result: transformed,
      assessmentId, // 保存した診断結果のIDを返す
      isIncremental, // 差分診断かどうか
    });

  } catch (e: any) {
    console.error("Unexpected error:", e);
    return NextResponse.json(
      { error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
