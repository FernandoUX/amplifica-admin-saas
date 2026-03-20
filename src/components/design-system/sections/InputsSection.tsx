"use client";

import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function InputsSection() {
  return (
    <DSSection id="inputs" title="Inputs" description="Campos de entrada: Input, Select y sus estados.">
      <DSSubsection title="Input — Estados">
        <DSShowcase>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input label="Default" placeholder="Texto de ejemplo" />
            <Input label="Con valor" defaultValue="Amplifica SaaS" />
            <Input label="Requerido" required placeholder="Campo obligatorio" />
            <Input label="Con error" error="Este campo es requerido" required />
            <Input label="Con hint" hint="Mínimo 8 caracteres" placeholder="Contraseña" />
            <Input label="Deshabilitado" disabled defaultValue="No editable" />
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Select">
        <DSShowcase>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Select
              label="País"
              required
              placeholder="Seleccionar"
              options={[
                { value: "cl", label: "Chile" },
                { value: "co", label: "Colombia" },
                { value: "pe", label: "Perú" },
                { value: "ar", label: "Argentina" },
              ]}
            />
            <Select
              label="Con error"
              error="Selecciona una opción"
              placeholder="Seleccionar"
              options={[{ value: "1", label: "Opción 1" }]}
            />
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Props — Input">
        <div className="rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-600">
                <th className="px-4 py-3">Prop</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Default</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700">
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">label</td><td className="px-4 py-2 text-xs">string</td><td className="px-4 py-2 text-xs">—</td></tr>
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">error</td><td className="px-4 py-2 text-xs">string</td><td className="px-4 py-2 text-xs">—</td></tr>
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">hint</td><td className="px-4 py-2 text-xs">string</td><td className="px-4 py-2 text-xs">—</td></tr>
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">required</td><td className="px-4 py-2 text-xs">boolean</td><td className="px-4 py-2 text-xs">false</td></tr>
            </tbody>
          </table>
        </div>
      </DSSubsection>
    </DSSection>
  );
}
