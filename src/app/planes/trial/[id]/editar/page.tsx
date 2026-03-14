"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import MultiSelect from "@/components/ui/MultiSelect";
import Toggle from "@/components/ui/Toggle";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_TRIAL_CONFIGS } from "@/lib/mock-data";
import { MODULOS_SISTEMA } from "@/lib/types";

interface FormState {
  nombre: string;
  descripcion: string;
  duracionDias: string;
  modulos: string[];
  pedidosMax: string;
  sucursalesMax: string;
  esDefault: boolean;
}

export default function EditarTrialConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const config = MOCK_TRIAL_CONFIGS.find((c) => c.id === id);

  const initialForm: FormState = config
    ? { nombre: config.nombre, descripcion: config.descripcion, duracionDias: String(config.duracionDias), modulos: [...config.modulos], pedidosMax: String(config.pedidosMax), sucursalesMax: String(config.sucursalesMax), esDefault: config.esDefault }
    : { nombre: "", descripcion: "", duracionDias: "", modulos: [], pedidosMax: "", sucursalesMax: "", esDefault: false };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  if (!config) {
    return (
      <MainLayout narrow>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-neutral-500">Configuración no encontrada</p>
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
    if (!f.duracionDias) e.duracionDias = "Campo obligatorio";
    else if (Number(f.duracionDias) < 1) e.duracionDias = "Mínimo 1 día";
    else if (Number(f.duracionDias) > 90) e.duracionDias = "Máximo 90 días";
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
    setTimeout(() => router.push(`/planes/trial/${config.id}`), 1200);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push(`/planes/trial/${config.id}`);
  };

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/planes" },
            { label: config.nombre, href: `/planes/trial/${config.id}` },
            { label: "Editar" },
          ]}
          title={`Editar: ${config.nombre}`}
          description="Modifica la configuración de trial"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">
            <Input
              label="Nombre de la configuración"
              required
              placeholder="Ej: Trial Starter 15d"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onBlur={() => handleBlur("nombre")}
              error={touched.has("nombre") ? errors.nombre : undefined}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción interna del propósito del trial"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              onBlur={() => handleBlur("descripcion")}
              error={touched.has("descripcion") ? errors.descripcion : undefined}
            />

            <Input
              label="Duración (días)"
              required
              type="number"
              min={1}
              max={90}
              placeholder="Ej: 15"
              value={form.duracionDias}
              onChange={(e) => setForm({ ...form, duracionDias: e.target.value })}
              onBlur={() => handleBlur("duracionDias")}
              error={touched.has("duracionDias") ? errors.duracionDias : undefined}
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
                placeholder="Ej: 50"
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
                placeholder="Ej: 1"
                value={form.sucursalesMax}
                onChange={(e) => setForm({ ...form, sucursalesMax: e.target.value })}
                onBlur={() => handleBlur("sucursalesMax")}
                error={touched.has("sucursalesMax") ? errors.sucursalesMax : undefined}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-800">Marcar como default</p>
                <p className="text-xs text-neutral-500">Se aplica automáticamente a tenants sin contrato (trial implícito)</p>
              </div>
              <Toggle checked={form.esDefault} onChange={(v) => setForm({ ...form, esDefault: v })} />
            </div>

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
        onConfirm={() => router.push(`/planes/trial/${config.id}`)}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Configuración actualizada!" message="Los cambios se han guardado correctamente." />
    </MainLayout>
  );
}
