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
import { MOCK_CONTRATOS, MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";
import { Contrato } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { FileText, Plus, Search, ChevronUp, ChevronDown } from "lucide-react";

/* ── Helpers ── */

const billingBadge = (mode: string) => {
  if (mode === "pagado") return { variant: "active", label: "Pagado" };
  return { variant: "pending", label: "Trial" };
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

type SortCol = "displayId" | "tenant" | "cliente" | "billingMode" | "planNombre" | "fechaInicio" | "fechaVencimiento" | "montoBaseFinal" | "estado" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-300 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

export default function ContratosPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [contratos, setContratos] = useState<Contrato[]>(MOCK_CONTRATOS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertContrato, setAlertContrato] = useState<Contrato | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  // Lookups
  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  const getTenantName = (tenantId: string) => tenantMap[tenantId]?.nombre ?? "—";
  const getClienteName = (tenantId: string) => {
    const t = tenantMap[tenantId];
    if (!t) return "—";
    return empresaMap[t.empresaId]?.nombreFantasia ?? "—";
  };

  const filtered = contratos.filter((c) => {
    const tenantNombre = getTenantName(c.tenantId);
    const clienteNombre = getClienteName(c.tenantId);
    return `${c.displayId} ${tenantNombre} ${clienteNombre} ${c.planNombre ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        let va = "";
        let vb = "";
        if (sortCol === "tenant") {
          va = getTenantName(a.tenantId);
          vb = getTenantName(b.tenantId);
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

  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Contratos" }]}
          title="Contratos"
          description="Acuerdos comerciales vinculados a tenants"
          actions={
            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="h-[44px] w-full sm:min-w-[320px] rounded-lg border border-neutral-300 pl-8 pr-3 text-base md:text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Buscar por Nº, tenant o cliente"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          }
          stickyMobileAction={
            canCrear("Contratos")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/contratos/crear")}>Crear contrato</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<FileText size={24} />} title="No hay contratos registrados" onCreateClick={() => router.push("/contratos/crear")} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[1100px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className={thSort} onClick={() => toggleSort("displayId")}>
                        <span className="inline-flex items-center">Nº Contrato <SortIcon active={sortCol === "displayId"} dir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("tenant")}>
                        <span className="inline-flex items-center">Tenant <SortIcon active={sortCol === "tenant"} dir={sortDir} /></span>
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
                      <th className="w-10 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((contrato) => {
                      const billing = billingBadge(contrato.billingMode);
                      const estadoDisplay = getEstadoDisplay(contrato);
                      const tenant = tenantMap[contrato.tenantId];
                      const empresa = tenant ? empresaMap[tenant.empresaId] : null;

                      return (
                        <tr key={contrato.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/contratos/${contrato.id}`)}
                              className="text-sm font-medium font-mono text-primary-600 hover:text-primary-700 hover:underline text-left"
                            >
                              {contrato.displayId}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/tenants/${contrato.tenantId}`)}
                              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              {tenant?.nombre ?? "—"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {empresa ? (
                              <button
                                onClick={() => router.push(`/clientes/${empresa.id}`)}
                                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
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
                          <td className="px-4 py-3 text-sm text-neutral-600">{contrato.fechaInicio}</td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{contrato.fechaVencimiento}</td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
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
                          <td className="w-10 py-3 pr-3">
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
          )}
        </div>
      </div>

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
