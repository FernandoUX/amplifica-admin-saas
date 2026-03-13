"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MOCK_EMPRESAS } from "@/lib/mock-data";

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const empresa = MOCK_EMPRESAS.find((e) => e.id === id);

  const [form, setForm] = useState({
    razonSocial: empresa?.razonSocial ?? "",
    nombreFantasia: empresa?.nombreFantasia ?? empresa?.nombre ?? "",
    pais: empresa?.pais ?? "Chile",
    idFiscal: empresa?.idFiscal ?? "",
    giro: empresa?.giro ?? "",
    direccion: empresa?.direccion ?? "",
    nombreContacto: empresa?.nombreContacto ?? "",
    cargo: empresa?.cargo ?? "",
    correoContacto: empresa?.correoContacto ?? "",
    telefonoPrincipal: empresa?.telefonoPrincipal ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!empresa) {
    return (
      <MainLayout narrow>
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes", href: "/clientes" }, { label: "No encontrado" }]}
          title="Cliente no encontrado"
        />
      </MainLayout>
    );
  }

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const valid = !!(form.razonSocial && form.nombreFantasia);

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    router.push(`/clientes/${id}?updated=1`);
  };

  const handleCancel = () => {
    if (dirty) setConfirmCancel(true);
    else router.push(`/clientes/${id}`);
  };

  return (
    <MainLayout narrow>
      <PageHeader
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Clientes", href: "/clientes" },
          { label: empresa.nombre, href: `/clientes/${id}` },
          { label: "Editar" },
        ]}
        title={`Editar: ${empresa.nombre}`}
      />

      <div className="px-4 sm:px-6 pb-10">
        <div className="flex flex-col gap-6">

          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Datos empresariales</h2>
            <Input label="Razón Social" required value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} />
            <Input label="Nombre de fantasía" required value={form.nombreFantasia} onChange={(e) => set("nombreFantasia", e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="País" value={form.pais} onChange={(e) => set("pais", e.target.value)} />
              <Input label="ID Fiscal (RUT)" value={form.idFiscal} onChange={(e) => set("idFiscal", e.target.value)} />
            </div>
            <Input label="Giro comercial" value={form.giro} onChange={(e) => set("giro", e.target.value)} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto principal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre de contacto" value={form.nombreContacto} onChange={(e) => set("nombreContacto", e.target.value)} />
              <Input label="Cargo" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Correo de contacto" type="email" value={form.correoContacto} onChange={(e) => set("correoContacto", e.target.value)} />
              <Input label="Teléfono principal" value={form.telefonoPrincipal} onChange={(e) => set("telefonoPrincipal", e.target.value)} />
            </div>
          </section>

          {!valid && <p className="text-xs text-neutral-400">* Completa los campos obligatorios para continuar</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="lg" onClick={handleCancel}>Cancelar</Button>
            <Button size="lg" disabled={!valid} loading={loading} onClick={handleSubmit}>Guardar</Button>
          </div>
        </div>
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmCancel(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl mx-4 p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-neutral-900">¿Estás seguro?</h3>
            <p className="text-sm text-neutral-500">Los cambios no guardados se perderán.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmCancel(false)}>Seguir editando</Button>
              <Button variant="danger" className="flex-1" onClick={() => router.push(`/clientes/${id}`)}>Descartar</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
