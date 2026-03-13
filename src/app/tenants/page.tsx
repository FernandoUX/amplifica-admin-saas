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
import { MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";
import { Tenant } from "@/lib/types";
import { Server, Plus, Search, MoreVertical } from "lucide-react";

const planBadgeVariant = (plan: string) => {
  if (plan === "Express") return "express";
  if (plan === "Envíos Pro") return "envios-pro";
  if (plan === "Multicanal") return "multicanal";
  return "default";
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [form, setForm] = useState({ empresaId: "", nombre: "", dominio: "", pais: "Chile", zonaHoraria: "", moneda: "", nota: "" });

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
    setToast(true);
    setModalOpen(false);
    setForm({ empresaId: "", nombre: "", dominio: "", pais: "Chile", zonaHoraria: "", moneda: "", nota: "" });
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
              <Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                Crear
              </Button>
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
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900">{t.razonSocial}</span>
                            <button className="text-neutral-400 hover:text-neutral-600"><MoreVertical size={14} /></button>
                          </div>
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

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Tenant creado!" message="Tenant se ha creado correctamente." />
    </MainLayout>
  );
}
