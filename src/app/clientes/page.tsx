"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Toast from "@/components/ui/Toast";
import RowMenu from "@/components/ui/RowMenu";
import FilterDropdown from "@/components/ui/FilterDropdown";
import MobileFilterModal from "@/components/ui/MobileFilterModal";
import FilterCheckboxList from "@/components/ui/FilterCheckboxList";
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS } from "@/lib/mock-data";
import { Empresa } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import {
  IconBuilding as Building2, IconPlus as Plus, IconSearch as Search, IconAlertTriangle as AlertTriangle,
  IconServer as Server, IconFileText as FileText,
  IconChevronUp as ChevronUp, IconChevronDown as ChevronDown,
  IconCircleCheck as CircleCheck, IconPlayerPause as CirclePause, IconCircleMinus as CircleMinus,
  IconX as X, IconDownload as Download, IconTrash as Trash2, IconCheck as Check,
  IconMinus as Minus, IconAdjustmentsHorizontal as SlidersHorizontal,
  IconCalendar, IconArrowsSort, IconId, IconBuildingStore, IconMapPin,
} from "@tabler/icons-react";
import SummaryCard from "@/components/ui/SummaryCard";
import PeriodFilter, { type Period, calcGrowth, filterByPeriod } from "@/components/ui/PeriodFilter";

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
];
const getAvatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const COUNTRY_FLAG: Record<string, string> = {
  Chile: "🇨🇱", Colombia: "🇨🇴", Perú: "🇵🇪",
  Argentina: "🇦🇷", México: "🇲🇽", España: "🇪🇸", Brasil: "🇧🇷",
};

const STATUS_DOT: Record<string, string> = {
  activo: "bg-emerald-500",
  suspendido: "bg-red-500",
  inactivo: "bg-neutral-400",
};

const statusLabel = (s: string) => {
  if (s === "activo") return "Activo";
  if (s === "suspendido") return "Suspendido";
  return "Inactivo";
};

type ColKey = "razonSocial" | "idFiscal" | "pais" | "tenants" | "enTrial" | "estado" | "fechaCreacion";
const ALL_COLS: { key: ColKey; label: string }[] = [
  { key: "razonSocial",   label: "Razón Social" },
  { key: "idFiscal",      label: "ID Fiscal" },
  { key: "pais",          label: "País" },
  { key: "tenants",       label: "Tenants" },
  { key: "enTrial",       label: "En trial" },
  { key: "estado",        label: "Estado" },
  { key: "fechaCreacion", label: "Creación" },
];

type SortCol = "nombreFantasia" | "razonSocial" | "tenants" | "operationalStatus" | "fechaCreacion" | null;

function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: SortCol; sortDir: "asc" | "desc" }) {
  if (sortCol !== col) return <ChevronUp size={11} className="text-neutral-600 ml-0.5" />;
  return sortDir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

// ── Custom checkbox (light + dark mode) ──────────────────────────────────────
function Checkbox({ checked, indeterminate, onChange }: {
  checked: boolean; indeterminate?: boolean; onChange: () => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
        checked || indeterminate
          ? "bg-primary-600 border-primary-600"
          : "border-neutral-300 bg-white hover:border-primary-400"
      }`}
    >
      {indeterminate
        ? <Minus size={8} className="text-white" strokeWidth={3} />
        : checked
          ? <Check size={8} className="text-white" strokeWidth={3} />
          : null}
    </button>
  );
}

// ── Column visibility toggle ──────────────────────────────────────────────────
function ColumnToggle({ cols, visible, onChange }: {
  cols: { key: string; label: string }[];
  visible: Set<string>;
  onChange: (v: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuW = 180;
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
    const closeOnScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("scroll", closeOnScroll, true); };
  }, [open, updatePos]);

  const toggle = (key: string) => {
    if (visible.has(key) && visible.size <= 1) return;
    const next = new Set(visible);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange(next);
  };

  const hiddenCount = cols.length - visible.size;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 h-[44px] px-3 rounded-lg text-sm font-medium transition-colors ${
          hiddenCount > 0
            ? "bg-primary-50 text-primary-700"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800"
        }`}
      >
        <SlidersHorizontal size={13} />
        <span>Columnas{hiddenCount > 0 ? ` (${cols.length - hiddenCount}/${cols.length})` : ""}</span>
        <ChevronDown size={12} className="text-neutral-400" />
      </button>

      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[180px] rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg"
          style={{ top: pos.top, left: pos.left, boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
        >
          <div className="px-3 py-1 mb-1 border-b border-neutral-100">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Columnas visibles</span>
          </div>
          {cols.map(col => (
            <div
              key={col.key}
              onClick={() => toggle(col.key)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer select-none"
            >
              <Checkbox checked={visible.has(col.key)} onChange={() => toggle(col.key)} />
              <span>{col.label}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClientesPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>("fechaCreacion");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [alertEmpresa, setAlertEmpresa] = useState<Empresa | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });
  const [period, setPeriod] = useState<Period>(30);
  const [filterEstado, setFilterEstado] = useState<Set<string>>(new Set());
  const [filterPais, setFilterPais] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(ALL_COLS.map(c => c.key)));
  const [bulkAlert, setBulkAlert] = useState<"suspender" | "desactivar" | "activar" | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const col = (key: ColKey) => visibleCols.has(key);

  const allPaises = [...new Set(MOCK_EMPRESAS.map(e => e.pais))].sort();

  const estadoOptions = [
    { value: "activo",     label: "Activo",     dot: "bg-emerald-500" },
    { value: "suspendido", label: "Suspendido", dot: "bg-red-500" },
    { value: "inactivo",   label: "Inactivo",   dot: "bg-neutral-400" },
  ];
  const paisOptions = allPaises.map(p => ({ value: p, label: `${COUNTRY_FLAG[p] ?? "🌎"} ${p}` }));

  const filtered = empresas.filter((e) => {
    if (!e.habilitado && e.nombreFantasia.startsWith("_")) return false; // skip growth stubs
    const matchSearch = `${e.nombreFantasia} ${e.razonSocial} ${e.idFiscal}`.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado.size === 0 || filterEstado.has(e.operationalStatus);
    const matchPais = filterPais.size === 0 || filterPais.has(e.pais);
    return matchSearch && matchEstado && matchPais;
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const va = String((a as never)[sortCol] ?? "");
        const vb = String((b as never)[sortCol] ?? "");
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleSuspend = (empresa: Empresa) => setAlertEmpresa(empresa);

  const confirmSuspend = () => {
    if (!alertEmpresa) return;
    setEmpresas((prev) => prev.map((e) =>
      e.id === alertEmpresa.id ? { ...e, operationalStatus: "suspendido", habilitado: false, estado: "Inactivo" } : e
    ));
    setToastMsg({ title: "Cliente suspendido", message: `"${alertEmpresa.nombreFantasia}" ha sido suspendido.` });
    setToast(true);
    setAlertEmpresa(null);
  };

  const handleReactivar = (empresa: Empresa) => {
    setEmpresas((prev) => prev.map((e) =>
      e.id === empresa.id ? { ...e, operationalStatus: "activo", habilitado: true, estado: "Activo" } : e
    ));
    setToastMsg({ title: "Cliente reactivado", message: `"${empresa.nombreFantasia}" está activo nuevamente.` });
    setToast(true);
  };

  // Bulk actions
  const allPageIds = paginated.map(e => e.id);
  const allPageSelected = allPageIds.length > 0 && allPageIds.every(id => selected.has(id));
  const somePageSelected = allPageIds.some(id => selected.has(id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected(prev => { const next = new Set(prev); allPageIds.forEach(id => next.delete(id)); return next; });
    } else {
      setSelected(prev => new Set([...prev, ...allPageIds]));
    }
  };
  const toggleRow = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const selectedEmpresas = empresas.filter(e => selected.has(e.id));
  const hasActive    = selectedEmpresas.some(e => e.operationalStatus === "activo");
  const hasNonActive = selectedEmpresas.some(e => e.operationalStatus !== "activo");

  const confirmBulkAction = () => {
    if (!bulkAlert) return;
    const count = selected.size;
    if (bulkAlert === "suspender") {
      setEmpresas(prev => prev.map(e => selected.has(e.id) ? { ...e, operationalStatus: "suspendido", habilitado: false } : e));
      setToastMsg({ title: "Clientes suspendidos", message: `${count} cliente${count !== 1 ? "s" : ""} suspendido${count !== 1 ? "s" : ""}.` });
    } else if (bulkAlert === "desactivar") {
      setEmpresas(prev => prev.map(e => selected.has(e.id) ? { ...e, operationalStatus: "inactivo", habilitado: false } : e));
      setToastMsg({ title: "Clientes inactivados", message: `${count} cliente${count !== 1 ? "s" : ""} marcado${count !== 1 ? "s" : ""} como inactivo.` });
    } else if (bulkAlert === "activar") {
      setEmpresas(prev => prev.map(e => selected.has(e.id) ? { ...e, operationalStatus: "activo", habilitado: true } : e));
      setToastMsg({ title: "Clientes activados", message: `${count} cliente${count !== 1 ? "s" : ""} reactivado${count !== 1 ? "s" : ""}.` });
    }
    setToast(true);
    setBulkAlert(null);
    setSelected(new Set());
    setDeleteConfirmed(false);
  };

  const thBase = "px-4 py-2.5 text-left text-sm font-semibold text-neutral-600";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  const cur = filterByPeriod(empresas, period);
  const prv = filterByPeriod(empresas, period * 2, period);
  const growthTotal      = calcGrowth(cur.length, prv.length);
  const growthActivos    = calcGrowth(cur.filter(e => e.operationalStatus === "activo").length, prv.filter(e => e.operationalStatus === "activo").length);
  const growthSuspendidos = calcGrowth(cur.filter(e => e.operationalStatus === "suspendido").length, prv.filter(e => e.operationalStatus === "suspendido").length);
  const growthInactivos  = calcGrowth(cur.filter(e => e.operationalStatus === "inactivo").length, prv.filter(e => e.operationalStatus === "inactivo").length);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
          title="Clientes"
          description="Administración y gestión de empresas con contratos"
          stickyMobileAction={
            canCrear("Clientes")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/clientes/crear")}>Crear cliente</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search && filterEstado.size === 0 && filterPais.size === 0 ? (
            <EmptyState icon={<Building2 size={24} />} title="No hay clientes registrados" onCreateClick={() => router.push("/clientes/crear")} />
          ) : (
            <>
            {/* Toolbar: search + filters | column toggle (right) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    className="h-[44px] w-full rounded-lg bg-neutral-100 pl-8 pr-3 text-base md:text-sm text-neutral-800 placeholder:text-neutral-500 outline-none focus:bg-white focus:ring-2 focus:ring-primary-100"
                    placeholder="Buscar por nombre, RUT..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <MobileFilterModal
                  activeCount={filterEstado.size + filterPais.size}
                  sections={[
                    { label: "Estado", content: <FilterCheckboxList options={estadoOptions} selected={filterEstado} onChange={(v) => { setFilterEstado(v); setPage(1); }} /> },
                    { label: "País", content: <FilterCheckboxList options={paisOptions} selected={filterPais} onChange={(v) => { setFilterPais(v); setPage(1); }} /> },
                    { label: "Ordenar por", content: (
                      <div className="flex flex-wrap gap-2">
                        {[{ value: "fechaCreacion", label: "Fecha" }, { value: "nombreFantasia", label: "Nombre" }, { value: "operationalStatus", label: "Estado" }, { value: "tenants", label: "Tenants" }].map(opt => (
                          <button key={opt.value} onClick={() => { const v = opt.value as SortCol; if (v === sortCol) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(v); setSortDir("asc"); } }} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sortCol === opt.value ? "bg-primary-50 text-primary-700 font-medium" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{opt.label}{sortCol === opt.value ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</button>
                        ))}
                      </div>
                    )},
                  ]}
                />
              </div>
              <div className="hidden sm:flex items-center gap-2 w-auto">
                <FilterDropdown label="Estado" options={estadoOptions} selected={filterEstado} onChange={(v) => { setFilterEstado(v); setPage(1); }} />
                <FilterDropdown label="País"   options={paisOptions}   selected={filterPais}   onChange={(v) => { setFilterPais(v);   setPage(1); }} />
              </div>
              <div className="hidden md:flex items-center ml-auto">
                <ColumnToggle cols={ALL_COLS} visible={visibleCols} onChange={setVisibleCols} />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {paginated.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">Sin resultados para los filtros aplicados.</p>
              ) : (
                <>
                  {/* Select-all row */}
                  <div className="flex items-center gap-2.5 px-1 mt-4">
                    <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleSelectAll} />
                    <span className="text-xs text-neutral-500">
                      {allPageSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                    </span>
                  </div>

                  {paginated.map((empresa) => {
                    const isSelected = selected.has(empresa.id);
                    const rowActions = [
                      { label: "Ver detalle", onClick: () => router.push(`/clientes/${empresa.id}`) },
                      ...(canEditar("Clientes") ? [{ label: "Editar", onClick: () => router.push(`/clientes/${empresa.id}/editar`) }] : []),
                      ...(canDeshabilitar("Clientes") && empresa.operationalStatus !== "suspendido"
                        ? [{ label: "Suspender", onClick: () => handleSuspend(empresa), variant: "danger" as const }]
                        : []),
                      ...(canDeshabilitar("Clientes") && empresa.operationalStatus !== "activo"
                        ? [{ label: "Reactivar", onClick: () => handleReactivar(empresa) }]
                        : []),
                    ];
                    return (
                      <div
                        key={empresa.id}
                        className={`rounded-xl border overflow-hidden transition-colors ${isSelected ? "border-primary-300 bg-primary-50/30" : "border-neutral-200 bg-white"}`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <Checkbox checked={isSelected} onChange={() => toggleRow(empresa.id)} />
                          <div className="flex flex-col min-w-0 flex-1">
                            <button onClick={() => router.push(`/clientes/${empresa.id}`)} className="text-sm font-semibold text-neutral-900 hover:text-primary-600 text-left truncate transition-colors">
                              {empresa.nombreFantasia}
                            </button>
                            <span className="text-xs text-neutral-400 truncate">{empresa.razonSocial}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              empresa.operationalStatus === "activo" ? "bg-emerald-50 text-emerald-700" :
                              empresa.operationalStatus === "suspendido" ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-600"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[empresa.operationalStatus] ?? "bg-neutral-400"}`} />
                              {statusLabel(empresa.operationalStatus)}
                            </span>
                            <RowMenu actions={rowActions} />
                          </div>
                        </div>
                        {/* Details */}
                        <div className="flex flex-col gap-2 px-4 py-3 border-t border-neutral-100">
                          <div className="flex items-center gap-2.5">
                            <IconId size={15} className="text-neutral-400 shrink-0" />
                            <span className="text-sm text-neutral-700">{empresa.idFiscal}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <IconMapPin size={15} className="text-neutral-400 shrink-0" />
                            <span className="text-sm text-neutral-700">{COUNTRY_FLAG[empresa.pais] ?? "🌎"} {empresa.pais}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <IconBuildingStore size={15} className="text-neutral-400 shrink-0" />
                            <span className="text-sm text-neutral-700">{empresa.tenants} tenant{empresa.tenants !== 1 ? "s" : ""}{empresa.tenantsTrial > 0 ? ` · ${empresa.tenantsTrial} trial` : ""}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <IconCalendar size={15} className="text-neutral-400 shrink-0" />
                            <span className="text-sm text-neutral-700">{new Date(empresa.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {/* Desktop bulk action bar — top of table */}
              {selected.size > 0 && (
                <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2.5 dark:bg-white">
                  <button onClick={() => setSelected(new Set())} className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:text-neutral-700 transition-colors" title="Limpiar selección">
                    <X size={14} />
                  </button>
                  <span className="text-xs font-medium text-neutral-200 dark:text-neutral-700 tabular-nums">
                    {selected.size} cliente{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
                  </span>
                  <div className="h-4 w-px bg-neutral-700 dark:bg-neutral-200" />
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar selección">
                      <Download size={13} />
                      <span className="text-xs font-medium">Exportar</span>
                    </button>
                    {canDeshabilitar("Clientes") && hasNonActive && (
                      <button onClick={() => setBulkAlert("activar")} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-emerald-400 hover:bg-emerald-900/40 dark:text-emerald-600 dark:hover:bg-emerald-50 transition-colors" title="Activar selección">
                        <CircleCheck size={13} />
                        <span className="text-xs font-medium">Activar</span>
                      </button>
                    )}
                    {canDeshabilitar("Clientes") && hasActive && (
                      <button onClick={() => { setDeleteConfirmed(false); setBulkAlert("suspender"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-red-400 hover:bg-red-900/40 dark:text-red-600 dark:hover:bg-red-50 transition-colors" title="Suspender selección">
                        <CirclePause size={13} />
                        <span className="text-xs font-medium">Suspender</span>
                      </button>
                    )}
                    {canDeshabilitar("Clientes") && hasActive && (
                      <button onClick={() => { setDeleteConfirmed(false); setBulkAlert("desactivar"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-neutral-400 hover:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-100 transition-colors" title="Desactivar selección">
                        <CircleMinus size={13} />
                        <span className="text-xs font-medium">Desactivar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="table-scroll">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="w-10 px-4 py-2.5">
                        <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleSelectAll} />
                      </th>
                      <th className={thSort} onClick={() => toggleSort("nombreFantasia")}>
                        <span className="inline-flex items-center">Nombre de fantasía <SortIcon col="nombreFantasia" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      {col("razonSocial")   && <th className={thSort} onClick={() => toggleSort("razonSocial")}><span className="inline-flex items-center">Razón Social <SortIcon col="razonSocial" sortCol={sortCol} sortDir={sortDir} /></span></th>}
                      {col("idFiscal")      && <th className={thBase}>ID Fiscal</th>}
                      {col("pais")          && <th className={thBase}>País</th>}
                      {col("tenants")       && <th className={`${thSort} text-center`} onClick={() => toggleSort("tenants")}><span className="inline-flex items-center justify-center">Tenants <SortIcon col="tenants" sortCol={sortCol} sortDir={sortDir} /></span></th>}
                      {col("enTrial")       && <th className={thBase}>En trial</th>}
                      {col("estado")        && <th className={thSort} onClick={() => toggleSort("operationalStatus")}><span className="inline-flex items-center">Estado <SortIcon col="operationalStatus" sortCol={sortCol} sortDir={sortDir} /></span></th>}
                      {col("fechaCreacion") && <th className={thSort} onClick={() => toggleSort("fechaCreacion")}><span className="inline-flex items-center">Creación <SortIcon col="fechaCreacion" sortCol={sortCol} sortDir={sortDir} /></span></th>}
                      <th className="w-10 py-2.5 sticky right-0 bg-neutral-50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={20} className="px-4 py-10 text-center text-sm text-neutral-500">
                          Sin resultados para los filtros aplicados.
                        </td>
                      </tr>
                    ) : paginated.map((empresa) => (
                      <tr key={empresa.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${selected.has(empresa.id) ? "bg-neutral-100" : ""}`}>
                        <td className="w-10 px-4 py-3">
                          <Checkbox checked={selected.has(empresa.id)} onChange={() => toggleRow(empresa.id)} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {(() => {
                              const initials = empresa.nombreFantasia.slice(0, 2).toUpperCase();
                              const color = getAvatarColor(String(empresa.id));
                              return (
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-semibold shrink-0 ${color.bg} ${color.border} ${color.text}`}>
                                  {initials}
                                </div>
                              );
                            })()}
                            <button onClick={() => router.push(`/clientes/${empresa.id}`)} className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 text-left transition-colors">
                              {empresa.nombreFantasia}
                            </button>
                          </div>
                        </td>
                        {col("razonSocial")   && <td className="px-4 py-3 text-sm font-medium text-neutral-600">{empresa.razonSocial}</td>}
                        {col("idFiscal")      && <td className="px-4 py-3 text-sm font-medium text-neutral-700 font-mono">{empresa.idFiscal}</td>}
                        {col("pais")          && <td className="px-4 py-3"><span title={empresa.pais} className="cursor-default text-base leading-none">{COUNTRY_FLAG[empresa.pais] ?? "🌎"}</span></td>}
                        {col("tenants")       && <td className="px-4 py-3 text-sm font-medium text-neutral-700 text-center">{empresa.tenants}</td>}
                        {col("enTrial")       && <td className="px-4 py-3">{empresa.tenantsTrial > 0 ? <Badge variant="trial">{empresa.tenantsTrial} trial</Badge> : <span className="text-sm text-neutral-400">—</span>}</td>}
                        {col("estado")        && (
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[empresa.operationalStatus] ?? "bg-neutral-400"}`} />
                              <span className="text-sm font-medium text-neutral-700">{statusLabel(empresa.operationalStatus)}</span>
                            </span>
                          </td>
                        )}
                        {col("fechaCreacion") && <td className="px-4 py-3 text-sm font-medium text-neutral-600">{new Date(empresa.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}</td>}
                        <td className="w-10 py-3 pr-3 sticky right-0 bg-white">
                          <RowMenu actions={[
                            { label: "Ver detalle", onClick: () => router.push(`/clientes/${empresa.id}`) },
                            ...(canEditar("Clientes") ? [{ label: "Editar", onClick: () => router.push(`/clientes/${empresa.id}/editar`) }] : []),
                            ...(canDeshabilitar("Clientes") && empresa.operationalStatus !== "suspendido"
                              ? [{ label: "Suspender", onClick: () => handleSuspend(empresa), variant: "danger" as const }]
                              : []),
                            ...(canDeshabilitar("Clientes") && empresa.operationalStatus !== "activo"
                              ? [{ label: "Reactivar", onClick: () => handleReactivar(empresa) }]
                              : []),
                          ]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </div>

            <div className="md:hidden">
              <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bulk action sticky bar — sits above "Crear cliente" button */}
      {selected.size > 0 && (
        <div className="md:hidden fixed bottom-[72px] inset-x-0 z-40 animate-bulk-bar bg-neutral-900 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-4 pt-2 pb-2.5 dark:bg-white safe-area-bottom">
          {/* Close button — circle protruding above the bar */}
          <button
            onClick={() => setSelected(new Set())}
            className="absolute left-1/2 -translate-x-1/2 -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-500 hover:bg-neutral-100 transition-colors"
            title="Limpiar selección"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col gap-1.5">
            {/* Count */}
            <div className="text-center">
              <span className="text-[11px] font-medium text-neutral-600 tabular-nums">
                {selected.size} cliente{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
              </span>
            </div>
            {/* Bottom row: action buttons centered */}
            <div className="flex items-center justify-center gap-2">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar">
                <Download size={16} />
                <span className="text-[9px] font-medium leading-none">Exportar</span>
              </button>
              {canDeshabilitar("Clientes") && hasNonActive && (
                <button onClick={() => setBulkAlert("activar")} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-emerald-400 hover:bg-emerald-900/40 dark:text-emerald-600 dark:hover:bg-emerald-50 transition-colors" title="Activar">
                  <CircleCheck size={16} />
                  <span className="text-[9px] font-medium leading-none">Activar</span>
                </button>
              )}
              {canDeshabilitar("Clientes") && hasActive && (
                <button onClick={() => { setDeleteConfirmed(false); setBulkAlert("suspender"); }} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-red-400 hover:bg-red-900/40 dark:text-red-600 dark:hover:bg-red-50 transition-colors" title="Suspender">
                  <CirclePause size={16} />
                  <span className="text-[9px] font-medium leading-none">Suspender</span>
                </button>
              )}
              {canDeshabilitar("Clientes") && hasActive && (
                <button onClick={() => { setDeleteConfirmed(false); setBulkAlert("desactivar"); }} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-neutral-400 hover:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-100 transition-colors" title="Desactivar">
                  <CircleMinus size={16} />
                  <span className="text-[9px] font-medium leading-none">Desactivar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {alertEmpresa && (() => {
        const relTenants = MOCK_TENANTS.filter((t) => t.empresaId === alertEmpresa.id);
        const relTenantIds = relTenants.map((t) => t.id);
        const relContratos = MOCK_CONTRATOS.filter((c) => relTenantIds.includes(c.tenantId));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAlertEmpresa(null)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">Suspender cliente</h3>
                <p className="text-sm text-neutral-500">
                  Al suspender <strong className="text-neutral-700">&quot;{alertEmpresa.nombreFantasia}&quot;</strong>, todos sus tenants quedarán bloqueados y los usuarios no podrán acceder. ¿Deseas continuar?
                </p>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Server size={13} className="text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-600">Tenants asociados ({relTenants.length})</span>
                </div>
                {relTenants.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                    {relTenants.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-neutral-800">{t.nombre}</span>
                          <span className="text-[11px] text-neutral-400 ml-2">ID: {t.id}</span>
                        </div>
                        <Badge variant={t.operationalStatus === "activo" ? "active" : "inactive"}>{t.operationalStatus === "activo" ? "Activo" : t.operationalStatus === "suspendido" ? "Suspendido" : "Inactivo"}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-neutral-400 italic">Sin tenants asociados</p>}
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={13} className="text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-600">Contratos asociados ({relContratos.length})</span>
                </div>
                {relContratos.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                    {relContratos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-neutral-800">{c.displayId}</span>
                          <span className="text-[11px] text-neutral-400 ml-2">{c.planNombre ?? "Trial"} · Vence: {c.fechaVencimiento}</span>
                        </div>
                        <Badge variant={c.estado === "vigente" ? "active" : "inactive"}>{c.estado === "vigente" ? "Vigente" : "Inactivo"}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-neutral-400 italic">Sin contratos asociados</p>}
              </div>
              <div className="flex w-full gap-3 mt-5">
                <Button variant="secondary" className="flex-1" onClick={() => setAlertEmpresa(null)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={confirmSuspend}>Confirmar suspensión</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bulk action confirmation modal */}
      {bulkAlert && (() => {
        const affectedEmpresas = empresas.filter(e => selected.has(e.id));
        const affectedTenantIds = affectedEmpresas.map(e => e.id);
        const affectedTenants = MOCK_TENANTS.filter(t => affectedTenantIds.includes(t.empresaId));
        const affectedContratos = MOCK_CONTRATOS.filter(c => affectedTenants.map(t => t.id).includes(c.tenantId));
        const isActivar = bulkAlert === "activar";
        const isSuspender = bulkAlert === "suspender";
        const isDesactivar = bulkAlert === "desactivar";
        const label = isActivar ? "Activar" : isSuspender ? "Suspender" : "Desactivar";
        const confirmColor = isActivar
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : isSuspender
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-neutral-700 hover:bg-neutral-800 text-white";
        const iconColor = isActivar ? "bg-emerald-50" : isSuspender ? "bg-red-50" : "bg-neutral-100";
        const icon = isActivar ? <CircleCheck size={24} className="text-emerald-500" /> : isSuspender ? <CirclePause size={24} className="text-red-500" /> : <CircleMinus size={24} className="text-neutral-500" />;
        const contractStatusDot: Record<string, string> = { vigente: "bg-emerald-500", inactivo: "bg-neutral-400" };
        const contractStatusLabel: Record<string, string> = { vigente: "Vigente", inactivo: "Inactivo" };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBulkAlert(null)} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex flex-col items-center text-center gap-3 mb-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor}`}>{icon}</div>
                <h3 className="text-base font-semibold text-neutral-900">{label} {selected.size} cliente{selected.size !== 1 ? "s" : ""}</h3>
                <p className="text-sm text-neutral-500">
                  {isActivar
                    ? "Los tenants asociados recuperarán acceso y se procesarán pedidos."
                    : isSuspender
                      ? "Los tenants asociados quedarán bloqueados y los usuarios perderán acceso."
                      : "Los clientes pasarán a estado inactivo y sus tenants serán bloqueados."}
                </p>
              </div>
              {/* Grouped by client */}
              <div className="space-y-3 mb-5">
                {affectedEmpresas.map(empresa => {
                  const clientTenants = affectedTenants.filter(t => t.empresaId === empresa.id);
                  const clientContratos = affectedContratos.filter(c => clientTenants.some(t => t.id === c.tenantId));
                  return (
                    <div key={empresa.id} className="rounded-lg border border-neutral-200">
                      <div className="px-3 py-2.5 flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-800">{empresa.nombreFantasia}</span>
                        <span className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[empresa.operationalStatus] ?? "bg-neutral-400"}`} />
                          <span className="text-xs text-neutral-500">{statusLabel(empresa.operationalStatus)}</span>
                        </span>
                      </div>
                      <div className="px-3 pb-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                        {clientTenants.map(t => (
                          <span key={t.id}><Server size={10} className="inline -mt-px mr-0.5" />{t.nombre}</span>
                        ))}
                        {clientContratos.map(c => (
                          <span key={c.id}><FileText size={10} className="inline -mt-px mr-0.5" />{c.displayId} · {c.planNombre ?? "Trial"}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(isSuspender || isDesactivar) && (
                <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                    className={`mt-0.5 h-4 w-4 rounded border-neutral-300 ${isSuspender ? "text-red-600 accent-red-600" : "text-neutral-700 accent-neutral-700"}`}
                  />
                  <span className="text-xs text-neutral-600">
                    {isSuspender
                      ? "Entiendo que al suspender se bloquearán los tenants, contratos y usuarios asociados."
                      : "Entiendo que al desactivar se desactivarán los tenants, contratos y usuarios asociados."}
                  </span>
                </label>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setBulkAlert(null)}>Cancelar</Button>
                <button
                  onClick={confirmBulkAction}
                  disabled={(isSuspender || isDesactivar) && !deleteConfirmed}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${confirmColor} ${(isSuspender || isDesactivar) && !deleteConfirmed ? "opacity-40 cursor-not-allowed" : ""}`}
                >{label}</button>
              </div>
            </div>
          </div>
        );
      })()}

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
