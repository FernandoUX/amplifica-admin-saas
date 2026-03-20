import type { ReactNode } from "react";

type DeltaColor = "green" | "blue" | "red" | "amber" | "neutral";

type StatsCardProps = {
  title: string;
  value: string;
  delta: {
    value: string;
    label: string;
    color?: DeltaColor;
  };
  icon: ReactNode;
  sparkline?: number[];
};

const deltaClass: Record<DeltaColor, string> = {
  green:   "delta-green",
  blue:    "delta-blue",
  red:     "delta-red",
  amber:   "delta-amber",
  neutral: "delta-neutral",
};

function MiniSparkline({ data, color = "#4548FF" }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace("#", "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatsCard({ title, value, delta, icon, sparkline }: StatsCardProps) {
  const cls = deltaClass[delta.color ?? "green"];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-800">{title}</span>
        <span className="text-neutral-400">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[1.75rem] font-bold text-neutral-900 leading-tight tracking-tight truncate">
            {value}
          </span>
          <span className={`text-xs font-medium ${cls}`}>
            {delta.value} {delta.label}
          </span>
        </div>
        {sparkline && sparkline.length > 0 && (
          <MiniSparkline data={sparkline} color={delta.color === "blue" ? "#4548FF" : delta.color === "red" ? "#ef4444" : "#10b981"} />
        )}
      </div>
    </div>
  );
}
