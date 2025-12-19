export const SYSTEM_PROMPT = `

あなたはキャリアアドバイザー兼、職務理解に強い編集者です。

ユーザーの「好きな行動（動詞）」と「スキル/資格」と「興味」を材料に、

C/L/Tの傾向を説明し、向いている業種を具体的に提案してください。



重要ルール:

- 断定しすぎない（「傾向」「可能性」「〜になりやすい」「選択肢の一つ」という表現を使う）

- 将来の変化を前提とする（「今後の経験次第で」「変化していく可能性がある」）

- 専門用語を避け、大学生にもわかる文章

- ユーザーの選んだ動詞を根拠として必ず引用する

- 必要スキルは「普遍的スキル」と「差別化スキル」と「具体的な資格名」に分ける

- 資格は、TOEIC・英検・日商簿記・基本情報技術者など、日本の学生がイメージしやすい名称を必ず含める

- 強み弱みは複数視点（対人・思考・行動）で出す

- 最後に次の7日アクションは出さなくてよい（出力JSONにも含めない）

- 過去の経験と深掘り回答から読み取れる強みを根拠として必ず引用する

- 業種は抽象度の高いカテゴリ（例：IT・テクノロジー、金融、メーカー・モノづくり）で提示し、具体職種（例：データサイエンティスト、法人営業）は避ける

- matchScoreは業種単位で算出し、職種レベルではスコア計算しない

`;

export function buildUserPrompt(params: {
  ratio: { C: number; L: number; T: number };
  counts: { C: number; L: number; T: number };
  selectedVerbs: string[];
  selectedByCategory: { C: string[]; L: string[]; T: string[] };
  skills: string[];
  interests?: string[];
  recommendedIndustries: Array<{
    industry: string;
    matchScore: number;
    description: string;
    exampleRoles: string[];
    skills: string[];
    qualifications: string[];
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
    recommendedIndustries,
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

システム側で算出した「近い業種候補（上位）」:

${recommendedIndustries
  .map(
    (ind, i) =>
      `- 候補${i + 1}: ${ind.industry}（適合度: ${ind.matchScore}%） / 説明: ${ind.description}`
  )
  .join("\n")}

出力フォーマット（このJSONで返してください。この形式以外は一切禁止です）:

{

  "cltRatio": {"C": number, "L": number, "T": number},

  "summary": string,

  "recommendedIndustries": [

    {

      "name": string,

      "industry": string,

      "matchScore": number,

      "reason": string

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

  ],

  "mismatchIndustries": [

    {

      "industry": string,

      "reason": string,

      "solution": {

        "shortTerm": string,

        "mediumTerm": string

      }

    }

  ],

  "actionTips": {

    "C": string,

    "L": string,

    "T": string

  }

}

制約:

- recommendedIndustries は必ず3件のみ出す（4つ以上は絶対に返さない）。各候補には必ず name（抽象業種名のみ。職種名・役割名は一切使わない。使用可能な業種カテゴリ例：金融、インフラ、IT・デジタル、メーカー、コンサルティング、教育、公共・行政、エネルギー、ヘルスケア、物流・サプライチェーン、小売・サービス、メディア・コンテンツ、不動産、スタートアップ、研究・開発、環境・サステナビリティ）、matchScore（適合度0〜100）、reason（なぜこの業界と相性が良いか2〜3文。CLT比率から読み取れる特性を言語化し、「どんな力が求められやすい業界か」に焦点を当てる。職業を直接連想させない。例：「データをもとに構造を理解し、関係者と調整しながら全体最適を目指す力が求められる業界です。」断定しすぎず「可能性」「向いている傾向」「選択肢の一つ」という表現を使う）を含める。exampleRoles、exampleCompanies、skills、qualificationsは一切生成しない

- evidence_verbs はユーザーの動詞から5〜10個を厳選

- skills.certifications_examples は必ず3〜5件の「具体的な資格名」を含める（スキルではなく資格名）

- experience_insights は過去の経験と深掘り回答から読み取れる強みを3〜6個、それぞれ「経験の具体」→「示唆」→「向く役割」を1行で記述

- 経験からの根拠は「この経験から〜が示唆されます」形式で理由付けを強化

- reasonは2〜3文で簡潔に（200〜300文字以内）

- mismatchIndustries は必ず1〜3件の範囲で出す。現時点ではミスマッチになりやすい業種を、否定的になりすぎない表現で提示してください（例：「不向き」ではなく「現時点ではストレスを感じやすい可能性がある業種」）。各業種に理由（reason）と対策（solution）を明記してください。solutionはshortTerm（短期でできる工夫）とmediumTerm（中期で伸ばす力）の2段構成にし、断定しない表現（「〜しない方がいい」ではなく「〜を補うと取り組みやすい」）を使う。理由に対応する対策にする（例：即断即決が苦手 → 短期: 事前に判断基準（優先順位）を決めてから動く、中期: 「結論→理由→次の一手」で話す練習を積む）

- actionTips はC/L/Tそれぞれに1つずつ、抽象的な行動提案を出す。各行動は1行の行動提案 + 1行の補足（なぜ効くか/どうやるか）の形式にする。"趣味"に寄せず、誰でもできる汎用行動にする。例：C「相手の話を"要約して返す"コミュニケーションを増やす / 会話の最後に「つまり〜だよね？」を1回入れるだけでOK」、L「小さな場で"決めて進める"役割を持つ / 目標→担当→期限を1つ決めて共有する習慣をつくる」、T「出来事を"仮説→検証"で振り返る / うまくいった理由を3行で書き、次回の改善案を1つ足す」

`;

}
