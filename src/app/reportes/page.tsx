"use client";

import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS, MOCK_PLANES } from "@/lib/mock-data";
import { Download, BarChart3, TrendingUp, Package, Building2, AlertTriangle } from "lucide-react";

/* ── Mock usage data per tenant per cycle ── */
const MOCK_USAGE: Record<string, { pedidos: number; sucursalesActivas: number; diasActivos: number }> = {
  "0021": { pedidos: 1350, sucursalesActivas: 5, diasActivos: 28 },
  "0022": { pedidos: 420, sucursalesActivas: 3, diasActivos: 28 },
  "0023": { pedidos: 980, sucursalesActivas: 4, diasActivos: 28 },
  "0024": { pedidos: 210, sucursalesActivas: 2, diasActivos: 28 },
  "0025": { pedidos: 2100, sucursalesActivas: 8, diasActivos: 28 },
  "0026": { pedidos: 45, sucursalesActivas: 1, diasActivos: 15 },
  "0027": { pedidos: 12, sucursalesActivas: 1, diasActivos: 10 },
};

function StatCard({ label, value, sub, icon, variant }: { label: string; value: string; sub?: string; icon: React.ReactNode; variant?: "success" | "warning" | "danger" | "default" }) {
  const colors = {
    success: "border-green-200 bg-green-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
    default: "border-neutral-200 bg-white",
  };
  const iconColors = {
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    default: "text-neutral-500",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[variant ?? "default"]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColors[variant ?? "default"]}>{icon}</span>
        <span className="text-xs font-semibold text-neutral-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportesPage() {
  const [clienteId, setClienteId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [periodo, setPeriodo] = useState("2026-02");

  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));
  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));

  // Tenants filtered by selected client
  const availableTenants = clienteId
    ? MOCK_TENANTS.filter((t) => t.empresaId === clienteId)
    : MOCK_TENANTS;

  // Selected data
  const selectedTenant = tenantMap[tenantId];
  const selectedEmpresa = selectedTenant ? empresaMap[selectedTenant.empresaId] : null;
  const contrato = selectedTenant
    ? MOCK_CONTRATOS.find((c) => c.tenantId === selectedTenant.id && c.estado === "vigente")
    : null;
  const plan = contrato?.planId ? MOCK_PLANES.find((p) => p.id === contrato.planId) : null;
  const isTrial = contrato?.billingMode === "trial";
  const usage = MOCK_USAGE[tenantId] ?? null;

  // Effective limits (plan with overrides)
  const limitePedidos = contrato?.overridePedidosMes ?? plan?.pedidosMax ?? 0;
  const limiteSucursales = contrato?.overrideSucursales ?? plan?.sucursalesMax ?? 0;

  // Calculations
  const pedidosTotales = usage?.pedidos ?? 0;
  const excedente = isTrial ? 0 : Math.max(0, pedidosTotales - limitePedidos);
  const precioAdicional = contrato?.precioPedidoAdicional ?? 0;
  const totalVariable = excedente * precioAdicional;
  const montoBase = contrato?.montoBaseFinal ?? contrato?.montoBase ?? 0;
  const totalEstimado = isTrial ? 0 : montoBase + totalVariable;
  const sucursalesActivas = usage?.sucursalesActivas ?? 0;

  // Usage percentage for visual indicator
  const usagePct = limitePedidos > 0 ? Math.round((pedidosTotales / limitePedidos) * 100) : 0;
  const usageVariant = usagePct >= 100 ? "danger" : usagePct >= 80 ? "warning" : "success";

  // Periods for selector
  const periodos = [
    { value: "2026-02", label: "Febrero 2026 (05/02 – 04/03)" },
    { value: "2026-01", label: "Enero 2026 (05/01 – 04/02)" },
    { value: "2025-12", label: "Diciembre 2025 (05/12 – 04/01)" },
  ];

  const handleExportCSV = () => {
    if (!selectedTenant || !contrato || !usage) return;
    const headers = ["Cliente", "Tenant", "N° Contrato", "billing_mode", "Período inicio", "Período fin", "Plan", "Límite pedidos", "Pedidos totales", "Excedente pedidos", "Precio unitario pedido adicional", "Total variable pedidos", "Límite sucursales", "Sucursales activas", "Monto base mensual", "Total estimado", "Moneda", "Días activos en el período", "Prorrateo aplicado"];
    const row = [
      selectedEmpresa?.nombreFantasia ?? "",
      selectedTenant.nombre,
      contrato.displayId,
      contrato.billingMode,
      "2026-02-05",
      "2026-03-04",
      plan?.nombre ?? "Trial",
      limitePedidos,
      pedidosTotales,
      excedente,
      precioAdicional,
      totalVariable,
      limiteSucursales,
      sucursalesActivas,
      montoBase,
      totalEstimado,
      contrato.moneda ?? "CLP",
      usage.diasActivos,
      "No",
    ];
    const csv = [headers.join(","), row.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_uso_${selectedTenant.nombre.replace(/\s+/g, "_")}_2026-02-05_2026-03-04.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Reportes de uso" }]}
          title="Reportes de uso"
          description="Consumo por ciclo de facturación de cada tenant"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">

          {/* Filters */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Cliente"
                placeholder="Todos los clientes"
                value={clienteId}
                onChange={(e) => { setClienteId(e.target.value); setTenantId(""); }}
                options={[
                  { value: "", label: "Todos los clientes" },
                  ...MOCK_EMPRESAS.filter((e) => e.operationalStatus === "activo").map((e) => ({ value: e.id, label: e.nombreFantasia })),
                ]}
              />
              <Select
                label="Tenant"
                required
                placeholder="Selecciona un tenant"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                options={availableTenants.map((t) => {
                  const emp = empresaMap[t.empresaId];
                  return { value: t.id, label: `${t.nombre}${emp ? ` (${emp.nombreFantasia})` : ""}` };
                })}
              />
              <Select
                label="Período"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                options={periodos}
              />
            </div>
          </div>

          {/* Report content */}
          {!tenantId ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-12 flex flex-col items-center gap-3 text-neutral-400">
              <BarChart3 size={32} />
              <p className="text-sm font-medium">Selecciona un tenant para ver el reporte de uso</p>
              <p className="text-xs">Los datos se mostrarán automáticamente al seleccionar los filtros</p>
            </div>
          ) : (
            <>
              {/* Header bar */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-neutral-900">{selectedTenant?.nombre}</h2>
                  {selectedEmpresa && <span className="text-sm text-neutral-400">({selectedEmpresa.nombreFantasia})</span>}
                  {contrato && <Badge variant={isTrial ? "pending" : "active"}>{isTrial ? "Trial" : "Pagado"}</Badge>}
                  {contrato && <span className="text-xs text-neutral-400 font-mono">{contrato.displayId}</span>}
                  {isTrial && (
                    <Badge variant="pending">Trial — sin cobro de excedente</Badge>
                  )}
                </div>
                {contrato && usage && (
                  <Button
                    variant="secondary"
                    icon={<Download size={14} />}
                    onClick={handleExportCSV}
                  >
                    Exportar CSV
                  </Button>
                )}
              </div>

              {!contrato ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 flex flex-col items-center gap-2 text-amber-700">
                  <AlertTriangle size={24} />
                  <p className="text-sm font-medium">Este tenant no tiene un contrato activo</p>
                  <p className="text-xs text-amber-600">No se puede generar reporte de uso sin contrato vigente</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pedidos section */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <Package size={16} className="text-neutral-400" />
                      Pedidos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard
                        label="Pedidos totales del período"
                        value={pedidosTotales.toLocaleString("es-CL")}
                        sub={`${usagePct}% del límite`}
                        icon={<Package size={16} />}
                        variant={usageVariant as never}
                      />
                      <StatCard
                        label="Límite incluido"
                        value={limitePedidos.toLocaleString("es-CL")}
                        sub={plan ? `Plan: ${plan.nombre}${contrato.overridePedidosMes != null ? " (override)" : ""}` : "Trial"}
                        icon={<TrendingUp size={16} />}
                      />
                      <StatCard
                        label="Excedente"
                        value={isTrial ? "N/A" : excedente.toLocaleString("es-CL")}
                        sub={isTrial ? "Trial — sin cobro" : excedente > 0 ? `${excedente} pedidos extra` : "Sin excedente"}
                        icon={<TrendingUp size={16} />}
                        variant={excedente > 0 && !isTrial ? "warning" : "default"}
                      />
                      <StatCard
                        label="Precio por pedido adicional"
                        value={isTrial ? "N/A" : `$${precioAdicional.toLocaleString("es-CL")}`}
                        sub={contrato.moneda ?? "CLP"}
                        icon={<BarChart3 size={16} />}
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {!isTrial && (
                    <div className="rounded-xl border border-neutral-200 bg-white p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-500">Uso de pedidos</span>
                        <span className="text-xs font-medium text-neutral-700">{pedidosTotales.toLocaleString("es-CL")} / {limitePedidos.toLocaleString("es-CL")}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePct >= 100 ? "bg-red-500" : usagePct >= 80 ? "bg-amber-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(usagePct, 100)}%` }}
                        />
                      </div>
                      {usagePct >= 80 && usagePct < 100 && (
                        <p className="text-xs text-amber-600 mt-1.5">⚠️ Uso al {usagePct}% del límite. Se acerca al tope del plan.</p>
                      )}
                      {usagePct >= 100 && (
                        <p className="text-xs text-red-600 mt-1.5">🚨 Excedente de {excedente} pedidos. Se cobrará variable adicional.</p>
                      )}
                    </div>
                  )}

                  {/* Sucursales section */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <Building2 size={16} className="text-neutral-400" />
                      Sucursales
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StatCard
                        label="Sucursales activas"
                        value={String(sucursalesActivas)}
                        sub={`de ${limiteSucursales} permitidas`}
                        icon={<Building2 size={16} />}
                        variant={sucursalesActivas >= limiteSucursales ? "danger" : "default"}
                      />
                      <StatCard
                        label="Límite de sucursales"
                        value={String(limiteSucursales)}
                        sub={`Hard limit${contrato.overrideSucursales != null ? " (override)" : ""}`}
                        icon={<Building2 size={16} />}
                      />
                    </div>
                  </div>

                  {/* Financial summary — only for pagado */}
                  {!isTrial && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <BarChart3 size={16} className="text-neutral-400" />
                        Resumen financiero del período
                      </h3>
                      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                        <div className="divide-y divide-neutral-100">
                          <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-neutral-600">Monto base mensual</span>
                            <span className="text-sm font-medium text-neutral-900">${montoBase.toLocaleString("es-CL")} {contrato.moneda}</span>
                          </div>
                          <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-neutral-600">Total variable (excedente)</span>
                            <span className={`text-sm font-medium ${totalVariable > 0 ? "text-amber-600" : "text-neutral-900"}`}>
                              ${totalVariable.toLocaleString("es-CL")} {contrato.moneda}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                            <span className="text-sm font-semibold text-neutral-700">Total estimado del período</span>
                            <span className="text-lg font-bold text-neutral-900">${totalEstimado.toLocaleString("es-CL")} {contrato.moneda}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isTrial && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                      <p className="text-sm text-blue-700">
                        <strong>Tenant en modalidad trial.</strong> El reporte se genera para monitoreo interno. No se calcula excedente ni cobro variable.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
