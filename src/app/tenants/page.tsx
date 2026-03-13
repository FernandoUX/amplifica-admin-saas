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
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";
import { Tenant } from "@/lib/types";
import RowMenu from "@/components/ui/RowMenu";
import { useRole } from "@/lib/role-context";
import { Server, Plus, Search } from "lucide-react";

const planBadgeVariant = (plan: string) => {
  if (plan === "Express") return "express";
  if (plan === "Envíos Pro") return "envios-pro";
  if (plan === "Multicanal") return "multicanal";
  return "default";
};

const readOnlyField = (label: string, value: string) => (
  <div>
    <label className="text-xs font-semibold text-neutral-700 block mb-1">{label}</label>
    <p className="text-sm text-neutral-900 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">{value || "—"}</p>
  </div>
);

export default function TenantsPage() {
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: "success" as "success" | "error", title: "", message: "" });
  const [form, setForm] = useState({ empresaId: "", nombre: "", dominio: "", pais: "Chile", zonaHoraria: "", moneda: "", nota: "" });

  // Row menu states
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [alertTenant, setAlertTenant] = useState<Tenant | null>(null);

  const filtered = tenants.filter((t) =>
    `${t.nombre} ${t.razonSocial} ${t.dominio}`.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    const empresa = MOCK_EMPRESAS.find((e) => e.id === form.empresaId);
    const nuevo: Tenant = {
      id: String(1000 + tenants.length),
      empresaId: form.empresaId,
      razonSocial: empresa?.razonSocial || form.nombre,
      nombre: form.nombre,
      dominio: form.dominio,
      pais: form.pais,
      zonaHoraria: form.zonaHoraria,
      moneda: form.moneda,
      nota: form.nota,
      couriers: false,
      planes: [],
      contratos: 0,
      estado: "Activo",
      habilitado: true,
    };
    setTenants((prev) => [nuevo, ...prev]);
    setToastMsg({ type: "success", title: "¡Tenant creado!", message: "Tenant se ha creado correctamente." });
    setToast(true);
    setModalOpen(false);
    setForm({ empresaId: "", nombre: "", dominio: "", pais: "Chile", zonaHoraria: "", moneda: "", nota: "" });
  };

  const handleSaveEdit = () => {
    if (!editTenant) return;
    setTenants((prev) => prev.map((t) => (t.id === editTenant.id ? editTenant : t)));
    setToastMsg({ type: "success", title: "¡Tenant actualizado!", message: "Los cambios se guardaron correctamente." });
    setToast(true);
    setEditTenant(null);
  };

  const handleDisable = () => {
    if (!alertTenant) return;
    setTenants((prev) => prev.map((t) => (t.id === alertTenant.id ? { ...t, habilitado: false, estado: "Inactivo" as const } : t)));
    setToastMsg({ type: "success", title: "Tenant deshabilitado", message: `"${alertTenant.nombre}" ha sido deshabilitado.` });
    setToast(true);
    setAlertTenant(null);
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb="Inicio / Tenant"
          title="Tenants"
          description="Administración y gestión de tenants con empresas"
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  className="h-8 w-56 rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Busca por ID, dominio, plan, estado o razón social"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              {canCrear("Tenants") && <Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Crear</Button>}
            </div>
          }
        />

        <div className="flex-1 px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<Server size={24} />} title="No tienes tenants creadas aún" onCreateClick={() => setModalOpen(true)} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">ID</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Razón Social</th>
                      <th className="w-8 py-2.5"></th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Dominio</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Couriers</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Planes</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Contratos</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Estado</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-neutral-500">Habilitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t) => (
                      <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-neutral-500">{t.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-neutral-900">{t.razonSocial}</span>
                        </td>
                        <td className="w-8 py-3 pr-2">
                          <RowMenu actions={[
                            { label: "Ver", onClick: () => setViewTenant(t) },
                            ...(canEditar("Tenants") ? [{ label: "Editar", onClick: () => setEditTenant({ ...t }) }] : []),
                            ...(canDeshabilitar("Tenants") ? [{ label: "Deshabilitar", onClick: () => setAlertTenant(t), variant: "danger" as const }] : []),
                          ]} />
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-500">{t.dominio}</td>
                        <td className="px-4 py-3">
                          <Badge variant={t.couriers ? "active" : "inactive"}>{t.couriers ? "Sí" : "No"}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {t.planes.length > 0
                              ? t.planes.map((p) => <Badge key={p} variant={planBadgeVariant(p) as never}>{p}</Badge>)
                              : <span className="text-xs text-neutral-400">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{t.contratos}</td>
                        <td className="px-4 py-3">
                          <Badge variant={t.estado === "Activo" ? "active" : "inactive"}>{t.estado}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Toggle checked={t.habilitado} onChange={(v) => setTenants((prev) => prev.map((x) => x.id === t.id ? { ...x, habilitado: v } : x))} />
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tenants" subtitle="Complete los siguientes datos para crear empresa">
        <div className="flex flex-col gap-4">
          <Select label="Empresa asociada" placeholder="Seleccione" value={form.empresaId} onChange={(e) => set("empresaId", e.target.value)} options={MOCK_EMPRESAS.map((e) => ({ value: e.id, label: e.razonSocial }))} />
          <Input label="Nombre" placeholder="Ingrese" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          <Input label="Dominio" placeholder="www.ejemplo.cl" value={form.dominio} onChange={(e) => set("dominio", e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <Select label="País" placeholder="Seleccione" value={form.pais} onChange={(e) => set("pais", e.target.value)} options={[{ value: "Chile", label: "Chile" }, { value: "Argentina", label: "Argentina" }]} />
            <Select label="Zona horaria" placeholder="Seleccione" value={form.zonaHoraria} onChange={(e) => set("zonaHoraria", e.target.value)} options={[{ value: "America/Santiago", label: "Santiago (UTC-4)" }]} />
            <Select label="Moneda" placeholder="Seleccione" value={form.moneda} onChange={(e) => set("moneda", e.target.value)} options={[{ value: "CLP", label: "CLP" }, { value: "USD", label: "USD" }]} />
          </div>
          <Textarea label="Nota o comentario (Opcional)" placeholder="Máx. 1000 caracteres" value={form.nota} onChange={(e) => set("nota", e.target.value)} />
          <Button className="w-full mt-2" disabled={!form.empresaId || !form.nombre} onClick={handleCreate}>Crear tenant</Button>
        </div>
      </Modal>

      {/* View Modal (read-only) */}
      <Modal open={!!viewTenant} onClose={() => setViewTenant(null)} title="Detalle de Tenant" subtitle="Información del tenant en modo lectura">
        {viewTenant && (
          <div className="flex flex-col gap-4">
            {readOnlyField("Nombre", viewTenant.nombre)}
            {readOnlyField("Dominio", viewTenant.dominio)}
            {readOnlyField("País", viewTenant.pais)}
            {readOnlyField("Zona horaria", viewTenant.zonaHoraria)}
            {readOnlyField("Moneda", viewTenant.moneda)}
            {readOnlyField("Nota", viewTenant.nota || "")}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTenant} onClose={() => setEditTenant(null)} title="Editar Tenant" subtitle="Modifique los datos del tenant">
        {editTenant && (
          <div className="flex flex-col gap-4">
            <Input label="Nombre" value={editTenant.nombre} onChange={(e) => setEditTenant({ ...editTenant, nombre: e.target.value })} />
            <Input label="Dominio" value={editTenant.dominio} onChange={(e) => setEditTenant({ ...editTenant, dominio: e.target.value })} />
            <Input label="País" value={editTenant.pais} onChange={(e) => setEditTenant({ ...editTenant, pais: e.target.value })} />
            <Input label="Zona horaria" value={editTenant.zonaHoraria} onChange={(e) => setEditTenant({ ...editTenant, zonaHoraria: e.target.value })} />
            <Input label="Moneda" value={editTenant.moneda} onChange={(e) => setEditTenant({ ...editTenant, moneda: e.target.value })} />
            <Input label="Nota" value={editTenant.nota || ""} onChange={(e) => setEditTenant({ ...editTenant, nota: e.target.value })} />
            <Button className="w-full mt-2" onClick={handleSaveEdit}>Guardar cambios</Button>
          </div>
        )}
      </Modal>

      {/* Alert Modal (disable confirmation) */}
      <AlertModal
        open={!!alertTenant}
        onClose={() => setAlertTenant(null)}
        onConfirm={handleDisable}
        title="Deshabilitar tenant"
        message={`¿Estás seguro de que deseas deshabilitar "${alertTenant?.nombre}"? Esta acción se puede revertir más adelante.`}
        confirmLabel="Deshabilitar"
        cancelLabel="Cancelar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type={toastMsg.type} title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
