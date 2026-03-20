"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MOCK_CONTRATOS, MOCK_TENANTS, MOCK_EMPRESAS, MOCK_PLANES, MOCK_TRIAL_CONFIGS } from "@/lib/mock-data";
import { Contrato } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { IconPencil as Pencil, IconChevronRight } from "@tabler/icons-react";

/* ── Helpers ── */

const getEstadoDisplay = (c: Contrato) => {
  if (c.estado === "inactivo") {
    if (c.closureReason === "cancelado") return { label: "Cancelado", variant: "danger" };
    if (c.closureReason === "convertido") return { label: "Convertido", variant: "default" };
    return { label: "Vencido", variant: "inactive" };
  }
  const today = new Date();
  const venc = new Date(c.fechaVencimiento);
  const diff = Math.ceil((venc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 30 && diff >= 0) return { label: "Por vencer", variant: "pending" };
  return { label: "Vigente", variant: "active" };
};

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 mb-0.5">{label}</p>
      {children ?? <p className="text-sm text-neutral-900">{value || "—"}</p>}
    </div>
  );
}

export default function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar } = useRole();

  const contrato = MOCK_CONTRATOS.find((c) => c.id === id);
  const tenant = contrato ? MOCK_TENANTS.find((t) => t.id === contrato.tenantId) : null;
  const empresa = tenant ? MOCK_EMPRESAS.find((e) => e.id === tenant.empresaId) : null;
  const plan = contrato?.planId ? MOCK_PLANES.find((p) => p.id === contrato.planId) : null;
  const trialConfig = contrato?.trialConfigId ? MOCK_TRIAL_CONFIGS.find((tc) => tc.id === contrato.trialConfigId) : null;

  if (!contrato) {
    return (
      <MainLayout narrow>
        <div className="px-4 sm:px-6 pt-5 pb-4">
          <nav className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
            <Link href="/" className="hover:text-neutral-600">Inicio</Link>
            <IconChevronRight size={12} className="text-neutral-400" />
            <Link href="/contratos" className="hover:text-neutral-600">Contratos</Link>
            <IconChevronRight size={12} className="text-neutral-400" />
            <span>No encontrado</span>
          </nav>
          <h1 className="text-2xl font-bold text-neutral-900">Contrato no encontrado</h1>
        </div>
      </MainLayout>
    );
  }

  const estado = getEstadoDisplay(contrato);
  const isPagado = contrato.billingMode === "pagado";

  // Effective limits
  const effectivePedidos = contrato.overridePedidosMes ?? plan?.pedidosMax ?? trialConfig?.pedidosMax ?? 0;
  const effectiveSucursales = contrato.overrideSucursales ?? plan?.sucursalesMax ?? trialConfig?.sucursalesMax ?? 0;
  const modulos = plan?.modulos ?? trialConfig?.modulos ?? [];

  return (
    <MainLayout narrow>
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 pt-5 pb-0">
        <nav className="flex items-center gap-1 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600 transition-colors">Inicio</Link>
          <IconChevronRight size={12} className="text-neutral-400" />
          <Link href="/contratos" className="hover:text-neutral-600 transition-colors">Contratos</Link>
          <IconChevronRight size={12} className="text-neutral-400" />
          <span>{contrato.displayId}</span>
        </nav>
      </div>

      {/* Hero header */}
      <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0 font-mono">
            {contrato.displayId.slice(4)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-neutral-900 font-mono">{contrato.displayId}</h1>
              <Badge variant={estado.variant as never}>{estado.label}</Badge>
              <Badge variant={isPagado ? "active" : "trial"}>{isPagado ? "Pagado" : "Trial"}</Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">
              {tenant?.nombre ?? "—"} · {empresa?.nombreFantasia ?? "—"}
            </p>
          </div>
        </div>
        {canEditar("Contratos") && contrato.estado === "vigente" && (
          <Button
            size="lg"
            variant="secondary"
            icon={<Pencil size={14} />}
            onClick={() => router.push(`/contratos/${id}/editar`)}
            className="shrink-0"
          >
            Editar
          </Button>
        )}
      </div>

      <div className="px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* General info */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Datos del contrato</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nº de contrato" value={contrato.displayId} />
            <Field label="Billing mode">
              <Badge variant={isPagado ? "active" : "trial"}>{isPagado ? "Pagado" : "Trial"}</Badge>
            </Field>
            <Field label="Tenant asociado">
              <button
                onClick={() => router.push(`/tenants/${contrato.tenantId}`)}
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                {tenant?.nombre ?? "—"}
              </button>
            </Field>
            <Field label="Cliente (derivado)">
              {empresa ? (
                <button
                  onClick={() => router.push(`/clientes/${empresa.id}`)}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {empresa.nombreFantasia}
                </button>
              ) : <span className="text-sm text-neutral-400">—</span>}
            </Field>
            {contrato.planNombre && <Field label="Plan" value={contrato.planNombre} />}
            {contrato.trialConfigNombre && <Field label="Configuración de trial" value={contrato.trialConfigNombre} />}
            <Field label="Estado">
              <Badge variant={estado.variant as never}>{estado.label}</Badge>
            </Field>
            <Field label="Fecha de creación" value={new Date(contrato.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })} />
          </div>
        </section>

        {/* Dates */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Vigencia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha de inicio" value={contrato.fechaInicio} />
            <Field label="Fecha de vencimiento" value={contrato.fechaVencimiento} />
            {contrato.trialEndDate && <Field label="Fin del trial" value={contrato.trialEndDate} />}
            {isPagado && <Field label="Renovación automática" value={contrato.autoRenew ? "Sí" : "No"} />}
            {isPagado && <Field label="Ciclo de facturación" value="Mensual" />}
          </div>
        </section>

        {/* Pricing — only if pagado */}
        {isPagado && (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Condiciones comerciales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Moneda" value={contrato.moneda} />
              <Field label="Monto base mensual" value={contrato.montoBase != null ? `$${contrato.montoBase.toLocaleString("es-CL")}` : "—"} />
              <Field label="Precio por pedido adicional" value={contrato.precioPedidoAdicional != null ? `$${contrato.precioPedidoAdicional.toLocaleString("es-CL")}` : "—"} />
              {contrato.tipoDescuento && (
                <>
                  <Field label="Tipo de descuento" value={
                    contrato.tipoDescuento === "porcentaje" ? "Porcentaje" :
                    contrato.tipoDescuento === "monto_fijo" ? "Monto fijo" : "Precio negociado"
                  } />
                  <Field label="Valor del descuento" value={
                    contrato.tipoDescuento === "porcentaje" ? `${contrato.valorDescuento}%` :
                    `$${(contrato.valorDescuento ?? 0).toLocaleString("es-CL")}`
                  } />
                </>
              )}
              <Field label="Monto base final" value={contrato.montoBaseFinal != null ? `$${contrato.montoBaseFinal.toLocaleString("es-CL")}` : "—"} />
            </div>
          </section>
        )}

        {/* Overrides */}
        {isPagado && (contrato.overridePedidosMes != null || contrato.overrideSucursales != null) && (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Overrides de límites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contrato.overridePedidosMes != null && (
                <Field label="Override máx. pedidos/mes">
                  <p className="text-sm text-neutral-900">
                    Estándar: {plan?.pedidosMax ?? "—"} → <strong className="text-primary-600">Negociado: {contrato.overridePedidosMes}</strong>
                  </p>
                </Field>
              )}
              {contrato.overrideSucursales != null && (
                <Field label="Override máx. sucursales">
                  <p className="text-sm text-neutral-900">
                    Estándar: {plan?.sucursalesMax ?? "—"} → <strong className="text-primary-600">Negociado: {contrato.overrideSucursales}</strong>
                  </p>
                </Field>
              )}
            </div>
          </section>
        )}

        {/* Effective configuration */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-1">Configuración efectiva</h2>
          <p className="text-xs text-neutral-400 mb-4">
            {plan ? `Plan: ${plan.nombre}` : trialConfig ? `Trial: ${trialConfig.nombre}` : "Sin plan asociado"}
          </p>

          {modulos.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-neutral-500 mb-2">Módulos habilitados</h3>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {modulos.map((m) => (
                  <span key={m} className="inline-flex rounded-md bg-primary-50 border border-primary-200 px-2.5 py-1 text-xs font-medium text-primary-700">
                    {m}
                  </span>
                ))}
              </div>
            </>
          )}

          <h3 className="text-xs font-semibold text-neutral-500 mb-3">Límites operativos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-neutral-200 p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">{effectivePedidos}</p>
              <p className="text-xs text-neutral-500 mt-1">Pedidos / mes</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">{effectiveSucursales}</p>
              <p className="text-xs text-neutral-500 mt-1">Sucursales máx.</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">∞</p>
              <p className="text-xs text-neutral-500 mt-1">Usuarios (sin límite)</p>
            </div>
          </div>
        </section>

        {/* Closure info */}
        {contrato.estado === "inactivo" && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-sm font-semibold text-red-700 mb-4">Información de cierre</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Razón de cierre" value={
                contrato.closureReason === "vencido" ? "Vencido" :
                contrato.closureReason === "cancelado" ? "Cancelado manualmente" :
                contrato.closureReason === "convertido" ? "Convertido a pagado" : "—"
              } />
              {contrato.closureDate && <Field label="Fecha de cierre" value={contrato.closureDate} />}
              {contrato.closureNotes && <Field label="Notas de cierre" value={contrato.closureNotes} />}
            </div>
          </section>
        )}

        {/* Notes */}
        {contrato.notas && (
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-700 mb-2">Notas</h2>
            <p className="text-sm text-neutral-600 whitespace-pre-wrap">{contrato.notas}</p>
          </section>
        )}

      </div>
    </MainLayout>
  );
}
