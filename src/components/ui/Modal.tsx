"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
  footerHint?: string;
}

export default function Modal({ open, onClose, title, subtitle, children, width = "max-w-lg", footer, footerHint }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${width} rounded-t-2xl sm:rounded-2xl bg-white shadow-xl mx-0 sm:mx-4 flex flex-col`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-minimal px-6 py-5">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-neutral-100 px-6 py-4 bg-white rounded-b-2xl">
            {footerHint && (
              <p className="mb-3 text-xs text-neutral-500 text-center">{footerHint}</p>
            )}
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
