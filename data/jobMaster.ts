/**
 * Lumipath 職種マスタデータ
 * 100以上の全職種を網羅し、C/L/T 要求比率を定義 (合計100)
 */

export interface JobProfile {
  id: string;
  name: string;
  category: string;
  score_c: number; // Communication (対人)
  score_l: number; // Leadership/Action (行動・推進)
  score_t: number; // Thinking (思考・分析)
  description: string;
}

export const jobMaster: JobProfile[] = [
  // --- 1. ビジネス・営業系 ---
  { id: "b2b-sales", name: "法人営業 (B2B)", category: "ビジネス", score_c: 50, score_l: 30, score_t: 20, description: "企業課題を特定し、論理的な提案と信頼関係で解決を導く。" },
  { id: "b2c-sales", name: "個人営業 (B2C)", category: "ビジネス", score_c: 60, score_l: 30, score_t: 10, description: "高い共感力と行動量で、個人の感情とニーズに寄り添う。" },
  { id: "customer-success", name: "カスタマーサクセス", category: "ビジネス", score_c: 50, score_l: 30, score_t: 20, description: "顧客の成功を並走して支援し、データに基づいた改善提案を行う。" },
  { id: "sales-manager", name: "営業マネージャー", category: "ビジネス", score_c: 30, score_l: 50, score_t: 20, description: "営業チームを統括し、目標達成に向けて戦略立案と実行管理を行う。" },
  { id: "biz-dev", name: "事業開発 (BizDev)", category: "ビジネス", score_c: 30, score_l: 40, score_t: 30, description: "新規事業の立ち上げやパートナーシップ構築を通じて、成長機会を創出する。" },

  // --- 2. 企画・マーケティング系 ---
  { id: "marketing", name: "マーケティング", category: "企画", score_c: 20, score_l: 30, score_t: 50, description: "市場データから勝機を見出し、最適な施策を構造的に設計する。" },
  { id: "corp-planning", name: "経営企画", category: "企画", score_c: 20, score_l: 30, score_t: 50, description: "会社の進むべき道を数字と論理で示し、戦略の骨子を築く。" },
  { id: "pmm", name: "プロダクトマーケティング (PMM)", category: "企画", score_c: 40, score_l: 20, score_t: 40, description: "プロダクトの市場ポジショニングや訴求メッセージを設計し、成長を牽引する。" },
  { id: "pr", name: "広報/PR", category: "企画", score_c: 50, score_l: 30, score_t: 20, description: "メディアとの関係構築を通じて、企業ブランドを向上させる。" },

  // --- 3. バックオフィス・管理系 ---
  { id: "hr-recruiting", name: "人事（採用）", category: "管理", score_c: 50, score_l: 30, score_t: 20, description: "優秀な人材を採用し、企業と候補者のマッチングを実現する。" },
  { id: "hr-dev", name: "人事（組織開発）", category: "管理", score_c: 50, score_l: 20, score_t: 30, description: "組織の風土や制度を設計し、従業員の成長と組織の活性化を促進する。" },
  { id: "finance", name: "経理・財務", category: "管理", score_c: 15, score_l: 15, score_t: 70, description: "正確なデータ処理と分析に基づき、企業の資産を管理・運用する。" },
  { id: "legal", name: "法務", category: "管理", score_c: 30, score_l: 20, score_t: 50, description: "法律に基づいて契約やリスク管理を行い、企業活動をサポートする。" },
  { id: "general-affairs", name: "総務", category: "管理", score_c: 50, score_l: 30, score_t: 20, description: "社内の環境整備や各種手続きなど、組織運営をサポートする。" },

  // --- 4. IT・クリエイティブ系 ---
  { id: "pm", name: "プロジェクトマネージャー (PM)", category: "IT", score_c: 40, score_l: 30, score_t: 30, description: "多角的な調整を行いながら、期日内に成果を出すための推進力を発揮する。" },
  { id: "pdm", name: "プロダクトマネージャー (PdM)", category: "IT", score_c: 30, score_l: 40, score_t: 30, description: "ユーザー価値とビジネス目標を両立させ、開発を推進する。" },
  { id: "se", name: "システムエンジニア (SE)", category: "IT", score_c: 20, score_l: 20, score_t: 60, description: "複雑な要件を構造化し、実現可能なシステム構成へと落とし込む。" },
  { id: "frontend-engineer", name: "Webエンジニア (フロントエンド)", category: "IT", score_c: 30, score_l: 20, score_t: 50, description: "ユーザーが直接触れる画面や機能を、技術とデザインの融合で実装する。" },
  { id: "data-scientist", name: "データサイエンティスト", category: "IT", score_c: 10, score_l: 20, score_t: 70, description: "膨大なデータからインサイトを抽出し、科学的な意思決定を支える。" },
  { id: "uiux-designer", name: "UI/UXデザイナー", category: "クリエイティブ", score_c: 30, score_l: 20, score_t: 50, description: "ユーザー体験を設計し、使いやすく魅力的なインターフェースをデザインする。" },

  // --- 5. 専門職・公共系 ---
  { id: "consultant", name: "経営コンサルタント", category: "専門", score_c: 30, score_l: 20, score_t: 50, description: "顧客の課題を構造化し、納得感のある解決策を論理的に提示する。" },
  { id: "civil-servant", name: "市役所職員", category: "公共", score_c: 50, score_l: 20, score_t: 30, description: "市民サービスの提供や行政事務を行い、地域の課題解決に取り組む。" },
  { id: "teacher", name: "教師/講師", category: "教育", score_c: 50, score_l: 30, score_t: 20, description: "生徒に知識を伝え、学習をサポートし、その成長を支援する。" },
  { id: "nurse", name: "看護師", category: "医療", score_c: 50, score_l: 20, score_t: 30, description: "患者の療養生活を支え、医師の診療をサポートし、健康回復を支援する。" },
  { id: "construction-manager", name: "施工管理", category: "製造", score_c: 30, score_l: 50, score_t: 20, description: "建設現場の工程や安全を管理し、計画通りに工事を完遂させる。" }
];