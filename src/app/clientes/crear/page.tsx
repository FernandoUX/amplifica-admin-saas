"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const EMPTY = {
  razonSocial: "", nombreFantasia: "", pais: "Chile", idFiscal: "",
  giro: "", direccion: "", nombreContacto: "", cargo: "",
  correoContacto: "", telefonoPrincipal: "",
};

export default function CrearClientePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k: keyof typeof EMPTY, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const valid = !!(form.razonSocial && form.nombreFantasia);

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    router.push("/clientes?created=1");
  };

  const handleCancel = () => {
    if (dirty) setConfirmCancel(true);
    else router.push("/clientes");
  };

  return (
    <MainLayout narrow>
      <PageHeader
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Clientes", href: "/clientes" },
          { label: "Crear cliente" },
        ]}
        title="Crear cliente"
        description="Complete los datos para registrar un nuevo cliente."
      />

      <div className="px-4 sm:px-6 pb-10">
        <div className="flex flex-col gap-6">

          {/* Datos empresariales */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Datos empresariales</h2>
            <Input label="Razón Social" required placeholder="Ingrese razón social" value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} />
            <Input label="Nombre de fantasía" required placeholder="Nombre comercial" value={form.nombreFantasia} onChange={(e) => set("nombreFantasia", e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="País" placeholder="Chile" value={form.pais} onChange={(e) => set("pais", e.target.value)} />
              <Input label="ID Fiscal (RUT)" placeholder="00.000.000-0" value={form.idFiscal} onChange={(e) => set("idFiscal", e.target.value)} />
            </div>
            <Input label="Giro comercial" placeholder="Ingrese giro" value={form.giro} onChange={(e) => set("giro", e.target.value)} />
            <Input label="Dirección" placeholder="Dirección comercial" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
          </section>

          {/* Contacto */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto principal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre de contacto" placeholder="Nombre" value={form.nombreContacto} onChange={(e) => set("nombreContacto", e.target.value)} />
              <Input label="Cargo" placeholder="Cargo del contacto" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Correo de contacto" type="email" placeholder="contacto@empresa.cl" value={form.correoContacto} onChange={(e) => set("correoContacto", e.target.value)} />
              <Input label="Teléfono principal" placeholder="+56 9 1234 5678" value={form.telefonoPrincipal} onChange={(e) => set("telefonoPrincipal", e.target.value)} />
            </div>
          </section>

          {!valid && (
            <p className="text-xs text-neutral-400">* Completa los campos obligatorios para continuar</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="lg" onClick={handleCancel}>Cancelar</Button>
            <Button size="lg" disabled={!valid} loading={loading} onClick={handleSubmit}>Guardar</Button>
          </div>
        </div>
      </div>

      {/* Modal confirm cancel with unsaved changes */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmCancel(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl mx-4 p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-neutral-900">¿Estás seguro?</h3>
            <p className="text-sm text-neutral-500">Los cambios no guardados se perderán.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmCancel(false)}>Seguir editando</Button>
              <Button variant="danger" className="flex-1" onClick={() => router.push("/clientes")}>Descartar</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
