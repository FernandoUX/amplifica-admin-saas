"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_TENANTS, MOCK_EMPRESAS, MOCK_PLANES, MOCK_TRIAL_CONFIGS, MOCK_CONTRATOS } from "@/lib/mock-data";

interface FormState {
  tenantId: string;
  billingMode: string;
  planId: string;
  trialConfigId: string;
  fechaInicio: string;
  fechaVencimiento: string;
  moneda: string;
  montoBase: string;
  precioPedidoAdicional: string;
  tipoDescuento: string;
  valorDescuento: string;
  overridePedidosMes: string;
  overrideSucursales: string;
  autoRenew: boolean;
  notas: string;
}

export default function CrearContratoPage() {
  return (
    <Suspense fallback={<MainLayout narrow><div className="p-6 text-center text-sm text-neutral-400">Cargando...</div></MainLayout>}>
      <CrearContratoForm />
    </Suspense>
  );
}

function CrearContratoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledTenantId = searchParams.get("tenantId") ?? "";
  const prefilledBilling = searchParams.get("billingMode") ?? "";

  const initial: FormState = {
    tenantId: prefilledTenantId,
    billingMode: prefilledBilling || "",
    planId: "",
    trialConfigId: "",
    fechaInicio: "",
    fechaVencimiento: "",
    moneda: "CLP",
    montoBase: "",
    precioPedidoAdicional: "",
    tipoDescuento: "",
    valorDescuento: "",
    overridePedidosMes: "",
    overrideSucursales: "",
    autoRenew: true,
    notas: "",
  };

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const isPagado = form.billingMode === "pagado";
  const isTrial = form.billingMode === "trial";

  // Derived data
  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  // Available tenants: only from active clients, no active contract
  const availableTenants = MOCK_TENANTS.filter((t) => {
    const empresa = MOCK_EMPRESAS.find((e) => e.id === t.empresaId);
    if (!empresa || empresa.operationalStatus !== "activo") return false;
    const hasActive = MOCK_CONTRATOS.some((c) => c.tenantId === t.id && c.estado === "vigente");
    return !hasActive;
  });

  const selectedTenant = tenantMap[form.tenantId];
  const selectedEmpresa = selectedTenant ? empresaMap[selectedTenant.empresaId] : null;
  const selectedPlan = MOCK_PLANES.find((p) => p.id === form.planId);
  const selectedTrialConfig = MOCK_TRIAL_CONFIGS.find((tc) => tc.id === form.trialConfigId);
  const activePlanes = MOCK_PLANES.filter((p) => p.estado === "Activo");
  const activeTrialConfigs = MOCK_TRIAL_CONFIGS.filter((tc) => tc.estado === "Activo");

  // Calculated monto base final
  const montoBaseFinal = useMemo(() => {
    if (!isPagado || !form.montoBase) return null;
    const base = Number(form.montoBase);
    if (!form.tipoDescuento || !form.valorDescuento) return base;
    const val = Number(form.valorDescuento);
    if (form.tipoDescuento === "porcentaje") return Math.round(base * (1 - val / 100));
    if (form.tipoDescuento === "monto_fijo") return base - val;
    if (form.tipoDescuento === "precio_negociado") return val;
    return base;
  }, [form.montoBase, form.tipoDescuento, form.valorDescuento, isPagado]);

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (f: FormState) => {
    const e: Partial<Record<string, string>> = {};
    if (!f.tenantId) e.tenantId = "Debes seleccionar un tenant";
    if (!f.billingMode) e.billingMode = "Debes seleccionar el modo de facturación";
    if (isPagado && !f.planId) e.planId = "Debes seleccionar un plan";
    if (isTrial && !f.trialConfigId) e.trialConfigId = "Debes seleccionar una configuración de trial";
    if (!f.fechaInicio) e.fechaInicio = "La fecha de inicio es obligatoria";
    if (!f.fechaVencimiento) e.fechaVencimiento = "La fecha de vencimiento es obligatoria";
    else if (f.fechaInicio && f.fechaVencimiento <= f.fechaInicio) e.fechaVencimiento = "Debe ser posterior a la fecha de inicio";
    if (isPagado) {
      if (!f.moneda) e.moneda = "La moneda es obligatoria";
      if (!f.montoBase) e.montoBase = "El monto base es obligatorio";
      if (!f.precioPedidoAdicional) e.precioPedidoAdicional = "El precio por pedido adicional es obligatorio";
    }
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set([...prev, field]));
    setErrors(validate(form));
  };

  const handleSubmit = () => {
    const e = validate(form);
    setErrors(e);
    setTouched(new Set(Object.keys(form)));
    if (Object.keys(e).length > 0) return;
    setToast(true);
    setTimeout(() => router.push("/contratos"), 1200);
  };

  const handleCancel = () => {
    if (isDirty) setShowCancel(true);
    else router.push("/contratos");
  };

  // Auto-calc trial end date
  const trialEndDate = useMemo(() => {
    if (!isTrial || !form.fechaInicio || !selectedTrialConfig) return null;
    const d = new Date(form.fechaInicio);
    d.setDate(d.getDate() + selectedTrialConfig.duracionDias);
    return d.toISOString().slice(0, 10);
  }, [isTrial, form.fechaInicio, selectedTrialConfig]);

  return (
    <MainLayout narrow>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Contratos", href: "/contratos" }, { label: "Crear contrato" }]}
          title="Crear contrato"
          description="Define un nuevo acuerdo comercial vinculado a un tenant"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5">

            {/* Tenant */}
            <Select
              label="Tenant asociado"
              required
              placeholder="Selecciona un tenant disponible"
              value={form.tenantId}
              onChange={(e) => { set("tenantId", e.target.value); setTouched((p) => new Set([...p, "tenantId"])); }}
              onBlur={() => handleBlur("tenantId")}
              error={touched.has("tenantId") ? errors.tenantId : undefined}
              options={availableTenants.map((t) => ({ value: t.id, label: `${t.nombre} (${empresaMap[t.empresaId]?.nombreFantasia ?? ""})` }))}
            />

            {/* Cliente derivado */}
            {selectedEmpresa && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cliente (derivado)</label>
                <div className="h-[44px] flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 cursor-not-allowed">
                  {selectedEmpresa.nombreFantasia} — {selectedEmpresa.razonSocial}
                </div>
              </div>
            )}

            {/* Billing mode */}
            <Select
              label="Modo de facturación"
              required
              placeholder="Selecciona"
              value={form.billingMode}
              onChange={(e) => { set("billingMode", e.target.value); set("planId", ""); set("trialConfigId", ""); setTouched((p) => new Set([...p, "billingMode"])); }}
              onBlur={() => handleBlur("billingMode")}
              error={touched.has("billingMode") ? errors.billingMode : undefined}
              options={[{ value: "pagado", label: "Pagado" }, { value: "trial", label: "Trial" }]}
            />

            {/* Plan — only if pagado */}
            {isPagado && (
              <Select
                label="Plan"
                required
                placeholder="Selecciona un plan activo"
                value={form.planId}
                onChange={(e) => { set("planId", e.target.value); setTouched((p) => new Set([...p, "planId"])); }}
                onBlur={() => handleBlur("planId")}
                error={touched.has("planId") ? errors.planId : undefined}
                options={activePlanes.map((p) => ({ value: p.id, label: `${p.nombre} (${p.pedidosMax} ped/mes, ${p.sucursalesMax} suc.)` }))}
              />
            )}

            {/* Plan limits preview */}
            {isPagado && selectedPlan && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-blue-700">Límites del plan {selectedPlan.nombre}</p>
                <p className="text-xs text-blue-600">Pedidos/mes: {selectedPlan.pedidosMax} · Sucursales: {selectedPlan.sucursalesMax}</p>
                <p className="text-xs text-blue-600">Módulos: {selectedPlan.modulos.join(", ")}</p>
              </div>
            )}

            {/* Trial config — only if trial */}
            {isTrial && (
              <Select
                label="Configuración de trial"
                required
                placeholder="Selecciona una configuración activa"
                value={form.trialConfigId}
                onChange={(e) => { set("trialConfigId", e.target.value); setTouched((p) => new Set([...p, "trialConfigId"])); }}
                onBlur={() => handleBlur("trialConfigId")}
                error={touched.has("trialConfigId") ? errors.trialConfigId : undefined}
                options={activeTrialConfigs.map((tc) => ({ value: tc.id, label: `${tc.nombre} (${tc.duracionDias} días)` }))}
              />
            )}

            {/* Trial config preview */}
            {isTrial && selectedTrialConfig && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-amber-700">{selectedTrialConfig.nombre}</p>
                <p className="text-xs text-amber-600">Duración: {selectedTrialConfig.duracionDias} días · Pedidos: {selectedTrialConfig.pedidosMax} · Sucursales: {selectedTrialConfig.sucursalesMax}</p>
                <p className="text-xs text-amber-600">Módulos: {selectedTrialConfig.modulos.join(", ")}</p>
                {trialEndDate && <p className="text-xs text-amber-600">Fin del trial: {trialEndDate}</p>}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha de inicio"
                required
                type="date"
                value={form.fechaInicio}
                onChange={(e) => set("fechaInicio", e.target.value)}
                onBlur={() => handleBlur("fechaInicio")}
                error={touched.has("fechaInicio") ? errors.fechaInicio : undefined}
              />
              <Input
                label={isTrial && trialEndDate ? `Fecha de vencimiento (Trial: ${trialEndDate})` : "Fecha de vencimiento"}
                required
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => set("fechaVencimiento", e.target.value)}
                onBlur={() => handleBlur("fechaVencimiento")}
                error={touched.has("fechaVencimiento") ? errors.fechaVencimiento : undefined}
              />
            </div>

            {/* Pricing — only if pagado */}
            {isPagado && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Moneda"
                    required
                    value={form.moneda}
                    onChange={(e) => set("moneda", e.target.value)}
                    options={[{ value: "CLP", label: "CLP" }]}
                  />
                  <Input
                    label="Monto base mensual"
                    required
                    type="number"
                    placeholder="Ej: 500000"
                    value={form.montoBase}
                    onChange={(e) => set("montoBase", e.target.value)}
                    onBlur={() => handleBlur("montoBase")}
                    error={touched.has("montoBase") ? errors.montoBase : undefined}
                  />
                  <Input
                    label="Precio pedido adicional"
                    required
                    type="number"
                    placeholder="Ej: 500"
                    value={form.precioPedidoAdicional}
                    onChange={(e) => set("precioPedidoAdicional", e.target.value)}
                    onBlur={() => handleBlur("precioPedidoAdicional")}
                    error={touched.has("precioPedidoAdicional") ? errors.precioPedidoAdicional : undefined}
                  />
                </div>

                {/* Overrides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={`Override máx. pedidos/mes${selectedPlan ? ` (Estándar: ${selectedPlan.pedidosMax})` : ""}`}
                    type="number"
                    placeholder="Dejar vacío para usar estándar"
                    value={form.overridePedidosMes}
                    onChange={(e) => set("overridePedidosMes", e.target.value)}
                  />
                  <Input
                    label={`Override máx. sucursales${selectedPlan ? ` (Estándar: ${selectedPlan.sucursalesMax})` : ""}`}
                    type="number"
                    placeholder="Dejar vacío para usar estándar"
                    value={form.overrideSucursales}
                    onChange={(e) => set("overrideSucursales", e.target.value)}
                  />
                </div>

                {/* Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Tipo de descuento"
                    placeholder="Sin descuento"
                    value={form.tipoDescuento}
                    onChange={(e) => set("tipoDescuento", e.target.value)}
                    options={[
                      { value: "", label: "Sin descuento" },
                      { value: "porcentaje", label: "Porcentaje" },
                      { value: "monto_fijo", label: "Monto fijo" },
                      { value: "precio_negociado", label: "Precio negociado (final)" },
                    ]}
                  />
                  {form.tipoDescuento && (
                    <Input
                      label={form.tipoDescuento === "porcentaje" ? "Porcentaje (%)" : form.tipoDescuento === "precio_negociado" ? "Precio final" : "Monto a descontar"}
                      type="number"
                      placeholder="Valor del descuento"
                      value={form.valorDescuento}
                      onChange={(e) => set("valorDescuento", e.target.value)}
                    />
                  )}
                </div>

                {/* Monto final display */}
                {montoBaseFinal != null && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-semibold text-green-800">Monto base final: ${montoBaseFinal.toLocaleString("es-CL")} {form.moneda}</p>
                  </div>
                )}

                {/* Auto renew */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-neutral-700">Renovación automática</label>
                  <button
                    type="button"
                    onClick={() => set("autoRenew", !form.autoRenew)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.autoRenew ? "bg-primary-500" : "bg-neutral-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${form.autoRenew ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm text-neutral-500">{form.autoRenew ? "Sí" : "No"}</span>
                </div>
              </>
            )}

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notas</label>
              <textarea
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 min-h-[80px]"
                placeholder="Condiciones especiales (máx. 1000 caracteres)"
                maxLength={1000}
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button variant="secondary" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Crear contrato
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => router.push("/contratos")}
        title="¿Descartar cambios?"
        message="Los cambios no guardados se perderán. ¿Estás seguro?"
        confirmLabel="Descartar"
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title="¡Contrato creado!" message="El contrato se ha creado correctamente." />
    </MainLayout>
  );
}
