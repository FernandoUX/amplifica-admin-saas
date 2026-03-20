"use client";

export type Period = 30 | 60 | 90;

const OPTIONS: { label: string; value: Period }[] = [
  { label: "30 días", value: 30 },
  { label: "60 días", value: 60 },
  { label: "90 días", value: 90 },
];

interface PeriodFilterProps {
  value: Period;
  onChange: (v: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex w-full sm:inline-flex sm:w-auto items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 gap-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 sm:flex-none h-7 px-3 rounded-md text-xs font-medium transition-all duration-150 ${
            value === opt.value
              ? "bg-white text-neutral-900 shadow-sm"
              : "period-tab-inactive hover:period-tab-inactive-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Compara conteo actual vs período anterior y devuelve string "+ X%" o "— X%" */
export function calcGrowth(current: number, previous: number): { label: string; color: "green" | "red" | "neutral" } {
  if (previous === 0 && current === 0) return { label: "sin datos", color: "neutral" };
  if (previous === 0) return { label: `+${current} nuevos`, color: "green" };
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return {
    label: `${sign}${pct.toFixed(1)}% vs período anterior`,
    color: pct > 0 ? "green" : pct < 0 ? "red" : "neutral",
  };
}

/** Filtra un array por fechaCreacion dentro de [from, to) */
export function filterByPeriod<T extends { fechaCreacion: string }>(
  items: T[],
  daysFrom: number,
  daysTo: number = 0,
  today: Date = new Date("2026-03-16")
): T[] {
  const from = new Date(today);
  from.setDate(from.getDate() - daysFrom);
  const to = new Date(today);
  to.setDate(to.getDate() - daysTo);
  return items.filter((item) => {
    const d = new Date(item.fechaCreacion);
    return d >= from && d < to;
  });
}
