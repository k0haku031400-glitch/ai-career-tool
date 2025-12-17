import { CLT, VERB_CATEGORIES } from "@/data/verbs";



export type CLTScore = {

  counts: Record<CLT, number>;

  total: number;

  ratio: Record<CLT, number>; // 0〜100 %

  top: CLT; // 一番高いタイプ

  selectedByCategory: Record<CLT, string[]>;

};



export function calculateCLT(selectedVerbs: string[]): CLTScore {

  const counts: Record<CLT, number> = { C: 0, L: 0, T: 0 };

  const selectedByCategory: Record<CLT, string[]> = {

    C: [],

    L: [],

    T: [],

  };



  for (const v of selectedVerbs) {

    const cat = VERB_CATEGORIES[v];

    if (!cat) continue; // 辞書にない動詞は無視（自由入力に備える）



    counts[cat] += 1;

    selectedByCategory[cat].push(v);

  }



  const total = counts.C + counts.L + counts.T;



  const toPct = (x: number) =>

    total === 0 ? 0 : Math.round((x / total) * 100);



  const ratio: Record<CLT, number> = {

    C: toPct(counts.C),

    L: toPct(counts.L),

    T: toPct(counts.T),

  };



  const top: CLT =

    ratio.C >= ratio.L && ratio.C >= ratio.T

      ? "C"

      : ratio.L >= ratio.C && ratio.L >= ratio.T

      ? "L"

      : "T";



  return {

    counts,

    total,

    ratio,

    top,

    selectedByCategory,

  };

}

