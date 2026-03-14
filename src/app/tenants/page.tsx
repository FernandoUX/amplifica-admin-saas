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
import { MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";
import { Tenant } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Server, Plus, Search, ChevronUp, ChevronDown } from "lucide-react";

/* ── Helpers ── */

const billingBadge = (mode: string) => {
  if (mode === "pagado") return { variant: "active", label: "Pagado" };
  if (mode === "trial") return { variant: "pending", label: "Trial" };
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

type SortCol = "nombre" | "cliente" | "billingMode" | "planNombre" | "operationalStatus" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-300 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

export default function TenantsPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertTenant, setAlertTenant] = useState<Tenant | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  // Build lookup for client names
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e.nombreFantasia]));

  const filtered = tenants.filter((t) => {
    const clienteNombre = empresaMap[t.empresaId] || "";
    return `${t.nombre} ${clienteNombre} ${t.dominio}`.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        let va = "";
        let vb = "";
        if (sortCol === "cliente") {
          va = empresaMap[a.empresaId] || "";
          vb = empresaMap[b.empresaId] || "";
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

  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Tenants" }]}
          title="Tenants"
          description="Entornos operativos aislados de cada cliente"
          actions={
            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="h-[44px] w-full sm:min-w-[320px] rounded-lg border border-neutral-300 pl-8 pr-3 text-base md:text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Buscar por nombre, cliente o dominio"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          }
          stickyMobileAction={
            canCrear("Tenants")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/tenants/crear")}>Crear tenant</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<Server size={24} />} title="No hay tenants registrados" onCreateClick={() => router.push("/tenants/crear")} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[800px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className={thSort} onClick={() => toggleSort("nombre")}>
                        <span className="inline-flex items-center">Nombre del tenant <SortIcon active={sortCol === "nombre"} dir={sortDir} /></span>
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
                      <th className={thSort} onClick={() => toggleSort("operationalStatus")}>
                        <span className="inline-flex items-center">Estado <SortIcon active={sortCol === "operationalStatus"} dir={sortDir} /></span>
                      </th>
                      <th className="w-10 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((tenant) => {
                      const billing = billingBadge(tenant.billingMode);
                      return (
                        <tr key={tenant.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/tenants/${tenant.id}`)}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                            >
                              {tenant.nombre}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/clientes/${tenant.empresaId}`)}
                              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              {empresaMap[tenant.empresaId] || "—"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={billing.variant as never}>{billing.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {tenant.planNombre ? (
                              <span className="inline-flex rounded-md bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
                                {tenant.planNombre}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(tenant.operationalStatus) as never}>
                              {statusLabel(tenant.operationalStatus)}
                            </Badge>
                          </td>
                          <td className="w-10 py-3 pr-3">
                            <RowMenu actions={[
                              { label: "Ver detalle", onClick: () => router.push(`/tenants/${tenant.id}`) },
                              ...(canEditar("Tenants") ? [{ label: "Editar", onClick: () => router.push(`/tenants/${tenant.id}/editar`) }] : []),
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
          )}
        </div>
      </div>

      <AlertModal
        open={!!alertTenant}
        onClose={() => setAlertTenant(null)}
        onConfirm={confirmSuspend}
        title={alertTenant?.operationalStatus === "activo" ? "Suspender tenant" : "Reactivar tenant"}
        message={
          alertTenant?.operationalStatus === "activo"
            ? `Al suspender "${alertTenant?.nombre}", los usuarios perderán acceso y no se procesarán pedidos. ¿Deseas continuar?`
            : `¿Deseas reactivar "${alertTenant?.nombre}"? Los usuarios recuperarán acceso.`
        }
        confirmLabel={alertTenant?.operationalStatus === "activo" ? "Suspender" : "Reactivar"}
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
