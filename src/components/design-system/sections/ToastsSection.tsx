"use client";

import { useState } from "react";
import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

export default function ToastsSection() {
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" }>({ open: false, type: "success" });

  return (
    <DSSection id="toasts" title="Toasts" description="Notificaciones temporales: success, error y warning.">
      <DSSubsection title="Disparar toast">
        <DSShowcase>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setToast({ open: true, type: "success" })}>
              Success
            </Button>
            <Button variant="secondary" onClick={() => setToast({ open: true, type: "error" })}>
              Error
            </Button>
            <Button variant="secondary" onClick={() => setToast({ open: true, type: "warning" })}>
              Warning
            </Button>
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Preview estático">
        <DSShowcase label="Los 3 tipos de toast con borde lateral color-coded">
          <div className="flex flex-col gap-3 max-w-sm">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 border-l-4 border-l-emerald-500 bg-white px-4 py-3 shadow-sm">
              <div className="text-emerald-600 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <div><p className="text-sm font-semibold text-neutral-900">Success</p><p className="text-xs text-neutral-500">Operación completada correctamente.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 border-l-4 border-l-red-500 bg-white px-4 py-3 shadow-sm">
              <div className="text-red-600 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
              <div><p className="text-sm font-semibold text-neutral-900">Error</p><p className="text-xs text-neutral-500">No se pudo completar la operación.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-neutral-200 border-l-4 border-l-amber-500 bg-white px-4 py-3 shadow-sm">
              <div className="text-amber-600 mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
              <div><p className="text-sm font-semibold text-neutral-900">Warning</p><p className="text-xs text-neutral-500">Revisa los datos antes de continuar.</p></div>
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        type={toast.type}
        title={toast.type === "success" ? "Operación exitosa" : toast.type === "error" ? "Error" : "Advertencia"}
        message={toast.type === "success" ? "El registro fue creado." : toast.type === "error" ? "No se pudo guardar." : "Revisa los campos."}
      />
    </DSSection>
  );
}
