"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MOCK_TENANTS, MOCK_EMPRESAS, MOCK_CONTRATOS, MOCK_USUARIOS, MOCK_PLANES, MOCK_TRIAL_CONFIGS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { IconPencil as Pencil, IconServer as Server, IconFileText as FileText, IconUsers as Users, IconSettings as Settings, IconClipboardList as ClipboardList, IconAlertTriangle as AlertTriangle, IconPlus as Plus, IconChevronRight } from "@tabler/icons-react";

/* ── Helpers ── */

const statusVariant = (s: string) => {
  if (s === "activo") return "active";
  if (s === "suspendido") return "pending";
  return "inactive";
};
const statusLabel = (s: string) => {
  if (s === "activo") return "Activo";
  if (s === "suspendido") return "Suspendido";
  return "Inactivo";
};
const billingLabel = (mode: string) => {
  if (mode === "pagado") return "Pagado";
  if (mode === "trial") return "Trial";
  return "Sin contrato";
};
const billingVariant = (mode: string) => {
  if (mode === "pagado") return "active";
  if (mode === "trial") return "pending";
  return "default";
};
const estadoVariant = (e: string) => {
  if (e === "Al día" || e === "Activo" || e === "Vigente") return "active";
  if (e === "Por vencer") return "pending";
  return "inactive";
};

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 mb-0.5">{label}</p>
      {children ?? <p className="text-sm text-neutral-900">{value || "—"}</p>}
    </div>
  );
}

const TABS = ["Información general", "Contrato activo", "Usuarios", "Configuración", "Audit Log"] as const;
type Tab = typeof TABS[number];

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar, canCrear } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>("Información general");

  const tenant = MOCK_TENANTS.find((t) => t.id === id);
  const empresa = tenant ? MOCK_EMPRESAS.find((e) => e.id === tenant.empresaId) : null;
  const contrato = tenant ? MOCK_CONTRATOS.find((c) => c.tenantId === tenant.id && c.estado === "vigente") : null;
  const usuarios = MOCK_USUARIOS.filter((u) => u.memberships.some((m) => m.tenantId === id));
  const plan = contrato && tenant?.planNombre ? MOCK_PLANES.find((p) => p.nombre === tenant.planNombre) : null;
  const defaultTrial = MOCK_TRIAL_CONFIGS.find((tc) => tc.esDefault);

  // Determine which limits/modules apply
  const activePlan = plan || null;
  const trialConfig = !contrato && defaultTrial ? defaultTrial : null;
  const activeModulos = activePlan?.modulos ?? trialConfig?.modulos ?? [];
  const activePedidosMax = activePlan?.pedidosMax ?? trialConfig?.pedidosMax ?? 0;
  const activeSucursalesMax = activePlan?.sucursalesMax ?? trialConfig?.sucursalesMax ?? 0;

  if (!tenant) {
    return (
      <MainLayout narrow>
        <div className="px-4 sm:px-6 pt-5 pb-4">
          <nav className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
            <Link href="/" className="hover:text-neutral-600">Inicio</Link>
            <IconChevronRight size={12} className="text-neutral-400" />
            <Link href="/tenants" className="hover:text-neutral-600">Tenants</Link>
            <IconChevronRight size={12} className="text-neutral-400" />
            <span>No encontrado</span>
          </nav>
          <h1 className="text-2xl font-bold text-neutral-900">Tenant no encontrado</h1>
        </div>
      </MainLayout>
    );
  }

  const initials = tenant.nombre.slice(0, 2).toUpperCase();

  return (
    <MainLayout narrow>
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 pt-5 pb-0">
        <nav className="flex items-center gap-1 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600 transition-colors">Inicio</Link>
          <IconChevronRight size={12} className="text-neutral-400" />
          <Link href="/tenants" className="hover:text-neutral-600 transition-colors">Tenants</Link>
          <IconChevronRight size={12} className="text-neutral-400" />
          <span>{tenant.nombre}</span>
        </nav>
      </div>

      {/* Trial banner */}
      {!contrato && tenant.operationalStatus === "activo" && (
        <div className="mx-4 sm:mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Este tenant opera en <strong>trial implícito</strong> con límites reducidos.
            </p>
          </div>
          {canCrear("Contratos") && (
            <Button size="sm" onClick={() => router.push(`/contratos/crear?tenantId=${id}`)}>
              Crear contrato
            </Button>
          )}
        </div>
      )}

      {/* Hero header */}
      <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-base shrink-0">
            <span>{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-neutral-900">{tenant.nombre}</h1>
              <Badge variant={statusVariant(tenant.operationalStatus) as never}>
                {statusLabel(tenant.operationalStatus)}
              </Badge>
              <Badge variant={billingVariant(tenant.billingMode) as never}>
                {billingLabel(tenant.billingMode)}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">
              {empresa?.nombreFantasia ?? "—"} · {tenant.dominio}
            </p>
          </div>
        </div>
        {canEditar("Tenants") && (
          <Button
            size="lg"
            variant="secondary"
            icon={<Pencil size={14} />}
            onClick={() => router.push(`/tenants/${id}/editar`)}
            className="shrink-0"
          >
            Editar
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 border-b border-neutral-200">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary-500 text-primary-600 tab-active"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* ── Información general ── */}
        {activeTab === "Información general" && (
          <>
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Datos del tenant</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre del tenant" value={tenant.nombre} />
                <Field label="Subdominio" value={tenant.dominio} />
                <Field label="ID interno" value={tenant.id} />
                <Field label="Fecha de creación" value={new Date(tenant.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })} />
                <Field label="Estado operativo">
                  <Badge variant={statusVariant(tenant.operationalStatus) as never}>
                    {statusLabel(tenant.operationalStatus)}
                  </Badge>
                </Field>
                <Field label="Modo de facturación">
                  <Badge variant={billingVariant(tenant.billingMode) as never}>
                    {billingLabel(tenant.billingMode)}
                  </Badge>
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Cliente asociado</h2>
              {empresa ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre de fantasía">
                    <button
                      onClick={() => router.push(`/clientes/${empresa.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {empresa.nombreFantasia}
                    </button>
                  </Field>
                  <Field label="Razón Social" value={empresa.razonSocial} />
                  <Field label="ID Fiscal" value={empresa.idFiscal} />
                  <Field label="País" value={empresa.pais} />
                  <Field label="Estado">
                    <Badge variant={statusVariant(empresa.operationalStatus) as never}>
                      {statusLabel(empresa.operationalStatus)}
                    </Badge>
                  </Field>
                </div>
              ) : (
                <p className="text-sm text-neutral-400 italic">Cliente no encontrado</p>
              )}
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Resumen comercial</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Modo de facturación" value={billingLabel(tenant.billingMode)} />
                <Field label="Plan activo" value={tenant.planNombre ?? (trialConfig ? `Trial (${trialConfig.nombre})` : "—")} />
                {contrato && (
                  <>
                    <Field label="Nº Contrato" value={contrato.displayId} />
                    <Field label="Vencimiento" value={contrato.fechaVencimiento} />
                    {contrato.montoBaseFinal != null && (
                      <Field label="Monto base final" value={`${contrato.moneda} ${contrato.montoBaseFinal.toLocaleString("es-CL")}`} />
                    )}
                    <Field label="Renovación automática" value={contrato.autoRenew ? "Sí" : "No"} />
                  </>
                )}
              </div>
            </section>
          </>
        )}

        {/* ── Contrato activo ── */}
        {activeTab === "Contrato activo" && (
          <>
            {contrato ? (
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-neutral-700">Contrato vigente — {contrato.displayId}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant={contrato.billingMode === "pagado" ? "active" : "pending"}>
                      {contrato.billingMode === "pagado" ? "Pagado" : "Trial"}
                    </Badge>
                    <Badge variant="active">Vigente</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nº de contrato" value={contrato.displayId} />
                  <Field label="Billing mode" value={contrato.billingMode === "pagado" ? "Pagado" : "Trial"} />
                  {contrato.planNombre && <Field label="Plan" value={contrato.planNombre} />}
                  {contrato.trialConfigNombre && <Field label="Configuración de trial" value={contrato.trialConfigNombre} />}
                  <Field label="Fecha de inicio" value={contrato.fechaInicio} />
                  <Field label="Fecha de vencimiento" value={contrato.fechaVencimiento} />
                  {contrato.trialEndDate && <Field label="Fin del trial" value={contrato.trialEndDate} />}
                  <Field label="Moneda" value={contrato.moneda} />
                  {contrato.montoBase != null && <Field label="Monto base mensual" value={`$${contrato.montoBase.toLocaleString("es-CL")}`} />}
                  {contrato.precioPedidoAdicional != null && <Field label="Precio pedido adicional" value={`$${contrato.precioPedidoAdicional.toLocaleString("es-CL")}`} />}
                  {contrato.montoBaseFinal != null && <Field label="Monto base final" value={`$${contrato.montoBaseFinal.toLocaleString("es-CL")}`} />}
                  <Field label="Renovación automática" value={contrato.autoRenew ? "Sí" : "No"} />
                </div>
                {contrato.notas && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <Field label="Notas" value={contrato.notas} />
                  </div>
                )}
              </section>
            ) : (
              <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                    <FileText size={24} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Sin contrato activo</p>
                    <p className="text-xs text-neutral-400 mt-1">Este tenant opera en trial implícito con límites reducidos.</p>
                  </div>
                  {canCrear("Contratos") && (
                    <Button icon={<Plus size={14} />} onClick={() => router.push(`/contratos/crear?tenantId=${id}`)}>
                      Crear contrato
                    </Button>
                  )}
                </div>
              </section>
            )}

            {/* Historical contracts */}
            {(() => {
              const historicos = MOCK_CONTRATOS.filter((c) => c.tenantId === id && c.estado === "inactivo");
              if (historicos.length === 0) return null;
              return (
                <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-700">Contratos históricos ({historicos.length})</h2>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {historicos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{c.displayId} {c.planNombre ? `· ${c.planNombre}` : "· Trial"}</p>
                          <p className="text-xs text-neutral-400">{c.fechaInicio} → {c.fechaVencimiento} · {c.closureReason ?? ""}</p>
                        </div>
                        <Badge variant="inactive">Inactivo</Badge>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}
          </>
        )}

        {/* ── Usuarios ── */}
        {activeTab === "Usuarios" && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Usuarios ({usuarios.length})</h2>
            </div>
            {usuarios.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
                <Users size={24} />
                <p className="text-sm">Sin usuarios asignados a este tenant</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {usuarios.map((u, i) => (
                  <div key={`${u.id}-${i}`} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{u.nombres} {u.apellidos}</p>
                      <p className="text-xs text-neutral-400">{u.email} · Rol: {u.rol}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{u.tipo}</span>
                      <Badge variant={u.estado === "Activo" ? "active" : u.estado === "Pendiente de activación" ? "pending" : "inactive"}>{u.estado}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Configuración ── */}
        {activeTab === "Configuración" && (
          <>
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-1">
                {activePlan ? `Plan: ${activePlan.nombre}` : trialConfig ? `Trial: ${trialConfig.nombre}` : "Sin configuración"}
              </h2>
              <p className="text-xs text-neutral-400 mb-4">
                {activePlan
                  ? activePlan.descripcion
                  : trialConfig
                  ? `${trialConfig.descripcion} — Duración: ${trialConfig.duracionDias} días`
                  : "Este tenant no tiene un plan ni trial configurado."}
              </p>

              {(activePlan || trialConfig) && (
                <>
                  <h3 className="text-xs font-semibold text-neutral-500 mb-2">Módulos habilitados</h3>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {activeModulos.map((m) => (
                      <span key={m} className="inline-flex rounded-md bg-primary-50 border border-primary-200 px-2.5 py-1 text-xs font-medium text-primary-700">
                        {m}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xs font-semibold text-neutral-500 mb-3">Límites operativos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-neutral-200 p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">{activePedidosMax}</p>
                      <p className="text-xs text-neutral-500 mt-1">Pedidos / mes</p>
                    </div>
                    <div className="rounded-lg border border-neutral-200 p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">{activeSucursalesMax}</p>
                      <p className="text-xs text-neutral-500 mt-1">Sucursales máx.</p>
                    </div>
                    <div className="rounded-lg border border-neutral-200 p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">∞</p>
                      <p className="text-xs text-neutral-500 mt-1">Usuarios (sin límite)</p>
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        )}

        {/* ── Audit Log ── */}
        {activeTab === "Audit Log" && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-700">Audit Log</h2>
            </div>
            <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
              <ClipboardList size={24} />
              <p className="text-sm">Sin registros de auditoría</p>
            </div>
          </section>
        )}

      </div>
    </MainLayout>
  );
}
