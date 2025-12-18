import type { CLT } from "@/data/verbs";

import { JOB_MASTER } from "@/data/jobMaster";

export type JobProfile = {
  job: string;
  industries: string[];
  requiredRatio: Record<CLT, number>; // 0〜100
  description: string;
  skillsCommon: string[];      // 普遍スキル 3-5
  skillsDifferentiator: string[]; // 差別化スキル 3-5
  certifications: string[];    // 資格 0-5
};

// requiredRatio の固定ルール（必ず100）
// primary: 55, secondary: 30, remaining: 15
function ratioFrom(primary: CLT, secondary: CLT): Record<CLT, number> {
  const all: CLT[] = ["C", "L", "T"];
  const remaining = all.find((x) => x !== primary && x !== secondary)!;
  return {
    [primary]: 55,
    [secondary]: 30,
    [remaining]: 15,
  } as Record<CLT, number>;
}

// 既存5件（そのまま）
const EXISTING_PROFILES: JobProfile[] = [
  {
    job: "法人営業",
    industries: ["IT", "人材", "SaaS", "広告"],
    requiredRatio: { C: 55, L: 30, T: 15 },
    description: "顧客の課題を聞き出し、提案し、関係構築を通じて売上をつくる仕事。",
    skillsCommon: ["顧客対応", "コミュニケーション", "提案力", "関係構築"],
    skillsDifferentiator: ["商談管理", "見積作成", "契約交渉", "顧客分析", "競合調査"],
    certifications: ["資格は必須ではありません（あると有利：TOEIC、営業検定）"],
  },
  {
    job: "企画職（事業・サービス企画）",
    industries: ["IT", "メーカー", "教育", "スタートアップ"],
    requiredRatio: { C: 30, L: 25, T: 45 },
    description: "ユーザー課題を理解し、仮説検証をしながら新しいサービスを形にする仕事。",
    skillsCommon: ["ユーザー理解", "問題解決", "コミュニケーション", "論理的思考"],
    skillsDifferentiator: ["企画立案", "仮説検証", "プロトタイピング", "データ分析", "ステークホルダー調整"],
    certifications: ["資格は必須ではありません（あると有利：統計検定、UX検定）"],
  },
  {
    job: "プロジェクトマネージャー",
    industries: ["IT", "コンサル", "制作"],
    requiredRatio: { C: 35, L: 45, T: 20 },
    description: "関係者をまとめ、意思決定とスケジュール管理をしながらプロジェクトを進める仕事。",
    skillsCommon: ["チームマネジメント", "調整力", "報連相", "問題解決"],
    skillsDifferentiator: ["プロジェクト計画", "スケジュール管理", "リスク管理", "ステークホルダー管理", "品質管理"],
    certifications: ["PMP（有利）", "プロジェクトマネージャー試験（有利）", "ITコーディネータ（有利）"],
  },
  {
    job: "データアナリスト",
    industries: ["IT", "金融", "マーケティング"],
    requiredRatio: { C: 15, L: 10, T: 75 },
    description: "データをもとに傾向や課題を見つけ、意思決定に役立つ示唆を出す仕事。",
    skillsCommon: ["データ分析", "論理的思考", "問題解決", "報告力"],
    skillsDifferentiator: ["SQL操作", "統計分析", "可視化", "機械学習基礎", "ビジネス理解"],
    certifications: ["統計検定（有利）", "データサイエンティスト検定（有利）", "G検定（有利）"],
  },
  {
    job: "マーケター",
    industries: ["広告", "D2C", "IT", "メーカー"],
    requiredRatio: { C: 35, L: 25, T: 40 },
    description: "顧客理解と数字をもとに、商品やサービスが選ばれる仕組みをつくる仕事。",
    skillsCommon: ["顧客理解", "データ分析", "コミュニケーション", "企画力"],
    skillsDifferentiator: ["マーケティング戦略", "広告運用", "コンテンツ制作", "KPI管理", "A/Bテスト"],
    certifications: ["Google広告認定資格（有利）", "Facebook広告認定（有利）", "マーケティング検定（有利）"],
  },
];

// カテゴリ別テンプレート関数（スキル/資格の自動補完）
function getSkillsByCategory(job: string, industries: string[]): {
  skillsCommon: string[];
  skillsDifferentiator: string[];
  certifications: string[];
} {
  const jobLower = job.toLowerCase();
  const industriesLower = industries.map((i) => i.toLowerCase());

  // 小売/飲食/サービス系
  if (
    industriesLower.some((i) => ["小売", "飲食", "サービス", "アパレル"].includes(i)) ||
    jobLower.includes("店") ||
    jobLower.includes("販売") ||
    jobLower.includes("接客")
  ) {
    return {
      skillsCommon: ["接客コミュニケーション", "問題解決", "チーム連携", "報連相"],
      skillsDifferentiator: ["売上管理", "在庫管理", "シフト管理", "クレーム対応", "商品知識"],
      certifications: ["食品衛生責任者（業態による）", "販売士（有利）"],
    };
  }

  // 医療/介護系
  if (
    industriesLower.some((i) => ["医療", "介護", "福祉", "病院", "クリニック"].includes(i)) ||
    jobLower.includes("看護") ||
    jobLower.includes("介護") ||
    jobLower.includes("医療")
  ) {
    return {
      skillsCommon: ["患者・利用者対応", "チーム連携", "観察力", "安全意識"],
      skillsDifferentiator: ["記録・報告", "安全・衛生管理", "医療機器操作", "応急処置", "家族対応"],
      certifications: ["資格は必須ではありません（業種により国家資格が必要な場合あり）"],
    };
  }

  // 建設系
  if (
    industriesLower.some((i) => ["建設", "土木", "建築", "工務店"].includes(i)) ||
    jobLower.includes("施工") ||
    jobLower.includes("建設") ||
    jobLower.includes("建築")
  ) {
    return {
      skillsCommon: ["安全管理", "工程管理", "調整力", "報連相"],
      skillsDifferentiator: ["図面読解", "工程計画", "品質管理", "コスト管理", "現場監督"],
      certifications: ["施工管理技士（有利）", "建築士（有利）", "安全管理者（有利）"],
    };
  }

  // IT系
  if (
    industriesLower.some((i) => ["IT", "SaaS", "スタートアップ", "ゲーム"].includes(i)) ||
    jobLower.includes("エンジニア") ||
    jobLower.includes("プログラマ") ||
    jobLower.includes("開発")
  ) {
    return {
      skillsCommon: ["プログラミング", "問題解決", "学習意欲", "コミュニケーション"],
      skillsDifferentiator: ["要件定義", "設計", "テスト", "デバッグ", "コードレビュー"],
      certifications: ["基本情報技術者（有利）", "応用情報技術者（有利）"],
    };
  }

  // 公務系
  if (
    industriesLower.some((i) => ["官公庁", "地方自治体", "国家公務員", "公共"].includes(i)) ||
    jobLower.includes("公務員") ||
    jobLower.includes("行政")
  ) {
    return {
      skillsCommon: ["文書作成", "調整力", "法令理解", "報連相"],
      skillsDifferentiator: ["行政手続き", "予算管理", "政策企画", "広報・広聴", "危機管理"],
      certifications: ["公務員試験合格（必須）", "行政書士（有利）"],
    };
  }

  // 教育系
  if (
    industriesLower.some((i) => ["教育", "学校", "学習塾"].includes(i)) ||
    jobLower.includes("教師") ||
    jobLower.includes("講師") ||
    jobLower.includes("教育")
  ) {
    return {
      skillsCommon: ["生徒対応", "説明力", "コミュニケーション", "問題解決"],
      skillsDifferentiator: ["授業設計", "学習指導", "進路相談", "保護者対応", "教材作成"],
      certifications: ["教員免許（有利）", "各種検定（有利）"],
    };
  }

  // 物流系
  if (
    industriesLower.some((i) => ["物流", "運輸", "配送", "EC"].includes(i)) ||
    jobLower.includes("物流") ||
    jobLower.includes("配送") ||
    jobLower.includes("ドライバー")
  ) {
    return {
      skillsCommon: ["安全管理", "計画立案", "調整力", "問題解決"],
      skillsDifferentiator: ["物流ネットワーク設計", "配送ルート最適化", "在庫管理", "コスト削減", "システム理解"],
      certifications: ["大型免許（有利）", "フォークリフト運転技能（有利）"],
    };
  }

  // デザイン/クリエイティブ系
  if (
    industriesLower.some((i) => ["広告", "メディア", "出版", "ゲーム"].includes(i)) ||
    jobLower.includes("デザイナー") ||
    jobLower.includes("クリエイティブ") ||
    jobLower.includes("編集")
  ) {
    return {
      skillsCommon: ["デザイン思考", "ユーザー理解", "コミュニケーション", "問題解決"],
      skillsDifferentiator: ["デザインツール操作", "レイアウト設計", "色彩・タイポグラフィ", "プロトタイピング", "トレンド把握"],
      certifications: ["資格は必須ではありません（あると有利：Adobe認定、色彩検定）"],
    };
  }

  // デフォルト（事務/管理系）
  return {
    skillsCommon: ["コミュニケーション", "調整力", "報連相", "問題解決"],
    skillsDifferentiator: ["文書作成", "データ管理", "スケジュール管理", "会議運営", "情報整理"],
    certifications: ["資格は必須ではありません（業種により有利な資格あり）"],
  };
}

// JOB_MASTER から自動生成
const GENERATED_PROFILES: JobProfile[] = JOB_MASTER.map((m) => {
  // 既にスキル/資格データがある場合はそれを使用、ない場合はテンプレートから補完
  const template = getSkillsByCategory(m.job, m.industries);
  return {
    job: m.job,
    industries: m.industries,
    requiredRatio: ratioFrom(m.primary, m.secondary),
    description: m.description,
    skillsCommon: m.skillsCommon ?? template.skillsCommon,
    skillsDifferentiator: m.skillsDifferentiator ?? template.skillsDifferentiator,
    certifications: m.certifications ?? template.certifications,
  };
});

// 既存5件 + 自動生成を結合
export const JOB_PROFILES: JobProfile[] = [
  ...EXISTING_PROFILES,
  ...GENERATED_PROFILES,
];

// 開発時のみ重複チェック
if (process.env.NODE_ENV !== "production") {
  const names = JOB_PROFILES.map((j) => j.job);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) {
    console.warn("Duplicate job names:", [...new Set(dup)]);
  }
}
