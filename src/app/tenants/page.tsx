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
import { MOCK_TENANTS, MOCK_EMPRESAS, MOCK_USUARIOS, MOCK_CONTRATOS } from "@/lib/mock-data";
import { Tenant, Contrato } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import {
  IconBuildingStore as Server, IconPlus as Plus, IconSearch as Search,
  IconChevronUp as ChevronUp, IconChevronDown as ChevronDown, IconClock as Clock,
  IconCircleCheck as CircleCheck, IconPlayerPause as CirclePause, IconX as X,
  IconDownload as Download, IconTrash as Trash2, IconCircleMinus as CircleMinus,
  IconMinus as Minus, IconCheck as Check, IconUsers as Users,
  IconBriefcase, IconWorld, IconCreditCard, IconStack2, IconAlertTriangle,
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
  if (mode === "trial") return { variant: "trial", label: "Trial" };
  return { variant: "default", label: "Sin contrato" };
};

const statusLabel = (s: string) => {
  if (s === "activo") return "Activo";
  if (s === "suspendido") return "Suspendido";
  return "Inactivo";
};
const statusVariant = (s: string) => {
  if (s === "activo") return "active";
  if (s === "suspendido") return "pending";
  return "inactive";
};

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

type SortCol = "dominio" | "cliente" | "billingMode" | "planNombre" | "operationalStatus" | "fechaCreacion" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-600 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

/** Build impact summary for suspend/inactivate modals */
function buildImpactSummary(tenantIds: string[]) {
  const idSet = new Set(tenantIds);
  // Active contracts linked to those tenants
  const contratos = MOCK_CONTRATOS.filter(c => idSet.has(c.tenantId) && c.estado === "vigente");
  // Users with memberships in those tenants
  const usuariosAfectados = MOCK_USUARIOS.filter(u =>
    u.memberships.some(m => idSet.has(m.tenantId))
  );
  // Unique plans
  const planes = [...new Set(contratos.map(c => c.planNombre).filter(Boolean))] as string[];

  return { contratos, usuariosAfectados, planes };
}

function ImpactDetail({ tenantIds }: { tenantIds: string[] }) {
  const { usuariosAfectados, planes } = buildImpactSummary(tenantIds);
  if (planes.length === 0 && usuariosAfectados.length === 0) return null;

  return (
    <div className="mt-3 w-full space-y-2 text-left">
      {planes.length > 0 && (
        <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
          <span className="block text-xs font-semibold text-neutral-600 mb-1">Planes activos</span>
          <div className="flex flex-wrap gap-1.5">
            {planes.map(p => (
              <span key={p} className="inline-flex rounded-md bg-white border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">{p}</span>
            ))}
          </div>
        </div>
      )}
      {usuariosAfectados.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              {usuariosAfectados.length} usuario{usuariosAfectados.length !== 1 ? "s" : ""} perderá{usuariosAfectados.length !== 1 ? "n" : ""} acceso
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenantsPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<Set<string>>(new Set());
  const [filterBilling, setFilterBilling] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>("fechaCreacion");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [alertTenant, setAlertTenant] = useState<Tenant | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAlert, setBulkAlert] = useState<"suspender" | "activar" | "desactivar" | null>(null);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });
  const [period, setPeriod] = useState<Period>(30);

  // Build lookup for client names & data
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e.nombreFantasia]));
  const empresaObjMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  const filtered = tenants.filter((t) => {
    const clienteNombre = empresaMap[t.empresaId] || "";
    const matchSearch = `${t.nombre} ${clienteNombre} ${t.dominio}`.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado.size === 0 || filterEstado.has(t.operationalStatus);
    const matchBilling = filterBilling.size === 0 || filterBilling.has(t.billingMode);
    return matchSearch && matchEstado && matchBilling;
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        let va = "";
        let vb = "";
        if (sortCol === "cliente") {
          va = empresaMap[a.empresaId] || "";
          vb = empresaMap[b.empresaId] || "";
        } else if (sortCol === "dominio") {
          va = a.dominio || "";
          vb = b.dominio || "";
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

  const handleSuspend = (tenant: Tenant) => setAlertTenant(tenant);

  const confirmSuspend = () => {
    if (!alertTenant) return;
    const isActive = alertTenant.operationalStatus === "activo";
    const newStatus = isActive ? "suspendido" : "activo";
    setTenants((prev) => prev.map((t) =>
      t.id === alertTenant.id ? { ...t, operationalStatus: newStatus as Tenant["operationalStatus"] } : t
    ));
    setToastMsg({
      title: isActive ? "Tenant suspendido" : "Tenant reactivado",
      message: `"${alertTenant.nombre}" ahora está ${statusLabel(newStatus).toLowerCase()}.`,
    });
    setToast(true);
    setAlertTenant(null);
  };

  // Bulk actions
  const allPageIds = paginated.map(t => t.id);
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

  const selectedTenants = tenants.filter(t => selected.has(t.id));
  const hasActiveTenants = selectedTenants.some(t => t.operationalStatus === "activo");
  const hasNonActiveTenants = selectedTenants.some(t => t.operationalStatus !== "activo");

  const confirmBulkAction = () => {
    if (!bulkAlert) return;
    const count = selected.size;
    if (bulkAlert === "suspender") {
      setTenants(prev => prev.map(t => selected.has(t.id) ? { ...t, operationalStatus: "suspendido" as const } : t));
      setToastMsg({ title: "Tenants suspendidos", message: `${count} tenant${count !== 1 ? "s" : ""} suspendido${count !== 1 ? "s" : ""}.` });
    } else if (bulkAlert === "activar") {
      setTenants(prev => prev.map(t => selected.has(t.id) ? { ...t, operationalStatus: "activo" as const } : t));
      setToastMsg({ title: "Tenants activados", message: `${count} tenant${count !== 1 ? "s" : ""} reactivado${count !== 1 ? "s" : ""}.` });
    }
    setToast(true);
    setBulkAlert(null);
    setBulkConfirmed(false);
    setSelected(new Set());
  };

  const thBase = "px-4 py-2.5 text-left text-sm font-semibold text-neutral-600";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  const cur = filterByPeriod(tenants, period);
  const prv = filterByPeriod(tenants, period * 2, period);
  const growthTotal = calcGrowth(cur.length, prv.length);
  const growthTrial = calcGrowth(cur.filter(t => t.billingMode === "trial").length, prv.filter(t => t.billingMode === "trial").length);
  const growthPagados = calcGrowth(cur.filter(t => t.billingMode === "pagado").length, prv.filter(t => t.billingMode === "pagado").length);
  const growthSuspendidos = calcGrowth(cur.filter(t => t.operationalStatus === "suspendido").length, prv.filter(t => t.operationalStatus === "suspendido").length);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Tenants" }]}
          title="Tenants"
          description="Entornos operativos aislados de cada cliente"
          stickyMobileAction={
            canCrear("Tenants")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/tenants/crear")}>Crear tenant</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search && filterEstado.size === 0 && filterBilling.size === 0 ? (
            <EmptyState icon={<Server size={24} />} title="No hay tenants registrados" onCreateClick={() => router.push("/tenants/crear")} />
          ) : (
            <>
              {/* Search + filter toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      className="h-[44px] w-full rounded-lg bg-neutral-100 pl-8 pr-3 text-base md:text-sm text-neutral-800 placeholder:text-neutral-500 outline-none focus:bg-white focus:ring-2 focus:ring-primary-100"
                      placeholder="Buscar por nombre, cliente o dominio..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>
                  <MobileFilterModal
                    activeCount={filterEstado.size + filterBilling.size}
                    sections={[
                      {
                        label: "Estado",
                        content: (
                          <FilterCheckboxList
                            options={[
                              { value: "activo", label: "Activo", dot: "bg-emerald-500" },
                              { value: "suspendido", label: "Suspendido", dot: "bg-red-500" },
                              { value: "inactivo", label: "Inactivo", dot: "bg-neutral-400" },
                            ]}
                            selected={filterEstado}
                            onChange={(v) => { setFilterEstado(v); setPage(1); }}
                          />
                        ),
                      },
                      {
                        label: "Billing",
                        content: (
                          <FilterCheckboxList
                            options={[
                              { value: "pagado", label: "Pagado" },
                              { value: "trial", label: "Trial" },
                              { value: "sin_contrato", label: "Sin contrato" },
                            ]}
                            selected={filterBilling}
                            onChange={(v) => { setFilterBilling(v); setPage(1); }}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <FilterDropdown
                    label="Estado"
                    options={[
                      { value: "activo", label: "Activo", dot: "bg-emerald-500" },
                      { value: "suspendido", label: "Suspendido", dot: "bg-red-500" },
                      { value: "inactivo", label: "Inactivo", dot: "bg-neutral-400" },
                    ]}
                    selected={filterEstado}
                    onChange={(v) => { setFilterEstado(v); setPage(1); }}
                  />
                  <FilterDropdown
                    label="Billing"
                    options={[
                      { value: "pagado", label: "Pagado" },
                      { value: "trial", label: "Trial" },
                      { value: "sin_contrato", label: "Sin contrato" },
                    ]}
                    selected={filterBilling}
                    onChange={(v) => { setFilterBilling(v); setPage(1); }}
                  />
                </div>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-1">
                  <Checkbox checked={allPageSelected} indeterminate={!allPageSelected && somePageSelected} onChange={toggleSelectAll} />
                  <span className="text-xs text-neutral-500">{allPageSelected ? "Deseleccionar todo" : "Seleccionar todo"}</span>
                </div>
                {paginated.map((tenant) => {
                  const billing = billingBadge(tenant.billingMode);
                  const rowActions = [
                    { label: "Ver detalle", onClick: () => router.push(`/tenants/${tenant.id}`) },
                    ...(canEditar("Tenants") ? [{ label: "Editar", onClick: () => router.push(`/tenants/${tenant.id}/editar`) }] : []),
                    ...(tenant.operationalStatus === "activo" ? [{ label: "Impersonar", onClick: () => window.open(`https://${tenant.dominio}`, "_blank") }] : []),
                    ...(canDeshabilitar("Tenants") && tenant.operationalStatus === "activo"
                      ? [{ label: "Suspender", onClick: () => handleSuspend(tenant), variant: "danger" as const }]
                      : []),
                    ...(canDeshabilitar("Tenants") && tenant.operationalStatus !== "activo"
                      ? [{ label: "Reactivar", onClick: () => handleSuspend(tenant) }]
                      : []),
                  ];
                  return (
                    <div key={tenant.id} className={`rounded-xl border overflow-hidden ${
                      selected.has(tenant.id) ? "border-primary-300 bg-primary-50/30" : "border-neutral-200 bg-white"
                    }`}>
                      {/* Header row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Checkbox checked={selected.has(tenant.id)} onChange={() => toggleRow(tenant.id)} />
                        {(() => {
                          const emp = empresaObjMap[tenant.empresaId];
                          const initials = (emp?.nombreFantasia ?? "?").slice(0, 2).toUpperCase();
                          const color = getAvatarColor(tenant.id);
                          return (
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[11px] font-bold shrink-0 ${color.bg} ${color.border} ${color.text}`}>
                              {initials}
                            </div>
                          );
                        })()}
                        <div className="flex flex-col min-w-0 flex-1">
                          <button
                            onClick={() => router.push(`/tenants/${tenant.id}`)}
                            className="text-sm font-semibold text-neutral-900 hover:text-primary-600 text-left truncate transition-colors"
                          >
                            {tenant.nombre}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            tenant.operationalStatus === "activo" ? "bg-emerald-50 text-emerald-700" :
                            tenant.operationalStatus === "suspendido" ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-600"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              tenant.operationalStatus === "activo" ? "bg-emerald-500" :
                              tenant.operationalStatus === "suspendido" ? "bg-red-500" : "bg-neutral-400"
                            }`} />
                            {statusLabel(tenant.operationalStatus)}
                          </span>
                          <RowMenu actions={rowActions} />
                        </div>
                      </div>
                      {/* Details */}
                      <div className="flex flex-col gap-2 px-4 py-3 border-t border-neutral-100">
                        <div className="flex items-center gap-2.5">
                          <IconWorld size={15} className="text-neutral-400 shrink-0" />
                          <span className="text-sm text-neutral-700 truncate">{tenant.dominio}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <IconBriefcase size={15} className="text-neutral-400 shrink-0" />
                          <span className="text-sm text-neutral-700">{empresaMap[tenant.empresaId] || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <IconCreditCard size={15} className="text-neutral-400 shrink-0" />
                          <Badge variant={billing.variant as never}>{billing.label}</Badge>
                        </div>
                        {tenant.planNombre && (
                          <div className="flex items-center gap-2.5">
                            <IconStack2 size={15} className="text-neutral-400 shrink-0" />
                            <span className="text-sm text-neutral-700">{tenant.planNombre}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                      {selected.size} tenant{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
                    </span>
                    <div className="h-4 w-px bg-neutral-700 dark:bg-neutral-200" />
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar selección">
                        <Download size={13} />
                        <span className="text-xs font-medium">Exportar</span>
                      </button>
                      {canDeshabilitar("Tenants") && hasNonActiveTenants && (
                        <button onClick={() => { setBulkConfirmed(false); setBulkAlert("activar"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-emerald-400 hover:bg-emerald-900/40 dark:text-emerald-600 dark:hover:bg-emerald-50 transition-colors" title="Activar selección">
                          <CircleCheck size={13} />
                          <span className="text-xs font-medium">Activar</span>
                        </button>
                      )}
                      {canDeshabilitar("Tenants") && hasActiveTenants && (
                        <button onClick={() => { setBulkConfirmed(false); setBulkAlert("suspender"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-amber-400 hover:bg-amber-900/40 dark:text-amber-600 dark:hover:bg-amber-50 transition-colors" title="Suspender selección">
                          <CirclePause size={13} />
                          <span className="text-xs font-medium">Suspender</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="table-scroll">
                  <table className="w-full min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-neutral-100 bg-neutral-50">
                        <th className="w-10 py-2.5 pl-4 pr-0">
                          <Checkbox checked={allPageSelected} indeterminate={!allPageSelected && somePageSelected} onChange={toggleSelectAll} />
                        </th>
                        <th className={thSort} onClick={() => toggleSort("cliente")}>
                          <span className="inline-flex items-center">Cliente <SortIcon active={sortCol === "cliente"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("dominio")}>
                          <span className="inline-flex items-center">Subdominio <SortIcon active={sortCol === "dominio"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("billingMode")}>
                          <span className="inline-flex items-center">Billing <SortIcon active={sortCol === "billingMode"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("planNombre")}>
                          <span className="inline-flex items-center">Plan <SortIcon active={sortCol === "planNombre"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("operationalStatus")}>
                          <span className="inline-flex items-center">Estado <SortIcon active={sortCol === "operationalStatus"} dir={sortDir} /></span>
                        </th>
                        <th className="w-10 py-2.5 sticky right-0 bg-neutral-50"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((tenant) => {
                        const billing = billingBadge(tenant.billingMode);
                        return (
                          <tr key={tenant.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${selected.has(tenant.id) ? "bg-neutral-100" : ""}`}>
                            <td className="pl-4 pr-0 py-3">
                              <div className="flex items-center gap-2.5">
                                <Checkbox checked={selected.has(tenant.id)} onChange={() => toggleRow(tenant.id)} />
                                {(() => {
                                  const emp = empresaObjMap[tenant.empresaId];
                                  const initials = (emp?.nombreFantasia ?? "?").slice(0, 2).toUpperCase();
                                  const color = getAvatarColor(tenant.id);
                                  return (
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-semibold ${color.bg} ${color.border} ${color.text}`}>
                                      {initials}
                                    </div>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => router.push(`/clientes/${tenant.empresaId}`)}
                                className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 transition-colors text-left"
                              >
                                {empresaMap[tenant.empresaId] || "—"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => router.push(`/tenants/${tenant.id}`)}
                                className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 text-left transition-colors"
                              >
                                {tenant.dominio}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={billing.variant as never}>{billing.label}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              {tenant.planNombre ? (
                                <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                                  {tenant.planNombre}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  tenant.operationalStatus === "activo" ? "bg-emerald-500" :
                                  tenant.operationalStatus === "suspendido" ? "bg-red-500" : "bg-neutral-400"
                                }`} />
                                <span className="text-base font-medium text-neutral-700">{statusLabel(tenant.operationalStatus)}</span>
                              </span>
                            </td>
                            <td className="w-10 py-3 pr-3 sticky right-0 bg-white">
                              <RowMenu actions={[
                                { label: "Ver detalle", onClick: () => router.push(`/tenants/${tenant.id}`) },
                                ...(canEditar("Tenants") ? [{ label: "Editar", onClick: () => router.push(`/tenants/${tenant.id}/editar`) }] : []),
                                ...(tenant.operationalStatus === "activo" ? [{ label: "Impersonar", onClick: () => window.open(`https://${tenant.dominio}`, "_blank") }] : []),
                                ...(canDeshabilitar("Tenants") && tenant.operationalStatus === "activo"
                                  ? [{ label: "Suspender", onClick: () => handleSuspend(tenant), variant: "danger" as const }]
                                  : []),
                                ...(canDeshabilitar("Tenants") && tenant.operationalStatus !== "activo"
                                  ? [{ label: "Reactivar", onClick: () => handleSuspend(tenant) }]
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

              {/* Mobile pagination */}
              <div className="md:hidden">
                <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bulk action sticky bar */}
      {selected.size > 0 && (
        <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-neutral-900 px-5 pt-2 pb-3.5 shadow-2xl dark:bg-white min-w-[190px] animate-bulk-bar">
            <button
              onClick={() => setSelected(new Set())}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 dark:bg-neutral-100 dark:text-neutral-500 dark:hover:bg-neutral-200 dark:hover:text-neutral-700 transition-colors"
              title="Limpiar selección"
            >
              <X size={13} />
            </button>
            <span className="text-xs font-medium text-neutral-200 dark:text-neutral-700 tabular-nums text-center leading-tight">
              {selected.size} tenant{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors">
                <Download size={13} />
                Exportar
              </button>
              {canDeshabilitar("Tenants") && hasNonActiveTenants && (
                <button onClick={() => { setBulkConfirmed(false); setBulkAlert("activar"); }} className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium text-emerald-400 hover:bg-emerald-900/40 dark:text-emerald-600 dark:hover:bg-emerald-50 transition-colors">
                  <CircleCheck size={13} />
                  Activar
                </button>
              )}
              {canDeshabilitar("Tenants") && hasActiveTenants && (
                <button onClick={() => { setBulkConfirmed(false); setBulkAlert("suspender"); }} className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium text-amber-400 hover:bg-amber-900/40 dark:text-amber-600 dark:hover:bg-amber-50 transition-colors">
                  <CirclePause size={13} />
                  Suspender
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertModal
        open={!!alertTenant}
        onClose={() => setAlertTenant(null)}
        onConfirm={confirmSuspend}
        title={alertTenant?.operationalStatus === "activo" ? "Suspender tenant" : "Reactivar tenant"}
        message={
          alertTenant?.operationalStatus === "activo"
            ? (
              <>
                <span>Al suspender &quot;{alertTenant?.nombre}&quot;, los usuarios perderán acceso.</span>
                {alertTenant && <ImpactDetail tenantIds={[alertTenant.id]} />}
              </>
            )
            : `¿Deseas reactivar "${alertTenant?.nombre}"? Los usuarios recuperarán acceso.`
        }
        confirmLabel={alertTenant?.operationalStatus === "activo" ? "Suspender" : "Reactivar"}
      />

      {bulkAlert && (() => {
        const isSuspender = bulkAlert === "suspender";
        const isDesactivar = bulkAlert === "desactivar";
        const needsConfirm = isSuspender || isDesactivar;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBulkAlert(null)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <IconAlertTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {bulkAlert === "activar" ? "Activar" : isSuspender ? "Suspender" : "Desactivar"} {selected.size} tenant{selected.size !== 1 ? "s" : ""}
                </h3>
                <div className="text-sm text-neutral-500">
                  {bulkAlert === "activar"
                    ? "Los tenants seleccionados recuperarán acceso y procesarán pedidos."
                    : (
                      <>
                        <span>Los tenants seleccionados quedarán bloqueados y los usuarios perderán acceso.</span>
                        <ImpactDetail tenantIds={[...selected]} />
                      </>
                    )
                  }
                </div>
                {needsConfirm && (
                  <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bulkConfirmed}
                      onChange={(e) => setBulkConfirmed(e.target.checked)}
                      className={`mt-0.5 h-4 w-4 rounded border-neutral-300 ${isSuspender ? "text-red-600 accent-red-600" : "text-neutral-700 accent-neutral-700"}`}
                    />
                    <span className="text-xs text-neutral-600">
                      {isSuspender
                        ? "Entiendo que al suspender se bloquearán los tenants y usuarios asociados."
                        : "Entiendo que al desactivar se desactivarán los tenants y usuarios asociados."}
                    </span>
                  </label>
                )}
                <div className="flex w-full gap-3 mt-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setBulkAlert(null)}>Cancelar</Button>
                  <Button
                    variant="danger"
                    className={`flex-1 ${needsConfirm && !bulkConfirmed ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={needsConfirm && !bulkConfirmed}
                    onClick={() => { confirmBulkAction(); setBulkAlert(null); }}
                  >
                    {bulkAlert === "activar" ? "Activar" : isSuspender ? "Suspender" : "Desactivar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
