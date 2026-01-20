# Lumipath - プロジェクト概要

## 📋 プロジェクト情報

**プロジェクト名**: Lumipath  
**サブタイトル**: 今の自分を、行動から可視化するキャリア診断  
**バージョン**: 0.1.0  
**ライセンス**: Private

## 🎯 プロジェクトの目的

AIを活用したキャリア診断ツール。ユーザーが選択した動詞（行動）から、**C/L/T（思考・行動・対人）の傾向を分析**し、業種レベルで今の方向性を提示する。

## 🔑 主要機能

### 1. C/L/T 診断
- **C（Communication）**: 対人コミュニケーション能力
- **L（Leadership）**: リーダーシップ・行動力
- **T（Thinking）**: 思考・分析能力

ユーザーが選択した動詞（10個以上100個以下）を分析し、C/L/Tの比率を計算。選択した動詞のカテゴリー分布からパーセンテージを算出。

### 2. 業種推薦
- C/L/Tバランスに基づいて、適合度の高い業種を最大3つ推薦
- システム推薦とAI分析の両方を使用
- 各業種に対して適合度スコア、説明、必要なスキルなどを表示

### 3. 詳細分析（AI分析）
- OpenAI GPT-4o-miniを使用した詳細なキャリア分析
- 強み・弱みの抽出
- 経験に基づくインサイト
- 行動のヒント
- 適合しない業種の分析

### 4. 診断結果の保存
- Supabaseに診断結果を保存（ログイン時のみ）
- 保存内容：
  - 業種診断結果
  - C/L/Tスコア（score_c, score_l, score_t）
  - 強み（strengths）
  - 弱み（weaknesses）

### 5. マイページ（ダッシュボード）
- 過去の診断結果を確認
- 診断履歴の一覧表示
- ログイン機能

### 6. 追加機能
- **フォローアップ質問**: 診断結果に基づいて追加の質問を生成
- **自由入力動詞**: プリセットにない動詞を自由入力可能
- **スキル・興味入力**: スキルや興味を追加で入力可能
- **経験の記述**: 自由形式で経験を記述可能

## 🛠 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: React 18

### バックエンド
- **API Routes**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini

### 開発環境
- Node.js
- npm

## 📁 プロジェクト構造

```
├── app/                      # Next.js App Router
│   ├── api/                  # API ルート
│   │   ├── analyze/          # 診断分析API
│   │   ├── assessments/      # 診断結果保存API
│   │   └── followup/         # フォローアップ質問API
│   ├── auth/                 # 認証
│   │   └── callback/         # OAuthコールバック
│   ├── dashboard/            # マイページ
│   ├── login/                # ログインページ
│   ├── privacy/              # プライバシーポリシー
│   ├── terms/                # 利用規約
│   ├── error.tsx             # エラーページ
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # レイアウト
│   └── page.tsx              # メインページ（診断画面）
├── components/               # React コンポーネント
│   ├── ConsentNotice.tsx     # 同意表示
│   ├── Footer.tsx            # フッター
│   ├── LegalLayout.tsx       # 法的文書レイアウト
│   ├── LogoutButton.tsx      # ログアウトボタン
│   └── TableOfContents.tsx   # 目次
├── data/                     # データ定義
│   ├── companyExamples.ts    # 会社例
│   ├── industryProfiles.ts   # 業種プロファイル
│   ├── jobMaster.ts          # ジョブマスタ
│   ├── jobs.ts               # ジョブデータ
│   ├── verbOptions.ts        # 動詞オプション
│   └── verbs.ts              # 動詞データ
├── lib/                      # ユーティリティ関数
│   ├── calculateCLT.ts       # C/L/T計算
│   ├── prompts.ts            # AIプロンプト
│   ├── recommendIndustries.ts # 業種推薦
│   ├── recommendJobs.ts      # ジョブ推薦
│   ├── safeJson.ts           # 安全なJSONパース
│   └── verbGroups.ts         # 動詞グループ
├── utils/                    # ユーティリティ
│   └── supabase/             # Supabaseクライアント
│       ├── client.ts         # クライアントサイド
│       └── server.ts         # サーバーサイド
├── db/                       # データベース
│   └── schema.sql            # データベーススキーマ
├── docs/                     # ドキュメント
│   ├── assessment-data-flow.md
│   ├── assessment-save-implementation.md
│   └── environment-variables.md
├── middleware.ts             # Next.jsミドルウェア
├── package.json              # 依存関係
└── README.md                 # プロジェクト説明
```

## 🔄 データフロー

### 診断プロセス

1. **ユーザー入力**
   - 動詞選択（10-100個）
   - スキル入力（任意）
   - 興味入力（任意）
   - 経験の記述（任意）

2. **C/L/T計算** (`lib/calculateCLT.ts`)
   - 選択された動詞をC/L/Tカテゴリーに分類
   - ラプラス補正を適用して比率を計算
   - パーセンテージで出力（合計100%）

3. **業種推薦** (`lib/recommendIndustries.ts`)
   - C/L/T比率と業種の要求比率の距離（L1距離）を計算
   - 適合度スコア（0-100）を算出
   - 適合度の高い順に最大3つの業種を推薦

4. **AI分析** (`app/api/analyze/route.ts`)
   - OpenAI APIにプロンプトを送信
   - 詳細な分析結果を取得：
     - 業種推薦（理由付き）
     - 強み・弱みの分析
     - 経験からのインサイト
     - 行動のヒント
     - 適合しない業種の分析

5. **結果表示**
   - C/L/Tスコアの可視化
   - 推薦業種の表示
   - 強み・弱みの表示
   - 詳細な分析結果の表示

6. **結果保存**（ログイン時のみ）
   - Supabaseに診断結果を保存
   - マイページで履歴を確認可能

### データ構造

#### 診断結果（assessmentResult）
```typescript
{
  industry_result: string;      // 業種診断結果
  score_c: number;              // Cスコア（0-100）
  score_l: number;              // Lスコア（0-100）
  score_t: number;              // Tスコア（0-100）
  strengths: string[];          // 強みの配列
  weaknesses: string[];         // 弱みの配列
}
```

#### APIレスポンス構造
```typescript
{
  input: {
    verbs: string[];
    skills: string[];
    interests?: string[];
    clt: {
      counts: { C: number; L: number; T: number };
      total: number;
      ratio: { C: number; L: number; T: number };
      top: "C" | "L" | "T";
      selectedByCategory: { C: string[]; L: string[]; T: string[] };
    };
    recommendedIndustries: Array<{
      industry: string;
      matchScore: number;
      description: string;
      exampleRoles: string[];
      skills: string[];
      qualifications: string[];
    }>;
  };
  result: {
    clt_summary: {
      ratio: { C: number; L: number; T: number };
      tendency_text: string;
      evidence_verbs: string[];
    };
    recommended: Array<{
      name: string;
      industry: string;
      matchScore: number;
      reason: string;
    }>;
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
    experience_insights: any[];
    mismatch_industries: Array<{
      industry: string;
      reason: string;
      solution: { shortTerm: string; mediumTerm: string };
    }>;
    action_tips: { C: string; L: string; T: string };
  };
}
```

## 🗄 データベーススキーマ

### profiles テーブル
- `id` (UUID, PRIMARY KEY): ユーザーID
- `created_at` (TIMESTAMP): 作成日時

### assessments テーブル
- `id` (UUID, PRIMARY KEY): 診断ID
- `user_id` (UUID, FOREIGN KEY): ユーザーID
- `created_at` (TIMESTAMP): 作成日時
- `industry_result` (TEXT): 業種診断結果
- `score_c` (INT): Cスコア
- `score_l` (INT): Lスコア
- `score_t` (INT): Tスコア
- `strengths` (JSONB): 強みの配列
- `weaknesses` (JSONB): 弱みの配列

### セキュリティ
- Row Level Security (RLS) を有効化
- ユーザーは自分のデータのみアクセス可能

## 🔐 環境変数

### 必須環境変数

#### Supabase設定
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### OpenAI API設定
```env
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` ファイルをプロジェクトルートに作成し、環境変数を設定

### 3. Supabaseのセットアップ
1. Supabaseでプロジェクトを作成
2. `db/schema.sql` をSQL Editorで実行
3. Settings > APIから環境変数を取得

### 4. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📊 C/L/T分析の詳細

### C（Communication）- 対人
コミュニケーション、協力、チームワーク、関係構築などに関する動詞

例：話す、相談する、聞く、説明する、提案する、交渉する、共感する、支援する、励ます、応援する、紹介する、連携する、調整する

### L（Leadership）- 行動
リーダーシップ、実行力、行動力、決断力などに関する動詞

例：決める、実行する、行動する、進める、推進する、リードする、引っ張る、巻き込む、目標設定、計画、管理、責任を持つ、挑戦する、変化を起こす、改善する、主導する、率先する

### T（Thinking）- 思考
思考、分析、論理、構造化、設計などに関する動詞

例：分析する、考える、整理する、構造化する、設計する、計画する、仮説を立てる、検証する、比較する、評価する、調査する、研究する、論理的に考える、データを扱う、情報を整理する、要約する、抽象化する、分解する、把握する

### 計算方法
1. 選択された動詞をC/L/Tカテゴリーに分類
2. 各カテゴリーの数をカウント
3. ラプラス補正（+1）を適用
4. パーセンテージを計算（合計100%になるように調整）

## 🔍 業種推薦アルゴリズム

1. 各業種の要求C/L/T比率とユーザーのC/L/T比率の距離（L1距離）を計算
2. 適合度スコア = 100 - (距離 / 2)
3. 適合度の高い順にソート
4. システム推薦とAI分析の結果を組み合わせて最大3つを推薦

## 📝 主要なAPIエンドポイント

### POST /api/analyze
診断分析を実行

**リクエストボディ**:
```json
{
  "verbs": string[],
  "skills": string[],
  "interests": string[],
  "experienceText": string,
  "followupAnswers": Array<{ q: string; a: string }>
}
```

**レスポンス**: 診断結果オブジェクト

### POST /api/assessments
診断結果を保存

**リクエストボディ**:
```json
{
  "industry_result": string,
  "score_c": number,
  "score_l": number,
  "score_t": number,
  "strengths": string[],
  "weaknesses": string[]
}
```

### POST /api/followup
フォローアップ質問を生成

## 🎨 UI/UXの特徴

- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **直感的な操作**: 動詞選択から診断までシームレス
- **視覚的なフィードバック**: C/L/Tスコアのグラフィカル表示
- **詳細な分析結果**: 多角的なキャリア分析を提供

## 📚 関連ドキュメント

- `README.md`: 基本的なセットアップと使用方法
- `docs/assessment-data-flow.md`: 診断データのフロー詳細
- `docs/assessment-save-implementation.md`: 保存機能の実装詳細
- `docs/environment-variables.md`: 環境変数の設定方法

## 🔮 今後の拡張可能性

- より詳細なジョブ推薦機能
- キャリアパスの可視化
- スキルギャップ分析
- 学習リソースの推薦
- 他ユーザーとの比較機能
- 診断結果の共有機能
