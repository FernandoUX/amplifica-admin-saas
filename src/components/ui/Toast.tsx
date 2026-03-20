"use client";

import { useEffect } from "react";
import { IconCircleCheck, IconAlertCircle, IconX } from "@tabler/icons-react";

type ToastType = "success" | "error" | "warning";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <IconCircleCheck size={16} className="text-emerald-600" />,
  error:   <IconAlertCircle size={16} className="text-red-600" />,
  warning: <IconAlertCircle size={16} className="text-amber-600" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error:   "border-l-red-500",
  warning: "border-l-amber-500",
};

export default function Toast({
  open,
  onClose,
  type = "success",
  title,
  message,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div
        className={`flex items-start gap-3 rounded-xl border border-neutral-200 border-l-4 bg-white px-4 py-3 shadow-lg ${borderColors[type]}`}
        style={{ minWidth: 280, maxWidth: 360 }}
      >
        <div className="mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {message && <p className="mt-0.5 text-xs text-neutral-500">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors"
        >
          <IconX size={13} />
        </button>
      </div>
    </div>
  );
}
