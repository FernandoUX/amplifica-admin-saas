"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MOCK_PLANES } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { Edit2, Package, BarChart3, Building2 } from "lucide-react";

export default function PlanDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar } = useRole();
  const plan = MOCK_PLANES.find((p) => p.id === id);

  if (!plan) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-neutral-500">Plan no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const statusVariant = plan.estado === "Activo" ? "active" : "inactive";

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/planes" },
            { label: plan.nombre },
          ]}
          title={plan.nombre}
          description={plan.descripcion || "Sin descripción"}
          actions={
            canEditar("Planes") ? (
              <Button size="md" variant="secondary" icon={<Edit2 size={14} />} onClick={() => router.push(`/planes/${plan.id}/editar`)}>
                Editar
              </Button>
            ) : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6 space-y-5">
          {/* Estado */}
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant as never}>{plan.estado}</Badge>
            <span className="text-xs text-neutral-400">
              Creado el {new Date(plan.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>

          {/* Info general */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={16} className="text-neutral-400" />
              Información del plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Nombre del plan</p>
                <p className="text-sm text-neutral-900">{plan.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Estado</p>
                <Badge variant={statusVariant as never}>{plan.estado}</Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-neutral-500 mb-1">Descripción</p>
                <p className="text-sm text-neutral-600">{plan.descripcion || "—"}</p>
              </div>
            </div>
          </div>

          {/* Módulos incluidos */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={16} className="text-neutral-400" />
              Módulos incluidos
            </h3>
            <div className="flex flex-wrap gap-2">
              {plan.modulos.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center rounded-lg bg-primary-50 border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Límites y uso */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-neutral-400" />
              Límites del plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900 tabular-nums">{plan.pedidosMax.toLocaleString("es-CL")}</p>
                <p className="text-xs text-neutral-500 mt-1">Pedidos máx. / mes</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900 tabular-nums">{plan.sucursalesMax}</p>
                <p className="text-xs text-neutral-500 mt-1">Sucursales máx.</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 size={16} className="text-neutral-400" />
                  <p className="text-2xl font-bold text-neutral-900 tabular-nums">{plan.tenantsActivos}</p>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Tenants usando este plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
