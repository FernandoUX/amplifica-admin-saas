"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Empresa } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (e: Empresa) => void;
}

const EMPTY: Partial<Empresa> = {
  nombre: "", razonSocial: "", nombreFantasia: "", pais: "Chile", idFiscal: "",
  giro: "", direccion: "", nombreContacto: "", cargo: "", correoContacto: "",
  telefonoPrincipal: "",
};

export default function CreateEmpresaModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<Partial<Empresa>>(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Empresa, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.razonSocial || !form.nombreFantasia) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const created: Empresa = {
      id: String(Date.now()),
      nombre: form.nombreFantasia!,
      razonSocial: form.razonSocial!,
      nombreFantasia: form.nombreFantasia!,
      pais: form.pais || "Chile",
      idFiscal: form.idFiscal || "",
      giro: form.giro || "",
      direccion: form.direccion || "",
      nombreContacto: form.nombreContacto || "",
      cargo: form.cargo || "",
      correoContacto: form.correoContacto || "",
      telefonoPrincipal: form.telefonoPrincipal || "",
      planes: [],
      contratos: 0,
      estadoComercial: "Al día",
      estado: "Activo",
      habilitado: true,
    };
    setLoading(false);
    setForm(EMPTY);
    onCreated(created);
    onClose();
  };

  const valid = !!(form.razonSocial && form.nombreFantasia);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Empresa"
      subtitle="Complete los siguientes datos para crear empresa"
      width="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <Input label="Razón Social" required placeholder="Ingrese razón social" value={form.razonSocial || ""} onChange={(e) => set("razonSocial", e.target.value)} />
        <Input label="Nombre de fantasía" required placeholder="Ingrese nombre de fantasía" value={form.nombreFantasia || ""} onChange={(e) => set("nombreFantasia", e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="País" placeholder="Chile" value={form.pais || ""} onChange={(e) => set("pais", e.target.value)} />
          <Input label="ID Fiscal" placeholder="0000000-0" value={form.idFiscal || ""} onChange={(e) => set("idFiscal", e.target.value)} />
        </div>

        <Input label="Giro" placeholder="Ingrese giro comercial" value={form.giro || ""} onChange={(e) => set("giro", e.target.value)} />
        <Input label="Dirección" placeholder="Ingrese la dirección comercial" value={form.direccion || ""} onChange={(e) => set("direccion", e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre de contacto" placeholder="Ingrese el nombre de contacto" value={form.nombreContacto || ""} onChange={(e) => set("nombreContacto", e.target.value)} />
          <Input label="Cargo" placeholder="Ingrese el cargo" value={form.cargo || ""} onChange={(e) => set("cargo", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Correo de contacto" placeholder="contacto@empresa.cl" type="email" value={form.correoContacto || ""} onChange={(e) => set("correoContacto", e.target.value)} />
          <Input label="Teléfono principal" placeholder="CL +56 9 1234 5678" value={form.telefonoPrincipal || ""} onChange={(e) => set("telefonoPrincipal", e.target.value)} />
        </div>

        <div className="mt-2">
          <Button
            className="w-full"
            disabled={!valid}
            loading={loading}
            onClick={handleSubmit}
          >
            Crear empresa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
