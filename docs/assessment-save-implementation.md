# 診断完了データの自動保存実装

## 1. 診断完了データの生成場所

### ファイル: `app/page.tsx`

**生成箇所**: `submit` 関数内（診断API成功時）

**行番号**: 255-263行目

```typescript
// assessmentResult オブジェクトを生成
const result = {
  industry_result: industryResult,
  score_c: Math.round(cltData.ratio.C),
  score_l: Math.round(cltData.ratio.L),
  score_t: Math.round(cltData.ratio.T),
  strengths: strengthsArray,
  weaknesses: weaknessesArray,
};

setAssessmentResult(result);
```

### データの流れ

1. **診断API呼び出し** (191-218行目)
   - `fetch("/api/analyze")` で診断を実行
   - レスポンスを `setResponse(data as ApiResponse)` で保存

2. **データ抽出** (228-253行目)
   - `responseData.input?.clt` から C/L/T スコアを取得
   - `responseData.result` から分析結果を取得
   - `analysisData.recommended[0]` から業種診断結果を取得
   - `analysisData.strengths_weaknesses` から強み・弱みを取得

3. **assessmentResult 生成** (255-263行目)
   - すべてのデータを1つのオブジェクトに統合
   - `setAssessmentResult(result)` で state に保存

## 2. Supabase 保存処理のタイミング

### ファイル: `app/page.tsx`

**追加箇所**: `submit` 関数内（`assessmentResult` 生成直後）

**行番号**: 267-289行目

```typescript
// 診断完了時に自動的に保存を試みる（未ログインの場合はエラーにしない）
try {
  const saveRes = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });
  
  const saveData = await saveRes.json();
  
  // 保存成功時はメッセージを表示しない（自動保存のため）
  // 未ログインの場合は静かにスキップ（エラーにしない）
  if (saveRes.ok) {
    if (saveData.success) {
      // 保存成功（ログイン済みの場合のみ）
      console.log("診断結果を自動保存しました");
    } else if (saveData.skipped) {
      // 未ログインの場合は静かにスキップ（ログにも出さない）
      // 何もしない
    }
  } else {
    // エラーの場合のみログに記録（ユーザーには表示しない）
    console.warn("診断結果の自動保存に失敗:", saveData.error || "不明なエラー");
  }
} catch (saveError) {
  // 保存エラーは無視（診断結果の表示を妨げない）
  console.warn("診断結果の自動保存中にエラー:", saveError);
}
```

### 保存処理の特徴

- **自動実行**: 診断完了時に自動的に実行される
- **非ブロッキング**: 診断結果の表示を妨げない（非同期処理）
- **エラーハンドリング**: 保存エラーは無視され、診断結果の表示に影響しない
- **未ログイン対応**: 未ログインの場合は静かにスキップ（エラーにしない）

## 3. API ルートの実装

### ファイル: `app/api/assessments/route.ts`

**実装内容**:

1. **認証チェック** (18-30行目)
   - Supabase SSR クライアントで user を取得
   - 未ログインの場合は `{ success: false, skipped: true }` を返す（200ステータス）

2. **リクエストボディの取得** (32-41行目)
   - `safeJsonParse` を使用して安全にJSONパース

3. **バリデーション** (43-56行目)
   - 必須フィールドのチェック

4. **プロフィール作成** (58-66行目)
   - `profiles` が無ければ `upsert` で作成

5. **診断結果の保存** (68-89行目)
   - `assessments` テーブルに `insert`
   - 成功時は `{ success: true, data }` を返す

## 4. 変更ファイル一覧

1. **`app/page.tsx`** (修正)
   - `assessmentResult` state を追加（100-105行目）
   - 診断完了時に `assessmentResult` オブジェクトを生成（255-263行目）
   - 診断完了時に自動保存処理を追加（267-289行目）

2. **`app/api/assessments/route.ts`** (修正)
   - 未ログイン時の処理を変更（401 → 200、`skipped: true` を返す）
   - `safeJsonParse` を使用して安全にJSONパース

3. **`docs/assessment-data-flow.md`** (新規)
   - 診断完了データの所在とフローを文書化

4. **`docs/assessment-save-implementation.md`** (新規)
   - 自動保存実装の詳細を文書化

## 5. 保存されるデータ構造の最終形

```typescript
type AssessmentResult = {
  industry_result: string;  // 業種診断結果（最初の推奨業種）
  score_c: number;          // C スコア（0-100）
  score_l: number;          // L スコア（0-100）
  score_t: number;          // T スコア（0-100）
  strengths: string[];      // 強みの配列（interpersonal + thinking + action）
  weaknesses: string[];    // 弱みの配列（interpersonal + thinking + action）
};
```

### データの変換処理

- **industry_result**: `analysisData.recommended[0]?.industry || recommended[0]?.name || "未設定"`
- **score_c/l/t**: `Math.round(cltData.ratio.C/L/T)` で1%単位に丸める
- **strengths**: `strengthsData.interpersonal + thinking + action` を1つの配列に統合
- **weaknesses**: `weaknessesData.interpersonal + thinking + action` を1つの配列に統合

## 6. 動作フロー

1. ユーザーが診断を実行
2. `/api/analyze` が呼ばれ、診断結果が返される
3. `submit` 関数内で `assessmentResult` オブジェクトが生成される（255-263行目）
4. 生成直後に自動保存処理が実行される（267-289行目）
5. ログイン済みの場合: Supabase に保存される
6. 未ログインの場合: 静かにスキップ（エラーにしない）
7. 診断結果が画面に表示される（保存処理の結果に依存しない）

## 7. 安全性・品質

- ✅ `safeJsonParse` を使用して安全にJSONパース
- ✅ TypeScript の型エラーなし
- ✅ `next dev` / `next build` が通る
- ✅ 既存UIや診断ロジックを壊さない
- ✅ 未ログイン時はエラーにしない
- ✅ 保存エラーは診断結果の表示を妨げない

