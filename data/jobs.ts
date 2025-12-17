import type { CLT } from "@/data/verbs";



export type JobProfile = {

  job: string;

  industries: string[];

  requiredRatio: Record<CLT, number>; // 0〜100

  description: string;

};



export const JOB_PROFILES: JobProfile[] = [

  {

    job: "法人営業",

    industries: ["IT", "人材", "SaaS", "広告"],

    requiredRatio: { C: 55, L: 30, T: 15 },

    description: "顧客の課題を聞き出し、提案し、関係構築を通じて売上をつくる仕事。",

  },

  {

    job: "企画職（事業・サービス企画）",

    industries: ["IT", "メーカー", "教育", "スタートアップ"],

    requiredRatio: { C: 30, L: 25, T: 45 },

    description: "ユーザー課題を理解し、仮説検証をしながら新しいサービスを形にする仕事。",

  },

  {

    job: "プロジェクトマネージャー",

    industries: ["IT", "コンサル", "制作"],

    requiredRatio: { C: 35, L: 45, T: 20 },

    description: "関係者をまとめ、意思決定とスケジュール管理をしながらプロジェクトを進める仕事。",

  },

  {

    job: "データアナリスト",

    industries: ["IT", "金融", "マーケティング"],

    requiredRatio: { C: 15, L: 10, T: 75 },

    description: "データをもとに傾向や課題を見つけ、意思決定に役立つ示唆を出す仕事。",

  },

  {

    job: "マーケター",

    industries: ["広告", "D2C", "IT", "メーカー"],

    requiredRatio: { C: 35, L: 25, T: 40 },

    description: "顧客理解と数字をもとに、商品やサービスが選ばれる仕組みをつくる仕事。",

  },

];

