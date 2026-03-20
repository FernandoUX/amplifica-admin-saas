"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MOCK_TRIAL_CONFIGS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { IconEdit, IconPackage, IconChartBar, IconBuilding, IconStar, IconClock } from "@tabler/icons-react";

export default function TrialConfigDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar } = useRole();
  const config = MOCK_TRIAL_CONFIGS.find((c) => c.id === id);

  if (!config) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-neutral-500">Configuración no encontrada</p>
        </div>
      </MainLayout>
    );
  }

  const statusVariant = config.estado === "Activo" ? "active" : "inactive";

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/planes" },
            { label: config.nombre },
          ]}
          title={config.nombre}
          description={config.descripcion || "Sin descripción"}
          actions={
            canEditar("Planes") ? (
              <Button size="md" variant="secondary" icon={<IconEdit size={14} />} onClick={() => router.push(`/planes/trial/${config.id}/editar`)}>
                Editar
              </Button>
            ) : undefined
          }
        />

        <div className="flex-1 px-4 sm:px-6 pb-6 space-y-5">
          {/* Estado + Default */}
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant as never}>{config.estado}</Badge>
            {config.esDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <IconStar size={10} className="fill-amber-400 text-amber-400" /> Default
              </span>
            )}
            <span className="text-xs text-neutral-400">
              Creado el {new Date(config.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>

          {/* Info general */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <IconPackage size={16} className="text-neutral-400" />
              Información de la configuración
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Nombre</p>
                <p className="text-sm text-neutral-900">{config.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Duración</p>
                <span className="inline-flex items-center gap-1 text-sm text-neutral-900">
                  <IconClock size={13} className="text-neutral-400" />
                  {config.duracionDias} días
                </span>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-neutral-500 mb-1">Descripción</p>
                <p className="text-sm text-neutral-600">{config.descripcion || "—"}</p>
              </div>
            </div>
          </div>

          {/* Módulos incluidos */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <IconPackage size={16} className="text-neutral-400" />
              Módulos incluidos
            </h3>
            <div className="flex flex-wrap gap-2">
              {config.modulos.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center rounded-lg bg-primary-50 border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Límites */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <IconChartBar size={16} className="text-neutral-400" />
              Límites del trial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900 tabular-nums">{config.pedidosMax.toLocaleString("es-CL")}</p>
                <p className="text-xs text-neutral-500 mt-1">Pedidos máx. / mes</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900 tabular-nums">{config.sucursalesMax}</p>
                <p className="text-xs text-neutral-500 mt-1">Sucursales máx.</p>
              </div>
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <IconBuilding size={16} className="text-neutral-400" />
                  <p className="text-2xl font-bold text-neutral-900 tabular-nums">{config.tenantsActivos}</p>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Tenants usando esta config</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
