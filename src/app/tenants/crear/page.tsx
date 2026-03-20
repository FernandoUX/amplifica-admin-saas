"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import AlertModal from "@/components/ui/AlertModal";
import { IconInfoCircle, IconSearch, IconUpload, IconX } from "@tabler/icons-react";
import { MOCK_EMPRESAS, addTenant } from "@/lib/mock-data";
import type { Tenant } from "@/lib/types";

interface FormState {
  empresaId: string;
  nombre: string;
  descripcion: string;
}

export default function CrearTenantPage() {
  return (
    <Suspense fallback={<MainLayout narrow><div className="p-6 text-center text-sm text-neutral-400">Cargando...</div></MainLayout>}>
      <CrearTenantForm />
    </Suspense>
  );
}

function CrearTenantForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmpresaId = searchParams.get("empresaId") ?? "";

  const initial: FormState = { empresaId: prefilledEmpresaId, nombre: "", descripcion: "" };

  const [form, setForm] = useState<FormState>(initial);
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [clienteQuery, setClienteQuery] = useState("");
  const [clienteOpen, setClienteOpen] = useState(false);
  const clienteRef = useRef<HTMLDivElement>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const clientesActivos = MOCK_EMPRESAS.filter((e) => e.operationalStatus === "activo");
  const selectedCliente = clientesActivos.find((c) => c.id === form.empresaId) ?? null;

  const clienteResults = useMemo(() => {
    if (!clienteQuery.trim()) return clientesActivos;
    const q = clienteQuery.toLowerCase();
    return clientesActivos.filter(
      (c) => c.nombreFantasia.toLowerCase().includes(q) || c.razonSocial.toLowerCase().includes(q)
    );
  }, [clienteQuery, clientesActivos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target as Node)) setClienteOpen(false);
    };
    if (clienteOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [clienteOpen]);
  const subdomain = form.nombre ? `${form.nombre}.amplifica.io` : null;

  // Logo upload
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError("El archivo debe ser una imagen");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.width < 150 || img.height < 150) {
        setLogoError("La imagen debe ser de al menos 150×150px");
        setLogoPreview(null);
      } else if (Math.abs(img.width - img.height) > img.width * 0.1) {
        setLogoError("La imagen debe ser cuadrada (proporción 1:1)");
        setLogoPreview(null);
      } else {
        setLogoPreview(URL.createObjectURL(file));
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const validate = (f: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!f.empresaId) e.empresaId = "Debes seleccionar un cliente";
    if (!f.nombre.trim()) e.nombre = "El nombre del tenant es obligatorio";
    else if (f.nombre.length < 3) e.nombre = "Mínimo 3 caracteres";
    else if (!/^[a-z0-9-]+$/.test(f.nombre)) e.nombre = "Solo letras minúsculas, números y guiones";
    return e;
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => new Set([...prev, field]));
    setErrors(validate(form));
  };

  const handleSubmit = () => {
    const e = validate(form);
    setErrors(e);
    setTouched(new Set(Object.keys(form)));
    if (Object.keys(e).length > 0) return;
    const tenant = addTenant({
      empresaId: form.empresaId,
      nombre: form.nombre,
      dominio: `${form.nombre}.amplifica.io`,
      billingMode: "sin_contrato",
      planNombre: null,
      operationalStatus: "activo",
    });
    setCreatedTenant(tenant);
    setShowSuccess(true);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push("/tenants");
  };

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Tenants", href: "/tenants" }, { label: "Crear tenant" }]}
          title="Crear tenant"
          description="Define un nuevo entorno operativo para un cliente"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5 pb-20 md:pb-6">
            {/* Cliente asociado — searchable combobox */}
            <div ref={clienteRef} className="relative flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">
                Cliente asociado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  className={`h-[44px] w-full rounded-lg border pl-9 pr-3 text-base md:text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition-colors focus:ring-2 focus:ring-primary-100 ${
                    touched.has("empresaId") && errors.empresaId
                      ? "border-red-400 focus:border-red-400"
                      : "border-neutral-300 focus:border-primary-500"
                  }`}
                  placeholder="Buscar cliente por nombre o razón social..."
                  value={selectedCliente && !clienteOpen ? `${selectedCliente.nombreFantasia} (${selectedCliente.razonSocial})` : clienteQuery}
                  onFocus={() => { setClienteOpen(true); if (selectedCliente) setClienteQuery(""); }}
                  onChange={(e) => setClienteQuery(e.target.value)}
                  onBlur={() => handleBlur("empresaId")}
                />
              </div>
              {touched.has("empresaId") && errors.empresaId && (
                <p className="text-xs text-red-500">{errors.empresaId}</p>
              )}
              {clienteOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                  {clienteResults.length === 0 ? (
                    <div className="px-3 py-2.5 text-sm text-neutral-400">Sin resultados</div>
                  ) : (
                    clienteResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setForm({ ...form, empresaId: c.id });
                          setTouched((p) => new Set([...p, "empresaId"]));
                          setClienteQuery("");
                          setClienteOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 ${
                          c.id === form.empresaId ? "bg-primary-50 font-medium text-primary-700" : "text-neutral-700"
                        }`}
                      >
                        <span>{c.nombreFantasia}</span>
                        <span className="text-neutral-400">({c.razonSocial})</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Nombre + Subdominio side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-700">
                  Nombre del tenant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`h-[44px] w-full rounded-lg border px-3 text-base md:text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition-colors focus:ring-2 focus:ring-primary-100 ${
                    touched.has("nombre") && errors.nombre
                      ? "border-red-400 focus:border-red-400"
                      : "border-neutral-300 focus:border-primary-500"
                  }`}
                  placeholder="ej: amplifica-cl"
                  value={form.nombre}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setForm({ ...form, nombre: val });
                  }}
                  onBlur={() => handleBlur("nombre")}
                />
                {touched.has("nombre") && errors.nombre ? (
                  <p className="text-xs text-red-500">{errors.nombre}</p>
                ) : (
                  <p className="text-xs text-neutral-400">Solo letras minúsculas, números y guiones</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-700">Subdominio</label>
                <div className={`h-[44px] flex items-center px-3 rounded-lg border transition-colors ${
                  subdomain ? "border-neutral-200 bg-neutral-50" : "border-dashed border-neutral-200 bg-neutral-50"
                }`}>
                  {subdomain ? (
                    <span className="text-sm font-mono text-neutral-700">{subdomain}</span>
                  ) : (
                    <span className="text-sm text-neutral-400 italic">Ingresa el nombre para previsualizar</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">URL generada automáticamente</p>
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-700">Descripción</label>
              <textarea
                className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-base md:text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:bg-white focus:ring-2 focus:ring-primary-100 resize-none"
                rows={3}
                placeholder="Describe brevemente el propósito de este tenant..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            {/* Logo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-700">Logo del tenant</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-lg border border-neutral-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setLogoPreview(null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-red-600 transition-colors"
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                  >
                    <IconUpload size={20} />
                    <span className="text-[10px] font-medium">Subir</span>
                  </button>
                )}
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-neutral-500">Imagen cuadrada, mínimo 150×150px</p>
                  <p className="text-xs text-neutral-400">Formatos: PNG, JPG, SVG</p>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium text-left"
                    >
                      Cambiar imagen
                    </button>
                  )}
                </div>
              </div>
              {logoError && <p className="text-xs text-red-500">{logoError}</p>}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3">
              <IconInfoCircle size={18} className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Siguiente paso:</strong> Después de crear el tenant, podrás elegir entre crear un contrato o dejarlo en trial implícito con límites reducidos.
              </p>
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-3 md:relative md:inset-auto md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-3 z-20">
              <Button variant="secondary" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => router.push("/tenants")}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">¡Tenant creado exitosamente!</h3>
                <p className="text-sm text-neutral-500">El tenant ha sido registrado en el sistema.</p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Resumen</h4>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <span className="text-neutral-500">Cliente</span>
                <span className="font-medium text-neutral-900">{clientesActivos.find((c) => c.id === form.empresaId)?.nombreFantasia ?? "—"}</span>
                <span className="text-neutral-500">Subdominio</span>
                <span className="font-mono font-medium text-neutral-900">{form.nombre}.amplifica.io</span>
                {form.descripcion && (
                  <>
                    <span className="text-neutral-500">Descripción</span>
                    <span className="font-medium text-neutral-900 truncate">{form.descripcion}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3">
              <IconInfoCircle size={18} className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Siguiente paso:</strong> Crea un contrato para definir el acuerdo comercial de este tenant.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/tenants")}>
                Ir a tenants
              </Button>
              <Button className="flex-1" onClick={() => router.push(`/contratos/crear?tenantId=${createdTenant?.id ?? ""}`)}>
                Crear contrato
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
