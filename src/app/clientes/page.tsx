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
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS } from "@/lib/mock-data";
import { Empresa } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Building2, Plus, Search, AlertTriangle, Server, FileText, ChevronUp, ChevronDown } from "lucide-react";

const COUNTRY_FLAG: Record<string, string> = {
  Chile: "🇨🇱", Colombia: "🇨🇴", Perú: "🇵🇪",
  Argentina: "🇦🇷", México: "🇲🇽", España: "🇪🇸", Brasil: "🇧🇷",
};

const statusVariant = (s: string) => {
  if (s === "activo") return "active";
  if (s === "suspendido") return "pending";
  return "inactive";
};
const statusLabel = (s: string) => {
  if (s === "activo") return "Activo";
  if (s === "suspendido") return "Suspendido";
  return "Inactivo";
};
const estadoVariant = (e: string) => {
  if (e === "Al día" || e === "Activo") return "active";
  if (e === "Por vencer") return "pending";
  return "inactive";
};

type SortCol = "nombreFantasia" | "razonSocial" | "tenants" | "operationalStatus" | "fechaCreacion" | null;

function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: SortCol; sortDir: "asc" | "desc" }) {
  if (sortCol !== col) return <ChevronUp size={11} className="text-neutral-300 ml-0.5" />;
  return sortDir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

export default function ClientesPage() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertEmpresa, setAlertEmpresa] = useState<Empresa | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  const filtered = empresas.filter((e) =>
    `${e.nombreFantasia} ${e.razonSocial} ${e.idFiscal}`.toLowerCase().includes(search.toLowerCase())
  );

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

  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
          title="Clientes"
          description="Administración y gestión de empresas con contratos"
          actions={
            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="h-[44px] w-full sm:min-w-[320px] rounded-lg border border-neutral-300 pl-8 pr-3 text-base md:text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Busca por nombre, razón social o RUT"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          }
          stickyMobileAction={
            canCrear("Clientes")
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => router.push("/clientes/crear")}>Crear cliente</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<Building2 size={24} />} title="No hay clientes registrados" onCreateClick={() => router.push("/clientes/crear")} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[900px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className={thSort} onClick={() => toggleSort("nombreFantasia")}>
                        <span className="inline-flex items-center">Nombre de fantasía <SortIcon col="nombreFantasia" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("razonSocial")}>
                        <span className="inline-flex items-center">Razón Social <SortIcon col="razonSocial" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thBase}>ID Fiscal</th>
                      <th className={thBase}>País</th>
                      <th className={thSort} onClick={() => toggleSort("tenants")}>
                        <span className="inline-flex items-center">Tenants <SortIcon col="tenants" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thBase}>En trial</th>
                      <th className={thSort} onClick={() => toggleSort("operationalStatus")}>
                        <span className="inline-flex items-center">Estado <SortIcon col="operationalStatus" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("fechaCreacion")}>
                        <span className="inline-flex items-center">Creación <SortIcon col="fechaCreacion" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className="w-10 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((empresa) => (
                      <tr key={empresa.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => router.push(`/clientes/${empresa.id}`)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                          >
                            {empresa.nombreFantasia}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{empresa.razonSocial}</td>
                        <td className="px-4 py-3 text-sm text-neutral-500 font-mono">{empresa.idFiscal}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">
                          <span className="flex items-center gap-1.5">
                            <span>{COUNTRY_FLAG[empresa.pais] ?? "🌎"}</span>
                            <span>{empresa.pais}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{empresa.tenants}</td>
                        <td className="px-4 py-3">
                          {empresa.tenantsTrial > 0
                            ? <Badge variant="pending">{empresa.tenantsTrial} trial</Badge>
                            : <span className="text-xs text-neutral-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(empresa.operationalStatus) as never}>
                            {statusLabel(empresa.operationalStatus)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-500">
                          {new Date(empresa.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="w-10 py-3 pr-3">
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
          )}
        </div>
      </div>

      {alertEmpresa && (() => {
        const relTenants = MOCK_TENANTS.filter((t) => t.empresaId === alertEmpresa.id);
        const relContratos = MOCK_CONTRATOS.filter((c) => c.empresaId === alertEmpresa.id);
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
                        <Badge variant={t.estado === "Activo" ? "active" : "inactive"}>{t.estado}</Badge>
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
                          <span className="text-sm font-medium text-neutral-800">{c.nombre}</span>
                          <span className="text-[11px] text-neutral-400 ml-2">Vence: {c.fechaVencimiento}</span>
                        </div>
                        <Badge variant={estadoVariant(c.estado) as never}>{c.estado}</Badge>
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

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
