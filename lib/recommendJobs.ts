import type { CLT } from "@/data/verbs";

import { JOB_PROFILES, JobProfile } from "@/data/jobs";

type Ratio = Record<CLT, number>;

// ユーザー比率と職業比率の距離（L1距離）を計算

function distance(a: Ratio, b: Ratio) {

  return (

    Math.abs(a.C - b.C) +

    Math.abs(a.L - b.L) +

    Math.abs(a.T - b.T)

  );

}

export function recommendJobs(

  userRatio: Ratio,

  topN = 3

): Array<JobProfile & { score: number }> {

  return JOB_PROFILES

    .map((p) => ({

      ...p,

      score: distance(userRatio, p.requiredRatio),

    }))

    .sort((x, y) => x.score - y.score)

    .slice(0, topN);

}

