import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import SummaryCard from "@/components/ui/SummaryCard";
import { IconFileText, IconAlertTriangle, IconCash, IconBan } from "@tabler/icons-react";

export default function CardsSection() {
  return (
    <DSSection id="cards" title="Cards" description="SummaryCard para KPIs y métricas en listados.">
      <DSSubsection title="Summary Cards">
        <DSShowcase label="Ejemplo: cards de la página /contratos">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Contratos vigentes" value={29} icon={<IconFileText size={18} />} sub="+3 este mes" subColor="green" />
            <SummaryCard title="Por vencer (30d)" value={11} icon={<IconAlertTriangle size={18} />} sub="requieren atención" subColor="amber" />
            <SummaryCard title="Monto mensual total" value={7003500} icon={<IconCash size={18} />} sub="+12% vs anterior" subColor="blue" />
            <SummaryCard title="Cancelados" value={0} icon={<IconBan size={18} />} sub="sin cancelaciones" subColor="neutral" />
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Variantes de subColor">
        <DSShowcase label="Colores disponibles para el sub-badge">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <SummaryCard title="Green" value={42} sub="+20%" subColor="green" icon={<IconFileText size={18} />} />
            <SummaryCard title="Blue" value={18} sub="+5%" subColor="blue" icon={<IconFileText size={18} />} />
            <SummaryCard title="Red" value={3} sub="-10%" subColor="red" icon={<IconFileText size={18} />} />
            <SummaryCard title="Amber" value={7} sub="atención" subColor="amber" icon={<IconFileText size={18} />} />
            <SummaryCard title="Neutral" value={0} sub="sin datos" subColor="neutral" icon={<IconFileText size={18} />} />
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
