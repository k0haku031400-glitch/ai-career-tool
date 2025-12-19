import type { CLT } from "@/data/verbs";

import { INDUSTRY_PROFILES, IndustryProfile } from "@/data/industryProfiles";

type Ratio = Record<CLT, number>;

/**
 * ユーザー比率と業種比率の距離（L1距離）を計算
 * 距離が小さいほど、ユーザーのC/L/Tバランスと業種の要求が一致している
 */
function distance(a: Ratio, b: Ratio): number {
  return (
    Math.abs(a.C - b.C) +
    Math.abs(a.L - b.L) +
    Math.abs(a.T - b.T)
  );
}

/**
 * ユーザーのC/L/T比率に基づいて、適合度の高い業種を推薦
 * 
 * @param userRatio ユーザーのC/L/T比率（合計100）
 * @param topN 推薦する業種の数（デフォルト5）
 * @returns 適合度スコア付きの業種プロファイル配列（適合度の高い順）
 */
export function recommendIndustries(
  userRatio: Ratio,
  topN = 5
): Array<IndustryProfile & { matchScore: number }> {
  return INDUSTRY_PROFILES
    .map((p) => {
      // 距離を計算（距離が小さいほど適合度が高い）
      const dist = distance(userRatio, p.requiredRatio);
      // 適合度スコア（0-100、距離が0のとき100、距離が200のとき0）
      const matchScore = Math.max(0, Math.round(100 - (dist / 2)));
      
      return {
        ...p,
        matchScore,
      };
    })
    .sort((x, y) => y.matchScore - x.matchScore) // スコアの高い順
    .slice(0, topN);
}

