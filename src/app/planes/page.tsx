"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import { Layers, Plus } from "lucide-react";

const RUTAS = ["Dashboard", "Pedidos", "Inventario", "Devoluciones", "Recepciones", "Configuración", "Productos", "Couriers"];

interface Rol { id: string; nombre: string; permisos: { ver: string[]; editar: string[]; crear: string[]; deshabilitar: string[] } }

export default function PlanesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [form, setForm] = useState({ nombre: "", ver: [] as string[], editar: [] as string[], crear: [] as string[], deshabilitar: [] as string[] });

  const toggleRuta = (permiso: keyof typeof form, ruta: string) => {
    setForm((f) => {
      const arr = f[permiso] as string[];
      return { ...f, [permiso]: arr.includes(ruta) ? arr.filter((r) => r !== ruta) : [...arr, ruta] };
    });
  };

  const handleCreate = () => {
    setRoles((prev) => [{ id: String(prev.length + 1), nombre: form.nombre, permisos: { ver: form.ver, editar: form.editar, crear: form.crear, deshabilitar: form.deshabilitar } }, ...prev]);
    setToast(true);
    setModalOpen(false);
    setForm({ nombre: "", ver: [], editar: [], crear: [], deshabilitar: [] });
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb="Inicio / Roles"
          title="Roles"
          description="Administración y gestión de roles para asignar a tenants."
          actions={<Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Crear</Button>}
        />
        <div className="flex-1 px-6 pb-6">
          <EmptyState icon={<Layers size={24} />} title="No tienes roles creados aún" onCreateClick={() => setModalOpen(true)} />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Rol" subtitle="Complete datos y selecciones los módulos de permisos asignados al rol.">
        <div className="flex flex-col gap-5">
          <Input label="Nombre del rol" placeholder="Ingrese" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />

          {(["ver", "editar", "crear", "deshabilitar"] as const).map((permiso) => (
            <div key={permiso}>
              <label className="text-xs font-semibold text-neutral-700 capitalize block mb-2">{permiso.charAt(0).toUpperCase() + permiso.slice(1)}</label>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs text-neutral-400 mb-2">Seleccione las rutas a asignar</p>
                <div className="flex flex-wrap gap-1.5">
                  {(form[permiso] as string[]).map((r) => (
                    <span key={r} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                      {r}
                      <button onClick={() => toggleRuta(permiso, r)} className="text-neutral-400 hover:text-neutral-700">×</button>
                    </span>
                  ))}
                  <select className="h-6 rounded border-0 text-xs text-neutral-400 outline-none bg-transparent cursor-pointer" onChange={(e) => { if (e.target.value) { toggleRuta(permiso, e.target.value); e.target.value = ""; } }}>
                    <option value="">+ Agregar ruta</option>
                    {RUTAS.filter((r) => !(form[permiso] as string[]).includes(r)).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <Button className="w-full mt-2" disabled={!form.nombre} onClick={handleCreate}>Crear rol</Button>
        </div>
      </Modal>

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Rol creado!" message="El rol se ha creado correctamente." />
    </MainLayout>
  );
}
