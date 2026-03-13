import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Configuración" }]}
          title="Configuración"
          description="Configuración general del panel de administración."
        />
        <div className="flex-1 px-6 pb-6">
          <EmptyState icon={<Settings size={24} />} title="Sin configuración disponible aún" />
        </div>
      </div>
    </MainLayout>
  );
}
