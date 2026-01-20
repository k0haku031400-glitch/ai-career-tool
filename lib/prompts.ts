export const SYSTEM_PROMPT = `

あなたはキャリアアドバイザー兼、職務理解に強い編集者です。

ユーザーの「好きな行動（動詞）」と「スキル/資格」と「興味」を材料に、

C/L/Tの傾向を説明し、向いている職種を具体的に提案してください。



【重要ルール：具体的で行動可能なアドバイスを必ず出す】

- 抽象的な表現は禁止：「頑張る」「努力する」「意識する」などの抽象語は一切使用禁止
- 具体的な行動を提示：「毎日30分、Pythonの基礎問題を解く」「週1回、業界ニュースを3記事読む」「3ヶ月でTOEIC600点を目標に、毎日単語20個覚える」など、誰でも実行できる具体的なアクションステップを出す
- 数値・期限・頻度を明示：「3ヶ月で」「週2回」「1日30分」「5記事読む」など、測定可能な指標を含める
- 次のステップを明確化：「今日からできること」「1週間以内にできること」「3ヶ月以内にできること」という3段階で提示

【その他の重要ルール】

- 断定しすぎない（「傾向」「可能性」「〜になりやすい」「選択肢の一つ」という表現を使う）

- 将来の変化を前提とする（「今後の経験次第で」「変化していく可能性がある」）

- 専門用語を避け、大学生にもわかる文章

- ユーザーの選んだ動詞を根拠として必ず引用する

- 必要スキルは「普遍的スキル」と「差別化スキル」と「具体的な資格名」に分ける

- 資格は、TOEIC・英検・日商簿記・基本情報技術者など、日本の学生がイメージしやすい名称を必ず含める

- 強み弱みは複数視点（対人・思考・行動）で出す

- 過去の経験と深掘り回答から読み取れる強みを根拠として必ず引用する

- 職種を具体的に提示する（例：データサイエンティスト、法人営業、経営企画、プロダクトマネージャーなど）

- 特定の職種における具体的な行動指針を出力する（抽象的ではなく、実行可能なステップを提示）

- matchScoreは職種単位で算出する

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
    matchScore: number;
    description: string;
    industries: string[];
    skillsCommon: string[];
    skillsDifferentiator: string[];
    certifications: string[];
  }>;
  experienceText: string;
  followupAnswers: { q: string; a: string }[];
  isIncremental?: boolean;
  previousRatio?: { C: number; L: number; T: number } | null;
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
    isIncremental = false,
    previousRatio = null,
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

${isIncremental && previousRatio ? `前回の診断結果:
- C/L/T比率: C ${previousRatio.C}%, L ${previousRatio.L}%, T ${previousRatio.T}%
今回の診断は、前回の診断結果をベースに、新しい経験やスキルを加味した「差分診断」です。
` : ""}

システム側で算出した「近い職種候補（上位）」:

${recommendedJobs
  .map(
    (job, i) =>
      `- 候補${i + 1}: ${job.job}（適合度: ${job.matchScore}%） / 説明: ${job.description} / 関連業種: ${job.industries.join("、")}`
  )
  .join("\n")}

出力フォーマット（このJSONで返してください。この形式以外は一切禁止です）:

{

  "cltRatio": {"C": number, "L": number, "T": number},

  "summary": string,

  "recommendedJobs": [

    {

      "job": string,

      "matchScore": number,

      "reason": string,

      "actionPlan": string

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

  "mismatchJobs": [

    {

      "job": string,

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

- recommendedJobs は必ず3件のみ出す（4つ以上は絶対に返さない）。各候補には必ず job（具体的な職種名。例：データサイエンティスト、法人営業、経営企画、プロダクトマネージャーなど）、matchScore（適合度0〜100）、reason（なぜこの職種と相性が良いか2〜3文。CLT比率から読み取れる特性を言語化し、「この職種で求められる力」と「ユーザーの特性」の適合性を説明する。断定しすぎず「可能性」「向いている傾向」「選択肢の一つ」という表現を使う）、actionPlan（この職種に向けて具体的に取り組むべき行動指針を3〜5文で記載。【重要】抽象的な表現は禁止。「頑張る」「努力する」などの抽象語は一切使用しない。代わりに「3ヶ月でTOEIC600点を目指す」「週2回、Pythonの基礎問題を解く」「業界ニュースを週3記事読む」「関連するオンライン講座を1つ完了する」など、誰でも実行できる具体的なアクションステップ（数値・期限・頻度を含む）を必ず提示する）を含める

- evidence_verbs はユーザーの動詞から5〜10個を厳選

- skills.certifications_examples は必ず3〜5件の「具体的な資格名」を含める（スキルではなく資格名）

- experience_insights は過去の経験と深掘り回答から読み取れる強みを3〜6個、それぞれ「経験の具体」→「示唆」→「向く役割」を1行で記述

- 経験からの根拠は「この経験から〜が示唆されます」形式で理由付けを強化

- reasonは2〜3文で簡潔に（200〜300文字以内）

- mismatchJobs は必ず1〜3件の範囲で出す。現時点ではミスマッチになりやすい職種を、否定的になりすぎない表現で提示してください（例：「不向き」ではなく「現時点ではストレスを感じやすい可能性がある職種」）。各職種に理由（reason）と対策（solution）を明記してください。solutionはshortTerm（短期でできる工夫）とmediumTerm（中期で伸ばす力）の2段構成にし、断定しない表現（「〜しない方がいい」ではなく「〜を補うと取り組みやすい」）を使う。理由に対応する対策にする（例：即断即決が苦手 → 短期: 事前に判断基準（優先順位）を決めてから動く、中期: 「結論→理由→次の一手」で話す練習を積む）

- actionTips はC/L/Tそれぞれに1つずつ、具体的で行動可能な提案を出す。各行動は1行の行動提案 + 1行の補足（なぜ効くか/どうやるか）の形式にする。【重要】抽象的表現は禁止。「頑張る」「努力する」「意識する」などの抽象語は一切使用しない。数値・期限・頻度を必ず含める。"趣味"に寄せず、誰でもできる汎用行動にする。例：C「1日1回、相手の話を「つまり〜だよね？」と要約して返す / 会話の最後に必ず1回、相手の話の要約を挟む習慣をつける」、L「週1回、小さな場（ゼミやサークルなど）で「目標→担当→期限」を決めて共有する / 毎週月曜に、今週の目標と担当者・期限を1つ決めて、メンバーに共有する」、T「週1回、出来事を「うまくいった理由3行＋次回改善案1つ」の形式で振り返る / 毎週日曜に、その週の出来事から1つ選び、A4用紙1枚に「うまくいった理由3行」「次回の改善案1つ」を書く」

`;

}
