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
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_CONTRATOS, MOCK_EMPRESAS, MOCK_TENANTS } from "@/lib/mock-data";
import { Contrato } from "@/lib/types";
import RowMenu from "@/components/ui/RowMenu";
import { useRole } from "@/lib/role-context";
import { FileText, Plus, Search } from "lucide-react";

const PLANES_OPTIONS = [
  { value: "Express", label: "Express" },
  { value: "Envíos Pro", label: "Envíos Pro" },
  { value: "Multicanal", label: "Multicanal" },
  { value: "Pedidos Pro", label: "Pedidos Pro" },
  { value: "Omnicanal", label: "Omnicanal" },
];

const planBadgeVariant = (plan: string) => {
  if (plan === "Express") return "express";
  if (plan === "Envíos Pro") return "envios-pro";
  if (plan === "Multicanal") return "multicanal";
  return "default";
};

const estadoVariant = (e: string) => {
  if (e === "Activo" || e === "Vigente") return "active";
  if (e === "Vencido") return "vencido";
  return "inactive";
};

const readOnlyField = (label: string, value: string) => (
  <div>
    <label className="text-xs font-semibold text-neutral-700 block mb-1">{label}</label>
    <p className="text-sm text-neutral-900 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">{value || "—"}</p>
  </div>
);

export default function ContratosPage() {
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [contratos, setContratos] = useState<Contrato[]>(MOCK_CONTRATOS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });
  const [form, setForm] = useState({ empresaId: "", tenantId: "", planes: [] as string[], fechaInicio: "", fechaVencimiento: "", moneda: "CLP", monto: "" });

  const [viewContrato, setViewContrato] = useState<Contrato | null>(null);
  const [editContrato, setEditContrato] = useState<Contrato | null>(null);
  const [alertContrato, setAlertContrato] = useState<Contrato | null>(null);

  const filtered = contratos.filter((c) =>
    `${c.id} ${c.nombre} ${c.tenantNombre} ${c.razonSocial}`.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    const tenant = MOCK_TENANTS.find((t) => t.id === form.tenantId);
    const empresa = MOCK_EMPRESAS.find((e) => e.id === form.empresaId);
    const nuevo: Contrato = {
      id: String(contratos.length + 5).padStart(4, "0"),
      empresaId: form.empresaId,
      tenantId: form.tenantId,
      tenantNombre: tenant?.nombre || "",
      nombre: empresa?.nombreFantasia || "",
      razonSocial: empresa?.razonSocial || "",
      planes: form.planes,
      fechaInicio: form.fechaInicio,
      fechaVencimiento: form.fechaVencimiento,
      moneda: form.moneda,
      monto: Number(form.monto),
      plazoVencer: "—",
      estado: "Activo",
      habilitado: true,
    };
    setContratos((prev) => [nuevo, ...prev]);
    setToastMsg({ title: "¡Contrato creado!", message: "El contrato se ha creado correctamente." });
    setToast(true);
    setModalOpen(false);
    setForm({ empresaId: "", tenantId: "", planes: [] as string[], fechaInicio: "", fechaVencimiento: "", moneda: "CLP", monto: "" });
  };

  const handleSaveEdit = () => {
    if (!editContrato) return;
    setContratos((prev) => prev.map((c) => c.id === editContrato.id ? editContrato : c));
    setToastMsg({ title: "¡Contrato actualizado!", message: "Los cambios se guardaron correctamente." });
    setToast(true);
    setEditContrato(null);
  };

  const handleDisable = () => {
    if (!alertContrato) return;
    setContratos((prev) => prev.map((c) => c.id === alertContrato.id ? { ...c, habilitado: false, estado: "Inactivo" as const } : c));
    setToastMsg({ title: "Contrato deshabilitado", message: `El contrato #${alertContrato.id} ha sido deshabilitado.` });
    setToast(true);
    setAlertContrato(null);
  };

  const togglePlan = (plan: string) => {
    setForm((f) => ({
      ...f,
      planes: f.planes.includes(plan) ? f.planes.filter((p) => p !== plan) : [...f.planes, plan],
    }));
  };

  const toggleEditPlan = (plan: string) => {
    if (!editContrato) return;
    setEditContrato((prev) => {
      if (!prev) return prev;
      return { ...prev, planes: prev.planes.includes(plan) ? prev.planes.filter((p) => p !== plan) : [...prev.planes, plan] };
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb="Inicio / Contratos"
          title="Contratos"
          description="Administración y gestión de contratos asignados a tenants."
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input className="h-8 w-56 rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400" placeholder="Busca por ID, nombre, tenant o estado" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              {canCrear("Contratos") && <Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Crear</Button>}
            </div>
          }
        />

        <div className="flex-1 px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<FileText size={24} />} title="No tienes contratos creados aún" onCreateClick={() => setModalOpen(true)} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">ID</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Tenant asociado</th>
                      <th className="w-8 py-2.5"></th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Nombre</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Razón Social</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Planes</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Plazo a vencer</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Estado</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-neutral-500">Habilitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c) => (
                      <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-neutral-500">{c.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-neutral-900">{c.tenantNombre}</span>
                        </td>
                        <td className="w-8 py-3 pr-2">
                          <RowMenu actions={[
                            { label: "Ver", onClick: () => setViewContrato(c) },
                            ...(canEditar("Contratos") ? [{ label: "Editar", onClick: () => setEditContrato({ ...c }) }] : []),
                            ...(canDeshabilitar("Contratos") ? [{ label: "Deshabilitar", onClick: () => setAlertContrato(c), variant: "danger" as const }] : []),
                          ]} />
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{c.nombre}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{c.razonSocial}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.planes.map((p) => <Badge key={p} variant={planBadgeVariant(p) as never}>{p}</Badge>)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{c.plazoVencer}</td>
                        <td className="px-4 py-3">
                          <Badge variant={estadoVariant(c.estado) as never}>{c.estado}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Toggle checked={c.habilitado} onChange={(v) => setContratos((prev) => prev.map((x) => x.id === c.id ? { ...x, habilitado: v } : x))} />
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

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Contrato #${String(contratos.length + 5).padStart(4, "0")}`} subtitle="Complete datos y seleccione los planes asignados al contrato.">
        <div className="flex flex-col gap-4">
          <Select label="Seleccione empresa" placeholder="Seleccione" value={form.empresaId} onChange={(e) => set("empresaId", e.target.value)} options={MOCK_EMPRESAS.map((e) => ({ value: e.id, label: e.razonSocial }))} />
          <Select label="Tenant asociado" placeholder="Seleccione" value={form.tenantId} onChange={(e) => set("tenantId", e.target.value)} options={MOCK_TENANTS.filter((t) => !form.empresaId || t.empresaId === form.empresaId).map((t) => ({ value: t.id, label: t.nombre }))} />
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Seleccione uno o más planes</label>
            <div className="flex flex-wrap gap-2">
              {PLANES_OPTIONS.map((p) => (
                <button key={p.value} onClick={() => togglePlan(p.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${form.planes.includes(p.value) ? "border-primary-400 bg-primary-50 text-primary-700" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"}`}>{p.label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} />
            <Input label="Fecha de vencimiento" type="date" value={form.fechaVencimiento} onChange={(e) => set("fechaVencimiento", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Moneda" placeholder="Seleccione" value={form.moneda} onChange={(e) => set("moneda", e.target.value)} options={[{ value: "CLP", label: "CLP" }, { value: "USD", label: "USD" }]} />
            <Input label="Monto" placeholder="Ingresa monto" type="number" value={form.monto} onChange={(e) => set("monto", e.target.value)} />
          </div>
          <Button className="w-full mt-2" disabled={!form.empresaId || !form.tenantId} onClick={handleCreate}>Crear Contrato</Button>
        </div>
      </Modal>

      {/* View Modal (read-only) */}
      <Modal open={!!viewContrato} onClose={() => setViewContrato(null)} title={`Contrato #${viewContrato?.id || ""}`} subtitle="Detalle del contrato (solo lectura)">
        {viewContrato && (
          <div className="flex flex-col gap-4">
            {readOnlyField("Tenant asociado", viewContrato.tenantNombre)}
            <div className="grid grid-cols-2 gap-3">
              {readOnlyField("Nombre", viewContrato.nombre)}
              {readOnlyField("Razón Social", viewContrato.razonSocial)}
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Planes</label>
              <div className="flex flex-wrap gap-1">
                {viewContrato.planes.length > 0
                  ? viewContrato.planes.map((p) => <Badge key={p} variant={planBadgeVariant(p) as never}>{p}</Badge>)
                  : <span className="text-xs text-neutral-400">—</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {readOnlyField("Fecha de inicio", viewContrato.fechaInicio)}
              {readOnlyField("Fecha de vencimiento", viewContrato.fechaVencimiento)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {readOnlyField("Moneda", viewContrato.moneda)}
              {readOnlyField("Monto", viewContrato.monto ? `$${viewContrato.monto.toLocaleString()}` : "—")}
            </div>
            {readOnlyField("Plazo a vencer", viewContrato.plazoVencer)}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editContrato} onClose={() => setEditContrato(null)} title={`Editar: Contrato #${editContrato?.id || ""}`} subtitle="Modifique los datos del contrato.">
        {editContrato && (
          <div className="flex flex-col gap-4">
            {readOnlyField("Tenant asociado", editContrato.tenantNombre)}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" value={editContrato.nombre} onChange={(e) => setEditContrato((prev) => prev ? { ...prev, nombre: e.target.value } : prev)} />
              <Input label="Razón Social" value={editContrato.razonSocial} onChange={(e) => setEditContrato((prev) => prev ? { ...prev, razonSocial: e.target.value } : prev)} />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Planes</label>
              <div className="flex flex-wrap gap-2">
                {PLANES_OPTIONS.map((p) => (
                  <button key={p.value} onClick={() => toggleEditPlan(p.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${editContrato.planes.includes(p.value) ? "border-primary-400 bg-primary-50 text-primary-700" : "border-neutral-300 text-neutral-600 hover:border-neutral-400"}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Fecha de inicio" type="date" value={editContrato.fechaInicio} onChange={(e) => setEditContrato((prev) => prev ? { ...prev, fechaInicio: e.target.value } : prev)} />
              <Input label="Fecha de vencimiento" type="date" value={editContrato.fechaVencimiento} onChange={(e) => setEditContrato((prev) => prev ? { ...prev, fechaVencimiento: e.target.value } : prev)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Moneda" value={editContrato.moneda} onChange={(e) => setEditContrato((prev) => prev ? { ...prev, moneda: e.target.value } : prev)} options={[{ value: "CLP", label: "CLP" }, { value: "USD", label: "USD" }]} />
              <Input label="Monto" type="number" value={String(editContrato.monto)} onChange={(e) => setEditContrato((prev) => prev ? { ...prev, monto: Number(e.target.value) } : prev)} />
            </div>
            <Button className="w-full mt-2" onClick={handleSaveEdit}>Guardar cambios</Button>
          </div>
        )}
      </Modal>

      {/* Disable Alert */}
      <AlertModal
        open={!!alertContrato}
        onClose={() => setAlertContrato(null)}
        onConfirm={handleDisable}
        title="Deshabilitar contrato"
        message={`¿Estás seguro de que deseas deshabilitar el contrato #${alertContrato?.id}? Esta acción se puede revertir más adelante.`}
        confirmLabel="Deshabilitar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
