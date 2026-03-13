import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";

export default function AuditLogPage() {
  return (
    <MainLayout>
      <PageHeader
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Audit Log" }]}
        title="Audit Log"
        description="Registro inmutable de todas las acciones realizadas en el sistema."
      />
    </MainLayout>
  );
}
