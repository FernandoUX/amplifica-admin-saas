"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { MOCK_AUDIT_LOG } from "@/lib/mock-data";
import { AuditEntidad, AuditAccion } from "@/lib/types";
import { Search, ChevronUp, ChevronDown, Download, ShieldCheck } from "lucide-react";

/* ── Helpers ── */

const ENTIDADES: AuditEntidad[] = ["Cliente", "Tenant", "Contrato", "Usuario", "Plan", "Trial Config"];
const ACCIONES: AuditAccion[] = ["Crear", "Editar", "Desactivar", "Reactivar", "Suspender", "Eliminar", "Reenviar invitación"];

const accionBadge = (accion: AuditAccion) => {
  if (accion === "Crear") return "active";
  if (accion === "Editar") return "default";
  if (accion === "Desactivar" || accion === "Suspender" || accion === "Eliminar") return "inactive";
  if (accion === "Reactivar") return "active";
  return "pending";
};

const formatTimestamp = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
};

type SortCol = "timestamp" | "usuarioNombre" | "entidad" | "accion" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-300 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [filterEntidad, setFilterEntidad] = useState<string>("");
  const [filterAccion, setFilterAccion] = useState<string>("");
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ── Filtrado ── */
  const filtered = MOCK_AUDIT_LOG.filter((e) => {
    if (filterEntidad && e.entidad !== filterEntidad) return false;
    if (filterAccion && e.accion !== filterAccion) return false;
    if (filterDesde) {
      const desde = new Date(filterDesde);
      if (new Date(e.timestamp) < desde) return false;
    }
    if (filterHasta) {
      const hasta = new Date(filterHasta);
      hasta.setHours(23, 59, 59, 999);
      if (new Date(e.timestamp) > hasta) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return `${e.usuarioNombre} ${e.entidad} ${e.entidadLabel} ${e.accion} ${e.campo ?? ""} ${e.valorAnterior ?? ""} ${e.valorNuevo ?? ""} ${e.ip}`.toLowerCase().includes(q);
    }
    return true;
  });

  /* ── Ordenamiento ── */
  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        let va = "";
        let vb = "";
        if (sortCol === "timestamp") { va = a.timestamp; vb = b.timestamp; }
        else { va = String((a as never)[sortCol] ?? ""); vb = String((b as never)[sortCol] ?? ""); }
        const cmp = va.localeCompare(vb);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
    setPage(1);
  };

  /* ── CSV Export ── */
  const exportCSV = () => {
    const headers = ["Timestamp", "Usuario", "Entidad", "ID Entidad", "Entidad (nombre)", "Acción", "Campo modificado", "Valor anterior", "Valor nuevo", "IP"];
    const rows = sorted.map((e) => [
      e.timestamp, e.usuarioNombre, e.entidad, e.entidadId, e.entidadLabel,
      e.accion, e.campo ?? "", e.valorAnterior ?? "", e.valorNuevo ?? "", e.ip,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectBase = "h-9 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white";
  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  const hasFilters = filterEntidad || filterAccion || filterDesde || filterHasta || search;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Audit Log" }]}
          title="Audit Log"
          description="Registro inmutable de todas las acciones realizadas en el sistema"
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  className="h-[44px] w-full sm:min-w-[280px] rounded-lg border border-neutral-300 pl-8 pr-3 text-base md:text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Buscar en el log…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">Entidad</label>
              <select value={filterEntidad} onChange={(e) => { setFilterEntidad(e.target.value); setPage(1); }} className={selectBase}>
                <option value="">Todas</option>
                {ENTIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">Acción</label>
              <select value={filterAccion} onChange={(e) => { setFilterAccion(e.target.value); setPage(1); }} className={selectBase}>
                <option value="">Todas</option>
                {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">Desde</label>
              <input type="date" value={filterDesde} onChange={(e) => { setFilterDesde(e.target.value); setPage(1); }} className={selectBase} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">Hasta</label>
              <input type="date" value={filterHasta} onChange={(e) => { setFilterHasta(e.target.value); setPage(1); }} className={selectBase} />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {hasFilters && (
                <button
                  onClick={() => { setFilterEntidad(""); setFilterAccion(""); setFilterDesde(""); setFilterHasta(""); setSearch(""); setPage(1); }}
                  className="h-9 px-3 rounded-lg text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Download size={14} />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Tabla */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white flex flex-col items-center gap-3 py-16 text-neutral-400">
              <ShieldCheck size={28} />
              <p className="text-sm font-medium">
                {hasFilters ? "No se encontraron registros con los filtros seleccionados" : "No hay registros de auditoría"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[1200px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className={thSort} onClick={() => toggleSort("timestamp")}>
                        <span className="inline-flex items-center">Timestamp <SortIcon active={sortCol === "timestamp"} dir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("usuarioNombre")}>
                        <span className="inline-flex items-center">Usuario <SortIcon active={sortCol === "usuarioNombre"} dir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("entidad")}>
                        <span className="inline-flex items-center">Entidad <SortIcon active={sortCol === "entidad"} dir={sortDir} /></span>
                      </th>
                      <th className={thBase}>ID Entidad</th>
                      <th className={thSort} onClick={() => toggleSort("accion")}>
                        <span className="inline-flex items-center">Acción <SortIcon active={sortCol === "accion"} dir={sortDir} /></span>
                      </th>
                      <th className={thBase}>Campo modificado</th>
                      <th className={thBase}>Valor anterior</th>
                      <th className={thBase}>Valor nuevo</th>
                      <th className={thBase}>IP de origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((e) => (
                      <tr key={e.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{formatTimestamp(e.timestamp)}</td>
                        <td className="px-4 py-3 text-sm text-neutral-800 font-medium whitespace-nowrap">{e.usuarioNombre}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <Badge variant="default">{e.entidad}</Badge>
                            <span className="text-xs text-neutral-400 mt-0.5 truncate max-w-[140px]">{e.entidadLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{e.entidadId}</td>
                        <td className="px-4 py-3">
                          <Badge variant={accionBadge(e.accion) as never}>{e.accion}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{e.campo ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-500 max-w-[160px] truncate">{e.valorAnterior ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-500 max-w-[160px] truncate">{e.valorNuevo ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{e.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
