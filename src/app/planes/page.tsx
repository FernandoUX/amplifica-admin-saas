"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import RowMenu from "@/components/ui/RowMenu";
import AlertModal from "@/components/ui/AlertModal";
import { useRole } from "@/lib/role-context";
import { Layers, Plus, Search, ChevronRight, ChevronDown } from "lucide-react";

const RUTAS = ["Dashboard", "Pedidos", "Inventario", "Devoluciones", "Recepciones", "Configuración", "Productos", "Couriers"];
const MAX_BADGES = 3;

interface Rol { id: string; nombre: string; protegido?: boolean; permisos: { ver: string[]; editar: string[]; crear: string[]; deshabilitar: string[] } }

const DEFAULT_ROLES: Rol[] = [
  { id: "sa", nombre: "Super Admin", protegido: true, permisos: { ver: [...RUTAS], editar: [...RUTAS], crear: [...RUTAS], deshabilitar: [...RUTAS] } },
  { id: "staff", nombre: "Staff Amplifica SaaS", permisos: { ver: [...RUTAS], editar: ["Pedidos", "Inventario", "Devoluciones", "Recepciones", "Productos", "Couriers"], crear: ["Pedidos", "Inventario", "Recepciones", "Productos"], deshabilitar: [] } },
  { id: "finanzas", nombre: "Finanzas SaaS", permisos: { ver: [...RUTAS], editar: [], crear: [], deshabilitar: [] } },
];

function BadgeList({ items, expanded }: { items: string[]; expanded: boolean }) {
  if (items.length === 0) return <span className="text-xs text-neutral-400">—</span>;
  const visible = expanded ? items : items.slice(0, MAX_BADGES);
  const remaining = items.length - MAX_BADGES;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((p) => <Badge key={p} variant="default">{p}</Badge>)}
      {!expanded && remaining > 0 && (
        <Badge variant="default">+{remaining} más</Badge>
      )}
    </div>
  );
}

export default function PlanesPage() {
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [roles, setRoles] = useState<Rol[]>(DEFAULT_ROLES);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRol, setViewRol] = useState<Rol | null>(null);
  const [editRol, setEditRol] = useState<Rol | null>(null);
  const [alertRol, setAlertRol] = useState<Rol | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });
  const [form, setForm] = useState({ nombre: "", ver: [] as string[], editar: [] as string[], crear: [] as string[], deshabilitar: [] as string[] });

  const filtered = roles.filter((r) => r.nombre.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleRuta = (permiso: string, ruta: string) => {
    setForm((f) => {
      const arr = f[permiso as keyof typeof f] as string[];
      return { ...f, [permiso]: arr.includes(ruta) ? arr.filter((r) => r !== ruta) : [...arr, ruta] };
    });
  };

  const toggleEditRuta = (permiso: string, ruta: string) => {
    if (!editRol) return;
    setEditRol((prev) => {
      if (!prev) return prev;
      const arr = prev.permisos[permiso as keyof typeof prev.permisos];
      return { ...prev, permisos: { ...prev.permisos, [permiso]: arr.includes(ruta) ? arr.filter((r) => r !== ruta) : [...arr, ruta] } };
    });
  };

  const handleCreate = () => {
    setRoles((prev) => [{ id: String(Date.now()), nombre: form.nombre, permisos: { ver: form.ver, editar: form.editar, crear: form.crear, deshabilitar: form.deshabilitar } }, ...prev]);
    setToastMsg({ title: "¡Rol creado!", message: "El rol se ha creado correctamente." });
    setToast(true);
    setModalOpen(false);
    setForm({ nombre: "", ver: [], editar: [], crear: [], deshabilitar: [] });
  };

  const handleSaveEdit = () => {
    if (!editRol) return;
    setRoles((prev) => prev.map((r) => r.id === editRol.id ? editRol : r));
    setToastMsg({ title: "¡Rol actualizado!", message: "El rol se ha actualizado correctamente." });
    setToast(true);
    setEditRol(null);
  };

  const handleDelete = () => {
    if (!alertRol) return;
    setRoles((prev) => prev.filter((r) => r.id !== alertRol.id));
    setToastMsg({ title: "Rol eliminado", message: `El rol "${alertRol.nombre}" ha sido eliminado.` });
    setToast(true);
  };

  const permisoSection = (permiso: string, items: string[], onToggle: (p: string, r: string) => void, readOnly?: boolean) => (
    <div key={permiso}>
      <label className="text-xs font-semibold text-neutral-700 block mb-2">{permiso.charAt(0).toUpperCase() + permiso.slice(1)}</label>
      <div className="rounded-lg border border-neutral-200 p-3">
        {readOnly ? (
          <div className="flex flex-wrap gap-1.5">
            {items.length > 0 ? items.map((r) => (
              <span key={r} className="inline-flex rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">{r}</span>
            )) : <span className="text-xs text-neutral-400">Sin permisos asignados</span>}
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-400 mb-2">Seleccione las rutas a asignar</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                  {r}
                  <button onClick={() => onToggle(permiso, r)} className="text-neutral-400 hover:text-neutral-700">×</button>
                </span>
              ))}
              <select className="h-6 rounded border-0 text-xs text-neutral-400 outline-none bg-transparent cursor-pointer" onChange={(e) => { if (e.target.value) { onToggle(permiso, e.target.value); e.target.value = ""; } }}>
                <option value="">+ Agregar ruta</option>
                {RUTAS.filter((r) => !items.includes(r)).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Planes" }]}
          title="Roles"
          description="Administración y gestión de roles para asignar a tenants."
          actions={
            <div className="flex items-center gap-2">
              {roles.length > 0 && (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input className="h-8 w-56 rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400" placeholder="Busca por nombre de rol" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
              )}
              {canCrear("Planes") && <Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Crear</Button>}
            </div>
          }
        />
        <div className="flex-1 px-6 pb-6">
          {roles.length === 0 ? (
            <EmptyState icon={<Layers size={24} />} title="No tienes roles creados aún" onCreateClick={() => setModalOpen(true)} />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="w-10 py-2.5"></th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Nombre</th>
                      <th className="w-8 py-2.5"></th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Ver</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Editar</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Crear</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Deshabilitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((r) => {
                      const expanded = expandedRows.has(r.id);
                      return (
                        <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                          <td className="w-10 py-3 pl-3">
                            <button onClick={() => toggleExpand(r.id)} className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
                              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-neutral-900">{r.nombre}</span>
                            {r.protegido && <Badge variant="active">Protegido</Badge>}
                          </td>
                          <td className="w-8 py-3 pr-2">
                            <RowMenu actions={[
                              { label: "Ver", onClick: () => setViewRol(r) },
                              ...(!r.protegido && canEditar("Planes") ? [{ label: "Editar", onClick: () => setEditRol(r) }] : []),
                              ...(!r.protegido && canDeshabilitar("Planes") ? [{ label: "Eliminar", onClick: () => setAlertRol(r), variant: "danger" as const }] : []),
                            ]} />
                          </td>
                          <td className="px-4 py-3"><BadgeList items={r.permisos.ver} expanded={expanded} /></td>
                          <td className="px-4 py-3"><BadgeList items={r.permisos.editar} expanded={expanded} /></td>
                          <td className="px-4 py-3"><BadgeList items={r.permisos.crear} expanded={expanded} /></td>
                          <td className="px-4 py-3"><BadgeList items={r.permisos.deshabilitar} expanded={expanded} /></td>
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

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Rol" subtitle="Complete datos y seleccione los módulos de permisos asignados al rol.">
        <div className="flex flex-col gap-5">
          <Input label="Nombre del rol" placeholder="Ingrese" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          {(["ver", "editar", "crear", "deshabilitar"] as const).map((p) =>
            permisoSection(p, form[p], toggleRuta)
          )}
          <Button className="w-full mt-2" disabled={!form.nombre} onClick={handleCreate}>Crear rol</Button>
        </div>
      </Modal>

      {/* View Modal (read-only) */}
      <Modal open={!!viewRol} onClose={() => setViewRol(null)} title={viewRol?.nombre || ""} subtitle="Detalle del rol (solo lectura)">
        {viewRol && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Nombre del rol</label>
              <p className="text-sm text-neutral-900 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">{viewRol.nombre}</p>
            </div>
            {(["ver", "editar", "crear", "deshabilitar"] as const).map((p) =>
              permisoSection(p, viewRol.permisos[p], () => {}, true)
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editRol} onClose={() => setEditRol(null)} title={`Editar: ${editRol?.nombre || ""}`} subtitle="Modifique los permisos asignados al rol.">
        {editRol && (
          <div className="flex flex-col gap-5">
            <Input label="Nombre del rol" placeholder="Ingrese" value={editRol.nombre} onChange={(e) => setEditRol((prev) => prev ? { ...prev, nombre: e.target.value } : prev)} />
            {(["ver", "editar", "crear", "deshabilitar"] as const).map((p) =>
              permisoSection(p, editRol.permisos[p], toggleEditRuta)
            )}
            <Button className="w-full mt-2" disabled={!editRol.nombre} onClick={handleSaveEdit}>Guardar cambios</Button>
          </div>
        )}
      </Modal>

      {/* Delete Alert */}
      <AlertModal
        open={!!alertRol}
        onClose={() => setAlertRol(null)}
        onConfirm={handleDelete}
        title="Eliminar rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${alertRol?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
