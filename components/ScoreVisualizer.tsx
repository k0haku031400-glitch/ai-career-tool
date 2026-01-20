"use client";

import { useMemo } from "react";

type CLTScore = {
  C: number;
  L: number;
  T: number;
};

type ScoreVisualizerProps = {
  currentScore: CLTScore;
  previousScore?: CLTScore | null;
  size?: number;
  showComparison?: boolean;
};

export default function ScoreVisualizer({
  currentScore,
  previousScore = null,
  size = 300,
  showComparison = true,
}: ScoreVisualizerProps) {
  const center = size / 2;
  const radius = size * 0.4; // チャートの半径

  // レーダーチャート用のポイントを計算
  const calculatePoints = (scores: CLTScore) => {
    return ["C", "L", "T"].map((label, i) => {
      const angle = (i * 120 - 90) * (Math.PI / 180); // 120度間隔で配置
      const r = (scores[label as keyof CLTScore] / 100) * radius;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return { x, y, label, value: scores[label as keyof CLTScore] };
    });
  };

  const currentPoints = useMemo(
    () => calculatePoints(currentScore),
    [currentScore]
  );

  const previousPoints = useMemo(
    () => (previousScore ? calculatePoints(previousScore) : null),
    [previousScore]
  );

  // ポリゴンのポイント文字列を生成
  const polygonPoints = (points: typeof currentPoints) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  // 軸ラベルの位置を計算
  const getAxisLabelPosition = (label: string, index: number) => {
    const angle = (index * 120 - 90) * (Math.PI / 180);
    const r = radius + 30; // ラベルの位置
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return { x, y, angle };
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto"
      >
        {/* グリッド線（同心円） */}
        {[0, 25, 50, 75, 100].map((value) => (
          <circle
            key={value}
            cx={center}
            cy={center}
            r={(value / 100) * radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={value === 0 ? 0 : 1}
            opacity={value === 0 ? 0 : 0.5}
          />
        ))}

        {/* 軸線（3本の線） */}
        {["C", "L", "T"].map((label, i) => {
          const angle = (i * 120 - 90) * (Math.PI / 180);
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <g key={label}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth={1}
                opacity={0.6}
              />
              {/* 軸ラベル */}
              <text
                x={center + Math.cos(angle) * (radius + 25)}
                y={center + Math.sin(angle) * (radius + 25)}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#0f172a"
                className="font-bold"
              >
                {label}
              </text>
              {/* パーセンテージラベル（外側） */}
              {[25, 50, 75, 100].map((value) => {
                const r = (value / 100) * radius;
                const labelX = center + Math.cos(angle) * (r + 15);
                const labelY = center + Math.sin(angle) * (r + 15);
                return (
                  <text
                    key={value}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#94a3b8"
                    opacity={0.6}
                  >
                    {value}%
                  </text>
                );
              })}
            </g>
          );
        })}

        {/* 前回のデータ（点線） */}
        {showComparison && previousPoints && (
          <>
            <polygon
              points={polygonPoints(previousPoints)}
              fill="rgba(239, 68, 68, 0.08)"
              stroke="rgba(239, 68, 68, 0.5)"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            {/* 前回のデータポイント */}
            {previousPoints.map((point, i) => (
              <circle
                key={`prev-${i}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgba(239, 68, 68, 0.5)"
              />
            ))}
          </>
        )}

        {/* 今回のデータ（実線） */}
        <polygon
          points={polygonPoints(currentPoints)}
          fill="rgba(198, 40, 40, 0.15)"
          stroke="#c62828"
          strokeWidth={3}
        />
        {/* 今回のデータポイント */}
        {currentPoints.map((point, i) => (
          <circle
            key={`current-${i}`}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="#c62828"
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
      </svg>

      {/* 中央の数値表示 */}
      <div
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="text-xs text-slate-500 mb-1">バランス</div>
        <div className="text-xs text-slate-400">
          C: {currentScore.C}% / L: {currentScore.L}% / T: {currentScore.T}%
        </div>
      </div>
    </div>
  );
}
