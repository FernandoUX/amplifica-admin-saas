"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const PAISES = ["Chile", "Colombia", "Perú", "Argentina", "México", "España", "Brasil", "Otro"];

const EMPTY_CONTACTO = { nombre: "", cargo: "", correo: "", telefono: "" };

const EMPTY = {
  nombreFantasia: "",
  razonSocial: "",
  idFiscal: "",
  pais: "Chile",
  giro: "",
  direccion: "",
  contactoComercial: { ...EMPTY_CONTACTO },
  mismoQueComercial: true,
  contactoPagos: { ...EMPTY_CONTACTO },
  notasInternas: "",
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-neutral-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function selectClass(error?: boolean) {
  return `h-[44px] w-full rounded-lg border ${error ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"} px-3 text-sm text-neutral-900 bg-white outline-none focus:ring-2 appearance-none`;
}

function textareaClass() {
  return "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none";
}

export default function CrearClientePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setField = (k: string, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const setCC = (k: string, v: string) => {
    setForm((f) => ({ ...f, contactoComercial: { ...f.contactoComercial, [k]: v } }));
    setDirty(true);
  };

  const setCP = (k: string, v: string) => {
    setForm((f) => ({ ...f, contactoPagos: { ...f.contactoPagos, [k]: v } }));
    setDirty(true);
  };

  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const errors = {
    nombreFantasia: touched.nombreFantasia && form.nombreFantasia.length < 2,
    razonSocial: touched.razonSocial && form.razonSocial.length < 3,
    idFiscal: touched.idFiscal && form.idFiscal.length < 5,
    pais: touched.pais && !form.pais,
    ccNombre: touched.ccNombre && !form.contactoComercial.nombre,
    ccCorreo: touched.ccCorreo && !form.contactoComercial.correo.includes("@"),
  };

  const valid =
    form.nombreFantasia.length >= 2 &&
    form.razonSocial.length >= 3 &&
    form.idFiscal.length >= 5 &&
    !!form.pais &&
    !!form.contactoComercial.nombre &&
    form.contactoComercial.correo.includes("@");

  const handleSubmit = async () => {
    if (!valid) {
      setTouched({ nombreFantasia: true, razonSocial: true, idFiscal: true, pais: true, ccNombre: true, ccCorreo: true });
      return;
    }
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

          {/* Datos de la empresa */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Datos de la empresa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Nombre de fantasía"
                  required
                  placeholder="Nombre comercial visible"
                  value={form.nombreFantasia}
                  onChange={(e) => setField("nombreFantasia", e.target.value)}
                  onBlur={() => blur("nombreFantasia")}
                />
                {errors.nombreFantasia && <p className="text-xs text-red-500 mt-1">Mínimo 2 caracteres</p>}
              </div>
              <div>
                <Input
                  label="Razón Social"
                  required
                  placeholder="Razón social legal"
                  value={form.razonSocial}
                  onChange={(e) => setField("razonSocial", e.target.value)}
                  onBlur={() => blur("razonSocial")}
                />
                {errors.razonSocial && <p className="text-xs text-red-500 mt-1">Mínimo 3 caracteres</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="ID Fiscal (RUT)"
                  required
                  placeholder="00.000.000-0"
                  value={form.idFiscal}
                  onChange={(e) => setField("idFiscal", e.target.value)}
                  onBlur={() => blur("idFiscal")}
                />
                {errors.idFiscal && <p className="text-xs text-red-500 mt-1">Ingrese un ID fiscal válido</p>}
              </div>
              <div>
                <FieldLabel label="País" required />
                <select
                  className={selectClass(errors.pais)}
                  value={form.pais}
                  onChange={(e) => setField("pais", e.target.value)}
                  onBlur={() => blur("pais")}
                >
                  <option value="">Seleccionar país</option>
                  {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.pais && <p className="text-xs text-red-500 mt-1">Selecciona un país</p>}
              </div>
            </div>

            <Input label="Giro comercial" placeholder="Ej. Comercio electrónico" value={form.giro} onChange={(e) => setField("giro", e.target.value)} />
            <Input label="Dirección" placeholder="Dirección comercial" value={form.direccion} onChange={(e) => setField("direccion", e.target.value)} />
          </section>

          {/* Contacto comercial */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto comercial</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Nombre"
                  required
                  placeholder="Nombre del contacto"
                  value={form.contactoComercial.nombre}
                  onChange={(e) => setCC("nombre", e.target.value)}
                  onBlur={() => blur("ccNombre")}
                />
                {errors.ccNombre && <p className="text-xs text-red-500 mt-1">Campo requerido</p>}
              </div>
              <Input label="Cargo" placeholder="Ej. CEO, Dir. Comercial" value={form.contactoComercial.cargo} onChange={(e) => setCC("cargo", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Correo"
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={form.contactoComercial.correo}
                  onChange={(e) => setCC("correo", e.target.value)}
                  onBlur={() => blur("ccCorreo")}
                />
                {errors.ccCorreo && <p className="text-xs text-red-500 mt-1">Ingrese un correo válido</p>}
              </div>
              <Input label="Teléfono" placeholder="+56 9 1234 5678" value={form.contactoComercial.telefono} onChange={(e) => setCC("telefono", e.target.value)} />
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
                onChange={(e) => setField("mismoQueComercial", e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Mismo que contacto comercial</span>
            </label>
            {!form.mismoQueComercial && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Nombre" placeholder="Nombre del contacto de pagos" value={form.contactoPagos.nombre} onChange={(e) => setCP("nombre", e.target.value)} />
                  <Input label="Cargo" placeholder="Ej. CFO, Contador" value={form.contactoPagos.cargo} onChange={(e) => setCP("cargo", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Correo" type="email" placeholder="pagos@empresa.com" value={form.contactoPagos.correo} onChange={(e) => setCP("correo", e.target.value)} />
                  <Input label="Teléfono" placeholder="+56 9 1234 5678" value={form.contactoPagos.telefono} onChange={(e) => setCP("telefono", e.target.value)} />
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
                onChange={(e) => setField("notasInternas", e.target.value)}
              />
            </div>
          </section>

          {!valid && (
            <p className="text-xs text-neutral-400">* Completa los campos obligatorios para continuar</p>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="lg" onClick={handleCancel}>Cancelar</Button>
            <Button size="lg" disabled={false} loading={loading} onClick={handleSubmit}>Guardar</Button>
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
              <Button variant="danger" className="flex-1" onClick={() => router.push("/clientes")}>Descartar</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
