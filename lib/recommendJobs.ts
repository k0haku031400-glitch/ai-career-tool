import type { CLT } from "@/data/verbs";
import { jobMaster, type JobProfile } from "@/data/jobMaster";

type Ratio = Record<CLT, number>;

/**
 * ユーザー比率と職種比率の距離（L1距離）を計算
 * 距離が小さいほど、ユーザーのC/L/Tバランスと職種の要求が一致している
 */
function distance(a: Ratio, b: Ratio): number {
  return (
    Math.abs(a.C - b.C) +
    Math.abs(a.L - b.L) +
    Math.abs(a.T - b.T)
  );
}

/**
 * JobProfileのscore_c, score_l, score_tからRatioに変換
 */
function ratioFromJobProfile(job: JobProfile): Ratio {
  return {
    C: job.score_c,
    L: job.score_l,
    T: job.score_t,
  };
}

/**
 * ユーザーのC/L/T比率に基づいて、適合度の高い職種を推薦
 * 
 * @param userCLT ユーザーのC/L/T比率（合計100）
 * @param topN 推薦する職種の数（デフォルト3）
 * @returns 適合度スコア付きの職種マスターデータ配列（適合度の高い順）
 */
export function recommendJobs(
  userCLT: Ratio,
  topN = 3
): Array<JobProfile & { matchScore: number; requiredRatio: Ratio; job: string; industries: string[]; skillsCommon: string[]; skillsDifferentiator: string[]; certifications: string[] }> {
  if (!jobMaster || !Array.isArray(jobMaster) || jobMaster.length === 0) {
    console.error("jobMaster is not available or empty");
    return [];
  }

  return jobMaster
    .map((job) => {
      // 職種の理想比率を取得
      const requiredRatio = ratioFromJobProfile(job);
      
      // 距離を計算（距離が小さいほど適合度が高い）
      const dist = distance(userCLT, requiredRatio);
      
      // 適合度スコア = 100 - (L1距離 / 2)
      // 距離が0のとき100、距離が200のとき0
      const matchScore = Math.max(0, Math.round(100 - (dist / 2)));
      
      return {
        ...job,
        job: job.name, // jobプロパティとしてnameを使用
        matchScore,
        requiredRatio,
        industries: [], // デフォルト値（必要に応じてjobMasterに追加）
        skillsCommon: [], // デフォルト値
        skillsDifferentiator: [], // デフォルト値
        certifications: [], // デフォルト値
      };
    })
    .sort((x, y) => y.matchScore - x.matchScore) // スコアの高い順
    .slice(0, topN);
}
