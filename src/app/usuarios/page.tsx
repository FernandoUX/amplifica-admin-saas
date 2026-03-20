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
import { MOCK_USUARIOS, MOCK_TENANTS } from "@/lib/mock-data";
import { Usuario } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import {
  IconUsers as Users, IconPlus as Plus, IconSearch as Search,
  IconChevronUp as ChevronUp, IconChevronDown as ChevronDown,
  IconX as X, IconDownload as Download, IconTrash as Trash2,
  IconCheck as Check, IconMinus as Minus,
  IconCircleCheck as CircleCheck, IconCircleMinus as CircleMinus,
  IconAlertTriangle as AlertTriangle,
} from "@tabler/icons-react";

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

const tipoBadge = (tipo: string) => {
  if (tipo === "SaaS Admin") return { variant: "default", label: "SaaS Admin" };
  if (tipo === "Staff Amplifica") return { variant: "pending", label: "Staff" };
  return { variant: "active", label: "Tenant" };
};

const estadoBadge = (estado: string) => {
  if (estado === "Activo") return { variant: "active", label: "Activo" };
  if (estado === "Pendiente de activación") return { variant: "pending", label: "Pendiente" };
  return { variant: "inactive", label: "Inactivo" };
};

const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));

const getUserTenantNames = (u: Usuario) => {
  if (u.memberships.length === 0) return "—";
  return u.memberships.map((m) => tenantMap[m.tenantId]?.nombre ?? m.tenantId).join(", ");
};

const getUserRolDisplay = (u: Usuario) => {
  if (u.tipo === "Usuario Tenant" && u.memberships.length > 1) {
    const roles = [...new Set(u.memberships.map((m) => m.rol))];
    return roles.join(", ");
  }
  return u.rol;
};

const formatLogin = (d: string | null) => {
  if (!d) return "Nunca";
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

type SortCol = "nombre" | "email" | "tipo" | "rol" | "estado" | "ultimoLogin" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-600 ml-0.5" />;
  return dir === "asc"
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

export default function UsuariosPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<Set<string>>(new Set());
  const [filterTipo, setFilterTipo] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertUsuario, setAlertUsuario] = useState<Usuario | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAlert, setBulkAlert] = useState<"desactivar" | "activar" | "eliminar" | null>(null);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);

  const filtered = usuarios.filter((u) => {
    const tenants = getUserTenantNames(u);
    const matchSearch = `${u.nombres} ${u.apellidos} ${u.email} ${u.rol} ${u.tipo} ${tenants}`.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado.size === 0 || filterEstado.has(u.estado);
    const matchTipo = filterTipo.size === 0 || filterTipo.has(u.tipo);
    return matchSearch && matchEstado && matchTipo;
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        let va = "";
        let vb = "";
        if (sortCol === "nombre") {
          va = `${a.nombres} ${a.apellidos}`;
          vb = `${b.nombres} ${b.apellidos}`;
        } else if (sortCol === "ultimoLogin") {
          va = a.ultimoLogin ?? "";
          vb = b.ultimoLogin ?? "";
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

  const handleDesactivar = (u: Usuario) => setAlertUsuario(u);

  const confirmDesactivar = () => {
    if (!alertUsuario) return;
    setUsuarios((prev) => prev.map((u) =>
      u.id === alertUsuario.id ? { ...u, estado: "Inactivo" as const } : u
    ));
    setToastMsg({ title: "Usuario desactivado", message: `"${alertUsuario.nombres} ${alertUsuario.apellidos}" ha sido desactivado.` });
    setToast(true);
    setAlertUsuario(null);
  };

  const handleReactivar = (u: Usuario) => {
    setUsuarios((prev) => prev.map((x) =>
      x.id === u.id ? { ...x, estado: "Activo" as const } : x
    ));
    setToastMsg({ title: "Usuario reactivado", message: `"${u.nombres} ${u.apellidos}" está activo nuevamente.` });
    setToast(true);
  };

  // ── Bulk selection helpers ──
  const allPageIds = paginated.map(u => u.id);
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

  const selectedUsuarios = usuarios.filter(u => selected.has(u.id));
  const hasActive    = selectedUsuarios.some(u => u.estado === "Activo");
  const hasInactive  = selectedUsuarios.some(u => u.estado === "Inactivo");

  const confirmBulkAction = () => {
    if (!bulkAlert) return;
    const count = selected.size;
    if (bulkAlert === "desactivar") {
      setUsuarios(prev => prev.map(u => selected.has(u.id) ? { ...u, estado: "Inactivo" as const } : u));
      setToastMsg({ title: "Usuarios desactivados", message: `${count} usuario${count !== 1 ? "s" : ""} desactivado${count !== 1 ? "s" : ""}.` });
    } else if (bulkAlert === "activar") {
      setUsuarios(prev => prev.map(u => selected.has(u.id) ? { ...u, estado: "Activo" as const } : u));
      setToastMsg({ title: "Usuarios activados", message: `${count} usuario${count !== 1 ? "s" : ""} reactivado${count !== 1 ? "s" : ""}.` });
    } else if (bulkAlert === "eliminar") {
      setUsuarios(prev => prev.filter(u => !selected.has(u.id)));
      setToastMsg({ title: "Usuarios eliminados", message: `${count} usuario${count !== 1 ? "s" : ""} eliminado${count !== 1 ? "s" : ""}.` });
    }
    setToast(true);
    setBulkAlert(null);
    setBulkConfirmed(false);
    setSelected(new Set());
  };

  const thBase = "px-4 py-2.5 text-left text-sm font-semibold text-neutral-600";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Usuarios" }]}
          title="Usuarios"
          description="Gestión global de accesos al ecosistema"
          stickyMobileAction={
            canCrear("Usuarios")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/usuarios/crear")}>Crear usuario</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">

          {/* Search + filter toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  className="h-[44px] w-full rounded-lg bg-neutral-100 pl-8 pr-3 text-base md:text-sm text-neutral-800 placeholder:text-neutral-500 outline-none focus:bg-white focus:ring-2 focus:ring-primary-100"
                  placeholder="Buscar por nombre, correo o rol..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <MobileFilterModal
                activeCount={filterEstado.size + filterTipo.size}
                sections={[
                  { label: "Estado", content: <FilterCheckboxList options={[
                    { value: "Activo", label: "Activo", dot: "bg-emerald-500" },
                    { value: "Pendiente de activación", label: "Pendiente", dot: "bg-amber-400" },
                    { value: "Inactivo", label: "Inactivo", dot: "bg-neutral-400" },
                  ]} selected={filterEstado} onChange={(v) => { setFilterEstado(v); setPage(1); }} /> },
                  { label: "Tipo", content: <FilterCheckboxList options={[
                    { value: "SaaS Admin", label: "SaaS Admin" },
                    { value: "Staff Amplifica", label: "Staff" },
                    { value: "Usuario Tenant", label: "Tenant" },
                  ]} selected={filterTipo} onChange={(v) => { setFilterTipo(v); setPage(1); }} /> },
                  { label: "Ordenar por", content: (
                    <div className="flex flex-wrap gap-2">
                      {[{ value: "nombre", label: "Nombre" }, { value: "email", label: "Correo" }, { value: "tipo", label: "Tipo" }, { value: "estado", label: "Estado" }, { value: "ultimoLogin", label: "Último login" }].map(opt => (
                        <button key={opt.value} onClick={() => { const v = opt.value as SortCol; if (v === sortCol) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(v); setSortDir("asc"); } }} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sortCol === opt.value ? "bg-primary-50 text-primary-700 font-medium" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{opt.label}{sortCol === opt.value ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</button>
                      ))}
                    </div>
                  )},
                ]}
              />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <FilterDropdown
                label="Estado"
                options={[
                  { value: "Activo", label: "Activo", dot: "bg-emerald-500" },
                  { value: "Pendiente de activación", label: "Pendiente", dot: "bg-amber-400" },
                  { value: "Inactivo", label: "Inactivo", dot: "bg-neutral-400" },
                ]}
                selected={filterEstado}
                onChange={(v) => { setFilterEstado(v); setPage(1); }}
              />
              <FilterDropdown
                label="Tipo"
                options={[
                  { value: "SaaS Admin", label: "SaaS Admin" },
                  { value: "Staff Amplifica", label: "Staff" },
                  { value: "Usuario Tenant", label: "Tenant" },
                ]}
                selected={filterTipo}
                onChange={(v) => { setFilterTipo(v); setPage(1); }}
              />
            </div>
          </div>

          {filtered.length === 0 && !search && filterEstado.size === 0 && filterTipo.size === 0 ? (
            <EmptyState icon={<Users size={24} />} title="No hay usuarios registrados" onCreateClick={() => router.push("/usuarios/crear")} />
          ) : (
            <>
              {/* ── Mobile cards ── */}
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

                    {paginated.map((u) => {
                      const tipo = tipoBadge(u.tipo);
                      const estado = estadoBadge(u.estado);
                      const isSelected = selected.has(u.id);
                      const rowActions = [
                        { label: "Ver detalle", onClick: () => router.push(`/usuarios/${u.id}`) },
                        ...(canEditar("Usuarios") && u.estado !== "Inactivo"
                          ? [{ label: "Editar", onClick: () => router.push(`/usuarios/${u.id}/editar`) }]
                          : []),
                        ...(u.estado === "Pendiente de activación"
                          ? [{ label: "Reenviar invitación", onClick: () => { setToastMsg({ title: "Invitación reenviada", message: `Se reenvió la invitación a ${u.email}` }); setToast(true); } }]
                          : []),
                        ...(canDeshabilitar("Usuarios") && u.estado === "Activo"
                          ? [{ label: "Desactivar", onClick: () => handleDesactivar(u), variant: "danger" as const }]
                          : []),
                        ...(canDeshabilitar("Usuarios") && u.estado === "Inactivo"
                          ? [{ label: "Reactivar", onClick: () => handleReactivar(u) }]
                          : []),
                      ];
                      const color = getAvatarColor(u.id);
                      const initials = `${u.nombres.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase();
                      return (
                        <div
                          key={u.id}
                          className={`rounded-xl border overflow-hidden transition-colors ${isSelected ? "border-primary-300 bg-primary-50/30" : "border-neutral-200 bg-white"}`}
                        >
                          {/* Header */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            <Checkbox checked={isSelected} onChange={() => toggleRow(u.id)} />
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-bold shrink-0 ${color.bg} ${color.border} ${color.text}`}>
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <button onClick={() => router.push(`/usuarios/${u.id}`)} className="text-sm font-semibold text-neutral-900 hover:text-primary-600 text-left truncate transition-colors">
                                {u.nombres} {u.apellidos}
                              </button>
                              <span className="text-xs text-neutral-400 truncate">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={estado.variant as never}>{estado.label}</Badge>
                              <RowMenu actions={rowActions} />
                            </div>
                          </div>
                          {/* Details */}
                          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/50">
                            <Badge variant={tipo.variant as never}>{tipo.label}</Badge>
                            <span className="text-xs text-neutral-500 truncate">{getUserRolDisplay(u)}</span>
                            <span className="text-xs text-neutral-400 ml-auto truncate">{getUserTenantNames(u)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* ── Desktop table ── */}
              <div className="hidden md:block rounded-xl border border-neutral-200 bg-white overflow-hidden">
                {/* Desktop bulk action bar — top of table */}
                {selected.size > 0 && (
                  <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2.5 dark:bg-white">
                    <button onClick={() => setSelected(new Set())} className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:text-neutral-700 transition-colors" title="Limpiar selección">
                      <X size={14} />
                    </button>
                    <span className="text-xs font-medium text-neutral-200 dark:text-neutral-700 tabular-nums">
                      {selected.size} usuario{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
                    </span>
                    <div className="h-4 w-px bg-neutral-700 dark:bg-neutral-200" />
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar selección">
                        <Download size={13} />
                        <span className="text-xs font-medium">Exportar</span>
                      </button>
                      {canDeshabilitar("Usuarios") && hasInactive && (
                        <button onClick={() => { setBulkConfirmed(false); setBulkAlert("activar"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-emerald-400 hover:bg-emerald-900/40 dark:text-emerald-600 dark:hover:bg-emerald-50 transition-colors" title="Activar selección">
                          <CircleCheck size={13} />
                          <span className="text-xs font-medium">Activar</span>
                        </button>
                      )}
                      {canDeshabilitar("Usuarios") && hasActive && (
                        <button onClick={() => { setBulkConfirmed(false); setBulkAlert("desactivar"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-amber-400 hover:bg-amber-900/40 dark:text-amber-600 dark:hover:bg-amber-50 transition-colors" title="Desactivar selección">
                          <CircleMinus size={13} />
                          <span className="text-xs font-medium">Desactivar</span>
                        </button>
                      )}
                      <button onClick={() => { setBulkConfirmed(false); setBulkAlert("eliminar"); }} className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-red-400 hover:bg-red-900/40 dark:text-red-600 dark:hover:bg-red-50 transition-colors" title="Eliminar selección">
                        <Trash2 size={13} />
                        <span className="text-xs font-medium">Eliminar</span>
                      </button>
                    </div>
                  </div>
                )}
                <div className="table-scroll">
                  <table className="w-full min-w-[1100px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-neutral-100 bg-neutral-50">
                        <th className="w-10 px-4 py-2.5">
                          <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleSelectAll} />
                        </th>
                        <th className={thSort} onClick={() => toggleSort("nombre")}>
                          <span className="inline-flex items-center">Nombre completo <SortIcon active={sortCol === "nombre"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("email")}>
                          <span className="inline-flex items-center">Correo <SortIcon active={sortCol === "email"} dir={sortDir} /></span>
                        </th>
                        <th className={thBase}>Teléfono</th>
                        <th className={thSort} onClick={() => toggleSort("tipo")}>
                          <span className="inline-flex items-center">Tipo <SortIcon active={sortCol === "tipo"} dir={sortDir} /></span>
                        </th>
                        <th className={thBase}>Tenant(s)</th>
                        <th className={thSort} onClick={() => toggleSort("rol")}>
                          <span className="inline-flex items-center">Rol <SortIcon active={sortCol === "rol"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("estado")}>
                          <span className="inline-flex items-center">Estado <SortIcon active={sortCol === "estado"} dir={sortDir} /></span>
                        </th>
                        <th className={thSort} onClick={() => toggleSort("ultimoLogin")}>
                          <span className="inline-flex items-center">Último login <SortIcon active={sortCol === "ultimoLogin"} dir={sortDir} /></span>
                        </th>
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
                      ) : paginated.map((u) => {
                        const tipo = tipoBadge(u.tipo);
                        const estado = estadoBadge(u.estado);
                        const rowActions = [
                          { label: "Ver detalle", onClick: () => router.push(`/usuarios/${u.id}`) },
                          ...(canEditar("Usuarios") && u.estado !== "Inactivo"
                            ? [{ label: "Editar", onClick: () => router.push(`/usuarios/${u.id}/editar`) }]
                            : []),
                          ...(u.estado === "Pendiente de activación"
                            ? [{ label: "Reenviar invitación", onClick: () => { setToastMsg({ title: "Invitación reenviada", message: `Se reenvió la invitación a ${u.email}` }); setToast(true); } }]
                            : []),
                          ...(canDeshabilitar("Usuarios") && u.estado === "Activo"
                            ? [{ label: "Desactivar", onClick: () => handleDesactivar(u), variant: "danger" as const }]
                            : []),
                          ...(canDeshabilitar("Usuarios") && u.estado === "Inactivo"
                            ? [{ label: "Reactivar", onClick: () => handleReactivar(u) }]
                            : []),
                        ];
                        return (
                          <tr key={u.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${selected.has(u.id) ? "bg-neutral-100" : ""}`}>
                            <td className="w-10 px-4 py-3">
                              <Checkbox checked={selected.has(u.id)} onChange={() => toggleRow(u.id)} />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => router.push(`/usuarios/${u.id}`)}
                                className="table-link text-sm font-semibold text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-500 transition-colors text-left"
                              >
                                {u.nombres} {u.apellidos}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-600">{u.email}</td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-600">{u.telefono || "—"}</td>
                            <td className="px-4 py-3">
                              <Badge variant={tipo.variant as never}>{tipo.label}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              {u.memberships.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {u.memberships.slice(0, 2).map((m) => (
                                    <span key={m.tenantId} className="inline-flex rounded-md bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700 max-w-[120px] truncate">
                                      {tenantMap[m.tenantId]?.nombre ?? m.tenantId}
                                    </span>
                                  ))}
                                  {u.memberships.length > 2 && (
                                    <span className="text-xs text-neutral-400">+{u.memberships.length - 2}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="default">{getUserRolDisplay(u)}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={estado.variant as never}>{estado.label}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-600">{formatLogin(u.ultimoLogin)}</td>
                            <td className="w-10 py-3 pr-3 sticky right-0 bg-white">
                              <RowMenu actions={rowActions} />
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

      {/* Mobile bulk action sticky bar — sits above "Crear usuario" button */}
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
                {selected.size} usuario{selected.size !== 1 ? "s" : ""} seleccionado{selected.size !== 1 ? "s" : ""}
              </span>
            </div>
            {/* Bottom row: action buttons centered */}
            <div className="flex items-center justify-center gap-2">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-neutral-300 hover:bg-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-100 transition-colors" title="Exportar">
                <Download size={16} />
                <span className="text-[9px] font-medium leading-none">Exportar</span>
              </button>
              {canDeshabilitar("Usuarios") && hasInactive && (
                <button onClick={() => { setBulkConfirmed(false); setBulkAlert("activar"); }} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-emerald-400 hover:bg-emerald-900/40 dark:text-emerald-600 dark:hover:bg-emerald-50 transition-colors" title="Activar">
                  <CircleCheck size={16} />
                  <span className="text-[9px] font-medium leading-none">Activar</span>
                </button>
              )}
              {canDeshabilitar("Usuarios") && hasActive && (
                <button onClick={() => { setBulkConfirmed(false); setBulkAlert("desactivar"); }} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-amber-400 hover:bg-amber-900/40 dark:text-amber-600 dark:hover:bg-amber-50 transition-colors" title="Desactivar">
                  <CircleMinus size={16} />
                  <span className="text-[9px] font-medium leading-none">Desactivar</span>
                </button>
              )}
              <button onClick={() => { setBulkConfirmed(false); setBulkAlert("eliminar"); }} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-red-400 hover:bg-red-900/40 dark:text-red-600 dark:hover:bg-red-50 transition-colors" title="Eliminar">
                <Trash2 size={16} />
                <span className="text-[9px] font-medium leading-none">Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        open={!!alertUsuario}
        onClose={() => setAlertUsuario(null)}
        onConfirm={confirmDesactivar}
        title="Desactivar usuario"
        message={`¿Estás seguro de desactivar a "${alertUsuario?.nombres} ${alertUsuario?.apellidos}"? Perderá acceso ${alertUsuario?.tipo === "SaaS Admin" ? "al panel de administración" : "a todos los tenants"} inmediatamente.`}
        confirmLabel="Desactivar"
      />

      {/* Bulk action confirmation modal */}
      {bulkAlert && (() => {
        const affectedUsuarios = usuarios.filter(u => selected.has(u.id));
        const isActivar = bulkAlert === "activar";
        const isDesactivar = bulkAlert === "desactivar";
        const isEliminar = bulkAlert === "eliminar";
        const needsConfirm = isDesactivar || isEliminar;
        const label = isActivar ? "Activar" : isEliminar ? "Eliminar" : "Desactivar";
        const confirmColor = isActivar
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : isEliminar
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-amber-500 hover:bg-amber-600 text-white";
        const iconColor = isActivar ? "bg-emerald-50" : isEliminar ? "bg-red-50" : "bg-amber-50";
        const icon = isActivar
          ? <CircleCheck size={24} className="text-emerald-500" />
          : isEliminar
            ? <AlertTriangle size={24} className="text-red-500" />
            : <CircleMinus size={24} className="text-amber-500" />;
        const statusDot: Record<string, string> = { Activo: "bg-emerald-500", "Pendiente de activación": "bg-amber-400", Inactivo: "bg-neutral-400" };
        const statusLabel: Record<string, string> = { Activo: "Activo", "Pendiente de activación": "Pendiente", Inactivo: "Inactivo" };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBulkAlert(null)} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex flex-col items-center text-center gap-3 mb-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor}`}>{icon}</div>
                <h3 className="text-base font-semibold text-neutral-900">{label} {selected.size} usuario{selected.size !== 1 ? "s" : ""}</h3>
                <p className="text-sm text-neutral-500">
                  {isActivar
                    ? "Los usuarios seleccionados recuperarán acceso a sus tenants y al sistema."
                    : isEliminar
                      ? "Esta acción es irreversible. Los usuarios seleccionados serán eliminados permanentemente."
                      : "Los usuarios seleccionados perderán acceso al sistema inmediatamente."}
                </p>
              </div>
              {/* Affected users */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-neutral-500 mb-1.5">Usuarios afectados ({affectedUsuarios.length})</p>
                <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                  {affectedUsuarios.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-neutral-800">{u.nombres} {u.apellidos}</span>
                        <span className="text-[11px] text-neutral-400 ml-2">{u.email}</span>
                      </div>
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[u.estado] ?? "bg-neutral-400"}`} />
                        <span className="text-xs text-neutral-500">{statusLabel[u.estado] ?? u.estado}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {needsConfirm && (
                <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bulkConfirmed}
                    onChange={(e) => setBulkConfirmed(e.target.checked)}
                    className={`mt-0.5 h-4 w-4 rounded border-neutral-300 ${isEliminar ? "text-red-600 accent-red-600" : "text-neutral-700 accent-neutral-700"}`}
                  />
                  <span className="text-xs text-neutral-600">
                    {isEliminar
                      ? "Entiendo que al eliminar se borrarán permanentemente los usuarios afectados."
                      : "Entiendo que al desactivar se revocarán los accesos de los usuarios afectados."}
                  </span>
                </label>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setBulkAlert(null)}>Cancelar</Button>
                <button onClick={confirmBulkAction} disabled={needsConfirm && !bulkConfirmed} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${confirmColor} ${needsConfirm && !bulkConfirmed ? "opacity-40 cursor-not-allowed" : ""}`}>{label}</button>
              </div>
            </div>
          </div>
        );
      })()}

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
