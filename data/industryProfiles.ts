import type { CLT } from "@/data/verbs";

/**
 * 業種プロファイル
 * 
 * 将来的に、業種 → 職種 → 職業へと段階的に深掘りできる設計
 */
export type IndustryProfile = {
  industry: string;
  description: string;
  requiredRatio: {
    C: number;
    L: number;
    T: number;
  };
  exampleRoles: string[]; // 代表的な職種（3〜5個）
  skills: string[];       // 具体的なスキル
  qualifications: string[]; // 関連資格（任意）
};

/**
 * 主要業種プロファイル
 * 各業種のrequiredRatioは合計100になるように設定
 */
export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    industry: "IT・テクノロジー",
    description: "テクノロジーを活用して新しい価値を創造する業種。論理的思考と主体性が重要。",
    requiredRatio: { C: 25, L: 30, T: 45 },
    exampleRoles: ["エンジニア", "プロダクトマネージャー", "データアナリスト", "プロジェクトマネージャー", "UXデザイナー"],
    skills: ["プログラミング", "システム設計", "データ分析", "プロジェクト管理", "ユーザー理解", "仮説検証"],
    qualifications: ["基本情報技術者", "応用情報技術者", "AWS認定", "G検定", "統計検定"],
  },
  {
    industry: "メーカー・モノづくり",
    description: "モノづくりを通じて社会に価値を提供する業種。品質管理と改善思考が重要。",
    requiredRatio: { C: 30, L: 40, T: 30 },
    exampleRoles: ["生産管理", "品質管理", "開発エンジニア", "営業", "購買"],
    skills: ["品質管理", "生産管理", "改善提案", "チームマネジメント", "コスト管理", "技術理解"],
    qualifications: ["QC検定", "品質管理検定", "技術士", "TOEIC"],
  },
  {
    industry: "コンサルティング",
    description: "企業の課題を分析し、戦略や改善策を提案する業種。論理的思考と提案力が重要。",
    requiredRatio: { C: 35, L: 35, T: 30 },
    exampleRoles: ["コンサルタント", "戦略企画", "経営企画", "業務改善", "PMO"],
    skills: ["課題分析", "戦略立案", "データ分析", "プレゼンテーション", "プロジェクト管理", "ステークホルダー調整"],
    qualifications: ["中小企業診断士", "MBA", "統計検定", "TOEIC"],
  },
  {
    industry: "教育",
    description: "人材育成や知識伝達を通じて社会に貢献する業種。コミュニケーション能力が重要。",
    requiredRatio: { C: 50, L: 30, T: 20 },
    exampleRoles: ["教師", "講師", "教育企画", "教材開発", "学習支援"],
    skills: ["説明力", "学習設計", "コミュニケーション", "カリキュラム作成", "評価設計", "学習者理解"],
    qualifications: ["教員免許", "TOEIC", "日本語教育能力検定", "教育コーチング検定"],
  },
  {
    industry: "医療・ヘルスケア",
    description: "人々の健康を支える業種。専門知識と対人スキルが重要。",
    requiredRatio: { C: 45, L: 25, T: 30 },
    exampleRoles: ["医師", "看護師", "薬剤師", "医療事務", "ヘルスケア企画"],
    skills: ["専門知識", "患者対応", "チーム連携", "記録管理", "医療情報管理", "コミュニケーション"],
    qualifications: ["医師免許", "看護師免許", "薬剤師免許", "医療事務検定", "TOEIC"],
  },
  {
    industry: "小売・サービス",
    description: "商品やサービスを顧客に届ける業種。顧客理解と対人スキルが重要。",
    requiredRatio: { C: 50, L: 30, T: 20 },
    exampleRoles: ["店舗運営", "EC運営", "バイヤー", "商品企画", "サービス企画"],
    skills: ["顧客対応", "在庫管理", "データ分析", "商品企画", "マーチャンダイジング", "サービス設計"],
    qualifications: ["販売士検定", "EC実務士", "TOEIC"],
  },
  {
    industry: "金融",
    description: "資金の流れを管理し、経済活動を支える業種。数字への理解と信頼構築が重要。",
    requiredRatio: { C: 35, L: 30, T: 35 },
    exampleRoles: ["銀行員", "証券アナリスト", "ファイナンシャルプランナー", "経理", "リスク管理"],
    skills: ["財務分析", "リスク管理", "顧客対応", "データ分析", "法規制理解", "提案力"],
    qualifications: ["FP技能士", "証券アナリスト", "日商簿記", "TOEIC", "銀行業務検定"],
  },
  {
    industry: "不動産・建設",
    description: "空間を提供し、生活や事業を支える業種。交渉力と専門知識が重要。",
    requiredRatio: { C: 40, L: 35, T: 25 },
    exampleRoles: ["不動産営業", "建築士", "施工管理", "不動産企画", "プロジェクトマネージャー"],
    skills: ["顧客対応", "交渉力", "法規制理解", "プロジェクト管理", "コスト管理", "技術理解"],
    qualifications: ["宅地建物取引士", "建築士", "施工管理技士", "FP技能士"],
  },
  {
    industry: "流通・物流",
    description: "モノの移動を管理し、サプライチェーンを支える業種。効率化思考と管理能力が重要。",
    requiredRatio: { C: 30, L: 40, T: 30 },
    exampleRoles: ["物流管理", "配送管理", "倉庫管理", "輸送計画", "SCM企画"],
    skills: ["在庫管理", "配送計画", "コスト管理", "システム運用", "改善提案", "チームマネジメント"],
    qualifications: ["物流管理士", "フォークリフト運転技能者", "TOEIC"],
  },
  {
    industry: "公共・行政",
    description: "公共サービスを提供し、社会基盤を支える業種。公平性と調整力が重要。",
    requiredRatio: { C: 40, L: 35, T: 25 },
    exampleRoles: ["公務員", "政策企画", "地域振興", "公共サービス企画", "調整業務"],
    skills: ["法規制理解", "調整力", "文書作成", "データ分析", "ステークホルダー調整", "政策立案"],
    qualifications: ["公務員試験", "行政書士", "社会保険労務士"],
  },
  {
    industry: "メディア・コンテンツ",
    description: "コンテンツを制作・発信し、人々に感動や情報を届ける業種。創造性とコミュニケーションが重要。",
    requiredRatio: { C: 45, L: 25, T: 30 },
    exampleRoles: ["コンテンツ制作", "編集", "プロデューサー", "ディレクター", "マーケティング"],
    skills: ["コンテンツ制作", "企画立案", "編集", "プロジェクト管理", "マーケティング", "クリエイティブ思考"],
    qualifications: ["映像音響処理技術者", "Webデザイナー検定", "TOEIC"],
  },
  {
    industry: "エネルギー",
    description: "社会の基盤となるエネルギーを提供・管理する業種。技術理解と安全管理が重要。",
    requiredRatio: { C: 30, L: 35, T: 35 },
    exampleRoles: ["エンジニア", "プラント管理", "安全管理", "設備管理", "プロジェクトマネージャー"],
    skills: ["技術理解", "安全管理", "設備管理", "プロジェクト管理", "データ分析", "法規制理解"],
    qualifications: ["技術士", "エネルギー管理士", "危険物取扱者", "TOEIC"],
  },
  {
    industry: "インフラ",
    description: "社会の基盤となるインフラを提供・管理する業種。技術理解と安全管理が重要。",
    requiredRatio: { C: 30, L: 35, T: 35 },
    exampleRoles: ["エンジニア", "プロジェクトマネージャー", "設備管理", "安全管理", "インフラ企画"],
    skills: ["技術理解", "安全管理", "設備管理", "プロジェクト管理", "データ分析", "法規制理解"],
    qualifications: ["技術士", "エネルギー管理士", "危険物取扱者", "TOEIC"],
  },
  {
    industry: "スタートアップ・ベンチャー",
    description: "新しい価値を創造し、成長を目指す業種。主体性と柔軟性が重要。",
    requiredRatio: { C: 35, L: 40, T: 25 },
    exampleRoles: ["起業家", "プロダクトマネージャー", "マーケター", "エンジニア", "営業"],
    skills: ["企画立案", "プロジェクト管理", "マーケティング", "データ分析", "コミュニケーション", "柔軟性"],
    qualifications: ["TOEIC", "統計検定", "基本情報技術者"],
  },
];

