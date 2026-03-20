"use client";

import { useState } from "react";
import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import MultiSelect from "@/components/ui/MultiSelect";

export default function FormFieldsSection() {
  const [modules, setModules] = useState<string[]>(["Fulfillment", "Tracking"]);

  return (
    <DSSection id="form-fields" title="Campos de formulario" description="Composición de Input + Label + Error, MultiSelect y otros campos compuestos.">
      <DSSubsection title="Formulario de ejemplo">
        <DSShowcase label="Patrón de formulario de creación de entidad">
          <div className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre de fantasía" required placeholder="Nombre comercial" />
              <Input label="Razón Social" required placeholder="Razón social legal" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="País"
                required
                placeholder="Seleccionar país"
                options={[
                  { value: "cl", label: "Chile" },
                  { value: "co", label: "Colombia" },
                  { value: "pe", label: "Perú" },
                ]}
              />
              <Input label="RUT" required placeholder="12.345.678-9" />
            </div>
            <MultiSelect
              label="Módulos"
              required
              placeholder="Seleccionar módulos"
              options={["Fulfillment", "Tracking", "Devoluciones", "Gestión de couriers", "Inventario"]}
              value={modules}
              onChange={setModules}
            />
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="MultiSelect interactivo">
        <DSShowcase label="Selección múltiple con pills removibles">
          <div className="max-w-md">
            <MultiSelect
              label="Módulos seleccionados"
              placeholder="Seleccionar"
              options={["Fulfillment", "Tracking", "Devoluciones", "Gestión de couriers", "Inventario", "Analytics", "Reportes"]}
              value={modules}
              onChange={setModules}
            />
            <p className="mt-2 text-xs text-neutral-500">Seleccionados: {modules.join(", ") || "ninguno"}</p>
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
