"use client";

import { useState } from "react";
import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import FilterDropdown from "@/components/ui/FilterDropdown";
import PeriodFilter from "@/components/ui/PeriodFilter";

export default function FiltersSection() {
  const [estado, setEstado] = useState<Set<string>>(new Set());
  const [period, setPeriod] = useState<30 | 60 | 90>(30);

  return (
    <DSSection id="filters" title="Filtros" description="FilterDropdown para filtrar listas y PeriodFilter para rangos temporales.">
      <DSSubsection title="FilterDropdown">
        <DSShowcase label="Filtro por estado con opciones seleccionables">
          <div className="flex gap-3">
            <FilterDropdown
              label="Estado"
              options={[
                { value: "activo", label: "Activo" },
                { value: "suspendido", label: "Suspendido" },
                { value: "inactivo", label: "Inactivo" },
              ]}
              selected={estado}
              onChange={setEstado}
            />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Seleccionados: {estado.size > 0 ? [...estado].join(", ") : "ninguno"}
          </p>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="PeriodFilter">
        <DSShowcase label="Selector de período (30/60/90 días)">
          <PeriodFilter value={period} onChange={setPeriod} />
          <p className="mt-3 text-xs text-neutral-500">Período: {period} días</p>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
