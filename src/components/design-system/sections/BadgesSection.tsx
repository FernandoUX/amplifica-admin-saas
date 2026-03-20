import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Badge from "@/components/ui/Badge";

const variants = [
  { variant: "active" as const, label: "Activo" },
  { variant: "inactive" as const, label: "Inactivo" },
  { variant: "pending" as const, label: "Pendiente" },
  { variant: "vencido" as const, label: "Vencido" },
  { variant: "trial" as const, label: "Trial" },
  { variant: "express" as const, label: "Express" },
  { variant: "envios-pro" as const, label: "Envíos Pro" },
  { variant: "multicanal" as const, label: "Multicanal" },
  { variant: "default" as const, label: "Default" },
];

export default function BadgesSection() {
  return (
    <DSSection id="badges" title="Badges" description="Indicadores visuales de estado y categoría.">
      <DSSubsection title="Variantes">
        <DSShowcase>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => (
              <Badge key={v.variant} variant={v.variant}>{v.label}</Badge>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Uso contextual">
        <DSShowcase label="Ejemplos de uso en tablas y detalle">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700 w-28">Estado cliente:</span>
              <Badge variant="active">Activo</Badge>
              <Badge variant="inactive">Suspendido</Badge>
              <Badge variant="inactive">Inactivo</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700 w-28">Contrato:</span>
              <Badge variant="active">Vigente</Badge>
              <Badge variant="pending">Por vencer</Badge>
              <Badge variant="vencido">Cancelado</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700 w-28">Billing:</span>
              <Badge variant="trial">Trial</Badge>
              <Badge variant="active">Pagado</Badge>
              <Badge variant="inactive">Sin contrato</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700 w-28">Módulos:</span>
              <Badge variant="default">Fulfillment</Badge>
              <Badge variant="trial">Tracking</Badge>
              <Badge variant="express">Devoluciones</Badge>
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
