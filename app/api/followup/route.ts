import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      experienceText: string;
      selectedVerbs?: string[];
    };

    if (!body.experienceText || !body.experienceText.trim()) {
      return NextResponse.json(
        { error: "経験を入力してください" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY が未設定です" },
        { status: 500 }
      );
    }

    const prompt = `ユーザーの過去の経験を深掘りする質問を5つ生成してください。

経験内容：
${body.experienceText}

${body.selectedVerbs && body.selectedVerbs.length > 0
  ? `選択した行動：${body.selectedVerbs.slice(0, 10).join("、")}`
  : ""}

要件：
- 抽象的すぎる質問は禁止
- ユーザーが思い出せる具体性を重視
- 各質問は短く（20文字以内）
- 経験から読み取れる強み・学び・成長を引き出す質問にする

出力形式：JSON配列
["質問1", "質問2", "質問3", "質問4", "質問5"]

例：
["その経験で一番達成感があった瞬間は？", "工夫したこと・改善したことは？", "周囲から褒められた点は？", "困難だったことと乗り越え方は？", "次に活かせる学びは？"]`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたは経験を深掘りする質問を生成する専門家です。JSON配列のみを返してください。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
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
      // JSONオブジェクトの場合、questionsキーを探す
      const questions = parsed.questions || parsed;
      if (Array.isArray(questions)) {
        return NextResponse.json({ questions });
      }
      // 配列でない場合、最初の5つの値を取得
      const questionArray = Object.values(questions).slice(0, 5) as string[];
      return NextResponse.json({ questions: questionArray });
    } catch {
      // JSON解析失敗時は、テキストから質問を抽出
      const lines = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line && line.includes("？") || line.includes("?"))
        .slice(0, 5);
      if (lines.length > 0) {
        return NextResponse.json({ questions: lines });
      }
      return NextResponse.json(
        { error: "AI出力がJSONとして解析できません", content },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}

