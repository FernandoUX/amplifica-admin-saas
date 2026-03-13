import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Receipt } from "lucide-react";

export default function FacturacionPage() {
  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb="Inicio / Facturación"
          title="Facturación"
          description="Administración y gestión de facturación."
        />
        <div className="flex-1 px-6 pb-6">
          <EmptyState icon={<Receipt size={24} />} title="No tienes registros de facturación aún" />
        </div>
      </div>
    </MainLayout>
  );
}
