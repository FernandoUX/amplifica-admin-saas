"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { IconDotsVertical } from "@tabler/icons-react";

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
  const [tooltip, setTooltip] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuH = (actions.length * 40) + 8; // estimated menu height
    const menuW = 150;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuH + 8;

    const clampedLeft = Math.max(16, Math.min(rect.right - menuW, window.innerWidth - menuW - 16));
    setPos({
      top: openUp ? rect.top - menuH - 4 : rect.bottom + 4,
      left: clampedLeft,
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

  const showTooltip = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + window.scrollY - 30,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setTooltip(true);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => { setOpen((v) => !v); setTooltip(false); }}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltip(false)}
        onFocus={showTooltip}
        onBlur={() => setTooltip(false)}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <IconDotsVertical size={16} />
      </button>

      {tooltip && !open && tooltipPos && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none flex flex-col items-center"
            style={{ top: tooltipPos.top - window.scrollY, left: tooltipPos.left - window.scrollX, transform: "translateX(-50%)" }}
          >
            <div className="rounded-md bg-neutral-800 px-2 py-1 text-[11px] font-medium text-white shadow-md whitespace-nowrap">
              Acciones
            </div>
            <div style={{ width: 6, height: 6, background: "#262626", transform: "rotate(45deg)", marginTop: -3 }} />
          </div>,
          document.body
        )}

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-[180px] rounded-xl border border-neutral-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
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
