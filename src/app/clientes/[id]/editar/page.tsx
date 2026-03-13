"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MOCK_EMPRESAS } from "@/lib/mock-data";

const PAISES = ["Chile", "Colombia", "Perú", "Argentina", "México", "España", "Brasil", "Otro"];

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-neutral-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function selectClass() {
  return "h-[44px] w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-900 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 appearance-none";
}

function textareaClass() {
  return "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none";
}

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const empresa = MOCK_EMPRESAS.find((e) => e.id === id);

  const [form, setForm] = useState({
    nombreFantasia: empresa?.nombreFantasia ?? "",
    razonSocial: empresa?.razonSocial ?? "",
    idFiscal: empresa?.idFiscal ?? "",
    pais: empresa?.pais ?? "Chile",
    giro: empresa?.giro ?? "",
    direccion: empresa?.direccion ?? "",
    ccNombre: empresa?.contactoComercial.nombre ?? "",
    ccCargo: empresa?.contactoComercial.cargo ?? "",
    ccCorreo: empresa?.contactoComercial.correo ?? "",
    ccTelefono: empresa?.contactoComercial.telefono ?? "",
    mismoQueComercial: empresa?.contactoPagos.mismoQueComercial ?? true,
    cpNombre: empresa?.contactoPagos.nombre ?? "",
    cpCargo: empresa?.contactoPagos.cargo ?? "",
    cpCorreo: empresa?.contactoPagos.correo ?? "",
    cpTelefono: empresa?.contactoPagos.telefono ?? "",
    notasInternas: empresa?.notasInternas ?? "",
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

  const set = (k: keyof typeof form, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const valid =
    form.nombreFantasia.length >= 2 &&
    form.razonSocial.length >= 3 &&
    form.idFiscal.length >= 5 &&
    !!form.pais &&
    !!form.ccNombre &&
    form.ccCorreo.includes("@");

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
          { label: empresa.nombreFantasia, href: `/clientes/${id}` },
          { label: "Editar" },
        ]}
        title={`Editar: ${empresa.nombreFantasia}`}
      />

      <div className="px-4 sm:px-6 pb-10">
        <div className="flex flex-col gap-6">

          {/* Datos de la empresa */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Datos de la empresa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre de fantasía" required value={form.nombreFantasia} onChange={(e) => set("nombreFantasia", e.target.value)} />
              <Input label="Razón Social" required value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="ID Fiscal (RUT)" required value={form.idFiscal} onChange={(e) => set("idFiscal", e.target.value)} />
              <div>
                <FieldLabel label="País" required />
                <select className={selectClass()} value={form.pais} onChange={(e) => set("pais", e.target.value)}>
                  {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <Input label="Giro comercial" value={form.giro} onChange={(e) => set("giro", e.target.value)} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
          </section>

          {/* Contacto comercial */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto comercial</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre" required value={form.ccNombre} onChange={(e) => set("ccNombre", e.target.value)} />
              <Input label="Cargo" value={form.ccCargo} onChange={(e) => set("ccCargo", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Correo" type="email" required value={form.ccCorreo} onChange={(e) => set("ccCorreo", e.target.value)} />
              <Input label="Teléfono" value={form.ccTelefono} onChange={(e) => set("ccTelefono", e.target.value)} />
            </div>
          </section>

          {/* Contacto de pagos */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto de pagos y finanzas</h2>
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-400 cursor-pointer"
                checked={form.mismoQueComercial}
                onChange={(e) => set("mismoQueComercial", e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Mismo que contacto comercial</span>
            </label>
            {!form.mismoQueComercial && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Nombre" value={form.cpNombre} onChange={(e) => set("cpNombre", e.target.value)} />
                  <Input label="Cargo" value={form.cpCargo} onChange={(e) => set("cpCargo", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Correo" type="email" value={form.cpCorreo} onChange={(e) => set("cpCorreo", e.target.value)} />
                  <Input label="Teléfono" value={form.cpTelefono} onChange={(e) => set("cpTelefono", e.target.value)} />
                </div>
              </>
            )}
          </section>

          {/* Notas internas */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-neutral-700">Notas internas</h2>
            <div>
              <FieldLabel label="Notas" />
              <textarea
                className={textareaClass()}
                rows={3}
                placeholder="Notas visibles solo para el equipo de Amplifica…"
                value={form.notasInternas}
                onChange={(e) => set("notasInternas", e.target.value)}
              />
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
