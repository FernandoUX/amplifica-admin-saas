"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";

interface FormState {
  nombre: string;
  dominio: string;
}

export default function EditarTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const tenant = MOCK_TENANTS.find((t) => t.id === id);
  const empresa = tenant ? MOCK_EMPRESAS.find((e) => e.id === tenant.empresaId) : null;

  const initial: FormState = {
    nombre: tenant?.nombre ?? "",
    dominio: tenant?.dominio ?? "",
  };

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const validate = (f: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!f.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (f.nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres";
    else if (f.nombre.trim().length > 100) e.nombre = "Máximo 100 caracteres";
    if (!f.dominio.trim()) e.dominio = "El dominio es obligatorio";
    else if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*$/i.test(f.dominio.trim())) e.dominio = "Solo alfanuméricos, guiones y puntos";
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
    setToast(true);
    setTimeout(() => router.push(`/tenants/${id}`), 1200);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push(`/tenants/${id}`);
  };

  if (!tenant) {
    return (
      <MainLayout narrow>
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Tenants", href: "/tenants" }, { label: "No encontrado" }]}
          title="Tenant no encontrado"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[
            { label: "Inicio", href: "/" },
            { label: "Tenants", href: "/tenants" },
            { label: tenant.nombre, href: `/tenants/${id}` },
            { label: "Editar" },
          ]}
          title="Editar tenant"
          description={`Modificar datos de "${tenant.nombre}"`}
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">

            {/* Cliente asociado — locked */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Cliente asociado
              </label>
              <div className="h-[44px] flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 cursor-not-allowed">
                {empresa ? `${empresa.nombreFantasia} (${empresa.razonSocial})` : "—"}
              </div>
              <p className="text-xs text-neutral-400 mt-1">El cliente no puede ser modificado después de la creación.</p>
            </div>

            <Input
              label="Nombre del tenant"
              required
              placeholder="Ej: Operación Chile, Sucursal MX"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onBlur={() => handleBlur("nombre")}
              error={touched.has("nombre") ? errors.nombre : undefined}
            />

            <Input
              label="Dominio / Subdominio"
              required
              placeholder="Ej: empresa-cl.amplifica.io"
              value={form.dominio}
              onChange={(e) => setForm({ ...form, dominio: e.target.value })}
              onBlur={() => handleBlur("dominio")}
              error={touched.has("dominio") ? errors.dominio : undefined}
            />

            <div className="flex gap-3 pt-3">
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
        onConfirm={() => router.push(`/tenants/${id}`)}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Tenant actualizado!" message="Los cambios se han guardado correctamente." />
    </MainLayout>
  );
}
