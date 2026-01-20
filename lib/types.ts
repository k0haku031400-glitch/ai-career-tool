/**
 * APIレスポンスとデータ構造の型定義
 */

export type CLTRatio = {
  C: number;
  L: number;
  T: number;
};

export type RecommendedJob = {
  job: string;
  matchScore: number;
  reason: string;
  actionPlan: string;
};

export type AIResponse = {
  recommendedJobs?: Array<{
    job?: string;
    matchScore?: number;
    reason?: string;
    actionPlan?: string;
  }>;
  strengths?: string[];
  weaknesses?: string[];
  cltRatio?: CLTRatio;
  summary?: string;
  experienceInsights?: Array<{
    experience?: string;
    insight?: string;
    suitable_role?: string;
  }>;
  mismatchJobs?: Array<{
    job?: string;
    reason?: string;
    solution?: {
      shortTerm?: string;
      mediumTerm?: string;
    };
  }>;
  actionTips?: {
    C?: string;
    L?: string;
    T?: string;
  };
};

export type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export type TransformedResult = {
  clt_summary: {
    ratio: CLTRatio;
    tendency_text: string;
    evidence_verbs: string[];
  };
  recommended: Array<{
    name: string;
    job: string;
    matchScore: number;
    reason: string;
    actionPlan: string;
  }>;
  skills: {
    universal: string[];
    differentiators: string[];
    certifications_examples: string[];
  };
  strengths_weaknesses: {
    strengths: {
      interpersonal: string[];
      thinking: string[];
      action: string[];
    };
    weaknesses: {
      interpersonal: string[];
      thinking: string[];
      action: string[];
    };
    tips: string[];
  };
  experience_insights: Array<{
    experience?: string;
    insight?: string;
    suitable_role?: string;
  }>;
  mismatch_jobs: Array<{
    job: string;
    reason: string;
    solution: {
      shortTerm: string;
      mediumTerm: string;
    };
  }>;
  action_tips: {
    C: string;
    L: string;
    T: string;
  };
};
