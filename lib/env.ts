/**
 * 環境変数の型定義とバリデーション
 * ビルド時に環境変数が欠落している場合、デフォルト値を使用するか、安全にスキップする
 */

type EnvConfig = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  openaiApiKey: string | null;
  nodeEnv: 'development' | 'production' | 'test';
  isSupabaseEnabled: boolean;
  isOpenAIEnabled: boolean;
};

/**
 * 環境変数を安全に取得し、バリデーションを行う
 * ビルド時に環境変数が空でもビルドが落ちないよう、プレースホルダー値を使用
 */
export function getEnvConfig(): EnvConfig {
  // ビルド時の安全な参照（プレースホルダー値を使用）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  const openaiApiKey = process.env.OPENAI_API_KEY || null;
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  
  // プレースホルダー値の場合は実際には無効として扱う
  const isSupabasePlaceholder = supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder';

  // 本番環境では環境変数の存在をチェック（警告のみ）
  if (nodeEnv === 'production') {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        '[env] Supabase環境変数が設定されていません。保存機能は使用できません。'
      );
    }
    if (!openaiApiKey) {
      console.warn(
        '[env] OPENAI_API_KEYが設定されていません。AI診断機能は使用できません。'
      );
    }
  }

  return {
    supabaseUrl: isSupabasePlaceholder ? null : supabaseUrl,
    supabaseAnonKey: isSupabasePlaceholder ? null : supabaseAnonKey,
    openaiApiKey,
    nodeEnv,
    isSupabaseEnabled: !isSupabasePlaceholder && !!(supabaseUrl && supabaseAnonKey),
    isOpenAIEnabled: !!openaiApiKey,
  };
}

/**
 * 環境変数のバリデーション（ビルド時エラーを防ぐ）
 */
export function validateEnv(): void {
  const config = getEnvConfig();

  // ビルド時にはエラーを投げず、警告のみ
  if (config.nodeEnv === 'production') {
    if (!config.isSupabaseEnabled) {
      console.warn(
        '[env] 本番環境でSupabaseが無効です。一部の機能が制限されます。'
      );
    }
    if (!config.isOpenAIEnabled) {
      console.warn(
        '[env] 本番環境でOpenAIが無効です。AI診断機能が使用できません。'
      );
    }
  }
}

// ビルド時に実行（モジュール読み込み時）
if (typeof window === 'undefined') {
  validateEnv();
}
