export type CLT = "C" | "L" | "T";

export type VerbItem = {
  id: string;        // ユニーク（slug）
  label: string;     // 表示名（具体）
  group: CLT;
  category: string;  // 例: "人と関わる行動"
  subcategory: string; // 例: "関係構築"
};

export const VERBS: VerbItem[] = [
  // 人と関わる行動（C）
  // 関係構築
  { id: "talk-to-people", label: "初対面の人と会話を始める", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "listen-to-people", label: "相手の話を最後まで聞いて理解する", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "share-feelings", label: "相手と気持ちを共有して共感する", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "think-from-others", label: "相手の立場に立って物事を考える", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "encourage-people", label: "落ち込んでいる人を励まして元気づける", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "make-friends", label: "初対面の人と自然に仲良くなる", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "build-trust", label: "時間をかけて人と信頼関係を築く", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "support-people", label: "困っている人を支えて助ける", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "cheer-people", label: "頑張っている人を応援して声をかける", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "express-gratitude", label: "感謝の気持ちを言葉で伝える", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "introduce-people", label: "知り合い同士を紹介してつなげる", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "team-chat", label: "チームメンバーと雑談して親睦を深める", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  { id: "read-atmosphere", label: "場の空気を読んで適切に振る舞う", group: "C", category: "人と関わる行動", subcategory: "関係構築" },
  
  // 発信・説得
  { id: "explain-to-others", label: "複雑な内容を分かりやすく説明する", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "convince-others", label: "相手を納得させて行動を促す", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "share-opinion", label: "自分の考えを明確に伝える", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "share-ideas", label: "アイデアを共有して意見交換する", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "give-feedback", label: "相手に建設的なフィードバックを伝える", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "correct-gently", label: "間違いをやさしく指摘して改善を促す", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "praise-encourage", label: "相手をほめて励まし、やる気を引き出す", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  { id: "follow-up", label: "後日フォロー連絡をして関係を維持する", group: "C", category: "人と関わる行動", subcategory: "発信・説得" },
  
  // 支援・育成
  { id: "consult-support", label: "友人の悩みを整理して助言する", group: "C", category: "人と関わる行動", subcategory: "支援・育成" },
  { id: "draw-opinions", label: "相手の意見を引き出して聞き出す", group: "C", category: "人と関わる行動", subcategory: "支援・育成" },
  { id: "cooperate", label: "チームメンバーと協力して目標を達成する", group: "C", category: "人と関わる行動", subcategory: "支援・育成" },
  { id: "decide-roles", label: "チーム内で役割分担を決めて調整する", group: "C", category: "人と関わる行動", subcategory: "支援・育成" },
  
  // 場づくり
  { id: "improve-atmosphere", label: "場の雰囲気をよくして楽しくする", group: "C", category: "人と関わる行動", subcategory: "場づくり" },
  { id: "enliven-conversation", label: "会話を盛り上げて場を活性化する", group: "C", category: "人と関わる行動", subcategory: "場づくり" },
  { id: "create-discussion", label: "話し合いの場を作って議論を促進する", group: "C", category: "人と関わる行動", subcategory: "場づくり" },
  { id: "casual-greeting", label: "挨拶しながら歩いて自然に会話する", group: "C", category: "人と関わる行動", subcategory: "場づくり" },
  
  // 行動・挑戦（L）
  // 意思決定・責任
  { id: "make-decisions", label: "期限付きの目標を決めて宣言する", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "decide-things", label: "複数の選択肢から最適な判断をする", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "take-responsibility", label: "自分の行動に責任を持って実行する", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "set-priorities", label: "優先順位を決めて効率的に進める", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "set-goals", label: "具体的な目標を設定して計画を立てる", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "choose-path", label: "自分で道を選んで進む", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "make-decision", label: "迷った時に決断して前に進む", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  { id: "stand-firm", label: "自分の意見を通して実現する", group: "L", category: "行動・挑戦に関すること", subcategory: "意思決定・責任" },
  
  // 実行・継続
  { id: "take-action", label: "考えたことをすぐに行動に移す", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "complete-task", label: "最後までやり切って結果を出す", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "keep-deadline", label: "期限を守って確実に完了する", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "create-habits", label: "習慣をつくって毎日継続する", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "run-routine", label: "毎日ルーティンを実行して積み上げる", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "continue-exercise", label: "ランニング・筋トレなど続けて習慣化する", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "manage-schedule", label: "スケジュール管理して計画的に進める", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "organize-tasks", label: "タスクを整理して効率的に処理する", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  { id: "reflect-first", label: "率先して反省して次に活かす", group: "L", category: "行動・挑戦に関すること", subcategory: "実行・継続" },
  
  // 巻き込み・リード
  { id: "lead-front", label: "先頭に立ってチームを引っ張る", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "pull-others", label: "周りを引っ張って目標に向かう", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "team-lead", label: "チームを引っ張って成果を出す", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "unite-team", label: "チームをまとめて結束を高める", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "involve-others", label: "周囲を巻き込んで協力を得る", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "involve-friends", label: "仲間を巻き込んで一緒に取り組む", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "show-direction", label: "方向性を示してチームを導く", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "influence-people", label: "人に影響を与えて行動を変える", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  { id: "manage-project", label: "プロジェクトを管理して成功に導く", group: "L", category: "行動・挑戦に関すること", subcategory: "巻き込み・リード" },
  
  // 挑戦・変化
  { id: "challenge-new", label: "新しいことに挑戦して経験を広げる", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "challenge-unknown", label: "未経験に挑戦してスキルを獲得する", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "face-difficulty", label: "困難に立ち向かって突破する", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "create-change", label: "変化を起こして状況を改善する", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "jump-new-env", label: "新しい環境に飛び込んで適応する", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "act-first", label: "誰より先に動いて主導権を握る", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "move-actively", label: "主体的に動いて状況を作る", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "try-small", label: "小さく試してから本格的に取り組む", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "find-problems", label: "問題を発見して改善のきっかけを作る", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  { id: "create-solutions", label: "解決策をつくって実行する", group: "L", category: "行動・挑戦に関すること", subcategory: "挑戦・変化" },
  
  // 考える・整理すること（T）
  // 分析・原因究明
  { id: "analyze-data", label: "データから原因を特定する", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "find-root-cause", label: "問題の真因を考える", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "search-cause", label: "問題の原因を探して特定する", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "view-data", label: "データを見て傾向を読み取る", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "compare-things", label: "複数の選択肢を比較して評価する", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "organize-advantages", label: "優劣を整理して判断材料にする", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "find-improvements", label: "改善点を見つけて提案する", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "dig-deep", label: "深く掘り下げて本質を理解する", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  { id: "think-essence", label: "本質を考える", group: "T", category: "考える・整理すること", subcategory: "分析・原因究明" },
  
  // 構造化・要約
  { id: "organize-info", label: "情報を整理して見やすくまとめる", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "structure-things", label: "物事を構造化して理解しやすくする", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "organize-diagram", label: "図に整理して視覚的に表現する", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "decompose-structure", label: "構造を分解して要素を明確にする", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "organize-memo", label: "メモを体系化して知識を整理する", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "organize-documents", label: "書類を整理して管理しやすくする", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "summarize-article", label: "文章を要約して要点を抽出する", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "summarize-reflection", label: "振り返りを文章化して記録する", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  { id: "abstract-things", label: "物事を抽象化してパターンを見出す", group: "T", category: "考える・整理すること", subcategory: "構造化・要約" },
  
  // 計画・優先順位
  { id: "make-plan", label: "計画を立てて実行ステップを明確にする", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  { id: "create-procedure", label: "手順を作って効率的に進める", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  { id: "think-efficiency", label: "効率の良い方法を考える", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  { id: "grasp-whole", label: "全体像を把握して優先順位を決める", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  { id: "create-rules", label: "ルールを作って運用を標準化する", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  { id: "design-system", label: "仕組みを設計して自動化する", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  { id: "think-mechanism", label: "仕組みを考える", group: "T", category: "考える・整理すること", subcategory: "計画・優先順位" },
  
  // 仮説・検証
  { id: "make-hypothesis", label: "仮説を立てて検証方法を考える", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "build-logic", label: "ロジックを組み立てて論理的に説明する", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "think-strategy", label: "戦略を考える", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "predict-future", label: "将来を予測して準備する", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "simulate", label: "シミュレーションして結果を予測する", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "think-carefully", label: "じっくり考える", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "create-materials", label: "資料を作って情報を整理する", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
  { id: "summarize-research", label: "調べた情報をまとめて活用する", group: "T", category: "考える・整理すること", subcategory: "仮説・検証" },
];

// カテゴリとサブカテゴリの定義（表示用）
export const CATEGORY_INFO: Record<string, { description: string }> = {
  "人と関わる行動": {
    description: "会話・共感・支援など、対人コミュニケーションの傾向",
  },
  "行動・挑戦に関すること": {
    description: "決断・実行・リードなど、行動力と推進力の傾向",
  },
  "考える・整理すること": {
    description: "分析・構造化・計画など、思考力と整理力の傾向",
  },
};

// 後方互換性のため（既存コード用）
export const VERB_GROUPS = [
  {
    title: "人と関わる行動",
    items: VERBS.filter((v) => v.category === "人と関わる行動").map((v) => v.label),
  },
  {
    title: "行動・挑戦に関すること",
    items: VERBS.filter((v) => v.category === "行動・挑戦に関すること").map((v) => v.label),
  },
  {
    title: "考える・整理すること",
    items: VERBS.filter((v) => v.category === "考える・整理すること").map((v) => v.label),
  },
];
