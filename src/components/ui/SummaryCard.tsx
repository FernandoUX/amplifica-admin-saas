"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";

type SubColor = "green" | "blue" | "red" | "amber" | "neutral";

interface SummaryCardProps {
  title: string;
  value: ReactNode;
  sub?: string;
  subColor?: SubColor;
  icon: ReactNode;
}

const subBadgeClass: Record<SubColor, string> = {
  green:   "bg-emerald-50 text-emerald-700",
  blue:    "bg-blue-50 text-blue-700",
  red:     "bg-red-50 text-red-700",
  amber:   "bg-amber-50 text-amber-700",
  neutral: "bg-neutral-100 text-neutral-500",
};

/** Parse a display value like "$7.003.500" or "29" into { prefix, number, suffix } */
function parseNumericValue(val: ReactNode): { prefix: string; number: number; suffix: string; formatted: (n: number) => string } | null {
  if (typeof val !== "string" && typeof val !== "number") return null;
  const str = String(val);
  const match = str.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  // Detect Chilean format (dots as thousand separators)
  const isChilean = numStr.includes(".") && !numStr.includes(",");
  const cleaned = numStr.replace(/\./g, "").replace(/,/g, ".");
  const number = parseFloat(cleaned);
  if (isNaN(number)) return null;
  return {
    prefix,
    number,
    suffix,
    formatted: (n: number) => {
      const rounded = Math.round(n);
      if (isChilean) return rounded.toLocaleString("es-CL");
      return String(rounded);
    },
  };
}

function AnimatedValue({ value }: { value: ReactNode }) {
  const parsed = parseNumericValue(value);
  const [display, setDisplay] = useState(parsed ? 0 : null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!parsed) return;
    const duration = 600; // ms
    const target = parsed.number;
    startRef.current = performance.now();
    setDisplay(0);

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [parsed?.number]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!parsed || display === null) {
    return <>{value}</>;
  }

  return <>{parsed.prefix}{parsed.formatted(display)}{parsed.suffix}</>;
}

export default function SummaryCard({ title, value, sub, subColor = "neutral", icon }: SummaryCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-base font-semibold text-neutral-600 truncate">{title}</p>
        <span className="text-neutral-400">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-semibold text-neutral-900 leading-tight">
          <AnimatedValue value={value} />
        </div>
        {sub && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium mt-1.5 ${subBadgeClass[subColor]}`}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
