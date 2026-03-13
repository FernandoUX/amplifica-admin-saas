"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuH = (actions.length * 40) + 8; // estimated menu height
    const menuW = 150;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuH + 8;

    setPos({
      top: openUp ? rect.top + window.scrollY - menuH - 4 : rect.bottom + window.scrollY + 4,
      left: Math.min(rect.right + window.scrollX - menuW, window.innerWidth - menuW - 8),
    });
  }, [actions.length]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleScroll = () => setOpen(false);
    const handleResize = () => setOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, updatePosition]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <MoreVertical size={14} />
      </button>

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[150px] rounded-xl border border-neutral-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: pos.top - window.scrollY,
              left: pos.left - window.scrollX,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }}
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
          </div>,
          document.body
        )}
    </>
  );
}
