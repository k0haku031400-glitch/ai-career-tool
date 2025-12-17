import { NextResponse } from "next/server";

import { calculateCLT } from "@/lib/calculateCLT";

import { recommendJobs } from "@/lib/recommendJobs";

import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";



export async function POST(req: Request) {

  try {

    const body = (await req.json()) as {

      verbs: string[];

      skills: string[];

      interests?: string[];

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

    const rec = recommendJobs(clt.ratio, 3).map((r) => ({

      job: r.job,

      industries: r.industries,

      description: r.description,

    }));



    const userPrompt = buildUserPrompt({

      ratio: clt.ratio,

      counts: clt.counts,

      selectedVerbs: body.verbs,

      selectedByCategory: clt.selectedByCategory,

      skills: body.skills?.length ? body.skills : ["特になし"],

      interests: body.interests ?? [],

      recommendedJobs: rec,

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

          { role: "system", content: SYSTEM_PROMPT },

          { role: "user", content: userPrompt },

        ],

        temperature: 0.7,

      }),

    });



    const data = await resp.json();

    const content = data?.choices?.[0]?.message?.content;



    if (!content) {

      return NextResponse.json(

        { error: "AIの出力が空でした", raw: data },

        { status: 500 }

      );

    }



    let parsed: any = null;

    try {

      parsed = JSON.parse(content);

    } catch {

      // 想定外の出力のときデバッグしやすいように生のcontentも返す

      return NextResponse.json(

        { error: "AI出力がJSONとして解析できません", content },

        { status: 500 }

      );

    }



    return NextResponse.json({

      input: { ...body, clt, recommendedJobs: rec },

      result: parsed,

    });

  } catch (e: any) {

    return NextResponse.json(

      { error: e?.message ?? "unknown error" },

      { status: 500 }

    );

  }

}

