"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { IconInfoCircle } from "@tabler/icons-react";
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
  { value: "Admin Tenant", label: "Admin" },
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
  return (
    <Suspense fallback={<MainLayout narrow><div className="p-6 text-center text-sm text-neutral-400">Cargando...</div></MainLayout>}>
      <CrearUsuarioForm />
    </Suspense>
  );
}

function CrearUsuarioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledTenantId = searchParams.get("tenantId") ?? "";
  const prefilledRol = searchParams.get("rol") ?? "";

  const initial: FormState = {
    tipo: prefilledTenantId ? "Usuario Tenant" : "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    tenantId: prefilledTenantId,
    rolMembresia: prefilledRol || (prefilledTenantId ? "Admin Tenant" : ""),
    rolGlobal: "",
  };

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useContactData, setUseContactData] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const isTenant = form.tipo === "Usuario Tenant";
  const isStaff = form.tipo === "Staff Amplifica";
  const isSaasAdmin = form.tipo === "SaaS Admin";

  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  const activeTenants = MOCK_TENANTS.filter((t) => t.operationalStatus === "activo");

  const selectedTenant = tenantMap[form.tenantId];
  const selectedEmpresa = selectedTenant ? empresaMap[selectedTenant.empresaId] : null;

  const handleUseContactData = (checked: boolean) => {
    setUseContactData(checked);
    if (checked && selectedEmpresa?.contactoComercial) {
      const { nombre, correo, telefono } = selectedEmpresa.contactoComercial;
      const parts = nombre.trim().split(/\s+/);
      const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(" ");
      const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(" ");
      setForm((f) => ({ ...f, nombres, apellidos, email: correo, telefono }));
      setTouched((p) => new Set([...p, "nombres", "apellidos", "email"]));
    } else {
      setForm((f) => ({ ...f, nombres: "", apellidos: "", email: "", telefono: "" }));
    }
  };

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

  const [onboardingLink] = useState(() => `https://app.amplifica.io/onboarding?token=inv_${Math.random().toString(36).slice(2, 10)}`);

  const handleSubmit = () => {
    const e = validate(form);
    setErrors(e);
    setTouched(new Set(Object.keys(form)));
    if (Object.keys(e).length > 0) return;
    setShowSuccess(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(onboardingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push("/usuarios");
  };

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Usuarios", href: "/usuarios" }, { label: "Crear usuario" }]}
          title="Crear usuario"
          description="Habilita acceso al sistema para una persona específica"
        />

        <div className="flex-1 px-4 sm:px-6 pb-20 md:pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">

            {/* Tipo de usuario — select en mobile, buttons en desktop */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo de usuario <span className="text-red-500">*</span></label>
              {/* Mobile: select */}
              <div className="sm:hidden">
                <select
                  value={form.tipo}
                  onChange={(e) => { const tipo = e.target.value as TipoUsuario; set("tipo", tipo); set("tenantId", ""); set("rolMembresia", ""); set("rolGlobal", ""); setTouched((p) => new Set([...p, "tipo"])); setUseContactData(false); }}
                  className="h-[44px] w-full rounded-lg border border-neutral-300 px-3 text-base md:text-sm text-neutral-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Selecciona un tipo</option>
                  {(["Usuario Tenant", "Staff Amplifica", "SaaS Admin"] as TipoUsuario[]).map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              {/* Desktop: buttons */}
              <div className="hidden sm:flex flex-wrap gap-3">
                {(["Usuario Tenant", "Staff Amplifica", "SaaS Admin"] as TipoUsuario[]).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => { set("tipo", tipo); set("tenantId", ""); set("rolMembresia", ""); set("rolGlobal", ""); setTouched((p) => new Set([...p, "tipo"])); setUseContactData(false); }}
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

            {/* Tenant selection — for Tenant and Staff */}
            {(isTenant || isStaff) && (
              <>
                <Select
                  label={isTenant ? "Tenant (membresía inicial)" : "Tenant asignado"}
                  required={isTenant}
                  placeholder="Selecciona un tenant activo"
                  value={form.tenantId}
                  onChange={(e) => { set("tenantId", e.target.value); setTouched((p) => new Set([...p, "tenantId"])); setUseContactData(false); }}
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
                    <div className="h-[44px] flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-base md:text-sm text-neutral-500 cursor-not-allowed">
                      {selectedEmpresa.nombreFantasia} — {selectedEmpresa.razonSocial}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pre-fill from contacto comercial */}
            {isTenant && selectedEmpresa?.contactoComercial && (() => {
              const contactEmail = selectedEmpresa.contactoComercial.correo;
              const contactAlreadyUser = MOCK_USUARIOS.some((u) => u.email === contactEmail);
              if (contactAlreadyUser) {
                return (
                  <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 px-4 py-3">
                    <IconInfoCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      El contacto comercial de <span className="font-medium">{selectedEmpresa.nombreFantasia}</span> ({contactEmail}) ya tiene una cuenta de usuario registrada.
                    </p>
                  </div>
                );
              }
              return (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useContactData}
                    onChange={(e) => handleUseContactData(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-500 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-700">
                    Usar datos del contacto comercial de{" "}
                    <span className="font-medium">{selectedEmpresa.nombreFantasia}</span>
                  </span>
                </label>
              );
            })()}

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
              <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3">
                <IconInfoCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  <strong>Este usuario ya existe.</strong> Se creará una nueva membresía en el tenant seleccionado.
                </p>
              </div>
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
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-3 md:relative md:inset-auto md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-3 z-20">
              <Button variant="secondary" className="flex-1 md:flex-initial" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="flex-1 md:flex-initial" onClick={handleSubmit}>
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

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">¡Usuario creado exitosamente!</h3>
                <p className="text-sm text-neutral-500">El usuario ha sido registrado en el sistema.</p>
              </div>
            </div>

            {/* Resumen */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Resumen</h4>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <p className="text-neutral-500">Nombre</p>
                <p className="font-medium text-neutral-900">{form.nombres} {form.apellidos}</p>
                <p className="text-neutral-500">Correo</p>
                <p className="font-medium text-neutral-900 truncate">{form.email}</p>
                {form.telefono ? (
                  <>
                    <p className="text-neutral-500">Teléfono</p>
                    <p className="font-medium text-neutral-900">{form.telefono}</p>
                  </>
                ) : null}
                <p className="text-neutral-500">Tipo</p>
                <p className="font-medium text-neutral-900">{form.tipo}</p>
                {isTenant && selectedTenant && (
                  <>
                    <p className="text-neutral-500">Tenant</p>
                    <p className="font-medium text-neutral-900">{selectedTenant.nombre}</p>
                    <p className="text-neutral-500">Rol</p>
                    <p className="font-medium text-neutral-900">
                      {ROLES_TENANT.find((r) => r.value === form.rolMembresia)?.label ?? form.rolMembresia}
                    </p>
                  </>
                )}
                {(isStaff || isSaasAdmin) && form.rolGlobal && (
                  <>
                    <p className="text-neutral-500">Rol</p>
                    <p className="font-medium text-neutral-900">{form.rolGlobal}</p>
                  </>
                )}
              </div>
            </div>

            {/* Link de onboarding */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-neutral-700">Link de activación</p>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <span className="flex-1 truncate text-xs text-neutral-500 font-mono">{onboardingLink}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                      </svg>
                      Copiar link
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-400">Este link expira en 72 horas. El usuario lo usará para activar su cuenta.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/usuarios")}>
                Ir a usuarios
              </Button>
              <Button className="flex-1" onClick={() => {
                setForm({
                  tipo: form.tipo || "Usuario Tenant",
                  nombres: "",
                  apellidos: "",
                  email: "",
                  telefono: "",
                  tenantId: form.tenantId,
                  rolMembresia: form.rolMembresia,
                  rolGlobal: form.rolGlobal,
                });
                setErrors({});
                setTouched(new Set());
                setUseContactData(false);
                setShowSuccess(false);
              }}>
                Crear otro
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
