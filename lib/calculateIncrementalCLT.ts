import { calculateCLT, type CLTScore } from "@/lib/calculateCLT";

type CLTRatio = { C: number; L: number; T: number };

/**
 * 経験テキストから特定の職種キーワードを検出し、C/L/Tにボーナスを付与
 * 各職種キーワードが含まれる場合、対応するC/L/Tに最大+5のボーナス
 */
export function calculateExperienceBonus(
  experienceText: string
): { C: number; L: number; T: number } {
  const bonus = { C: 0, L: 0, T: 0 };
  const text = experienceText.toLowerCase();

  // C（Communication）関連キーワード
  const cKeywords = [
    "営業", "接客", "カスタマー", "サポート", "相談", "面談",
    "チーム", "協力", "連携", "調整", "会議", "プレゼン", "説明",
    "教育", "指導", "講師", "トレーナー", "コーチ", "メンター"
  ];
  
  // L（Leadership）関連キーワード
  const lKeywords = [
    "リーダー", "マネージャー", "管理", "統括", "責任", "主導",
    "企画", "プロジェクト", "推進", "実行", "決断", "目標",
    "計画", "戦略", "改善", "改革", "挑戦", "起業"
  ];
  
  // T（Thinking）関連キーワード
  const tKeywords = [
    "分析", "データ", "調査", "研究", "開発", "設計", "プログラミング",
    "エンジニア", "システム", "技術", "統計", "論理", "思考",
    "企画", "立案", "検証", "評価", "最適化", "効率化"
  ];

  // キーワードマッチング（最大+5まで）
  const cMatches = cKeywords.filter(kw => text.includes(kw.toLowerCase())).length;
  const lMatches = lKeywords.filter(kw => text.includes(kw.toLowerCase())).length;
  const tMatches = tKeywords.filter(kw => text.includes(kw.toLowerCase())).length;

  bonus.C = Math.min(5, cMatches);
  bonus.L = Math.min(5, lMatches);
  bonus.T = Math.min(5, tMatches);

  return bonus;
}

/**
 * 2回目以降の「上乗せ診断」を実行
 * 
 * @param previousScore 前回のC/L/Tスコア（0-100）
 * @param currentInputVerbs 今回選択された動詞の配列
 * @param experienceText 経験テキスト（任意）
 * @returns 最終的なC/L/TスコアとCLTScoreオブジェクト
 */
export function calculateIncrementalCLT(
  previousScore: CLTRatio,
  currentInputVerbs: string[],
  experienceText: string = ""
): {
  finalRatio: CLTRatio;
  cltScore: CLTScore;
  experienceBonus: { C: number; L: number; T: number };
} {
  // 今回の動詞選択からC/L/Tを計算
  const currentScore = calculateCLT(currentInputVerbs);
  
  // 経験テキストからボーナスを計算
  const experienceBonus = calculateExperienceBonus(experienceText);
  
  // ボーナスを適用した現在スコア
  let currentWithBonus: CLTRatio = {
    C: Math.min(100, currentScore.ratio.C + experienceBonus.C),
    L: Math.min(100, currentScore.ratio.L + experienceBonus.L),
    T: Math.min(100, currentScore.ratio.T + experienceBonus.T),
  };
  
  // 合計が100を超える場合は正規化
  const sum = currentWithBonus.C + currentWithBonus.L + currentWithBonus.T;
  if (sum > 100) {
    const scale = 100 / sum;
    currentWithBonus = {
      C: Math.round(currentWithBonus.C * scale),
      L: Math.round(currentWithBonus.L * scale),
      T: Math.round(currentWithBonus.T * scale),
    };
    
    // 合計が100にならない場合は調整
    const finalSum = currentWithBonus.C + currentWithBonus.L + currentWithBonus.T;
    const diff = 100 - finalSum;
    if (diff !== 0) {
      if (currentWithBonus.C >= currentWithBonus.L && currentWithBonus.C >= currentWithBonus.T) {
        currentWithBonus.C += diff;
      } else if (currentWithBonus.L >= currentWithBonus.C && currentWithBonus.L >= currentWithBonus.T) {
        currentWithBonus.L += diff;
      } else {
        currentWithBonus.T += diff;
      }
    }
  }
  
  // 合成比率: FinalScore = (previousScore * 0.6) + (currentScore * 0.4)
  const weightPrevious = 0.6;
  const weightCurrent = 0.4;
  
  let finalRatio: CLTRatio = {
    C: Math.round(previousScore.C * weightPrevious + currentWithBonus.C * weightCurrent),
    L: Math.round(previousScore.L * weightPrevious + currentWithBonus.L * weightCurrent),
    T: Math.round(previousScore.T * weightPrevious + currentWithBonus.T * weightCurrent),
  };
  
  // 合計が100になるように調整
  const finalSum = finalRatio.C + finalRatio.L + finalRatio.T;
  const diff = 100 - finalSum;
  
  if (diff !== 0) {
    if (finalRatio.C >= finalRatio.L && finalRatio.C >= finalRatio.T) {
      finalRatio.C += diff;
    } else if (finalRatio.L >= finalRatio.C && finalRatio.L >= finalRatio.T) {
      finalRatio.L += diff;
    } else {
      finalRatio.T += diff;
    }
  }
  
  // 値域チェック（0-100）
  finalRatio.C = Math.max(0, Math.min(100, finalRatio.C));
  finalRatio.L = Math.max(0, Math.min(100, finalRatio.L));
  finalRatio.T = Math.max(0, Math.min(100, finalRatio.T));
  
  // CLTScoreオブジェクトを生成
  const top: "C" | "L" | "T" =
    finalRatio.C >= finalRatio.L && finalRatio.C >= finalRatio.T
      ? "C"
      : finalRatio.L >= finalRatio.C && finalRatio.L >= finalRatio.T
      ? "L"
      : "T";
  
  const cltScore: CLTScore = {
    counts: currentScore.counts,
    total: currentScore.total,
    ratio: finalRatio,
    top,
    selectedByCategory: currentScore.selectedByCategory,
  };
  
  return {
    finalRatio,
    cltScore,
    experienceBonus,
  };
}
