import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import EmptyState from "@/components/ui/EmptyState";
import { IconSearch, IconUsers, IconFileText } from "@tabler/icons-react";

export default function EmptyStateSection() {
  return (
    <DSSection id="empty-state" title="Empty State" description="Estado vacío cuando no hay datos o resultados de búsqueda.">
      <DSSubsection title="Sin resultados de búsqueda">
        <DSShowcase>
          <EmptyState
            icon={<IconSearch size={24} className="text-neutral-400" />}
            title="Sin resultados para los filtros aplicados."
          />
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Con acción de crear">
        <DSShowcase>
          <EmptyState
            icon={<IconUsers size={24} className="text-neutral-400" />}
            title="No hay usuarios registrados"
            createLabel="Crear usuario"
            onCreateClick={() => {}}
          />
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Variante contratos">
        <DSShowcase>
          <EmptyState
            icon={<IconFileText size={24} className="text-neutral-400" />}
            title="Este tenant no tiene contratos activos"
            createLabel="Crear contrato"
            onCreateClick={() => {}}
          />
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
