# Lumipath - 今の自分を、行動から可視化するキャリア診断

AIを活用したキャリア診断ツール。好きな行動・経験から、C/L/T（思考・行動・対人）の傾向を分析し、業種レベルで今の方向性を提示します。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください：

```env
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API設定（診断機能に必要）
OPENAI_API_KEY=your_openai_api_key
```

#### Supabase の設定方法

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. プロジェクトの Settings > API から以下を取得：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. SQL Editor で `db/schema.sql` を実行してテーブルを作成

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ビルド

```bash
npm run build
```

## 主な機能

- **C/L/T 診断**: 選択した動詞から、思考・行動・対人の傾向を分析
- **業種推薦**: C/L/T バランスに基づいた業種レベルの推薦
- **診断結果の保存**: Supabase に診断結果を保存（ログイン時）
- **マイページ**: 過去の診断結果を確認

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini

## プロジェクト構造

```
├── app/
│   ├── api/              # API ルート
│   ├── dashboard/        # マイページ
│   ├── login/            # ログインページ
│   ├── terms/            # 利用規約
│   └── privacy/          # プライバシーポリシー
├── components/           # React コンポーネント
├── lib/                   # ユーティリティ関数
├── utils/                 # Supabase クライアント
├── data/                  # データ定義
└── db/                    # データベーススキーマ
```

## ライセンス

Private

