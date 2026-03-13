"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { Pencil } from "lucide-react";

const estadoVariant = (e: string) => {
  if (e === "Al día" || e === "Activo") return "active";
  if (e === "Por vencer") return "pending";
  return "inactive";
};

const field = (label: string, value: string) => (
  <div key={label}>
    <p className="text-xs font-semibold text-neutral-500 mb-1">{label}</p>
    <p className="text-sm text-neutral-900">{value || "—"}</p>
  </div>
);

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar } = useRole();

  const empresa = MOCK_EMPRESAS.find((e) => e.id === id);
  const tenants = MOCK_TENANTS.filter((t) => t.empresaId === id);
  const contratos = MOCK_CONTRATOS.filter((c) => c.empresaId === id);

  if (!empresa) {
    return (
      <MainLayout narrow>
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes", href: "/clientes" }, { label: "No encontrado" }]}
          title="Cliente no encontrado"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout narrow>
      <PageHeader
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Clientes", href: "/clientes" },
          { label: empresa.nombre },
        ]}
        title={empresa.nombre}
        description={empresa.razonSocial}
        actions={
          canEditar("Clientes") ? (
            <Button size="lg" variant="secondary" icon={<Pencil size={14} />} onClick={() => router.push(`/clientes/${id}/editar`)}>
              Editar
            </Button>
          ) : undefined
        }
      />

      <div className="px-4 sm:px-6 pb-10 flex flex-col gap-6">

        {/* Datos empresariales */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Datos empresariales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Razón Social", empresa.razonSocial)}
            {field("Nombre de fantasía", empresa.nombreFantasia || empresa.nombre)}
            {field("País", empresa.pais || "Chile")}
            {field("ID Fiscal", empresa.idFiscal || "")}
            {field("Giro", empresa.giro || "")}
            {field("Dirección", empresa.direccion || "")}
          </div>
        </section>

        {/* Contacto */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Contacto principal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Nombre de contacto", empresa.nombreContacto || "")}
            {field("Cargo", empresa.cargo || "")}
            {field("Correo de contacto", empresa.correoContacto || "")}
            {field("Teléfono principal", empresa.telefonoPrincipal || "")}
          </div>
        </section>

        {/* Estado */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Estado</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-1">Estado comercial</p>
              <Badge variant={estadoVariant(empresa.estadoComercial) as never}>{empresa.estadoComercial}</Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-1">Estado</p>
              <Badge variant={empresa.estado === "Activo" ? "active" : "inactive"}>{empresa.estado}</Badge>
            </div>
          </div>
        </section>

        {/* Tenants */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Tenants ({tenants.length})</h2>
          {tenants.length === 0 ? (
            <p className="text-sm text-neutral-400">Sin tenants asociados.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {tenants.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{t.nombre}</p>
                    <p className="text-xs text-neutral-400">ID: {t.id}</p>
                  </div>
                  <Badge variant={t.estado === "Activo" ? "active" : "inactive"}>{t.estado}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contratos */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Contratos ({contratos.length})</h2>
          {contratos.length === 0 ? (
            <p className="text-sm text-neutral-400">Sin contratos asociados.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {contratos.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{c.nombre}</p>
                    <p className="text-xs text-neutral-400">Vence: {c.fechaVencimiento}</p>
                  </div>
                  <Badge variant={estadoVariant(c.estado) as never}>{c.estado}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </MainLayout>
  );
}
