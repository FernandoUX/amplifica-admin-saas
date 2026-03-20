"use client";

import { useState } from "react";
import { IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react";

export interface FilterSection {
  label: string;
  content: React.ReactNode;
}

interface MobileFilterModalProps {
  sections: FilterSection[];
  /** Number of active filters across all sections */
  activeCount?: number;
}

export default function MobileFilterModal({ sections, activeCount = 0 }: MobileFilterModalProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggleSection = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <>
      {/* Trigger button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center h-[44px] w-[44px] rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors relative shrink-0"
        title="Filtros"
      >
        <IconAdjustmentsHorizontal size={18} />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-sm font-semibold text-neutral-800">Filtros</h3>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
                <IconX size={16} />
              </button>
            </div>

            {/* Sections */}
            <div className="px-4 py-3 space-y-1">
              {sections.map((section, i) => (
                <div key={i} className="border-b border-neutral-100 last:border-0">
                  <button
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center justify-between py-3 text-sm font-medium text-neutral-700"
                  >
                    {section.label}
                    {expanded.has(i) ? <IconChevronUp size={14} className="text-neutral-400" /> : <IconChevronDown size={14} className="text-neutral-400" />}
                  </button>
                  {expanded.has(i) && (
                    <div className="pb-3">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Apply button */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-4 py-3">
              <button
                onClick={() => setOpen(false)}
                disabled={activeCount === 0}
                className={`w-full h-[44px] rounded-xl text-sm font-semibold transition-colors ${activeCount > 0 ? "bg-primary-500 text-white hover:bg-primary-600" : "bg-neutral-200 text-neutral-400 cursor-not-allowed"}`}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
