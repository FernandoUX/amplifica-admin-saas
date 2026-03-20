"use client";

import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import RowMenu from "@/components/ui/RowMenu";

export default function RowMenuSection() {
  return (
    <DSSection id="row-menu" title="Menú contextual (RowMenu)" description="Menú de acciones de 3 puntos para filas de tabla.">
      <DSSubsection title="Acciones estándar">
        <DSShowcase label="Click en el botón ⋮ para abrir">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700">Entidad activa:</span>
              <RowMenu actions={[
                { label: "Ver detalle", onClick: () => {} },
                { label: "Editar", onClick: () => {} },
                { label: "Suspender", onClick: () => {}, variant: "danger" },
              ]} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700">Entidad suspendida:</span>
              <RowMenu actions={[
                { label: "Ver detalle", onClick: () => {} },
                { label: "Editar", onClick: () => {} },
                { label: "Reactivar", onClick: () => {} },
              ]} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700">Contrato cancelado:</span>
              <RowMenu actions={[
                { label: "Ver detalle", onClick: () => {} },
                { label: "Reactivar", onClick: () => {} },
              ]} />
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
