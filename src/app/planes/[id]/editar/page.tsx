"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import MultiSelect from "@/components/ui/MultiSelect";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_PLANES } from "@/lib/mock-data";
import { MODULOS_SISTEMA } from "@/lib/types";

interface FormState {
  nombre: string;
  descripcion: string;
  modulos: string[];
  pedidosMax: string;
  sucursalesMax: string;
}

export default function EditarPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const plan = MOCK_PLANES.find((p) => p.id === id);

  const initialForm: FormState = plan
    ? { nombre: plan.nombre, descripcion: plan.descripcion, modulos: [...plan.modulos], pedidosMax: String(plan.pedidosMax), sucursalesMax: String(plan.sucursalesMax) }
    : { nombre: "", descripcion: "", modulos: [], pedidosMax: "", sucursalesMax: "" };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  if (!plan) {
    return (
      <MainLayout narrow>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-neutral-500">Plan no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const validate = (f: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!f.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (f.nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres";
    else if (f.nombre.trim().length > 100) e.nombre = "Máximo 100 caracteres";
    if (f.descripcion.length > 500) e.descripcion = "Máximo 500 caracteres";
    if (f.modulos.length === 0) e.modulos = "Selecciona al menos un módulo";
    if (!f.pedidosMax) e.pedidosMax = "Campo obligatorio";
    else if (Number(f.pedidosMax) < 1) e.pedidosMax = "Debe ser al menos 1";
    if (!f.sucursalesMax) e.sucursalesMax = "Campo obligatorio";
    else if (Number(f.sucursalesMax) < 1) e.sucursalesMax = "Debe ser al menos 1";
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
    setTimeout(() => router.push(`/planes/${plan.id}`), 1200);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push(`/planes/${plan.id}`);
  };

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/planes" },
            { label: plan.nombre, href: `/planes/${plan.id}` },
            { label: "Editar" },
          ]}
          title={`Editar: ${plan.nombre}`}
          description="Modifica los datos del plan"
        />

        <div className="flex-1 px-4 sm:px-6 pb-20 md:pb-6">
          {/* Warning si tiene tenants activos */}
          {plan.tenantsActivos > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-5">
              <p className="text-sm text-amber-800">
                <strong>Atención:</strong> Este plan tiene {plan.tenantsActivos} contrato(s) activo(s). Los cambios aplicarán solo a contratos futuros.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">
            <Input
              label="Nombre del plan"
              required
              placeholder="Ej: Starter, Growth, Enterprise"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onBlur={() => handleBlur("nombre")}
              error={touched.has("nombre") ? errors.nombre : undefined}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción comercial del plan"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              onBlur={() => handleBlur("descripcion")}
              error={touched.has("descripcion") ? errors.descripcion : undefined}
            />

            <MultiSelect
              label="Módulos incluidos"
              required
              placeholder="Selecciona los módulos"
              options={[...MODULOS_SISTEMA]}
              value={form.modulos}
              onChange={(v) => { setForm({ ...form, modulos: v }); setTouched((p) => new Set([...p, "modulos"])); setErrors(validate({ ...form, modulos: v })); }}
              error={touched.has("modulos") ? errors.modulos : undefined}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cantidad máxima de pedidos/mes"
                required
                type="number"
                min={1}
                placeholder="Ej: 300"
                value={form.pedidosMax}
                onChange={(e) => setForm({ ...form, pedidosMax: e.target.value })}
                onBlur={() => handleBlur("pedidosMax")}
                error={touched.has("pedidosMax") ? errors.pedidosMax : undefined}
              />
              <Input
                label="Cantidad máxima de sucursales"
                required
                type="number"
                min={1}
                placeholder="Ej: 5"
                value={form.sucursalesMax}
                onChange={(e) => setForm({ ...form, sucursalesMax: e.target.value })}
                onBlur={() => handleBlur("sucursalesMax")}
                error={touched.has("sucursalesMax") ? errors.sucursalesMax : undefined}
              />
            </div>

            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-3 md:relative md:inset-auto md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-3 z-20">
              <Button variant="secondary" className="flex-1 md:flex-initial" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="flex-1 md:flex-initial" onClick={handleSubmit}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => router.push(`/planes/${plan.id}`)}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Plan actualizado!" message="Los cambios se han guardado correctamente." />
    </MainLayout>
  );
}
