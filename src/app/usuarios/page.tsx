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
import { MOCK_USUARIOS, MOCK_EMPRESAS, MOCK_TENANTS } from "@/lib/mock-data";
import { Usuario } from "@/lib/types";
import { Users, Plus, Search, MoreVertical } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [form, setForm] = useState({ tipo: "", nombres: "", apellidos: "", telefono: "", email: "", empresaId: "", tenantId: "", rol: "" });

  const filtered = usuarios.filter((u) =>
    `${u.nombres} ${u.apellidos} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    const nuevo: Usuario = {
      id: String(usuarios.length + 1).padStart(4, "0"),
      tipo: form.tipo as never || "Amplifica",
      nombres: form.nombres,
      apellidos: form.apellidos,
      telefono: form.telefono,
      email: form.email,
      empresaId: form.empresaId,
      tenantId: form.tenantId,
      rol: form.rol,
      estado: "Activo",
      habilitado: true,
    };
    setUsuarios((prev) => [nuevo, ...prev]);
    setToast(true);
    setModalOpen(false);
    setForm({ tipo: "", nombres: "", apellidos: "", telefono: "", email: "", empresaId: "", tenantId: "", rol: "" });
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb="Inicio / Usuarios"
          title="Usuarios"
          description="Administración y gestión de usuarios."
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input className="h-8 w-56 rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400" placeholder="Busca por ID, nombre, tenant, rol o estado" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Crear</Button>
            </div>
          }
        />

        <div className="flex-1 px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState icon={<Users size={24} />} title="No tienes usuarios creados aún" onCreateClick={() => setModalOpen(true)} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">ID</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Nombres</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">E-mail</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Tenant asociados</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Roles</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Teléfono</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Estado</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-neutral-500">Habilitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u, i) => (
                      <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-neutral-500">{u.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900">{u.nombres}</span>
                            <button className="text-neutral-400 hover:text-neutral-600"><MoreVertical size={14} /></button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-500">{u.email}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{u.diasRestantes ? `${u.diasRestantes} días` : u.tenantId || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">{u.rol}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{u.telefono}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.estado === "Activo" ? "active" : "inactive"}>{u.estado}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Toggle checked={u.habilitado} onChange={(v) => setUsuarios((prev) => prev.map((x, j) => j === i ? { ...x, habilitado: v } : x))} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Usuario" subtitle="Complete los siguientes datos para crear usuario.">
        <div className="flex flex-col gap-4">
          <Select label="Tipo de Usuario" placeholder="Seleccione" value={form.tipo} onChange={(e) => set("tipo", e.target.value)} options={[{ value: "Amplifica", label: "Amplifica" }, { value: "Tenant", label: "Tenant" }, { value: "Staff", label: "Staff" }]} />
          <Input label="Nombres" placeholder="Ingrese nombres" value={form.nombres} onChange={(e) => set("nombres", e.target.value)} />
          <Input label="Apellidos" placeholder="Ingrese apellidos" value={form.apellidos} onChange={(e) => set("apellidos", e.target.value)} />
          <Input label="Teléfono" placeholder="+56943325678" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
          <Input label="E-mail" placeholder="usuario@amplifica.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <Select label="Empresa" placeholder="Seleccione" value={form.empresaId} onChange={(e) => set("empresaId", e.target.value)} options={MOCK_EMPRESAS.map((e) => ({ value: e.id, label: e.razonSocial }))} />
          <Select label="Tenants" placeholder="Seleccione" value={form.tenantId} onChange={(e) => set("tenantId", e.target.value)} options={MOCK_TENANTS.map((t) => ({ value: t.id, label: t.nombre }))} />
          <Select label="Roles" placeholder="Seleccione" value={form.rol} onChange={(e) => set("rol", e.target.value)} options={[{ value: "Super Admin", label: "Super Admin" }, { value: "Admin", label: "Admin" }, { value: "Dev", label: "Dev" }, { value: "Seller", label: "Seller" }]} />
          <Button className="w-full mt-2" disabled={!form.nombres || !form.email} onClick={handleCreate}>Crear usuario</Button>
        </div>
      </Modal>

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Usuario creado!" message="El usuario se ha creado correctamente." />
    </MainLayout>
  );
}
