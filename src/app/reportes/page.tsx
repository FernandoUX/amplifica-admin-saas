import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";

export default function ReportesPage() {
  return (
    <MainLayout>
      <PageHeader
        breadcrumb="Inicio / Reportes de uso"
        title="Reportes de uso"
        description="Visualiza y exporta reportes de uso por tenant y período."
      />
    </MainLayout>
  );
}
