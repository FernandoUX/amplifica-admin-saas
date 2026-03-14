"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_EMPRESAS } from "@/lib/mock-data";

interface FormState {
  empresaId: string;
  nombre: string;
  dominio: string;
}

const initial: FormState = { empresaId: "", nombre: "", dominio: "" };

export default function CrearTenantPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const clientesActivos = MOCK_EMPRESAS.filter((e) => e.operationalStatus === "activo");

  const validate = (f: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!f.empresaId) e.empresaId = "Debes seleccionar un cliente";
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
    setTimeout(() => router.push("/tenants"), 1200);
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
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">
            <Select
              label="Cliente asociado"
              required
              placeholder="Selecciona un cliente activo"
              value={form.empresaId}
              onChange={(e) => { setForm({ ...form, empresaId: e.target.value }); setTouched((p) => new Set([...p, "empresaId"])); }}
              onBlur={() => handleBlur("empresaId")}
              error={touched.has("empresaId") ? errors.empresaId : undefined}
              options={clientesActivos.map((e) => ({ value: e.id, label: `${e.nombreFantasia} (${e.razonSocial})` }))}
            />

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

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-800">
                <strong>Siguiente paso:</strong> Después de crear el tenant, podrás elegir entre crear un contrato o dejarlo en trial implícito con límites reducidos.
              </p>
            </div>

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
        onConfirm={() => router.push("/tenants")}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Tenant creado!" message="El tenant se ha creado correctamente." />
    </MainLayout>
  );
}
