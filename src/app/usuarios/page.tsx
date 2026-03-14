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
import { MOCK_USUARIOS, MOCK_TENANTS } from "@/lib/mock-data";
import { Usuario } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Users, Plus, Search, ChevronUp, ChevronDown } from "lucide-react";

/* ── Helpers ── */

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
  if (!active) return <ChevronUp size={11} className="text-neutral-300 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

export default function UsuariosPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertUsuario, setAlertUsuario] = useState<Usuario | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  const filtered = usuarios.filter((u) => {
    const tenants = getUserTenantNames(u);
    return `${u.nombres} ${u.apellidos} ${u.email} ${u.rol} ${u.tipo} ${tenants}`.toLowerCase().includes(search.toLowerCase());
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

  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Usuarios" }]}
          title="Usuarios"
          description="Gestión global de accesos al ecosistema"
          actions={
            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="h-[44px] w-full sm:min-w-[320px] rounded-lg border border-neutral-300 pl-8 pr-3 text-base md:text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Buscar por nombre, correo, rol o tenant"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          }
          stickyMobileAction={
            canCrear("Usuarios")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/usuarios/crear")}>Crear usuario</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<Users size={24} />} title="No hay usuarios registrados" onCreateClick={() => router.push("/usuarios/crear")} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[1100px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
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
                      <th className="w-10 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u) => {
                      const tipo = tipoBadge(u.tipo);
                      const estado = estadoBadge(u.estado);
                      return (
                        <tr key={u.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/usuarios/${u.id}`)}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                            >
                              {u.nombres} {u.apellidos}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{u.telefono || "—"}</td>
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
                          <td className="px-4 py-3 text-sm text-neutral-500">{formatLogin(u.ultimoLogin)}</td>
                          <td className="w-10 py-3 pr-3">
                            <RowMenu actions={[
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
          )}
        </div>
      </div>

      <AlertModal
        open={!!alertUsuario}
        onClose={() => setAlertUsuario(null)}
        onConfirm={confirmDesactivar}
        title="Desactivar usuario"
        message={`¿Estás seguro de desactivar a "${alertUsuario?.nombres} ${alertUsuario?.apellidos}"? Perderá acceso ${alertUsuario?.tipo === "SaaS Admin" ? "al panel de administración" : "a todos los tenants"} inmediatamente.`}
        confirmLabel="Desactivar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
