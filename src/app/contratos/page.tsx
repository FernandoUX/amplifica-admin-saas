"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Toast from "@/components/ui/Toast";
import RowMenu from "@/components/ui/RowMenu";
import AlertModal from "@/components/ui/AlertModal";
import FilterDropdown from "@/components/ui/FilterDropdown";
import MobileFilterModal from "@/components/ui/MobileFilterModal";
import FilterCheckboxList from "@/components/ui/FilterCheckboxList";
import { MOCK_CONTRATOS, MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";
import { Contrato } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import {
  IconFileText as FileText, IconPlus as Plus, IconSearch as Search,
  IconChevronUp as ChevronUp, IconChevronDown as ChevronDown,
  IconFileCheck as FileCheck, IconCalendarClock as CalendarClock,
  IconCurrencyDollar as DollarSign, IconFileX as FileX,
  IconX as X, IconDownload as Download, IconTrash as Trash2,
  IconCheck as Check, IconMinus as Minus, IconCircleX as CircleX,
  IconAlertTriangle as AlertTriangle,
  IconBriefcase, IconCreditCard, IconStack2, IconCalendar, IconCoin,
} from "@tabler/icons-react";
import SummaryCard from "@/components/ui/SummaryCard";
import PeriodFilter, { type Period, calcGrowth, filterByPeriod } from "@/components/ui/PeriodFilter";

/* ── Helpers ── */

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

const billingBadge = (mode: string) => {
  if (mode === "pagado") return { variant: "active", label: "Pagado" };
  return { variant: "trial", label: "Trial" };
};

/** Runtime "por vencer" logic: <=30 days to expiry */
const getEstadoDisplay = (c: Contrato) => {
  if (c.estado === "inactivo") {
    if (c.closureReason === "cancelado") return { label: "Cancelado", variant: "danger" };
    if (c.closureReason === "convertido") return { label: "Convertido", variant: "default" };
    return { label: "Vencido", variant: "inactive" };
  }
  // vigente — check "por vencer" (<=30 days)
  const today = new Date();
  const venc = new Date(c.fechaVencimiento);
  const diff = Math.ceil((venc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 30 && diff >= 0) return { label: "Por vencer", variant: "pending" };
  return { label: "Vigente", variant: "active" };
};

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

type SortCol = "displayId" | "tenant" | "cliente" | "billingMode" | "planNombre" | "fechaInicio" | "fechaVencimiento" | "montoBaseFinal" | "estado" | "fechaCreacion" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-600 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

export default function ContratosPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [contratos, setContratos] = useState<Contrato[]>(MOCK_CONTRATOS);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<Set<string>>(new Set());
  const [filterBilling, setFilterBilling] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>("fechaCreacion");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [alertContrato, setAlertContrato] = useState<Contrato | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });
  const [period, setPeriod] = useState<Period>(30);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAlert, setBulkAlert] = useState<"cancelar" | null>(null);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);

  // Lookups
  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  const getTenantName = (tenantId: string) => tenantMap[tenantId]?.nombre ?? "—";
  const getTenantDominio = (tenantId: string) => tenantMap[tenantId]?.dominio ?? "—";
  const getClienteName = (tenantId: string) => {
    const t = tenantMap[tenantId];
    if (!t) return "—";
    return empresaMap[t.empresaId]?.nombreFantasia ?? "—";
  };

  const filtered = contratos.filter((c) => {
    const tenantNombre = getTenantName(c.tenantId);
    const clienteNombre = getClienteName(c.tenantId);
    const matchSearch = `${c.displayId} ${tenantNombre} ${clienteNombre} ${c.planNombre ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const estadoKey = getEstadoDisplay(c).label === "Por vencer" ? "porVencer" :
      getEstadoDisplay(c).label === "Cancelado" ? "cancelado" :
      getEstadoDisplay(c).label === "Vencido" ? "vencido" : "vigente";
    const matchEstado = filterEstado.size === 0 || filterEstado.has(estadoKey);
    const matchBilling = filterBilling.size === 0 || filterBilling.has(c.billingMode);
    return matchSearch && matchEstado && matchBilling;
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        let va = "";
        let vb = "";
        if (sortCol === "tenant") {
          va = getTenantDominio(a.tenantId);
          vb = getTenantDominio(b.tenantId);
        } else if (sortCol === "cliente") {
          va = getClienteName(a.tenantId);
          vb = getClienteName(b.tenantId);
        } else if (sortCol === "montoBaseFinal") {
          const na = a.montoBaseFinal ?? 0;
          const nb = b.montoBaseFinal ?? 0;
          return sortDir === "asc" ? na - nb : nb - na;
        } else if (sortCol === "estado") {
          va = getEstadoDisplay(a).label;
          vb = getEstadoDisplay(b).label;
        } else {
          va = String((a as never)[sortCol] ?? "");
          vb = String((b as never)[sortCol] ?? "");
        }
        const cmp = va.localeCompare(vb);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleCancel = (contrato: Contrato) => setAlertContrato(contrato);

  const confirmCancel = () => {
    if (!alertContrato) return;
    setContratos((prev) => prev.map((c) =>
      c.id === alertContrato.id
        ? { ...c, estado: "inactivo" as const, closureReason: "cancelado" as const, closureDate: new Date().toISOString().slice(0, 10), closureNotes: "Cancelación manual" }
        : c
    ));
    setToastMsg({ title: "Contrato cancelado", message: `El contrato ${alertContrato.displayId} ha sido cancelado.` });
    setToast(true);
    setAlertContrato(null);
  };

  const handleReactivar = (contrato: Contrato) => {
    setContratos((prev) => prev.map((c) =>
      c.id === contrato.id
        ? { ...c, estado: "vigente" as const, closureReason: null, closureDate: null, closureNotes: null }
        : c
    ));
    setToastMsg({ title: "Contrato reactivado", message: `El contrato ${contrato.displayId} ha sido reactivado.` });
    setToast(true);
  };

  // ── Bulk selection helpers ──
  const allPageIds = paginated.map(c => c.id);
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

  const selectedContratos = contratos.filter(c => selected.has(c.id));
  const hasVigente = selectedContratos.some(c => c.estado === "vigente");

  const confirmBulkAction = () => {
    if (!bulkAlert) return;
    const count = selected.size;
    if (bulkAlert === "cancelar") {
      setContratos(prev => prev.map(c =>
        selected.has(c.id) && c.estado === "vigente"
          ? { ...c, estado: "inactivo" as const, closureReason: "cancelado" as const, closureDate: new Date().toISOString().slice(0, 10), closureNotes: "Cancelación masiva" }
          : c
      ));
      const vigCount = selectedContratos.filter(c => c.estado === "vigente").length;
      setToastMsg({ title: "Contratos cancelados", message: `${vigCount} contrato${vigCount !== 1 ? "s" : ""} cancelado${vigCount !== 1 ? "s" : ""}.` });
    }
    setToast(true);
    setBulkAlert(null);
    setBulkConfirmed(false);
    setSelected(new Set());
  };

  const thBase = "px-4 py-2.5 text-left text-sm font-semibold text-neutral-600";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  const todayDate = new Date();
  const vigentes = contratos.filter((c) => c.estado === "vigente");
  const porVencer = vigentes.filter((c) => {
    const venc = new Date(c.fechaVencimiento);
    const diff = Math.ceil((venc.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const montoMensual = vigentes.reduce((sum, c) => sum + (c.montoBaseFinal ?? 0), 0);
  const cancelados = contratos.filter((c) => c.estado === "inactivo" && c.closureReason === "cancelado").length;

  const cur = filterByPeriod(contratos, period);
  const prv = filterByPeriod(contratos, period * 2, period);
  const growthVigentes = calcGrowth(cur.filter(c => c.estado === "vigente").length, prv.filter(c => c.estado === "vigente").length);
  const growthCancelados = calcGrowth(cur.filter(c => c.estado === "inactivo" && c.closureReason === "cancelado").length, prv.filter(c => c.estado === "inactivo" && c.closureReason === "cancelado").length);
  // MRR growth: compare total current MRR vs MRR at start of selected period
  const TODAY_MOCK = new Date("2026-03-16");
  const mrrAtPeriodStart = (() => {
    const cutoff = new Date(TODAY_MOCK);
    cutoff.setDate(cutoff.getDate() - period);
    return contratos
      .filter(c => c.billingMode === "pagado" && c.estado === "vigente" && new Date(c.fechaCreacion) < cutoff)
      .reduce((s, c) => s + (c.montoBaseFinal ?? 0), 0);
  })();
  const growthMRR = calcGrowth(montoMensual, mrrAtPeriodStart);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Contratos" }]}
          title="Contratos"
          description="Acuerdos comerciales vinculados a tenants"
          stickyMobileAction={
            canCrear("Contratos")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/contratos/crear")}>Crear contrato</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {/* ── Dashboard stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <SummaryCard title="Contratos vigentes" value={vigentes.length} icon={<FileCheck size={16} />} />
            <SummaryCard title="Por vencer (30d)" value={porVencer} icon={<CalendarClock size={16} />} />
            <SummaryCard title="Monto mensual total" value={`$${montoMensual.toLocaleString("es-CL")}`} icon={<DollarSign size={16} />} />
            <SummaryCard title="Cancelados" value={cancelados} icon={<FileX size={16} />} />
          </div>

          {/* Search + filter toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  className="h-[44px] w-full rounded-lg bg-neutral-100 pl-8 pr-3 text-base md:text-sm text-neutral-800 placeholder:text-neutral-500 outline-none focus:bg-white focus:ring-2 focus:ring-primary-100"
                  placeholder="Buscar por Nº, tenant o cliente..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <MobileFilterModal
                activeCount={filterEstado.size + filterBilling.size}
                sections={[
                  { label: "Estado", content: <FilterCheckboxList options={[
                    { value: "vigente", label: "Vigente" },
                    { value: "porVencer", label: "Por vencer" },
                    { value: "cancelado", label: "Cancelado" },
                    { value: "vencido", label: "Vencido" },
                  ]} selected={filterEstado} onChange={(v) => { setFilterEstado(v); setPage(1); }} /> },
                  { label: "Billing", content: <FilterCheckboxList options={[
                    { value: "pagado", label: "Pagado" },
                    { value: "trial", label: "Trial" },
                  ]} selected={filterBilling} onChange={(v) => { setFilterBilling(v); setPage(1); }} /> },
                  { label: "Ordenar por", content: (
                    <div className="flex flex-wrap gap-2">
                      {([
                        { value: "displayId", label: "Nº Contrato" },
                        { value: "tenant", label: "Dominio" },
                        { value: "cliente", label: "Cliente" },
                        { value: "billingMode", label: "Billing" },
                        { value: "fechaInicio", label: "Inicio" },
                        { value: "fechaVencimiento", label: "Vencimiento" },
                        { value: "montoBaseFinal", label: "Monto" },
                        { value: "estado", label: "Estado" },
                      ] as { value: SortCol; label: string }[]).map(opt => (
                        <button key={opt.value} onClick={() => { if (opt.value === sortCol) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(opt.value); setSortDir("asc"); } }} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sortCol === opt.value ? "bg-primary-50 text-primary-700 font-medium" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{opt.label}{sortCol === opt.value ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</button>
                      ))}
                    </div>
                  ) },
                ]}
              />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <FilterDropdown
                label="Estado"
                options={[
                  { value: "vigente", label: "Vigente" },
                  { value: "porVencer", label: "Por vencer" },
                  { value: "cancelado", label: "Cancelado" },
                  { value: "vencido", label: "Vencido" },
                ]}
                selected={filterEstado}
                onChange={(v) => { setFilterEstado(v); setPage(1); }}
              />
              <FilterDropdown
                label="Billing"
                options={[
                  { value: "pagado", label: "Pagado" },
                  { value: "trial", label: "Trial" },
                ]}
                selected={filterBilling}
                onChange={(v) => { setFilterBilling(v); setPage(1); }}
              />
            </div>
          </div>

          {filtered.length === 0 && !search && filterEstado.size === 0 && filterBilling.size === 0 ? (
            <EmptyState icon={<FileText size={24} />} title="No hay contratos registrados" onCreateClick={() => router.push("/contratos/crear")} />
          ) : (
            <>
              {/* ── Mobile card view ── */}
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

                {paginated.map((contrato) => {
                  const billing = billingBadge(contrato.billingMode);
                  const estadoDisplay = getEstadoDisplay(contrato);
                  const tenant = tenantMap[contrato.tenantId];
                  const empresa = tenant ? empresaMap[tenant.empresaId] : null;
                  const isSelected = selected.has(contrato.id);
                  const rowActions = [
                    { label: "Ver detalle", onClick: () => router.push(`/contratos/${contrato.id}`) },
                    ...(canEditar("Contratos") && contrato.estado === "vigente"
                      ? [{ label: "Editar", onClick: () => router.push(`/contratos/${contrato.id}/editar`) }]
                      : []),
                    ...(canDeshabilitar("Contratos") && contrato.estado === "vigente"
                      ? [{ label: "Cancelar", onClick: () => handleCancel(contrato), variant: "danger" as const }]
                      : []),
                    ...(canDeshabilitar("Contratos") && contrato.estado === "inactivo" && contrato.closureReason === "cancelado"
                      ? [{ label: "Reactivar", onClick: () => handleReactivar(contrato) }]
                      : []),
                  ];

                  const color = getAvatarColor(contrato.id);
                  const initials = (tenant?.nombre ?? "?").slice(0, 2).toUpperCase();
                  return (
                    <div key={contrato.id} className={`rounded-xl border overflow-hidden transition-colors ${isSelected ? "border-primary-300 bg-primary-50/30" : "border-neutral-200 bg-white"}`}>
                      {/* Header */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Checkbox checked={isSelected} onChange={() => toggleRow(contrato.id)} />
                        <div className="flex flex-col min-w-0 flex-1">
                          <button onClick={() => router.push(`/contratos/${contrato.id}`)} className="text-sm font-semibold text-neutral-900 hover:text-primary-600 text-left truncate transition-colors font-mono">
                            {contrato.displayId}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={estadoDisplay.variant as never}>{estadoDisplay.label}</Badge>
                          <RowMenu actions={rowActions} />
                        </div>
                      </div>
                      {/* Details */}
                      <div className="flex flex-col gap-2 px-4 py-3 border-t border-neutral-100">
                        <div className="flex items-center gap-2.5">
                          <IconBriefcase size={15} className="text-neutral-400 shrink-0" />
                          <span className="text-sm text-neutral-700">{tenant?.nombre ?? "—"} · {empresa?.nombreFantasia ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <IconCreditCard size={15} className="text-neutral-400 shrink-0" />
                          <Badge variant={billing.variant as never}>{billing.label}</Badge>
                        </div>
                        {contrato.planNombre && (
                          <div className="flex items-center gap-2.5">
                            <IconStack2 size={15} className="text-neutral-400 shrink-0" />
                            <span className="text-sm text-neutral-700">{contrato.planNombre}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <IconCoin size={15} className="text-neutral-400 shrink-0" />
                          <span className="text-sm text-neutral-700">
                            {contrato.montoBaseFinal != null ? `$${contrato.montoBaseFinal.toLocaleString("es-CL")}` : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <IconCalendar size={15} className="text-neutral-400 shrink-0" />
                          <span className="text-sm text-neutral-700">{contrato.fechaInicio} → {contrato.fechaVencimiento}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </>
                )}
              </div>

              {/* ── Desktop table view ── */}
              <div className="hidden md:flex md:flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden max-h-[calc(100dvh-320px)]">
                {/* Desktop bulk action bar */}
                {selected.size > 0 && (
                  <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2.5 dark:bg-white">
                    <button onClick={() => setSelected(new Set())} className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:text-neutral-700 transition-colors" title="Limpiar selección">
                      <X size={14} />
                    </button>
                    <span className="text-xs font-medium text-neutral-200 dark:text-neutral-700 tabular-nums">
                      {selected.size} contrato{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
                    </span>
                    <div className="h-4 w-px bg-neutral-700 dark:bg-neutral-200" />
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar selección">
                        <Download size={13} />
                        <span className="text-xs font-medium">Exportar</span>
                      </button>
                      {canDeshabilitar("Contratos") && hasVigente && (
                        <button onClick={() => { setBulkConfirmed(false); setBulkAlert("cancelar"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-red-400 hover:bg-red-900/40 dark:text-red-600 dark:hover:bg-red-50 transition-colors" title="Cancelar selección">
                          <CircleX size={13} />
                          <span className="text-xs font-medium">Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="table-scroll flex-1 overflow-y-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-neutral-100 bg-neutral-50">
                        <th className="w-10 px-4 py-2.5">
                          <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleSelectAll} />
                        </th>
                        <th className={thSort} onClick={() => toggleSort("displayId")}>
                          <span className="inline-flex items-center">Nº Contrato <SortIcon active={sortCol === "displayId"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("tenant")}>
                          <span className="inline-flex items-center">Dominio <SortIcon active={sortCol === "tenant"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("cliente")}>
                          <span className="inline-flex items-center">Cliente <SortIcon active={sortCol === "cliente"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("billingMode")}>
                          <span className="inline-flex items-center">Billing <SortIcon active={sortCol === "billingMode"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("planNombre")}>
                          <span className="inline-flex items-center">Plan <SortIcon active={sortCol === "planNombre"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("fechaInicio")}>
                          <span className="inline-flex items-center">Inicio <SortIcon active={sortCol === "fechaInicio"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("fechaVencimiento")}>
                          <span className="inline-flex items-center">Vencimiento <SortIcon active={sortCol === "fechaVencimiento"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("montoBaseFinal")}>
                          <span className="inline-flex items-center">Monto final <SortIcon active={sortCol === "montoBaseFinal"} dir={sortDir} /></span>
                        </th>
                        <th className={thBase}>Renov.</th>
                        <th className={thSort} onClick={() => toggleSort("estado")}>
                          <span className="inline-flex items-center">Estado <SortIcon active={sortCol === "estado"} dir={sortDir} /></span>
                        </th>
                        <th className="w-10 py-2.5 sticky right-0 bg-neutral-50"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((contrato) => {
                        const billing = billingBadge(contrato.billingMode);
                        const estadoDisplay = getEstadoDisplay(contrato);
                        const tenant = tenantMap[contrato.tenantId];
                        const empresa = tenant ? empresaMap[tenant.empresaId] : null;

                        return (
                          <tr key={contrato.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${selected.has(contrato.id) ? "bg-neutral-100" : ""}`}>
                            <td className="w-10 px-4 py-3">
                              <Checkbox checked={selected.has(contrato.id)} onChange={() => toggleRow(contrato.id)} />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => router.push(`/contratos/${contrato.id}`)}
                                className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 transition-colors font-mono text-left"
                              >
                                {contrato.displayId}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => router.push(`/tenants/${contrato.tenantId}`)}
                                className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 transition-colors text-left"
                              >
                                {tenant?.dominio ?? "—"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              {empresa ? (
                                <button
                                  onClick={() => router.push(`/clientes/${empresa.id}`)}
                                  className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 transition-colors"
                                >
                                  {empresa.nombreFantasia}
                                </button>
                              ) : (
                                <span className="text-sm text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={billing.variant as never}>{billing.label}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              {contrato.planNombre ? (
                                <span className="inline-flex rounded-md bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
                                  {contrato.planNombre}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-600">{contrato.fechaInicio}</td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-600">{contrato.fechaVencimiento}</td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                              {contrato.montoBaseFinal != null
                                ? `$${contrato.montoBaseFinal.toLocaleString("es-CL")}`
                                : <span className="text-neutral-400">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              {contrato.billingMode === "pagado" ? (
                                <Badge variant={contrato.autoRenew ? "active" : "default"}>
                                  {contrato.autoRenew ? "Sí" : "No"}
                                </Badge>
                              ) : (
                                <span className="text-xs text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={estadoDisplay.variant as never}>{estadoDisplay.label}</Badge>
                            </td>
                            <td className="w-10 py-3 pr-3 sticky right-0 bg-white">
                              <RowMenu actions={[
                                { label: "Ver detalle", onClick: () => router.push(`/contratos/${contrato.id}`) },
                                ...(canEditar("Contratos") && contrato.estado === "vigente"
                                  ? [{ label: "Editar", onClick: () => router.push(`/contratos/${contrato.id}/editar`) }]
                                  : []),
                                ...(canDeshabilitar("Contratos") && contrato.estado === "vigente"
                                  ? [{ label: "Cancelar", onClick: () => handleCancel(contrato), variant: "danger" as const }]
                                  : []),
                                ...(canDeshabilitar("Contratos") && contrato.estado === "inactivo" && contrato.closureReason === "cancelado"
                                  ? [{ label: "Reactivar", onClick: () => handleReactivar(contrato) }]
                                  : []),
                              ]} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
              </div>

              {/* ── Mobile pagination ── */}
              <div className="md:hidden">
                <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bulk action sticky bar */}
      {selected.size > 0 && (
        <div className="md:hidden fixed bottom-[72px] inset-x-0 z-40 animate-bulk-bar bg-neutral-900 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] px-4 pt-2 pb-2.5 dark:bg-white safe-area-bottom">
          <button
            onClick={() => setSelected(new Set())}
            className="absolute left-1/2 -translate-x-1/2 -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-500 hover:bg-neutral-100 transition-colors"
            title="Limpiar selección"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col gap-1.5">
            <div className="text-center">
              <span className="text-[11px] font-medium text-neutral-600 tabular-nums">
                {selected.size} contrato{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar">
                <Download size={16} />
                <span className="text-[9px] font-medium leading-none">Exportar</span>
              </button>
              {canDeshabilitar("Contratos") && hasVigente && (
                <button onClick={() => { setBulkConfirmed(false); setBulkAlert("cancelar"); }} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-red-400 hover:bg-red-900/40 dark:text-red-600 dark:hover:bg-red-50 transition-colors" title="Cancelar">
                  <CircleX size={16} />
                  <span className="text-[9px] font-medium leading-none">Cancelar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk action confirmation modal */}
      {bulkAlert && (() => {
        const affectedContratos = contratos.filter(c => selected.has(c.id));
        const label = "Cancelar contratos";
        const confirmColor = "bg-red-600 hover:bg-red-700 text-white";
        const iconColor = "bg-red-50";
        const icon = <CircleX size={24} className="text-red-500" />;
        const description = "Los contratos vigentes seleccionados serán cancelados. Los tenants asociados perderán acceso a los módulos del plan.";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBulkAlert(null)} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex flex-col items-center text-center gap-3 mb-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor}`}>{icon}</div>
                <h3 className="text-base font-semibold text-neutral-900">{label}</h3>
                <p className="text-sm text-neutral-500">{description}</p>
              </div>
              {/* Affected contracts */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-neutral-500 mb-1.5">Contratos afectados ({affectedContratos.length})</p>
                <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                  {affectedContratos.map(c => {
                    const ed = getEstadoDisplay(c);
                    const tenant = tenantMap[c.tenantId];
                    return (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-neutral-800 font-mono">{c.displayId}</span>
                          <span className="text-[11px] text-neutral-400 ml-1.5">{tenant?.nombre ?? "—"} · {c.planNombre ?? "Trial"}</span>
                        </div>
                        <Badge variant={ed.variant as never}>{ed.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkConfirmed}
                  onChange={(e) => setBulkConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-red-600 accent-red-600"
                />
                <span className="text-xs text-neutral-600">Entiendo que al cancelar los contratos, los tenants asociados perderán acceso a los módulos del plan.</span>
              </label>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setBulkAlert(null)}>Cancelar</Button>
                <button onClick={confirmBulkAction} disabled={!bulkConfirmed} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${confirmColor} ${!bulkConfirmed ? "opacity-40 cursor-not-allowed" : ""}`}>
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <AlertModal
        open={!!alertContrato}
        onClose={() => setAlertContrato(null)}
        onConfirm={confirmCancel}
        title="Cancelar contrato"
        message={`¿Estás seguro de cancelar el contrato ${alertContrato?.displayId}? El tenant "${tenantMap[alertContrato?.tenantId ?? ""]?.nombre ?? ""}" perderá acceso a los módulos del plan.`}
        confirmLabel="Cancelar contrato"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
