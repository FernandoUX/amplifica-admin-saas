"use client";
import { useState, useRef, useEffect } from "react";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const DAYS_ES = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function DatePicker({
  label,
  value,
  onChange,
  required,
  error,
  disabled,
  placeholder = "Seleccionar fecha",
}: DatePickerProps) {
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const formatDisplay = (d: Date) =>
    d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

  // Build calendar cells
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevDays - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: "cur" });
  let nd = 1;
  while (cells.length % 7 !== 0) cells.push({ day: nd++, month: "next" });

  const selectDay = (cell: (typeof cells)[0]) => {
    if (cell.month !== "cur") return;
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(cell.day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((v) => v - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((v) => v + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isSelected = (cell: (typeof cells)[0]) => {
    if (!parsed || cell.month !== "cur") return false;
    return (
      parsed.getDate() === cell.day &&
      parsed.getMonth() === viewMonth &&
      parsed.getFullYear() === viewYear
    );
  };
  const isToday = (cell: (typeof cells)[0]) => {
    if (cell.month !== "cur") return false;
    return (
      today.getDate() === cell.day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  return (
    <div className="relative flex flex-col gap-1" ref={ref}>
      {label && (
        <label className="text-xs font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`h-[44px] w-full flex items-center justify-between rounded-lg border px-3 text-sm text-left transition-colors outline-none focus:ring-2 focus:ring-primary-100 ${
          error ? "border-red-400" : "border-neutral-300"
        } ${parsed ? "text-neutral-900" : "text-neutral-400"} ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary-400"
        }`}
      >
        <span>{parsed ? formatDisplay(parsed) : placeholder}</span>
        <IconCalendar size={15} strokeWidth={1.75} className="text-neutral-400 shrink-0" />
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border border-neutral-200 bg-white shadow-xl p-3 w-[280px]">
          {/* Header with month/year selectors */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <IconChevronLeft size={14} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-sm font-semibold text-neutral-800 bg-transparent border-none outline-none cursor-pointer hover:text-primary-600 transition-colors appearance-none pr-0 pl-0 text-center"
              >
                {MONTHS_ES.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-sm font-semibold text-neutral-800 bg-transparent border-none outline-none cursor-pointer hover:text-primary-600 transition-colors appearance-none pr-0 pl-0 text-center"
              >
                {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <IconChevronRight size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_ES.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-neutral-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, i) => {
              const sel = isSelected(cell);
              const tod = isToday(cell);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(cell)}
                  disabled={cell.month !== "cur"}
                  className={`relative flex flex-col items-center justify-center h-8 w-8 mx-auto rounded-full text-xs transition-colors ${
                    sel
                      ? "bg-primary-500 text-white font-semibold"
                      : cell.month !== "cur"
                      ? "text-neutral-300 cursor-default"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {cell.day}
                  {tod && !sel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
