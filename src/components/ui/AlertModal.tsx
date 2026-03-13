"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function AlertModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar" }: AlertModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl mx-4 p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">{message}</p>
          <div className="flex w-full gap-3 mt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>{cancelLabel}</Button>
            <Button variant="danger" className="flex-1" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
