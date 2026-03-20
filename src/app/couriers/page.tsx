import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { IconTruck as Truck } from "@tabler/icons-react";

export default function CouriersPage() {
  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Couriers" }]}
          title="Couriers"
          description="Administración y gestión de couriers."
        />
        <div className="flex-1 px-6 pb-6">
          <EmptyState icon={<Truck size={24} />} title="No tienes couriers creados aún" />
        </div>
      </div>
    </MainLayout>
  );
}
