"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Toggle from "@/components/ui/Toggle";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import CreateEmpresaModal from "@/components/empresas/CreateEmpresaModal";
import RowMenu from "@/components/ui/RowMenu";
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS } from "@/lib/mock-data";
import { Empresa } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Building2, Plus, Search, AlertTriangle, Server, FileText } from "lucide-react";

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

export default function EmpresasPage() {
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewEmpresa, setViewEmpresa] = useState<Empresa | null>(null);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [alertEmpresa, setAlertEmpresa] = useState<Empresa | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "¡Empresa creada!", message: "La empresa se ha creado correctamente." });

  const filtered = empresas.filter((e) =>
    `${e.nombre} ${e.razonSocial}`.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreated = (e: Empresa) => {
    setEmpresas((prev) => [e, ...prev]);
    setToastMsg({ title: "¡Empresa creada!", message: "La empresa se ha creado correctamente." });
    setToast(true);
  };

  const handleToggle = (empresa: Empresa, val: boolean) => {
    if (!val) {
      // Desactivar → abrir modal de alerta
      setAlertEmpresa(empresa);
    } else {
      // Activar → directo
      setEmpresas((prev) => prev.map((e) => (e.id === empresa.id ? { ...e, habilitado: true, estado: "Activo" } : e)));
      setToastMsg({ title: "Empresa habilitada", message: `"${empresa.nombre}" ha sido habilitada.` });
      setToast(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editEmpresa) return;
    setEmpresas((prev) => prev.map((e) => e.id === editEmpresa.id ? editEmpresa : e));
    setToastMsg({ title: "¡Empresa actualizada!", message: "La empresa se ha actualizado correctamente." });
    setToast(true);
    setEditEmpresa(null);
  };

  const handleDisable = () => {
    if (!alertEmpresa) return;
    setEmpresas((prev) => prev.map((e) => e.id === alertEmpresa.id ? { ...e, habilitado: false, estado: "Inactivo" } : e));
    setToastMsg({ title: "Empresa deshabilitada", message: `"${alertEmpresa.nombre}" ha sido deshabilitada.` });
    setToast(true);
  };

  const readOnlyField = (label: string, value: string) => (
    <div>
      <label className="text-xs font-semibold text-neutral-700 block mb-1">{label}</label>
      <p className="text-sm text-neutral-900 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">{value || "—"}</p>
    </div>
  );

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
              ? <Button size="lg" className="w-full" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Crear empresa</Button>
              : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<Building2 size={24} />} title="No tienes empresas creadas aún" onCreateClick={() => setModalOpen(true)} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Nombre</th>
                      <th className="w-8 py-2.5"></th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Razón Social</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Planes</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Contratos</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">E. Comercial</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Estado</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-neutral-500">Habilitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((empresa) => (
                      <tr key={empresa.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-neutral-900">{empresa.nombre}</span>
                        </td>
                        <td className="w-8 py-3 pr-2">
                          <RowMenu actions={[
                            { label: "Ver", onClick: () => setViewEmpresa(empresa) },
                            ...(canEditar("Clientes") ? [{ label: "Editar", onClick: () => setEditEmpresa({ ...empresa }) }] : []),
                            ...(canDeshabilitar("Clientes") ? [{ label: "Deshabilitar", onClick: () => setAlertEmpresa(empresa), variant: "danger" as const }] : []),
                          ]} />
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{empresa.razonSocial}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {empresa.planes.length > 0
                              ? empresa.planes.map((p) => <Badge key={p} variant={planBadgeVariant(p) as never}>{p}</Badge>)
                              : <span className="text-xs text-neutral-400">—</span>
                            }
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

      {/* Create */}
      <CreateEmpresaModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />

      {/* View (read-only) */}
      <Modal open={!!viewEmpresa} onClose={() => setViewEmpresa(null)} title={viewEmpresa?.nombre || ""} subtitle="Detalle de la empresa (solo lectura)">
        {viewEmpresa && (
          <div className="flex flex-col gap-4">
            {readOnlyField("Razón Social", viewEmpresa.razonSocial)}
            {readOnlyField("Nombre de fantasía", viewEmpresa.nombreFantasia || viewEmpresa.nombre)}
            <div className="grid grid-cols-2 gap-3">
              {readOnlyField("País", viewEmpresa.pais || "Chile")}
              {readOnlyField("ID Fiscal", viewEmpresa.idFiscal || "")}
            </div>
            {readOnlyField("Giro", viewEmpresa.giro || "")}
            {readOnlyField("Dirección", viewEmpresa.direccion || "")}
            <div className="grid grid-cols-2 gap-3">
              {readOnlyField("Nombre de contacto", viewEmpresa.nombreContacto || "")}
              {readOnlyField("Cargo", viewEmpresa.cargo || "")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {readOnlyField("Correo de contacto", viewEmpresa.correoContacto || "")}
              {readOnlyField("Teléfono principal", viewEmpresa.telefonoPrincipal || "")}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit */}
      <Modal open={!!editEmpresa} onClose={() => setEditEmpresa(null)} title={`Editar: ${editEmpresa?.nombre || ""}`} subtitle="Modifique los datos de la empresa.">
        {editEmpresa && (
          <div className="flex flex-col gap-4">
            <Input label="Razón Social" value={editEmpresa.razonSocial} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, razonSocial: e.target.value } : prev)} />
            <Input label="Nombre de fantasía" value={editEmpresa.nombreFantasia || editEmpresa.nombre} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, nombreFantasia: e.target.value, nombre: e.target.value } : prev)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="País" value={editEmpresa.pais || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, pais: e.target.value } : prev)} />
              <Input label="ID Fiscal" value={editEmpresa.idFiscal || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, idFiscal: e.target.value } : prev)} />
            </div>
            <Input label="Giro" value={editEmpresa.giro || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, giro: e.target.value } : prev)} />
            <Input label="Dirección" value={editEmpresa.direccion || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, direccion: e.target.value } : prev)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre de contacto" value={editEmpresa.nombreContacto || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, nombreContacto: e.target.value } : prev)} />
              <Input label="Cargo" value={editEmpresa.cargo || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, cargo: e.target.value } : prev)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Correo de contacto" value={editEmpresa.correoContacto || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, correoContacto: e.target.value } : prev)} />
              <Input label="Teléfono principal" value={editEmpresa.telefonoPrincipal || ""} onChange={(e) => setEditEmpresa((prev) => prev ? { ...prev, telefonoPrincipal: e.target.value } : prev)} />
            </div>
            <Button className="w-full mt-2" onClick={handleSaveEdit}>Guardar cambios</Button>
          </div>
        )}
      </Modal>

      {/* Disable — rich confirmation with associated data */}
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
                <h3 className="text-base font-semibold text-neutral-900">Deshabilitar empresa</h3>
                <p className="text-sm text-neutral-500">
                  ¿Estás seguro de que deseas deshabilitar <strong className="text-neutral-700">&quot;{alertEmpresa.nombre}&quot;</strong>? Se deshabilitarán todos los recursos asociados.
                </p>
              </div>

              {/* Tenants asociados */}
              <div className="mt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Server size={13} className="text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-600">Tenants asociados ({relTenants.length})</span>
                </div>
                {relTenants.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                    {relTenants.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-800">{t.nombre}</span>
                          <span className="text-[11px] text-neutral-400">ID: {t.id}</span>
                        </div>
                        <Badge variant={t.estado === "Activo" ? "active" : "inactive"}>{t.estado}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">Sin tenants asociados</p>
                )}
              </div>

              {/* Contratos asociados */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={13} className="text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-600">Contratos asociados ({relContratos.length})</span>
                </div>
                {relContratos.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                    {relContratos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-800">{c.nombre}</span>
                          <span className="text-[11px] text-neutral-400">Vence: {c.fechaVencimiento} &middot; {c.plazoVencer}</span>
                        </div>
                        <Badge variant={estadoVariant(c.estado) as never}>{c.estado}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">Sin contratos asociados</p>
                )}
              </div>

              <div className="flex w-full gap-3 mt-5">
                <Button variant="secondary" className="flex-1" onClick={() => setAlertEmpresa(null)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={() => { handleDisable(); setAlertEmpresa(null); }}>Deshabilitar</Button>
              </div>
            </div>
          </div>
        );
      })()}

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
