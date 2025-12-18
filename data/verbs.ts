export type CLT = "C" | "L" | "T";

// VERB_CATEGORIESは削除し、VERBS配列から取得するように変更
// 後方互換性のため、labelからgroupを取得する関数を提供
import { VERBS } from "@/data/verbOptions";

export function getVerbGroup(label: string): CLT | undefined {
  const verb = VERBS.find((v) => v.label === label);
  return verb?.group;
}
