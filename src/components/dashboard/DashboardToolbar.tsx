"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconArrowsExchange,
  IconBriefcase,
  IconShoppingCart,
  IconX,
  IconChevronDown,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import {
  type DashboardFilters,
  type PeriodKey,
  type CompareKey,
  PERIOD_OPTIONS,
  COMPARE_OPTIONS,
  getClientOptions,
  getTenantOptions,
} from "@/lib/dashboard-data";

interface Props {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

const SELECT_BASE =
  "h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 pr-8 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:border-primary-500 cursor-pointer appearance-none";

function FilterRows({
  filters,
  set,
  clientOptions,
  tenantOptions,
}: {
  filters: DashboardFilters;
  set: (p: Partial<DashboardFilters>) => void;
  clientOptions: { value: string; label: string }[];
  tenantOptions: { value: string; label: string }[];
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <IconCalendar size={15} className="text-neutral-400 flex-shrink-0" />
        <select value={filters.period} onChange={(e) => set({ period: e.target.value as PeriodKey })} className={SELECT_BASE}>
          {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <IconArrowsExchange size={15} className="text-neutral-400 flex-shrink-0" />
        <select value={filters.compare} onChange={(e) => set({ compare: e.target.value as CompareKey })} className={SELECT_BASE}>
          {COMPARE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <IconBriefcase size={15} className="text-neutral-400 flex-shrink-0" />
        <select value={filters.clientId} onChange={(e) => set({ clientId: e.target.value })} className={SELECT_BASE}>
          {clientOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <IconShoppingCart size={15} className="text-neutral-400 flex-shrink-0" />
        <select value={filters.tenantId} onChange={(e) => set({ tenantId: e.target.value })} className={SELECT_BASE}>
          {tenantOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </>
  );
}

/* ── Desktop filter button + dropdown (for PageHeader actions slot) ────────── */
export function DashboardFilterButton({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const clientOptions = getClientOptions();
  const tenantOptions = getTenantOptions(filters.clientId);

  const hasFilters =
    filters.clientId !== "" || filters.tenantId !== "" || filters.period !== "12m" || filters.compare !== "prev";

  const set = (partial: Partial<DashboardFilters>) => {
    const next = { ...filters, ...partial };
    if (partial.clientId !== undefined && partial.clientId !== filters.clientId) next.tenantId = "";
    onChange(next);
  };

  const reset = () => { onChange({ period: "12m", compare: "prev", clientId: "", tenantId: "" }); setOpen(false); };

  const filterCount = [
    filters.period !== "12m",
    filters.compare !== "prev",
    filters.clientId !== "",
    filters.tenantId !== "",
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-10 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 transition-all duration-100"
      >
        <IconAdjustmentsHorizontal size={16} className="text-neutral-400" />
        Filtros
        {filterCount > 0 && (
          <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {filterCount}
          </span>
        )}
        <IconChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl">
            <div className="flex flex-col gap-2 p-3">
              <FilterRows filters={filters} set={set} clientOptions={clientOptions} tenantOptions={tenantOptions} />
            </div>
            {hasFilters && (
              <div className="px-3 pb-3">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-1 h-8 w-full rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700"
                >
                  <IconX size={13} />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Mobile-only collapsible toolbar ───────────────────────────────────────── */
export default function DashboardToolbar({ filters, onChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const clientOptions = getClientOptions();
  const tenantOptions = getTenantOptions(filters.clientId);

  const hasFilters =
    filters.clientId !== "" || filters.tenantId !== "" || filters.period !== "12m" || filters.compare !== "prev";

  const set = (partial: Partial<DashboardFilters>) => {
    const next = { ...filters, ...partial };
    if (partial.clientId !== undefined && partial.clientId !== filters.clientId) {
      next.tenantId = "";
    }
    onChange(next);
  };

  const reset = () => onChange({ period: "12m", compare: "prev", clientId: "", tenantId: "" });

  const filterCount = [
    filters.period !== "12m",
    filters.compare !== "prev",
    filters.clientId !== "",
    filters.tenantId !== "",
  ].filter(Boolean).length;

  return (
    <>
      {/* ── Mobile: collapsible card ─────────────────────────────────── */}
      <div className="sm:hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5"
        >
          <div className="flex items-center gap-2">
            <IconAdjustmentsHorizontal size={15} className="text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Filtros</span>
            {filterCount > 0 && (
              <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </div>
          <IconChevronDown
            size={16}
            className={`text-neutral-400 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mobileOpen && (
          <div className="flex flex-col gap-2 px-4 pb-3 border-t border-neutral-100 dark:border-neutral-800 pt-3">
            <FilterRows filters={filters} set={set} clientOptions={clientOptions} tenantOptions={tenantOptions} />
            {hasFilters && (
              <button
                onClick={reset}
                className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors self-start"
              >
                <IconX size={13} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

    </>
  );
}
