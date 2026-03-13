"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Toggle from "@/components/ui/Toggle";
import Toast from "@/components/ui/Toast";
import RowMenu from "@/components/ui/RowMenu";
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS } from "@/lib/mock-data";
import { Empresa } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Building2, Plus, Search, AlertTriangle, Server, FileText, ChevronUp, ChevronDown } from "lucide-react";

const planBadgeVariant = (plan: string) => {
  if (plan === "Express") return "express";
  if (plan === "Envíos Pro") return "envios-pro";
  if (plan === "Multicanal") return "multicanal";
  return "default";
};

const estadoVariant = (e: string) => {
  if (e === "Al día" || e === "Activo") return "active";
  if (e === "Por vencer") return "pending";
  if (e === "Vencido" || e === "Inactivo") return "vencido";
  return "default";
};

type SortCol = "nombre" | "razonSocial" | "contratos" | "estadoComercial" | "estado" | null;

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
    `${e.nombre} ${e.razonSocial}`.toLowerCase().includes(search.toLowerCase())
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

  const handleToggle = (empresa: Empresa, val: boolean) => {
    if (!val) {
      setAlertEmpresa(empresa);
    } else {
      setEmpresas((prev) => prev.map((e) => e.id === empresa.id ? { ...e, habilitado: true, estado: "Activo" } : e));
      setToastMsg({ title: "Cliente habilitado", message: `"${empresa.nombre}" ha sido habilitado.` });
      setToast(true);
    }
  };

  const handleDisable = () => {
    if (!alertEmpresa) return;
    setEmpresas((prev) => prev.map((e) => e.id === alertEmpresa.id ? { ...e, habilitado: false, estado: "Inactivo" } : e));
    setToastMsg({ title: "Cliente deshabilitado", message: `"${alertEmpresa.nombre}" ha sido deshabilitado.` });
    setToast(true);
    setAlertEmpresa(null);
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
                placeholder="Busca por nombre o razón social"
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
                <table className="w-full min-w-[800px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className={thSort} onClick={() => toggleSort("nombre")}>
                        <span className="inline-flex items-center">Nombre <SortIcon col="nombre" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("razonSocial")}>
                        <span className="inline-flex items-center">Razón Social <SortIcon col="razonSocial" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thBase}>Planes</th>
                      <th className={thSort} onClick={() => toggleSort("contratos")}>
                        <span className="inline-flex items-center">Contratos <SortIcon col="contratos" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("estadoComercial")}>
                        <span className="inline-flex items-center">E. Comercial <SortIcon col="estadoComercial" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className={thSort} onClick={() => toggleSort("estado")}>
                        <span className="inline-flex items-center">Estado <SortIcon col="estado" sortCol={sortCol} sortDir={sortDir} /></span>
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-neutral-500">Habilitar</th>
                      <th className="w-10 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((empresa) => (
                      <tr key={empresa.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-neutral-900">{empresa.nombre}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{empresa.razonSocial}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {empresa.planes.length > 0
                              ? empresa.planes.map((p) => <Badge key={p} variant={planBadgeVariant(p) as never}>{p}</Badge>)
                              : <span className="text-xs text-neutral-400">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{empresa.contratos}</td>
                        <td className="px-4 py-3">
                          <Badge variant={estadoVariant(empresa.estadoComercial) as never}>{empresa.estadoComercial}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={empresa.estado === "Activo" ? "active" : "inactive"}>{empresa.estado}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Toggle checked={empresa.habilitado} onChange={(v) => handleToggle(empresa, v)} disabled={!canDeshabilitar("Clientes")} />
                        </td>
                        <td className="w-10 py-3 pr-3">
                          <RowMenu actions={[
                            { label: "Ver detalle", onClick: () => router.push(`/clientes/${empresa.id}`) },
                            ...(canEditar("Clientes") ? [{ label: "Editar", onClick: () => router.push(`/clientes/${empresa.id}/editar`) }] : []),
                            ...(canDeshabilitar("Clientes") ? [{ label: "Deshabilitar", onClick: () => setAlertEmpresa(empresa), variant: "danger" as const }] : []),
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
                  Al suspender <strong className="text-neutral-700">&quot;{alertEmpresa.nombre}&quot;</strong>, todos sus tenants quedarán bloqueados y los usuarios no podrán acceder. ¿Deseas continuar?
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
                <Button variant="danger" className="flex-1" onClick={handleDisable}>Confirmar suspensión</Button>
              </div>
            </div>
          </div>
        );
      })()}

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
