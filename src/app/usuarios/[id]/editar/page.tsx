"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_USUARIOS } from "@/lib/mock-data";

const ROLES_TENANT = [
  { value: "Admin Tenant", label: "Admin Tenant" },
  { value: "Operador", label: "Operador" },
  { value: "Visor", label: "Visor" },
];

const ROLES_STAFF = [
  { value: "Soporte", label: "Soporte" },
  { value: "Operaciones de campo", label: "Operaciones de campo" },
];

const ROLES_SAAS_ADMIN = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Comercial", label: "Comercial" },
  { value: "Customer Success", label: "Customer Success" },
  { value: "Operaciones", label: "Operaciones" },
  { value: "Finanzas", label: "Finanzas" },
];

interface FormState {
  nombres: string;
  apellidos: string;
  telefono: string;
  rol: string;
}

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const usuario = MOCK_USUARIOS.find((u) => u.id === id);

  const initial: FormState = usuario
    ? { nombres: usuario.nombres, apellidos: usuario.apellidos, telefono: usuario.telefono, rol: usuario.rol }
    : { nombres: "", apellidos: "", telefono: "", rol: "" };

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (f: FormState) => {
    const e: Partial<Record<string, string>> = {};
    if (!f.nombres || f.nombres.length < 2) e.nombres = "Mínimo 2 caracteres";
    if (!f.apellidos || f.apellidos.length < 2) e.apellidos = "Mínimo 2 caracteres";
    if (!f.rol) e.rol = "El rol es obligatorio";
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set([...prev, field]));
    setErrors(validate(form));
  };

  const handleSubmit = () => {
    const e = validate(form);
    setErrors(e);
    setTouched(new Set(Object.keys(form)));
    if (Object.keys(e).length > 0) return;
    setToast(true);
    setTimeout(() => router.push(`/usuarios/${id}`), 1200);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push(`/usuarios/${id}`);
  };

  if (!usuario) {
    return (
      <MainLayout narrow>
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Usuarios", href: "/usuarios" }, { label: "No encontrado" }]}
          title="Usuario no encontrado"
        />
      </MainLayout>
    );
  }

  const roleOptions = usuario.tipo === "SaaS Admin"
    ? ROLES_SAAS_ADMIN
    : usuario.tipo === "Staff Amplifica"
    ? ROLES_STAFF
    : ROLES_TENANT;

  const tipoBadge = usuario.tipo === "SaaS Admin"
    ? { variant: "default", label: "SaaS Admin" }
    : usuario.tipo === "Staff Amplifica"
    ? { variant: "pending", label: "Staff Amplifica" }
    : { variant: "active", label: "Usuario Tenant" };

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[
            { label: "Inicio", href: "/" },
            { label: "Usuarios", href: "/usuarios" },
            { label: `${usuario.nombres} ${usuario.apellidos}`, href: `/usuarios/${id}` },
            { label: "Editar" },
          ]}
          title={`Editar: ${usuario.nombres} ${usuario.apellidos}`}
          description="Modifica los datos del usuario"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">

            {/* Locked fields */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Campos no editables</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-0.5">Tipo de usuario</p>
                  <Badge variant={tipoBadge.variant as never}>{tipoBadge.label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-0.5">Correo electrónico</p>
                  <p className="text-sm text-neutral-700">{usuario.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-0.5">ID</p>
                  <p className="text-sm text-neutral-700 font-mono">{usuario.id}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-400">El tipo de usuario y el correo no pueden ser modificados después de la creación.</p>
            </div>

            {/* Editable: personal data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                required
                value={form.nombres}
                onChange={(e) => set("nombres", e.target.value)}
                onBlur={() => handleBlur("nombres")}
                error={touched.has("nombres") ? errors.nombres : undefined}
              />
              <Input
                label="Apellido"
                required
                value={form.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
                onBlur={() => handleBlur("apellidos")}
                error={touched.has("apellidos") ? errors.apellidos : undefined}
              />
            </div>

            <Input
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
            />

            {/* Editable: role */}
            <Select
              label={usuario.tipo === "Usuario Tenant" ? "Rol principal" : "Rol"}
              required
              value={form.rol}
              onChange={(e) => { set("rol", e.target.value); setTouched((p) => new Set([...p, "rol"])); }}
              onBlur={() => handleBlur("rol")}
              error={touched.has("rol") ? errors.rol : undefined}
              options={roleOptions}
            />

            {usuario.tipo === "Usuario Tenant" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs text-blue-700">
                  Las membresías de tenant se gestionan desde la pestaña <strong>&quot;Membresías&quot;</strong> en el detalle del usuario. No es necesario desactivar y recrear para cambiar de tenant.
                </p>
              </div>
            )}

            {usuario.tipo === "Staff Amplifica" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs text-amber-700">
                  Los tenants asignados a este staff se gestionan desde la pestaña <strong>&quot;Membresías&quot;</strong> en el detalle del usuario.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button variant="secondary" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => router.push(`/usuarios/${id}`)}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="Usuario actualizado" message="Los cambios se guardaron correctamente." />
    </MainLayout>
  );
}
