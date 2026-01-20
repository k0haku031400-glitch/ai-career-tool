# 環境変数の設定

Lumipath を動作させるために必要な環境変数を設定してください。

## 必須環境変数

### Supabase 設定

診断結果の保存機能に必要です。

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 取得方法

1. [Supabase](https://supabase.com/) にログイン
2. プロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクトの **Settings** > **API** に移動
4. 以下の値をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 注意事項

- 環境変数が未設定の場合、middleware は Supabase の処理をスキップします（開発中の事故防止）
- 診断結果の保存機能を使用する場合は、必ず設定してください

### OpenAI API 設定

AI診断機能に必要です。

```env
OPENAI_API_KEY=your_openai_api_key
```

#### 取得方法

1. [OpenAI Platform](https://platform.openai.com/) にログイン
2. **API keys** から新しい API キーを作成
3. 作成したキーをコピーして `.env.local` に設定

## 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の形式で設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI API設定
OPENAI_API_KEY=sk-your_api_key_here
```

## 環境変数の確認

環境変数が正しく設定されているか確認するには：

```bash
# 開発サーバー起動時にエラーが出ないか確認
npm run dev

# ビルド時にエラーが出ないか確認
npm run build
```

## トラブルシューティング

### middleware.ts でエラーが発生する場合

環境変数が未設定の場合、middleware は自動的に Supabase の処理をスキップします。エラーが発生する場合は、以下を確認してください：

1. `.env.local` ファイルがプロジェクトルートに存在するか
2. 環境変数名が正しいか（`NEXT_PUBLIC_` プレフィックスが必要）
3. 値に余分なスペースや引用符が含まれていないか

### 診断結果が保存されない場合

1. Supabase の環境変数が正しく設定されているか確認
2. Supabase のデータベースに `profiles` と `assessments` テーブルが作成されているか確認
3. ブラウザのコンソールでエラーメッセージを確認

