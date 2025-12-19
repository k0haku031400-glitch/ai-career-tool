import { NextResponse } from "next/server";

import { calculateCLT } from "@/lib/calculateCLT";

import { recommendIndustries } from "@/lib/recommendIndustries";

import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";



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



    const clt = calculateCLT(body.verbs);

    // 必ず3つの業種を推薦（不足する場合は補完）
    const recBase = recommendIndustries(clt.ratio, 3);
    
    // 3つに満たない場合は、C/L/T比率との一致度が高いものから補完
    const rec = recBase.length < 3
      ? [
          ...recBase,
          ...recommendIndustries(clt.ratio, 15)
            .filter((r) => !recBase.some((rb) => rb.industry === r.industry))
            .slice(0, 3 - recBase.length),
        ]
      : recBase.slice(0, 3); // 3つを超える場合は最初の3つだけ

    const recMapped = rec.map((r) => ({

      industry: r.industry,

      matchScore: r.matchScore,

      description: r.description,

      exampleRoles: r.exampleRoles,

      skills: r.skills,

      qualifications: r.qualifications,

    }));



    const userPrompt = buildUserPrompt({

      ratio: clt.ratio,

      counts: clt.counts,

      selectedVerbs: body.verbs,

      selectedByCategory: clt.selectedByCategory,

      skills: body.skills?.length ? body.skills : ["特になし"],

      interests: body.interests ?? [],

      recommendedIndustries: recMapped,

      experienceText: body.experienceText || "",

      followupAnswers: body.followupAnswers || [],

    });



    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {

      return NextResponse.json(

        { error: "OPENAI_API_KEY が未設定です" },

        { status: 500 }

      );

    }



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

    let data: any;

    try {

      data = JSON.parse(responseText);

    } catch (e) {

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



    let parsed: any = null;

    try {

      parsed = JSON.parse(jsonText);

    } catch (parseError) {

      console.error("AI raw output (JSON parse failed):", content);

      console.error("Extracted JSON text:", jsonText);

      console.error("Parse error:", parseError);

      return NextResponse.json(

        { error: "AI output is not valid JSON", raw: content },

        { status: 500 }

      );

    }



    // 既存のUI互換性のため、新しい形式から既存の形式に変換

    const transformed: any = {

      clt_summary: {

        ratio: parsed.cltRatio || { C: clt.ratio.C, L: clt.ratio.L, T: clt.ratio.T },

        tendency_text: parsed.summary || "",

        evidence_verbs: [] as string[],

      },

      recommended: (() => {
        const aiResults = parsed.recommendedIndustries || [];
        // AI結果が3つ未満の場合は、システム推薦から補完
        const systemResults = recMapped.filter(
          (r) => !aiResults.some((ai: any) => ai.industry === r.industry)
        );
        const combined = [...aiResults, ...systemResults].slice(0, 3);
        
        return combined.map((ind: any) => ({
          name: ind.industry || ind.name || "",
          industry: ind.industry || ind.name || "",
          matchScore: ind.matchScore || 0,
          reason: ind.reason || ind.why_fit || (ind.description ? `${ind.description} あなたのC/L/Tバランスと適合度が高い業界です。` : ""),
        }));
      })(),

      skills: {

        universal: [] as string[],

        differentiators: [] as string[],

        certifications_examples: [] as string[],

      },

      strengths_weaknesses: {

        strengths: {

          interpersonal: [] as string[],

          thinking: [] as string[],

          action: [] as string[],

        },

        weaknesses: {

          interpersonal: [] as string[],

          thinking: [] as string[],

          action: [] as string[],

        },

        tips: [] as string[],

      },

      experience_insights: (parsed.experienceInsights || []) as any[],

      mismatch_industries: (parsed.mismatchIndustries || []).map((m: any) => ({
        industry: m.industry || "",
        reason: m.reason || "",
        solution: m.solution || { shortTerm: "", mediumTerm: "" },
      })) as any[],

      action_tips: parsed.actionTips || { C: "", L: "", T: "" },

    };



    // strengthsとweaknessesを配列から分割

    if (Array.isArray(parsed.strengths)) {

      // 配列を3つに分割（対人・思考・行動）

      const third = Math.ceil(parsed.strengths.length / 3);

      transformed.strengths_weaknesses.strengths.interpersonal = parsed.strengths.slice(0, third);

      transformed.strengths_weaknesses.strengths.thinking = parsed.strengths.slice(third, third * 2);

      transformed.strengths_weaknesses.strengths.action = parsed.strengths.slice(third * 2);

    }

    if (Array.isArray(parsed.weaknesses)) {

      const third = Math.ceil(parsed.weaknesses.length / 3);

      transformed.strengths_weaknesses.weaknesses.interpersonal = parsed.weaknesses.slice(0, third);

      transformed.strengths_weaknesses.weaknesses.thinking = parsed.weaknesses.slice(third, third * 2);

      transformed.strengths_weaknesses.weaknesses.action = parsed.weaknesses.slice(third * 2);

    }

    // 必ず3件になるように補完（不足している場合）
    if (transformed.recommended.length < 3) {
      const existingNames = new Set(transformed.recommended.map((r: any) => r.industry || r.name));
      const additional = recMapped
        .filter((r) => !existingNames.has(r.industry))
        .slice(0, 3 - transformed.recommended.length)
        .map((r) => ({
          name: r.industry,
          industry: r.industry,
          matchScore: r.matchScore,
          reason: `${r.description} あなたのC/L/Tバランスと適合度が高い業界です。`,
        }));
      transformed.recommended = [...transformed.recommended, ...additional].slice(0, 3);
    }
    
    // 4つ以上ある場合は最初の3つだけ
    if (transformed.recommended.length > 3) {
      transformed.recommended = transformed.recommended.slice(0, 3);
    }



    return NextResponse.json({

      input: { ...body, clt, recommendedIndustries: recMapped },

      result: transformed,

    });

  } catch (e: any) {

    console.error("Unexpected error:", e);

    return NextResponse.json(

      { error: e?.message ?? "unknown error" },

      { status: 500 }

    );

  }

}
