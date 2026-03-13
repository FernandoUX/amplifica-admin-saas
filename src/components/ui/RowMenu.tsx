"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface RowMenuAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface RowMenuProps {
  actions: RowMenuAction[];
}

export default function RowMenu({ actions }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-7 z-50 min-w-[130px] rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => { action.onClick(); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-neutral-50 ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-neutral-800"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
