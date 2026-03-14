"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_TENANTS, MOCK_EMPRESAS, MOCK_USUARIOS } from "@/lib/mock-data";

type TipoUsuario = "" | "Usuario Tenant" | "Staff Amplifica" | "SaaS Admin";

interface FormState {
  tipo: TipoUsuario;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  tenantId: string;
  rolMembresia: string;
  rolGlobal: string;
}

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

export default function CrearUsuarioPage() {
  const router = useRouter();

  const initial: FormState = {
    tipo: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    tenantId: "",
    rolMembresia: "",
    rolGlobal: "",
  };

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const isTenant = form.tipo === "Usuario Tenant";
  const isStaff = form.tipo === "Staff Amplifica";
  const isSaasAdmin = form.tipo === "SaaS Admin";

  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  const activeTenants = MOCK_TENANTS.filter((t) => t.operationalStatus === "activo");

  // Check if email already exists as same type
  const existingUser = useMemo(() => {
    if (!form.email || !form.tipo) return null;
    return MOCK_USUARIOS.find((u) => u.email === form.email && u.tipo === form.tipo);
  }, [form.email, form.tipo]);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (f: FormState) => {
    const e: Partial<Record<string, string>> = {};
    if (!f.tipo) e.tipo = "Debes seleccionar el tipo de usuario";
    if (!f.nombres || f.nombres.length < 2) e.nombres = "Mínimo 2 caracteres";
    if (!f.apellidos || f.apellidos.length < 2) e.apellidos = "Mínimo 2 caracteres";
    if (!f.email) e.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Formato de correo inválido";
    if (isTenant && !f.tenantId) e.tenantId = "Debes seleccionar al menos un tenant";
    if (isTenant && !f.rolMembresia) e.rolMembresia = "Debes seleccionar un rol";
    if (isStaff && !f.rolGlobal) e.rolGlobal = "Debes seleccionar un rol";
    if (isSaasAdmin && !f.rolGlobal) e.rolGlobal = "Debes seleccionar un rol";
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
    setTimeout(() => router.push("/usuarios"), 1200);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push("/usuarios");
  };

  const selectedTenant = tenantMap[form.tenantId];
  const selectedEmpresa = selectedTenant ? empresaMap[selectedTenant.empresaId] : null;

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Usuarios", href: "/usuarios" }, { label: "Crear usuario" }]}
          title="Crear usuario"
          description="Habilita acceso al sistema para una persona específica"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">

            {/* Tipo de usuario */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo de usuario <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-3">
                {(["Usuario Tenant", "Staff Amplifica", "SaaS Admin"] as TipoUsuario[]).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => { set("tipo", tipo); set("tenantId", ""); set("rolMembresia", ""); set("rolGlobal", ""); setTouched((p) => new Set([...p, "tipo"])); }}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      form.tipo === tipo
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
              {touched.has("tipo") && errors.tipo && <p className="text-xs text-red-500 mt-1">{errors.tipo}</p>}
            </div>

            {/* Datos personales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                required
                placeholder="Nombre(s)"
                value={form.nombres}
                onChange={(e) => set("nombres", e.target.value)}
                onBlur={() => handleBlur("nombres")}
                error={touched.has("nombres") ? errors.nombres : undefined}
              />
              <Input
                label="Apellido"
                required
                placeholder="Apellido(s)"
                value={form.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
                onBlur={() => handleBlur("apellidos")}
                error={touched.has("apellidos") ? errors.apellidos : undefined}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Correo electrónico"
                required
                type="email"
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                error={touched.has("email") ? errors.email : undefined}
              />
              <Input
                label="Teléfono"
                placeholder="+56 9 1234 5678"
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
              />
            </div>

            {/* Existing user notice */}
            {existingUser && isTenant && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-700">
                  <strong>Este usuario ya existe.</strong> Se creará una nueva membresía en el tenant seleccionado.
                </p>
              </div>
            )}

            {/* Tenant selection — for Tenant and Staff */}
            {(isTenant || isStaff) && (
              <>
                <Select
                  label={isTenant ? "Tenant (membresía inicial)" : "Tenant asignado"}
                  required={isTenant}
                  placeholder="Selecciona un tenant activo"
                  value={form.tenantId}
                  onChange={(e) => { set("tenantId", e.target.value); setTouched((p) => new Set([...p, "tenantId"])); }}
                  onBlur={() => handleBlur("tenantId")}
                  error={touched.has("tenantId") ? errors.tenantId : undefined}
                  options={activeTenants.map((t) => {
                    const emp = empresaMap[t.empresaId];
                    return { value: t.id, label: `${t.nombre}${emp ? ` (${emp.nombreFantasia})` : ""}` };
                  })}
                />
                {/* Derived client */}
                {selectedEmpresa && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Cliente (derivado)</label>
                    <div className="h-[44px] flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 cursor-not-allowed">
                      {selectedEmpresa.nombreFantasia} — {selectedEmpresa.razonSocial}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Role — contextual by type */}
            {isTenant && (
              <Select
                label="Rol en el tenant"
                required
                placeholder="Selecciona un rol"
                value={form.rolMembresia}
                onChange={(e) => { set("rolMembresia", e.target.value); setTouched((p) => new Set([...p, "rolMembresia"])); }}
                onBlur={() => handleBlur("rolMembresia")}
                error={touched.has("rolMembresia") ? errors.rolMembresia : undefined}
                options={ROLES_TENANT}
              />
            )}

            {isStaff && (
              <Select
                label="Rol"
                required
                placeholder="Selecciona un rol"
                value={form.rolGlobal}
                onChange={(e) => { set("rolGlobal", e.target.value); setTouched((p) => new Set([...p, "rolGlobal"])); }}
                onBlur={() => handleBlur("rolGlobal")}
                error={touched.has("rolGlobal") ? errors.rolGlobal : undefined}
                options={ROLES_STAFF}
              />
            )}

            {isSaasAdmin && (
              <Select
                label="Rol"
                required
                placeholder="Selecciona un rol"
                value={form.rolGlobal}
                onChange={(e) => { set("rolGlobal", e.target.value); setTouched((p) => new Set([...p, "rolGlobal"])); }}
                onBlur={() => handleBlur("rolGlobal")}
                error={touched.has("rolGlobal") ? errors.rolGlobal : undefined}
                options={ROLES_SAAS_ADMIN}
              />
            )}

            {/* Info banner */}
            {form.tipo && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-xs text-neutral-500">
                  {isTenant && "Al guardar, el usuario recibirá un email de invitación para activar su cuenta. Estado inicial: Pendiente de activación."}
                  {isStaff && "Al guardar, el usuario recibirá un email de invitación. Tendrá acceso solo a los tenants asignados."}
                  {isSaasAdmin && "Al guardar, el usuario recibirá un email de invitación. Sistema de autenticación separado del ecosistema de tenants."}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button variant="secondary" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Crear usuario
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => router.push("/usuarios")}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Usuario creado!" message="Se envió la invitación de activación al correo del usuario." />
    </MainLayout>
  );
}
