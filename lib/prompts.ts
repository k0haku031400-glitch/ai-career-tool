export const SYSTEM_PROMPT = `

あなたはキャリアアドバイザー兼、職務理解に強い編集者です。

ユーザーの「好きな行動（動詞）」と「スキル/資格」と「興味」を材料に、

C/L/Tの傾向を説明し、向いている職業・業種を具体的に提案してください。



重要ルール:

- 断定しすぎない（「傾向」「可能性」「〜になりやすい」）

- 専門用語を避け、大学生にもわかる文章

- ユーザーの選んだ動詞を根拠として必ず引用する

- 必要スキルは「普遍的スキル」と「差別化スキル」と「具体的な資格名」に分ける

- 資格は、TOEIC・英検・日商簿記・基本情報技術者など、日本の学生がイメージしやすい名称を必ず含める

- 強み弱みは複数視点（対人・思考・行動）で出す

- 最後に次の7日アクションは出さなくてよい（出力JSONにも含めない）

- 過去の経験と深掘り回答から読み取れる強みを根拠として必ず引用する

`;

export function buildUserPrompt(params: {
  ratio: { C: number; L: number; T: number };
  counts: { C: number; L: number; T: number };
  selectedVerbs: string[];
  selectedByCategory: { C: string[]; L: string[]; T: string[] };
  skills: string[];
  interests?: string[];
  recommendedJobs: Array<{
    job: string;
    industries: string[];
    description: string;
  }>;
  experienceText: string;
  followupAnswers: { q: string; a: string }[];
}) {
  const {
    ratio,
    counts,
    selectedVerbs,
    selectedByCategory,
    skills,
    interests,
    recommendedJobs,
    experienceText,
    followupAnswers,
  } = params;

  return `

入力情報:

- C/L/T比率: C ${ratio.C}%, L ${ratio.L}%, T ${ratio.T}%

- カウント: C ${counts.C}, L ${counts.L}, T ${counts.T}

- 選ばれた動詞（全体）: ${selectedVerbs.join("、")}

- C寄りの動詞: ${selectedByCategory.C.join("、") || "なし"}

- L寄りの動詞: ${selectedByCategory.L.join("、") || "なし"}

- T寄りの動詞: ${selectedByCategory.T.join("、") || "なし"}

- 資格・スキル: ${skills.join("、")}

- 興味のある職業/業種（任意）: ${
    interests && interests.length > 0 ? interests.join("、") : "未回答"
  }

- 過去の経験: ${experienceText || "未入力"}

${
  followupAnswers && followupAnswers.length > 0
    ? `- 深掘り質問への回答:\n${followupAnswers
        .map((fa) => `  Q: ${fa.q}\n  A: ${fa.a}`)
        .join("\n")}`
    : ""
}

システム側で算出した「近い職業候補（上位）」:

${recommendedJobs
  .map(
    (j, i) =>
      `- 候補${i + 1}: ${j.job} / 業種例: ${j.industries.join(
        "、"
      )} / 概要: ${j.description}`
  )
  .join("\n")}

出力フォーマット（このJSONで返してください。この形式以外は一切禁止です）:

{

  "cltRatio": {"C": number, "L": number, "T": number},

  "summary": string,

  "recommendedJobs": [

    {

      "job": string,

      "industries": string[],

      "reason": string,

      "skills": string[],

      "qualifications": string[]

    }

  ],

  "strengths": string[],

  "weaknesses": string[],

  "experienceInsights": [

    {

      "experience": string,

      "insight": string,

      "suitable_role": string

    }

  ]

}

制約:

- recommended は必ず3〜5件の範囲で出す

- evidence_verbs はユーザーの動詞から5〜10個を厳選

- skills.certifications_examples は必ず3〜5件の「具体的な資格名」を含める（スキルではなく資格名）

- experience_insights は過去の経験と深掘り回答から読み取れる強みを3〜6個、それぞれ「経験の具体」→「示唆」→「向く役割」を1行で記述

- 経験からの根拠は「この経験から〜が示唆されます」形式で理由付けを強化

- 職業カードの各項目は200〜300文字以内に収める

`;

}
