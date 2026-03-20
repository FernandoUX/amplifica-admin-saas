"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IconPlus, IconX, IconChevronDown, IconCheck } from "@tabler/icons-react";

export interface FilterOption {
  value: string;
  label: string;
  dot?: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: Set<string>;
  onChange: (v: Set<string>) => void;
}

export default function FilterDropdown({ label, options, selected, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuW = menuRef.current?.offsetWidth || 180;
    const maxLeft = window.innerWidth - menuW - 16;
    const clampedLeft = Math.max(16, Math.min(r.left, maxLeft));
    setPos({ top: r.bottom + 4, left: clampedLeft });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", () => setOpen(false), true);
    return () => { document.removeEventListener("mousedown", close); };
  }, [open, updatePos]);

  const toggle = (v: string) => {
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    onChange(next);
  };

  const active = selected.size > 0;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center justify-center gap-1.5 h-[44px] px-3 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none ${
          active
            ? "bg-primary-50 text-primary-700"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800"
        }`}
      >
        {!active && <IconPlus size={12} />}
        <span>{active ? `${label} (${selected.size})` : label}</span>
        {active
          ? <IconX size={12} className="ml-0.5 text-primary-400" onClick={(e) => { e.stopPropagation(); onChange(new Set()); }} />
          : <IconChevronDown size={12} className="text-neutral-600" />
        }
      </button>

      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[180px] rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg"
          style={{ top: pos.top - window.scrollY, left: pos.left - window.scrollX, boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                selected.has(opt.value) ? "bg-primary-600 border-primary-600" : "border-neutral-300 bg-white"
              }`}>
                {selected.has(opt.value) && <IconCheck size={10} className="text-white" strokeWidth={3} />}
              </span>
              {opt.dot && <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dot}`} />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
