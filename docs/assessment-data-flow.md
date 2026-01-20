# 診断完了データの所在とフロー

## 1. 診断完了データの所在特定

### データフロー

1. **計算処理（Server Side）**
   - `app/api/analyze/route.ts` で以下が実行される：
     - `calculateCLT(body.verbs)` → C/L/T スコアを計算
     - `recommendIndustries(clt.ratio, 3)` → 業種推薦を計算
     - OpenAI API を呼び出して詳細分析を取得

2. **API レスポンス構造**
   ```typescript
   {
     input: {
       clt: {
         ratio: { C: number, L: number, T: number },
         counts: { C: number, L: number, T: number },
         // ...
       },
       recommendedIndustries: [...]
     },
     result: {
       recommended: [...], // 業種診断結果
       strengths_weaknesses: {
         strengths: {
           interpersonal: string[],
           thinking: string[],
           action: string[]
         },
         weaknesses: {
           interpersonal: string[],
           thinking: string[],
           action: string[]
         }
       }
     }
   }
   ```

3. **クライアント側でのデータ保存**
   - **場所**: `app/page.tsx`
   - **保存方法**: `useState` で管理
     ```typescript
     const [response, setResponse] = useState<ApiResponse | null>(null);
     ```
   - **データ取得**:
     - `const clt = response?.input?.clt;` → C/L/T スコア
     - `const analysis = response?.result ?? null;` → 分析結果全体
     - `const recommended = analysis?.recommended ?? [];` → 業種診断結果
     - `const strengths = analysis?.strengths_weaknesses?.strengths;` → 強み
     - `const weaknesses = analysis?.strengths_weaknesses?.weaknesses;` → 弱み

### データの所在まとめ

| データ項目 | 所在 | 取得方法 |
|-----------|------|---------|
| `industry_result` | `response.result.recommended[0].industry` | `analysis?.recommended?.[0]?.industry` |
| `score_c` | `response.input.clt.ratio.C` | `clt?.ratio.C` |
| `score_l` | `response.input.clt.ratio.L` | `clt?.ratio.L` |
| `score_t` | `response.input.clt.ratio.T` | `clt?.ratio.T` |
| `strengths` | `response.result.strengths_weaknesses.strengths` | `analysis?.strengths_weaknesses?.strengths` |
| `weaknesses` | `response.result.strengths_weaknesses.weaknesses` | `analysis?.strengths_weaknesses?.weaknesses` |

**データの保存場所**: `useState`（メモリ内、ページリロードで消失）
- `localStorage` / `sessionStorage` には保存されていない
- `props` として渡されていない
- `fetch` のレスポンスとして `response` state に保存されている

## 2. assessmentResult オブジェクトの生成

### 生成タイミング

診断完了時（`submit` 関数の成功時）に自動的に生成される：

```typescript
// app/page.tsx の submit 関数内
if (!res.ok) {
  setError(data.error || "分析中にエラーが発生しました");
  setAssessmentResult(null);
} else {
  setResponse(data as ApiResponse);
  
  // 診断完了時に assessmentResult オブジェクトを生成
  const responseData = data as ApiResponse;
  const cltData = responseData.input?.clt;
  const analysisData = responseData.result;
  
  if (cltData && analysisData) {
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
  }
}
```

### assessmentResult の型定義

```typescript
type AssessmentResult = {
  industry_result: string;
  score_c: number;
  score_l: number;
  score_t: number;
  strengths: string[];
  weaknesses: string[];
};
```

### 保存処理

`saveAssessment` 関数で `assessmentResult` をそのまま使用：

```typescript
const saveAssessment = async () => {
  if (!assessmentResult) {
    setError("保存する診断結果がありません");
    return;
  }
  
  // assessmentResult をそのまま API に送信
  const res = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assessmentResult),
  });
};
```

## 3. データの整合性

- `assessmentResult` は診断完了時に必ず生成される
- データは `useState` で管理され、コンポーネント内で一貫して使用可能
- Supabase への保存時は `assessmentResult` をそのまま使用

