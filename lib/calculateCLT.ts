import { CLT, getVerbGroup } from "@/data/verbs";

export type CLTScore = {
  counts: Record<CLT, number>;
  total: number;
  ratio: Record<CLT, number>; // 0〜100 %
  top: CLT; // 一番高いタイプ
  selectedByCategory: Record<CLT, string[]>;
};

/**
 * 自由入力動詞を分類する（簡易版）
 * キーワードベースで分類を試みる
 */
function classifyCustomVerb(verb: string): CLT | null {
  const lower = verb.toLowerCase();
  
  // C（コミュニケーション）のキーワード
  const cKeywords = ["話", "会話", "相談", "聞く", "伝える", "説明", "提案", "交渉", "共感", "支援", "励ます", "応援", "紹介", "関係", "チーム", "協力", "連携", "調整", "場", "雰囲気"];
  if (cKeywords.some(kw => lower.includes(kw))) return "C";
  
  // L（リーダーシップ）のキーワード
  const lKeywords = ["決める", "決断", "実行", "行動", "進める", "推進", "リード", "引っ張る", "巻き込む", "目標", "計画", "管理", "責任", "挑戦", "変化", "改善", "主導", "先頭", "率先"];
  if (lKeywords.some(kw => lower.includes(kw))) return "L";
  
  // T（思考・分析）のキーワード
  const tKeywords = ["分析", "考える", "整理", "構造", "設計", "計画", "仮説", "検証", "比較", "評価", "調査", "研究", "論理", "データ", "情報", "要約", "抽象", "分解", "把握"];
  if (tKeywords.some(kw => lower.includes(kw))) return "T";
  
  return null;
}

export function calculateCLT(selectedVerbs: string[]): CLTScore {
  const counts: Record<CLT, number> = { C: 0, L: 0, T: 0 };
  const selectedByCategory: Record<CLT, string[]> = {
    C: [],
    L: [],
    T: [],
  };

  for (const v of selectedVerbs) {
    let cat: CLT | undefined = getVerbGroup(v);
    
    // 辞書にない動詞（自由入力）はキーワードベースで分類を試みる
    if (!cat) {
      const customCat = classifyCustomVerb(v);
      if (!customCat) continue; // 分類できない場合はスキップ
      cat = customCat;
    }

    counts[cat] += 1;
    selectedByCategory[cat].push(v);
  }

  // ラプラス補正（+1）を適用して、未選択でも必ずパーセンテージが出るようにする
  const adjC = counts.C + 1;
  const adjL = counts.L + 1;
  const adjT = counts.T + 1;
  const adjTotal = adjC + adjL + adjT;

  // パーセンテージを計算（1%単位に丸める）
  const rawC = Math.round((adjC / adjTotal) * 100);
  const rawL = Math.round((adjL / adjTotal) * 100);
  const rawT = Math.round((adjT / adjTotal) * 100);
  
  // 合計が100%になるように調整（最大の項目で調整）
  const sum = rawC + rawL + rawT;
  const diff = 100 - sum;
  
  let ratio: Record<CLT, number> = {
    C: rawC,
    L: rawL,
    T: rawT,
  };
  
  // 差分を最大の項目に加算（同値の場合はC優先）
  if (diff !== 0) {
    if (ratio.C >= ratio.L && ratio.C >= ratio.T) {
      ratio.C += diff;
    } else if (ratio.L >= ratio.C && ratio.L >= ratio.T) {
      ratio.L += diff;
    } else {
      ratio.T += diff;
    }
  }

  const top: CLT =
    ratio.C >= ratio.L && ratio.C >= ratio.T
      ? "C"
      : ratio.L >= ratio.C && ratio.L >= ratio.T
      ? "L"
      : "T";

  return {
    counts,
    total: counts.C + counts.L + counts.T,
    ratio,
    top,
    selectedByCategory,
  };
}

