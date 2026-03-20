import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import { IconPlus } from "@tabler/icons-react";
import Button from "@/components/ui/Button";

export default function PageHeaderSection() {
  return (
    <DSSection id="page-header" title="Page Header" description="Breadcrumb + título + descripción + acciones de la página.">
      <DSSubsection title="Header de listado">
        <DSShowcase>
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
              <span className="text-primary-600 hover:underline cursor-pointer">Inicio</span>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-700">Clientes</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Clientes</h1>
                <p className="text-sm text-neutral-500 mt-1">Administración y gestión de empresas con contratos</p>
              </div>
              <Button icon={<IconPlus size={16} />}>Crear cliente</Button>
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Header de detalle">
        <DSShowcase>
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
              <span className="text-primary-600 hover:underline cursor-pointer">Inicio</span>
              <span className="text-neutral-300">/</span>
              <span className="text-primary-600 hover:underline cursor-pointer">Clientes</span>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-700">Extra Life</span>
            </nav>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">EX</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-neutral-900">Extra Life</h1>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Activo</span>
                  </div>
                  <p className="text-sm text-neutral-500">Extra Life SpA</p>
                </div>
              </div>
              <Button variant="secondary" icon={<IconPlus size={14} />}>Editar</Button>
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
