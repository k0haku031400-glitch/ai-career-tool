"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { VERBS, CATEGORY_INFO, type VerbItem } from "@/data/verbOptions";

type ApiResponse = {
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
    recommendedIndustries: any[];
  };
  result: any;
  error?: string;
};

// レスポンシブ用フック
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// SectionHeaderコンポーネント
function SectionHeader({
  title,
  description,
  isMobile,
}: {
  title: string;
  description: string;
  isMobile: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3
        style={{
          fontSize: isMobile ? "1rem" : "1.1rem",
          fontWeight: 800,
          marginBottom: 6,
          color: "#c62828",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: isMobile ? "0.72rem" : "0.78rem",
          color: "#666",
          lineHeight: 1.5,
          marginBottom: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

const MAX_SELECTION = 100;

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [verbs, setVerbs] = useState<string[]>([]);
  const [customVerbs, setCustomVerbs] = useState<string[]>([]);
  const [customVerbInput, setCustomVerbInput] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceText, setExperienceText] = useState<string>("");
  const [followupQuestions, setFollowupQuestions] = useState<{ id: string; q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFollowup, setLoadingFollowup] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const allVerbs = [...verbs, ...customVerbs];
  const selectedCount = allVerbs.length;

  const toggleVerb = (v: string) => {
    if (allVerbs.length >= MAX_SELECTION && !allVerbs.includes(v)) return;
    setVerbs((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const addCustomVerb = () => {
    const trimmed = customVerbInput.trim();
    if (!trimmed || trimmed.length < 2) return;
    if (allVerbs.includes(trimmed)) {
      setCustomVerbInput("");
      return;
    }
    if (allVerbs.length >= MAX_SELECTION) return;
    setCustomVerbs((prev) => [...prev, trimmed]);
    setCustomVerbInput("");
  };

  const removeCustomVerb = (v: string) => {
    setCustomVerbs((prev) => prev.filter((x) => x !== v));
  };

  const handleFollowupGenerate = async () => {
    if (!experienceText.trim()) {
      setError("経験を入力してください");
      return;
    }
    setLoadingFollowup(true);
    setError(null);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceText,
          selectedVerbs: allVerbs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "質問生成中にエラーが発生しました");
      } else {
        const questions = data.questions || [];
        setFollowupQuestions(
          questions.map((q: string, i: number) => ({
            id: `q-${i}`,
            q,
            a: "",
          }))
        );
      }
    } catch (e: any) {
      setError(e?.message ?? "ネットワークエラーが発生しました");
    } finally {
      setLoadingFollowup(false);
    }
  };

  const updateFollowupAnswer = (id: string, answer: string) => {
    setFollowupQuestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, a: answer } : item))
    );
  };

  const handleSkillsChange = (value: string) =>
    setSkills(
      value
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    );

  const handleInterestsChange = (value: string) =>
    setInterests(
      value
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    );

  async function submit() {
    if (allVerbs.length < 10 || allVerbs.length > MAX_SELECTION || loading) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verbs: allVerbs,
          skills,
          interests,
          experienceText,
          followupAnswers: followupQuestions
            .filter((item) => item.a.trim())
            .map((item) => ({ q: item.q, a: item.a })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "分析中にエラーが発生しました");
      } else {
        setResponse(data as ApiResponse);
      }
    } catch (e: any) {
      setError(e?.message ?? "ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const clt = response?.input?.clt;
  const analysis = response?.result ?? null;

  // パーセンテージを1%単位に丸めて合計100%に調整
  const rawRatio = clt?.ratio ?? { C: 33, L: 33, T: 34 };
  const sum = rawRatio.C + rawRatio.L + rawRatio.T;
  const diff = 100 - sum;
  
  // 差分を最大の項目に加算（同値の場合はC優先）
  let ratio = { ...rawRatio };
  if (diff !== 0) {
    if (ratio.C >= ratio.L && ratio.C >= ratio.T) {
      ratio.C += diff;
    } else if (ratio.L >= ratio.C && ratio.L >= ratio.T) {
      ratio.L += diff;
    } else {
      ratio.T += diff;
    }
  }
  
  // 1%単位に丸める
  ratio.C = Math.round(ratio.C);
  ratio.L = Math.round(ratio.L);
  ratio.T = Math.round(ratio.T);
  
  const pieTotal = ratio.C + ratio.L + ratio.T || 100;
  const cEnd = (ratio.C / pieTotal) * 100;
  const lEnd = ((ratio.C + ratio.L) / pieTotal) * 100;
  const tEnd = 100;

  const recommended = analysis?.recommended ?? [];
  const strengths = analysis?.strengths_weaknesses?.strengths ?? null;
  const weaknesses = analysis?.strengths_weaknesses?.weaknesses ?? null;
  const skillsAnalysis = analysis?.skills ?? null;
  const mismatchIndustries = analysis?.mismatch_industries ?? [];
  const actionTips = analysis?.action_tips ?? { C: "", L: "", T: "" };

  const handlePrintPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // 共通スタイル
  const cardStyle = {
    background: "#ffffff",
    borderRadius: 18,
    border: "1px solid #ffe0e0",
    padding: isMobile ? 14 : 18,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "#c62828",
    color: "#ffffff",
    fontSize: isMobile ? "0.85rem" : "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(198,40,40,0.4)",
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    background: "#ffcdd2",
    cursor: "default",
    boxShadow: "none",
  };

  // イントロ画面
  if (!isStarted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          padding: isMobile ? "24px 16px 40px" : "40px 24px 60px",
          position: "relative",
        }}
      >
        {/* 左上ヘッダー（会社名とロゴ） */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? 16 : 24,
            left: isMobile ? 16 : 24,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 8 : 10,
            zIndex: 10,
          }}
        >
          <Image
            src="/logo-ai-revolution.jpg"
            alt="株式会社AI Revolution"
            width={isMobile ? 28 : 32}
            height={isMobile ? 28 : 32}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: isMobile ? "0.75rem" : "0.85rem",
              fontWeight: 600,
              color: "#c62828",
              whiteSpace: "nowrap",
            }}
          >
            株式会社AI Revolution
          </span>
        </div>

        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {/* ヒーローエリア */}
          <section
            style={{
              textAlign: "center",
              marginBottom: isMobile ? 48 : 64,
              paddingTop: isMobile ? 20 : 40,
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? "2.5rem" : "3.5rem",
                fontWeight: 800,
                color: "#c62828",
                marginBottom: isMobile ? 12 : 16,
                letterSpacing: "-0.02em",
              }}
            >
              Lumipath
            </h1>
            <div
              style={{
                width: isMobile ? 120 : 160,
                height: 4,
                background: "#c62828",
                margin: "0 auto",
                marginBottom: isMobile ? 16 : 20,
                borderRadius: 2,
              }}
            />
            <p
              style={{
                fontSize: isMobile ? "0.95rem" : "1.1rem",
                color: "#555",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              今の自分を可視化するキャリア診断
            </p>
          </section>

          {/* ツール紹介 */}
          <section
            style={{
              marginBottom: isMobile ? 40 : 56,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: isMobile ? 20 : 24,
              }}
            >
              {[
                {
                  title: "自己分析",
                  description:
                    "好きな行動・経験から、C/L/T（対人・行動・思考）の傾向を分析します。",
                },
                {
                  title: "向いている業種",
                  description:
                    "分析結果から現状向いている業種を提示します",
                },
                {
                  title: "AIと経験を深掘り",
                  description:
                    "AIと経験を深掘りすることで、具体的なキャリアデザインが可能",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fffafa",
                    borderRadius: 18,
                    border: "1px solid #ffe0e0",
                    padding: isMobile ? 20 : 24,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      fontWeight: 700,
                      color: "#c62828",
                      marginBottom: 8,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      color: "#666",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 診断の特徴 */}
          <section
            style={{
              marginBottom: isMobile ? 40 : 56,
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "center",
                gap: isMobile ? 16 : 32,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "所要時間", value: "約3〜5分" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                      color: "#999",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      color: "#c62828",
                      fontWeight: 600,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 診断開始ボタン */}
          <section
            style={{
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setIsStarted(true)}
              style={{
                padding: isMobile ? "16px 32px" : "18px 40px",
                borderRadius: 999,
                border: "none",
                background: "#c62828",
                color: "#ffffff",
                fontSize: isMobile ? "1rem" : "1.1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(198,40,40,0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
                minWidth: isMobile ? "280px" : "320px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(198,40,40,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(198,40,40,0.4)";
              }}
            >
              診断をはじめる
            </button>
          </section>
        </div>
      </main>
    );
  }

  // 診断画面（既存のコード）
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ffe5e5 0%, #fff9f9 40%, #ffffff 100%)",
        padding: isMobile ? "12px 8px 32px" : "16px 12px 40px",
        position: "relative",
      }}
    >
      {/* 右上固定カウンターバッジ - main直下に配置してstickyを有効化 */}
      <div
        style={{
          position: "sticky",
          top: isMobile ? 8 : 12,
          zIndex: 50,
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-end",
          alignItems: "center",
          pointerEvents: "none",
          maxWidth: 1080,
          margin: "0 auto",
          padding: isMobile ? "8px 12px" : "12px 16px",
        }}
      >
        <div
          style={{
            marginLeft: "auto",
            width: "fit-content",
            borderRadius: 999,
            border: "1px solid rgba(254, 202, 202, 1)",
            background: "rgba(255, 245, 245, 0.9)",
            padding: "4px 12px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#b91c1c",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            pointerEvents: "auto",
          }}
        >
          選択中: {selectedCount} / {MAX_SELECTION}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          borderRadius: 24,
          background: "#ffffff",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >

        {/* タブバー風ヘッダー */}
        <header
          style={{
            padding: isMobile ? "12px 16px 8px" : "14px 20px 10px",
            borderBottom: "1px solid #ffe0e0",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {/* ロゴ */}
              <Image
                src="/logo-ai-revolution.jpg"
                alt="サービスロゴ"
                width={isMobile ? 32 : 40}
                height={isMobile ? 32 : 40}
                style={{ objectFit: "contain", borderRadius: 8 }}
              />
              <div>
                <div
                  style={{
                    fontSize: isMobile ? "0.95rem" : "1.05rem",
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    color: "#c62828",
                  }}
                >
                  Lumipath
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "0.72rem" : "0.78rem",
                    color: "#777",
                  }}
                >
                  今の自分を、行動から可視化するキャリア診断
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid #ffcdd2",
                color: "#c62828",
                background: "#fff5f5",
              }}
            >
              β version
            </div>
          </div>

          {/* タブナビゲーション */}
          <nav
            style={{
              display: "flex",
              gap: 16,
              fontSize: isMobile ? "0.75rem" : "0.8rem",
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {["ホーム", "AI診断", "コーチング", "成長", "設定"].map((tab) => {
              const active = tab === "AI診断";
              return (
                <div
                  key={tab}
                  style={{
                    paddingBottom: 6,
                    borderBottom: active
                      ? "2px solid #c62828"
                      : "2px solid transparent",
                    color: active ? "#c62828" : "#999",
                    whiteSpace: "nowrap",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </div>
              );
            })}
          </nav>
        </header>

        {/* コンテンツ */}
        <div
          style={{
            padding: isMobile ? "16px 12px 20px" : "18px 18px 24px",
          }}
        >
          {/* 入力カード */}
          <section
            style={{
              ...cardStyle,
              background: "#fffafa",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontWeight: 600,
                marginBottom: 6,
                color: "#c62828",
              }}
            >
              あなたは何をしている時が楽しい？
            </h2>
            <p
              style={{
                fontSize: isMobile ? "0.72rem" : "0.78rem",
                marginBottom: 12,
                lineHeight: 1.6,
              }}
            >
              日常で「楽しい・好き」と感じる行動を選んでください。10〜{MAX_SELECTION}個まで選択できます。
              選択した行動が多いほど精度が上がります。
            </p>

            {(() => {
              // カテゴリごとにグループ化
              const categories = Array.from(
                new Set(VERBS.map((v) => v.category))
              );
              
              // 開発時のみカテゴリ/サブカテゴリの件数をログ出力
              if (process.env.NODE_ENV !== "production") {
                const categoryCounts: Record<string, Record<string, number>> = {};
                VERBS.forEach((v) => {
                  if (!categoryCounts[v.category]) {
                    categoryCounts[v.category] = {};
                  }
                  categoryCounts[v.category][v.subcategory] =
                    (categoryCounts[v.category][v.subcategory] || 0) + 1;
                });
                console.log("カテゴリ/サブカテゴリ件数:", categoryCounts);
              }

              return categories.map((category, categoryIndex) => {
                const categoryVerbs = VERBS.filter((v) => v.category === category);
                const subcategories = Array.from(
                  new Set(categoryVerbs.map((v) => v.subcategory))
                );
                const isLastCategory = categoryIndex === categories.length - 1;

                return (
                  <section key={category} style={{ marginTop: 20 }}>
                    <SectionHeader
                      title={category}
                      description={CATEGORY_INFO[category]?.description || ""}
                      isMobile={isMobile}
                    />
                    {subcategories.map((subcategory) => {
                      const subcategoryVerbs = categoryVerbs.filter(
                        (v) => v.subcategory === subcategory
                      );
                      return (
                        <div key={subcategory} style={{ marginBottom: 16 }}>
                          <h4
                  style={{
                              fontSize: isMobile ? "0.75rem" : "0.8rem",
                              fontWeight: 700,
                    marginBottom: 8,
                              color: "#888",
                  }}
                >
                            {subcategory}
                          </h4>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                            {subcategoryVerbs.map((verb) => {
                              const active = verbs.includes(verb.label);
                    return (
                      <button
                        type="button"
                                  key={verb.id}
                                  onClick={() => toggleVerb(verb.label)}
                                  disabled={!active && allVerbs.length >= MAX_SELECTION}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: active
                            ? "1px solid #c62828"
                            : "1px solid #e0e0e0",
                          background: active ? "#c62828" : "#ffffff",
                          color: active ? "#ffffff" : "#333333",
                          fontSize: isMobile ? "0.72rem" : "0.76rem",
                                    cursor:
                                      !active && allVerbs.length >= MAX_SELECTION
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      !active && allVerbs.length >= MAX_SELECTION ? 0.5 : 1,
                          transition:
                            "background 0.15s, color 0.15s, box-shadow 0.15s",
                          boxShadow: active
                            ? "0 2px 6px rgba(198,40,40,0.4)"
                            : "none",
                        }}
                      >
                                  {verb.label}
                      </button>
                    );
                  })}
                </div>
                        </div>
                      );
                    })}
                    {!isLastCategory && (
                      <div
                        style={{
                          borderBottom: "1px solid rgba(198,40,40,0.25)",
                          marginTop: isMobile ? 24 : 28,
                          marginBottom: isMobile ? 24 : 28,
                        }}
                      />
                    )}
              </section>
                );
              });
            })()}

            {/* 自由入力の動詞を追加 */}
            <section style={{ marginTop: 20 }}>
              <h3
                style={{
                  fontSize: isMobile ? "0.82rem" : "0.88rem",
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "#c62828",
                }}
              >
                自由入力の動詞を追加
              </h3>
              <p
                style={{
                  fontSize: isMobile ? "0.68rem" : "0.72rem",
                  marginBottom: 6,
                  color: "#777",
                }}
              >
                選択肢にない動詞があれば追加できます（2文字以上、重複不可）
              </p>
            <div
              style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <input
                  type="text"
                  value={customVerbInput}
                  onChange={(e) => setCustomVerbInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomVerb();
                    }
                  }}
                  placeholder="例：企画する、分析する"
                  disabled={allVerbs.length >= MAX_SELECTION}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: 999,
                    border: "1px solid #e0e0e0",
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    background: "#ffffff",
                    opacity: allVerbs.length >= MAX_SELECTION ? 0.5 : 1,
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomVerb}
                  disabled={
                    !customVerbInput.trim() ||
                    customVerbInput.trim().length < 2 ||
                    allVerbs.includes(customVerbInput.trim()) ||
                    allVerbs.length >= MAX_SELECTION
                  }
                  style={{
                    padding: "9px 16px",
                    borderRadius: 999,
                    border: "none",
                    background:
                      allVerbs.length >= MAX_SELECTION ||
                      !customVerbInput.trim() ||
                      customVerbInput.trim().length < 2 ||
                      allVerbs.includes(customVerbInput.trim())
                        ? "#ffcdd2"
                        : "#c62828",
                    color: "#ffffff",
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    fontWeight: 600,
                    cursor:
                      allVerbs.length >= MAX_SELECTION ||
                      !customVerbInput.trim() ||
                      customVerbInput.trim().length < 2 ||
                      allVerbs.includes(customVerbInput.trim())
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  追加
                </button>
              </div>
              {customVerbs.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {customVerbs.map((v) => (
                    <div
                      key={v}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid #c62828",
                        background: "#fff5f5",
                        fontSize: isMobile ? "0.72rem" : "0.76rem",
                      }}
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomVerb(v)}
                        style={{
                          marginLeft: 4,
                          padding: "2px 6px",
                          border: "none",
                          background: "transparent",
                          color: "#c62828",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 精度向上のための説明 */}
            <section style={{ marginTop: 16 }}>
              <div
                style={{
                  background: "#fff5f5",
                  borderRadius: 12,
                  padding: isMobile ? 12 : 14,
                  border: "1px solid #ffe0e0",
                }}
              >
                <h4
                  style={{
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    fontWeight: 600,
                    marginBottom: 6,
                    color: "#c62828",
                  }}
                >
                  精度を上げたい方へ
                </h4>
                <p
                  style={{
                    fontSize: isMobile ? "0.7rem" : "0.75rem",
                    lineHeight: 1.6,
                    color: "#555",
                    margin: 0,
                  }}
                >
                  精度を上げたい方は、上の選択だけでなく下の"自由入力（動詞追加）"もおすすめです。
                  あなた固有の経験が反映され、診断の納得感が上がります。
                </p>
            </div>
            </section>

            {/* 資格・スキル */}
            <section style={{ marginTop: 16 }}>
              <h3
                style={{
                  fontSize: isMobile ? "0.82rem" : "0.88rem",
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "#c62828",
                }}
              >
                資格・スキル（任意）
              </h3>
              <p
                style={{
                  fontSize: isMobile ? "0.68rem" : "0.72rem",
                  marginBottom: 6,
                  color: "#777",
                }}
              >
                例：TOEIC, 営業経験, アルバイト, 
              </p>
              <input
                type="text"
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="例：英検2級, TOEIC650, 日商簿記3級, Python, 営業経験"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 999,
                  border: "1px solid #e0e0e0",
                  fontSize: isMobile ? "0.75rem" : "0.8rem",
                  background: "#ffffff",
                }}
              />
            </section>

            {/* 興味のある職業・業種 */}
            <section style={{ marginTop: 12 }}>
              <h3
                style={{
                  fontSize: isMobile ? "0.82rem" : "0.88rem",
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "#c62828",
                }}
              >
                興味のある業種（任意）
              </h3>
              <p
                style={{
                  fontSize: isMobile ? "0.68rem" : "0.72rem",
                  marginBottom: 6,
                  color: "#777",
                }}
              >
                例：企画, IT, 教育, コンサル など
              </p>
              <input
                type="text"
                onChange={(e) => handleInterestsChange(e.target.value)}
                placeholder="例：企画, IT, 教育, コンサル"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 999,
                  border: "1px solid #e0e0e0",
                  fontSize: isMobile ? "0.75rem" : "0.8rem",
                  background: "#ffffff",
                }}
              />
            </section>

            {/* 過去の経験 */}
            <section style={{ marginTop: 16 }}>
              <h3
                style={{
                  fontSize: isMobile ? "0.82rem" : "0.88rem",
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "#c62828",
                }}
              >
                過去の経験（任意）
              </h3>
              <p
                style={{
                  fontSize: isMobile ? "0.68rem" : "0.72rem",
                  marginBottom: 6,
                  color: "#777",
                  lineHeight: 1.5,
                }}
              >
                これまでの経験を具体的に書くほど分析精度が上がります（バイト/部活/留学/趣味/挫折/表彰など）
              </p>
              <textarea
                value={experienceText}
                onChange={(e) => setExperienceText(e.target.value)}
                placeholder="例：飲食バイトで新人教育を担当、SNSで発信しフォロワー増、部活で主将、留学準備で英語学習を継続、など"
                rows={4}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 12,
                  border: "1px solid #e0e0e0",
                  fontSize: isMobile ? "0.75rem" : "0.8rem",
                  background: "#ffffff",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            <button
              type="button"
                onClick={handleFollowupGenerate}
                disabled={!experienceText.trim() || loadingFollowup}
                style={{
                  marginTop: 8,
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid #c62828",
                  background: loadingFollowup || !experienceText.trim() ? "#ffcdd2" : "#ffffff",
                  color: "#c62828",
                  fontSize: isMobile ? "0.75rem" : "0.8rem",
                  fontWeight: 600,
                  cursor: loadingFollowup || !experienceText.trim() ? "not-allowed" : "pointer",
                }}
              >
                {loadingFollowup ? "生成中..." : "AIに深掘り質問を作ってもらう"}
              </button>
              {followupQuestions.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {followupQuestions.map((item) => (
                    <div key={item.id} style={{ marginBottom: 12 }}>
                      <p
                        style={{
                          fontSize: isMobile ? "0.72rem" : "0.78rem",
                          fontWeight: 600,
                          marginBottom: 4,
                          color: "#333",
                        }}
                      >
                        {item.q}
                      </p>
                      <input
                        type="text"
                        value={item.a}
                        onChange={(e) => updateFollowupAnswer(item.id, e.target.value)}
                        placeholder="回答を入力（任意）"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid #e0e0e0",
                          fontSize: isMobile ? "0.72rem" : "0.76rem",
                          background: "#ffffff",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              type="button"
              disabled={allVerbs.length < 10 || allVerbs.length > MAX_SELECTION || loading}
              onClick={submit}
              style={
                allVerbs.length < 10 || allVerbs.length > MAX_SELECTION || loading
                  ? { ...buttonDisabledStyle, width: "100%", marginTop: 16 }
                  : { ...buttonStyle, width: "100%", marginTop: 16 }
              }
            >
              {loading ? "分析中..." : "AI診断を実行する"}
            </button>

            {/* ローディング画面 */}
            {loading && (
              <>
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  .loading-spinner {
                    animation: spin 1s linear infinite;
                  }
                `}} />
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255, 255, 255, 0.95)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    gap: 20,
                  }}
                >
                  <div
                    className="loading-spinner"
                    style={{
                      width: 50,
                      height: 50,
                      border: "4px solid #ffe0e0",
                      borderTop: "4px solid #c62828",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      color: "#c62828",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>あなたの選択と経験を分析しています…</div>
                    <div style={{ marginBottom: 8 }}>C/L/Tバランスを計算中…</div>
                    <div>おすすめの業種・趣味を生成中…</div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p
                style={{
                  marginTop: 12,
                  color: "#c62828",
                  fontSize: isMobile ? "0.72rem" : "0.78rem",
                }}
              >
                {error}
              </p>
            )}
          </section>

          {/* グラフカード（入力フォームの下に配置） */}
          {response && analysis && (
            <section
              id="result"
              style={{
                ...cardStyle,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    fontSize: isMobile ? "0.95rem" : "1.05rem",
                    fontWeight: 700,
                    color: "#c62828",
                  }}
                >
                  あなたのタイプ分析（C / L / T 分布）
                </h2>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid #c62828",
                    background: "#ffffff",
                    color: "#c62828",
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  PDFとして保存
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  flexWrap: "wrap",
                  gap: 24,
                  alignItems: isMobile ? "center" : "flex-start",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: isMobile ? 200 : 240,
                    height: isMobile ? 200 : 240,
                    margin: "0 auto",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: `conic-gradient(
                        #e53935 0% ${cEnd}%,
                        #ff7043 ${cEnd}% ${lEnd}%,
                        #ffb74d ${lEnd}% ${tEnd}%
                      )`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: "20%",
                      borderRadius: "50%",
                      background: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile ? "0.65rem" : "0.7rem",
                        color: "#666",
                        marginBottom: 4,
                      }}
                    >
                      バランス
                    </div>
                      <div
                        style={{
                        fontSize: isMobile ? "0.6rem" : "0.65rem",
                        color: "#999",
                      }}
                    >
                      合計: {clt?.total || 0}個
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: isMobile ? "100%" : 200 }}>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      fontSize: isMobile ? "0.8rem" : "0.85rem",
                    }}
                  >
                    <li style={{ marginBottom: 10, display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#e53935",
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 600, marginRight: 6 }}>C（Communication）</span>
                      <span style={{ color: "#c62828", fontWeight: 700 }}>{ratio.C}%</span>
                    </li>
                    <li style={{ marginBottom: 10, display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#ff7043",
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 600, marginRight: 6 }}>L（Leadership）</span>
                      <span style={{ color: "#c62828", fontWeight: 700 }}>{ratio.L}%</span>
                    </li>
                    <li style={{ marginBottom: 10, display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#ffb74d",
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 600, marginRight: 6 }}>T（Thinking）</span>
                      <span style={{ color: "#c62828", fontWeight: 700 }}>{ratio.T}%</span>
                    </li>
                  </ul>

                  {analysis?.clt_summary?.tendency_text && (
                    <div
                      style={{
                        marginTop: 16,
                        fontSize: isMobile ? "0.72rem" : "0.78rem",
                        lineHeight: 1.6,
                        background: "#fff5f5",
                        borderRadius: 12,
                        padding: 12,
                        border: "1px solid #ffe0e0",
                      }}
                    >
                      {analysis.clt_summary.tendency_text}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 結果詳細 */}
          {response && analysis && (
            <>
              {/* おすすめ業種 */}
              <section style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontSize: isMobile ? "0.88rem" : "0.95rem",
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "#c62828",
                  }}
                >
                  あなたに向いていそうな業種（抽象レベル・3件）
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                  }}
                >
                  {recommended.slice(0, 3).map((industry: any, idx: number) => (
                    <article
                      key={idx}
                      style={{
                        ...cardStyle,
                        background: "#fffdfd",
                      }}
                    >
                      <div
                        style={{
                          fontSize: isMobile ? "0.72rem" : "0.78rem",
                          color: "#c62828",
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        候補 {idx + 1} {industry.matchScore && `（適合度: ${industry.matchScore}%）`}
                      </div>
                      <h4
                        style={{
                          fontSize: isMobile ? "0.88rem" : "0.95rem",
                          fontWeight: 700,
                          marginBottom: 4,
                          color: "#b71c1c",
                        }}
                      >
                        {industry.name || industry.industry}
                      </h4>
                      {(industry.reason || industry.why_fit) && (
                        <p
                          style={{
                            fontSize: isMobile ? "0.72rem" : "0.78rem",
                            marginTop: 8,
                            lineHeight: 1.6,
                            color: "#333",
                          }}
                        >
                          あなたに合いそうな理由：{industry.reason || industry.why_fit}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              {/* 向いていない業種 */}
              {mismatchIndustries.length > 0 && (
                <section style={{ marginBottom: 20 }}>
                  <h3
                    style={{
                      fontSize: isMobile ? "0.88rem" : "0.95rem",
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#c62828",
                    }}
                  >
                    現時点ではストレスを感じやすい可能性がある業種（最大3件）
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {mismatchIndustries.slice(0, 3).map((industry: any, idx: number) => (
                      <article
                        key={idx}
                        style={{
                          ...cardStyle,
                          background: "#fffafa",
                          border: "1px solid #ffcccc",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: isMobile ? "0.88rem" : "0.95rem",
                            fontWeight: 700,
                            marginBottom: 6,
                            color: "#b71c1c",
                          }}
                        >
                          {industry.industry}
                        </h4>
                        {industry.reason && (
                          <p
                            style={{
                              fontSize: isMobile ? "0.72rem" : "0.78rem",
                              lineHeight: 1.6,
                              color: "#555",
                              marginBottom: 12,
                            }}
                          >
                            {industry.reason}
                          </p>
                        )}
                        {industry.solution && (
                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop: "1px dashed #ffcccc",
                            }}
                          >
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginBottom: 6,
                                color: "#c62828",
                              }}
                            >
                              対策（こうすると改善できます）
                            </p>
                            {industry.solution.shortTerm && (
                              <p
                                style={{
                                  fontSize: isMobile ? "0.7rem" : "0.76rem",
                                  lineHeight: 1.6,
                                  color: "#555",
                                  marginBottom: 4,
                                }}
                              >
                                <strong>短期:</strong> {industry.solution.shortTerm}
                              </p>
                            )}
                            {industry.solution.mediumTerm && (
                              <p
                                style={{
                                  fontSize: isMobile ? "0.7rem" : "0.76rem",
                                  lineHeight: 1.6,
                                  color: "#555",
                                }}
                              >
                                <strong>中期:</strong> {industry.solution.mediumTerm}
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* C/L/Tを伸ばすためのおすすめ行動 */}
              {actionTips && (actionTips.C || actionTips.L || actionTips.T) && (
                <section style={{ marginBottom: 20 }}>
                  <h3
                    style={{
                      fontSize: isMobile ? "0.88rem" : "0.95rem",
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#c62828",
                    }}
                  >
                    C/L/Tを伸ばすためのおすすめ行動（各1つ）
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {actionTips.C && (
                      <article
                        style={{
                          ...cardStyle,
                          background: "#fffdfd",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: isMobile ? "0.88rem" : "0.95rem",
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "#b71c1c",
                          }}
                        >
                          C（Communication）を伸ばす
                        </h4>
                        <p
                          style={{
                            fontSize: isMobile ? "0.72rem" : "0.78rem",
                            lineHeight: 1.6,
                            color: "#333",
                            marginBottom: 6,
                          }}
                        >
                          <strong>行動:</strong> {actionTips.C.split(" / ")[0] || actionTips.C}
                        </p>
                        {actionTips.C.includes(" / ") && (
                          <p
                            style={{
                              fontSize: isMobile ? "0.7rem" : "0.76rem",
                              lineHeight: 1.6,
                              color: "#666",
                            }}
                          >
                            <strong>補足:</strong> {actionTips.C.split(" / ")[1]}
                          </p>
                        )}
                      </article>
                    )}
                    {actionTips.L && (
                      <article
                        style={{
                          ...cardStyle,
                          background: "#fffdfd",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: isMobile ? "0.88rem" : "0.95rem",
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "#b71c1c",
                          }}
                        >
                          L（Leadership）を伸ばす
                        </h4>
                        <p
                          style={{
                            fontSize: isMobile ? "0.72rem" : "0.78rem",
                            lineHeight: 1.6,
                            color: "#333",
                            marginBottom: 6,
                          }}
                        >
                          <strong>行動:</strong> {actionTips.L.split(" / ")[0] || actionTips.L}
                        </p>
                        {actionTips.L.includes(" / ") && (
                          <p
                            style={{
                              fontSize: isMobile ? "0.7rem" : "0.76rem",
                              lineHeight: 1.6,
                              color: "#666",
                            }}
                          >
                            <strong>補足:</strong> {actionTips.L.split(" / ")[1]}
                          </p>
                        )}
                      </article>
                    )}
                    {actionTips.T && (
                      <article
                        style={{
                          ...cardStyle,
                          background: "#fffdfd",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: isMobile ? "0.88rem" : "0.95rem",
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "#b71c1c",
                          }}
                        >
                          T（Thinking）を伸ばす
                        </h4>
                        <p
                          style={{
                            fontSize: isMobile ? "0.72rem" : "0.78rem",
                            lineHeight: 1.6,
                            color: "#333",
                            marginBottom: 6,
                          }}
                        >
                          <strong>行動:</strong> {actionTips.T.split(" / ")[0] || actionTips.T}
                        </p>
                        {actionTips.T.includes(" / ") && (
                          <p
                            style={{
                              fontSize: isMobile ? "0.7rem" : "0.76rem",
                              lineHeight: 1.6,
                              color: "#666",
                            }}
                          >
                            <strong>補足:</strong> {actionTips.T.split(" / ")[1]}
                          </p>
                        )}
                      </article>
                    )}
                  </div>
                </section>
              )}

              {/* 強み・弱み */}
              <section style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontSize: isMobile ? "0.88rem" : "0.95rem",
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "#c62828",
                  }}
                >
                  あなたの強みと弱み（複数の視点から）
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div style={cardStyle}>
                    <h4
                      style={{
                        fontSize: isMobile ? "0.82rem" : "0.88rem",
                        fontWeight: 700,
                        marginBottom: 8,
                        color: "#c62828",
                      }}
                    >
                      強み
                    </h4>
                    {strengths ? (
                      <>
                        {strengths.interpersonal && (
                          <>
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                            >
                              対人面
                            </p>
                            <ul
                              style={{
                                paddingLeft: 16,
                                margin: 0,
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                marginBottom: 8,
                              }}
                            >
                              {strengths.interpersonal.map(
                                (s: string, i: number) => (
                                  <li key={i} style={{ marginBottom: 2 }}>
                                    {s}
                                  </li>
                                )
                              )}
                            </ul>
                          </>
                        )}
                        {strengths.thinking && (
                          <>
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginTop: 8,
                                marginBottom: 4,
                              }}
                            >
                              思考面
                            </p>
                            <ul
                              style={{
                                paddingLeft: 16,
                                margin: 0,
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                marginBottom: 8,
                              }}
                            >
                              {strengths.thinking.map(
                                (s: string, i: number) => (
                                  <li key={i} style={{ marginBottom: 2 }}>
                                    {s}
                                  </li>
                                )
                              )}
                            </ul>
                          </>
                        )}
                        {strengths.action && (
                          <>
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginTop: 8,
                                marginBottom: 4,
                              }}
                            >
                              行動面
                            </p>
                            <ul
                              style={{
                                paddingLeft: 16,
                                margin: 0,
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                              }}
                            >
                              {strengths.action.map((s: string, i: number) => (
                                <li key={i} style={{ marginBottom: 2 }}>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize: isMobile ? "0.72rem" : "0.78rem" }}>
                        データが取得できませんでした。
                      </p>
                    )}
                  </div>

                  <div style={cardStyle}>
                    <h4
                      style={{
                        fontSize: isMobile ? "0.82rem" : "0.88rem",
                        fontWeight: 700,
                        marginBottom: 8,
                        color: "#333",
                      }}
                    >
                      弱み・注意ポイント
                    </h4>
                    {weaknesses ? (
                      <>
                        {weaknesses.interpersonal && (
                          <>
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginBottom: 4,
                              }}
                            >
                              対人面
                            </p>
                            <ul
                              style={{
                                paddingLeft: 16,
                                margin: 0,
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                marginBottom: 8,
                              }}
                            >
                              {weaknesses.interpersonal.map(
                                (s: string, i: number) => (
                                  <li key={i} style={{ marginBottom: 2 }}>
                                    {s}
                                  </li>
                                )
                              )}
                            </ul>
                          </>
                        )}
                        {weaknesses.thinking && (
                          <>
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginTop: 8,
                                marginBottom: 4,
                              }}
                            >
                              思考面
                            </p>
                            <ul
                              style={{
                                paddingLeft: 16,
                                margin: 0,
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                marginBottom: 8,
                              }}
                            >
                              {weaknesses.thinking.map(
                                (s: string, i: number) => (
                                  <li key={i} style={{ marginBottom: 2 }}>
                                    {s}
                                  </li>
                                )
                              )}
                            </ul>
                          </>
                        )}
                        {weaknesses.action && (
                          <>
                            <p
                              style={{
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                                fontWeight: 600,
                                marginTop: 8,
                                marginBottom: 4,
                              }}
                            >
                              行動面
                            </p>
                            <ul
                              style={{
                                paddingLeft: 16,
                                margin: 0,
                                fontSize: isMobile ? "0.72rem" : "0.78rem",
                              }}
                            >
                              {weaknesses.action.map((s: string, i: number) => (
                                <li key={i} style={{ marginBottom: 2 }}>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize: isMobile ? "0.72rem" : "0.78rem" }}>
                        データが取得できませんでした。
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* 経験からの根拠 */}
              {analysis?.experience_insights &&
                analysis.experience_insights.length > 0 && (
                  <section style={{ marginBottom: 20 }}>
                    <h3
                      style={{
                        fontSize: isMobile ? "0.88rem" : "0.95rem",
                        fontWeight: 600,
                        marginBottom: 12,
                        color: "#c62828",
                      }}
                    >
                      経験から読み取れる強み（根拠）
                    </h3>
                    <div style={cardStyle}>
                      <ul
                        style={{
                          paddingLeft: 16,
                          margin: 0,
                          fontSize: isMobile ? "0.72rem" : "0.78rem",
                        }}
                      >
                        {analysis.experience_insights.map(
                          (item: any, i: number) => (
                            <li
                              key={i}
                              style={{
                                marginBottom: 12,
                                lineHeight: 1.6,
                                listStyle: "disc",
                              }}
                            >
                              <strong>{item.experience || "経験"}</strong>
                              {" → "}
                              {item.insight || "示唆"}
                              {" → "}
                              <span style={{ color: "#c62828" }}>
                                {item.suitable_role || "向く役割"}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </section>
                )}

              {/* 現状の傾向であることを強調する注記 */}
              {response && analysis && (
                <section style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      ...cardStyle,
                      background: "#fff5f5",
                      border: "1px solid #ffe0e0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "0.72rem" : "0.78rem",
                        lineHeight: 1.8,
                        color: "#555",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      この分析結果は、あなたの「現時点での選択・経験」に基づいた傾向です。
                      <br />
                      経験や行動が変わることで、C/L/Tバランスも変化していきます。
                    </p>
                  </div>
                </section>
              )}

              {/* タイプ説明カード（固定） */}
              <section>
                <h3
                  style={{
                    fontSize: isMobile ? "0.88rem" : "0.95rem",
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "#c62828",
                  }}
                >
                  タイプについて
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      ...cardStyle,
                      background: "#fffafa",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "#c62828",
                      }}
                    >
                      C - コミュニケーション型
                    </h4>
                    <p
                      style={{
                        fontSize: isMobile ? "0.72rem" : "0.78rem",
                        lineHeight: 1.6,
                      }}
                    >
                      人と関わることや、周囲との対話を通じて力を発揮するタイプ。
                      チームでの協働や、相手の気持ちに寄り添った関係づくりが得意です。
                    </p>
                  </div>
                  <div
                    style={{
                      ...cardStyle,
                      background: "#fffafa",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "#c62828",
                      }}
                    >
                      L - リーダーシップ型
                    </h4>
                    <p
                      style={{
                        fontSize: isMobile ? "0.72rem" : "0.78rem",
                        lineHeight: 1.6,
                      }}
                    >
                      目標を掲げて行動したり、決断して前に進めることが得意なタイプ。
                      プロジェクト推進やチームをまとめる役割で力を発揮しやすいです。
                    </p>
                  </div>
                  <div
                    style={{
                      ...cardStyle,
                      background: "#fffafa",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        fontWeight: 700,
                        marginBottom: 6,
                        color: "#c62828",
                      }}
                    >
                      T - 思考・分析型
                    </h4>
                    <p
                      style={{
                        fontSize: isMobile ? "0.72rem" : "0.78rem",
                        lineHeight: 1.6,
                      }}
                    >
                      情報を整理したり、じっくり考えて仕組みを作ることが得意なタイプ。
                      データ分析や企画立案、ロジックを組む仕事で活躍しやすいです。
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
