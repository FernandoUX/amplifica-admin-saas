"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IconChevronLeft, IconChevronRight, IconCalendar } from "@tabler/icons-react";

const DAY_ABBR = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MONTH_ABBR = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d} ${MONTH_ABBR[parseInt(m) - 1]} ${y}`;
}

interface Props {
  startDate: string;  // "YYYY-MM-DD" or ""
  endDate: string;    // "YYYY-MM-DD" or ""
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: Props) {
  const now = new Date();
  const initLeft = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const initLeftYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [leftMonth, setLeftMonth] = useState(initLeft);
  const [leftYear, setLeftYear] = useState(initLeftYear);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pickingEnd, setPickingEnd] = useState(false);

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    const popH = mobile ? 280 : 340;
    const spaceBelow = window.innerHeight - r.bottom;
    const top = spaceBelow < popH + 8
      ? r.top + window.scrollY - popH - 4
      : r.bottom + window.scrollY + 4;
    if (mobile) {
      setPos({ top, left: 16, width: window.innerWidth - 32 });
    } else {
      setPos({ top, left: r.left + window.scrollX });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPos();
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, calcPos]);

  const handleDay = (ds: string) => {
    if (!pickingEnd || !startDate) {
      // start fresh selection
      onStartChange(ds);
      onEndChange("");
      setPickingEnd(true);
    } else {
      if (ds < startDate) {
        onEndChange(startDate);
        onStartChange(ds);
      } else if (ds === startDate) {
        // same day, keep as single point
        onEndChange("");
      } else {
        onEndChange(ds);
        setOpen(false);
      }
      setPickingEnd(false);
    }
  };

  const isStart = (d: string) => d === startDate;
  const isEnd   = (d: string) => d === endDate;
  const isSel   = (d: string) => isStart(d) || isEnd(d);

  const isInRange = (d: string) => {
    const lo = startDate;
    const hi = endDate || (pickingEnd && hover ? hover : "");
    if (!lo || !hi || lo === hi) return false;
    const [a, b] = lo < hi ? [lo, hi] : [hi, lo];
    return d > a && d < b;
  };

  const isRangeStart = (d: string) => {
    if (!startDate) return false;
    const hi = endDate || (pickingEnd && hover ? hover : "");
    return d === (hi && startDate > hi ? hi : startDate);
  };

  const isRangeEnd = (d: string) => {
    if (!startDate) return false;
    const hi = endDate || (pickingEnd && hover ? hover : "");
    if (!hi || hi === startDate) return false;
    return d === (startDate > hi ? startDate : hi);
  };

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
    else setLeftMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
    else setLeftMonth(m => m + 1);
  };

  const renderGrid = (year: number, month: number, fullWidth = false) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = new Date(year, month, 1).getDay();

    const cells: React.ReactNode[] = [];
    for (let i = 0; i < firstDow; i++) {
      cells.push(<div key={`e${i}`} className={fullWidth ? "h-9" : "h-8 w-8"} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = toStr(year, month, d);
      const sel = isSel(ds);
      const inRange = isInRange(ds);
      const rangeStart = isRangeStart(ds);
      const rangeEnd = isRangeEnd(ds);

      cells.push(
        <div
          key={d}
          className={`relative flex items-center justify-center
            ${fullWidth ? "h-9" : "h-8 w-8"}
            ${inRange ? "bg-neutral-100" : ""}
            ${rangeStart ? "rounded-l-full" : ""}
            ${rangeEnd ? "rounded-r-full" : ""}
          `}
        >
          <button
            type="button"
            onClick={() => handleDay(ds)}
            onMouseEnter={() => setHover(ds)}
            onMouseLeave={() => setHover(null)}
            className={`${fullWidth ? "h-9 w-9" : "h-8 w-8"} flex items-center justify-center text-sm rounded-full transition-colors z-10 relative
              ${sel
                ? "bg-neutral-900 text-white font-semibold"
                : "text-neutral-700 hover:bg-neutral-200"
              }
            `}
          >
            {d}
          </button>
        </div>
      );
    }

    return (
      <div className={fullWidth ? "w-full" : "w-[196px]"}>
        <div className="grid grid-cols-7 mb-1">
          {DAY_ABBR.map(h => (
            <div key={h} className={`${fullWidth ? "h-8" : "h-7 w-8"} flex items-center justify-center text-xs text-neutral-400 font-medium`}>
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells}
        </div>
      </div>
    );
  };

  const hasDates = startDate || endDate;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setPickingEnd(!!(startDate && !endDate));
          setOpen(v => !v);
        }}
        className="inline-flex items-center gap-1.5 h-[44px] rounded-lg border border-neutral-300 px-3 text-sm bg-white hover:border-neutral-400 transition-colors"
      >
        <IconCalendar size={14} className="text-neutral-400 shrink-0" />
        <span className={startDate ? "text-neutral-700" : "text-neutral-400"}>
          {startDate ? formatDisplay(startDate) : "Desde"}
        </span>
        <span className="text-neutral-300 px-0.5">→</span>
        <span className={endDate ? "text-neutral-700" : "text-neutral-400"}>
          {endDate ? formatDisplay(endDate) : "Hasta"}
        </span>
      </button>

      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          className="fixed z-[9999] bg-white rounded-2xl border border-neutral-200 shadow-xl p-5"
          style={{ top: pos.top - window.scrollY, left: pos.left - window.scrollX, ...(pos.width ? { width: pos.width } : {}) }}
        >
          {/* Month navigation header */}
          <div className="flex items-center mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <IconChevronLeft size={16} />
            </button>
            <div className="flex flex-1 justify-around px-2">
              <span className="text-sm font-semibold text-neutral-800">
                {MONTHS_ES[leftMonth]} {leftYear}
              </span>
              {!isMobile && (
                <span className="text-sm font-semibold text-neutral-800">
                  {MONTHS_ES[rightMonth]} {rightYear}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <IconChevronRight size={16} />
            </button>
          </div>

          {/* Calendars: 1 on mobile, 2 on desktop */}
          <div className={isMobile ? "flex justify-center" : "flex gap-6"}>
            {isMobile
              ? <div className="w-full">{renderGrid(leftYear, leftMonth, true)}</div>
              : <>{renderGrid(leftYear, leftMonth)}{renderGrid(rightYear, rightMonth)}</>
            }
          </div>

          {/* Footer */}
          {hasDates && (
            <div className="flex justify-end mt-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => { onStartChange(""); onEndChange(""); setPickingEnd(false); }}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Limpiar rango
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
