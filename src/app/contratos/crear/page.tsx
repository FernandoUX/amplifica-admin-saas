"use client";

import { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AlertModal from "@/components/ui/AlertModal";
import DatePicker from "@/components/ui/DatePicker";
import { MOCK_TENANTS, MOCK_EMPRESAS, MOCK_PLANES, MOCK_TRIAL_CONFIGS, MOCK_CONTRATOS, addContrato } from "@/lib/mock-data";
import { IconInfoCircle } from "@tabler/icons-react";
import type { Contrato } from "@/lib/types";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [sinVencimiento, setSinVencimiento] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const isPagado = form.billingMode === "pagado";
  const isTrial = form.billingMode === "trial";

  // Derived data
  const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
  const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

  // All active tenants (allows override of existing contracts)
  const availableTenants = MOCK_TENANTS.filter((t) => {
    const empresa = MOCK_EMPRESAS.find((e) => e.id === t.empresaId);
    if (!empresa || empresa.operationalStatus !== "activo") return false;
    return t.operationalStatus === "activo";
  });

  // Tenant search combobox state
  const [tenantQuery, setTenantQuery] = useState("");
  const [tenantOpen, setTenantOpen] = useState(false);
  const tenantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) setTenantOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tenantResults = useMemo(() => {
    const q = tenantQuery.toLowerCase();
    return availableTenants.filter((t) => {
      const emp = empresaMap[t.empresaId];
      return (
        t.nombre.toLowerCase().includes(q) ||
        (t.dominio ?? "").toLowerCase().includes(q) ||
        (emp?.nombreFantasia ?? "").toLowerCase().includes(q)
      );
    });
  }, [tenantQuery, availableTenants, empresaMap]);

  // Check if a tenant has an active (vigente) contract
  const vigenteTenantIds = useMemo(
    () => new Set(MOCK_CONTRATOS.filter((c) => c.estado === "vigente").map((c) => c.tenantId)),
    []
  );

  const selectedTenantHasContract = form.tenantId ? vigenteTenantIds.has(form.tenantId) : false;
  const overriddenContract = selectedTenantHasContract
    ? MOCK_CONTRATOS.find((c) => c.tenantId === form.tenantId && c.estado === "vigente")
    : null;

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
    if (!sinVencimiento) {
      if (!f.fechaVencimiento) e.fechaVencimiento = "La fecha de vencimiento es obligatoria";
      else if (f.fechaInicio && f.fechaVencimiento <= f.fechaInicio) e.fechaVencimiento = "Debe ser posterior a la fecha de inicio";
      else if (f.fechaInicio && f.fechaVencimiento) {
        const diffDays = (new Date(f.fechaVencimiento).getTime() - new Date(f.fechaInicio).getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < 15) e.fechaVencimiento = "Debe haber al menos 15 días entre inicio y vencimiento";
      }
    }
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
    addContrato({
      tenantId: form.tenantId,
      billingMode: form.billingMode as "trial" | "pagado",
      planId: isPagado ? form.planId || null : null,
      planNombre: isPagado ? (selectedPlan?.nombre ?? null) : null,
      trialConfigId: isTrial ? form.trialConfigId || null : null,
      trialConfigNombre: isTrial ? (selectedTrialConfig?.nombre ?? null) : null,
      fechaInicio: form.fechaInicio,
      fechaVencimiento: sinVencimiento ? "" : form.fechaVencimiento,
      trialEndDate: isTrial ? trialEndDate : null,
      moneda: form.moneda,
      montoBase: isPagado && form.montoBase ? Number(form.montoBase) : null,
      precioPedidoAdicional: isPagado && form.precioPedidoAdicional ? Number(form.precioPedidoAdicional) : null,
      tipoDescuento: (form.tipoDescuento as Contrato["tipoDescuento"]) || null,
      valorDescuento: form.valorDescuento ? Number(form.valorDescuento) : null,
      montoBaseFinal: montoBaseFinal,
      overridePedidosMes: form.overridePedidosMes ? Number(form.overridePedidosMes) : null,
      overrideSucursales: form.overrideSucursales ? Number(form.overrideSucursales) : null,
      autoRenew: form.autoRenew,
      notas: form.notas || null,
      estado: "vigente",
      closureReason: null,
      closureDate: null,
      closureNotes: null,
    });
    setShowSuccess(true);
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
          <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-5 pb-20 md:pb-6">

            {/* Tenant — predictive combobox */}
            <div ref={tenantRef} className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-neutral-700">
                Tenant asociado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar tenant por nombre o dominio..."
                  value={selectedTenant && !tenantOpen ? `${selectedTenant.nombre}${empresaMap[selectedTenant.empresaId] ? ` (${empresaMap[selectedTenant.empresaId].nombreFantasia})` : ""}` : tenantQuery}
                  onChange={(e) => { setTenantQuery(e.target.value); set("tenantId", ""); setTouched((p) => new Set([...p, "tenantId"])); }}
                  onFocus={() => { setTenantOpen(true); if (selectedTenant) setTenantQuery(""); }}
                  className={`h-[44px] w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary-100 ${touched.has("tenantId") && errors.tenantId ? "border-red-400 bg-red-50" : "border-neutral-200 bg-white focus:border-primary-400"}`}
                />
                {tenantOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-xl max-h-64 overflow-y-auto">
                    {tenantResults.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-neutral-400">Sin resultados</div>
                    ) : tenantResults.map((t) => {
                      const emp = empresaMap[t.empresaId];
                      const hasContract = vigenteTenantIds.has(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { set("tenantId", t.id); setTenantQuery(""); setTouched((p) => new Set([...p, "tenantId"])); setTenantOpen(false); setErrors(validate({ ...form, tenantId: t.id })); }}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors text-left"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-neutral-900 truncate">{t.nombre}</span>
                            {t.dominio && <span className="text-xs text-neutral-400 truncate">{t.dominio}</span>}
                          </div>
                          {hasContract && (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              Contrato vigente
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {touched.has("tenantId") && errors.tenantId && (
                <p className="text-xs text-red-500">{errors.tenantId}</p>
              )}
            </div>

            {/* Override warning */}
            {selectedTenantHasContract && overriddenContract && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col gap-1">
                <p className="text-sm font-medium text-amber-800">Este tenant ya tiene un contrato vigente</p>
                <p className="text-xs text-amber-700">
                  Plan: <strong>{overriddenContract.planNombre ?? "Trial"}</strong> · Vence: <strong>{overriddenContract.fechaVencimiento}</strong>.
                  Al guardar, el contrato anterior quedará sobreescrito y se registrará el monto pendiente en reportería.
                </p>
              </div>
            )}

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
              <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3">
                <IconInfoCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-700">Límites del plan {selectedPlan.nombre}</p>
                <p className="text-xs text-blue-600">Pedidos/mes: {selectedPlan.pedidosMax} · Sucursales: {selectedPlan.sucursalesMax}</p>
                <p className="text-xs text-blue-600">Módulos: {selectedPlan.modulos.join(", ")}</p>
                </div>
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
              <DatePicker
                label="Fecha de inicio"
                required
                value={form.fechaInicio}
                onChange={(val) => { set("fechaInicio", val); handleBlur("fechaInicio"); }}
                error={touched.has("fechaInicio") ? errors.fechaInicio : undefined}
              />
              {sinVencimiento ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-700">Fecha de vencimiento</label>
                  <div className="h-[44px] flex items-center px-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50">
                    <span className="text-sm text-neutral-400 italic">Sin fecha de vencimiento</span>
                  </div>
                </div>
              ) : (
                <DatePicker
                  label={isTrial && trialEndDate ? `Fecha de vencimiento (Trial: ${trialEndDate})` : "Fecha de vencimiento"}
                  required
                  value={form.fechaVencimiento}
                  onChange={(val) => { set("fechaVencimiento", val); handleBlur("fechaVencimiento"); }}
                  error={touched.has("fechaVencimiento") ? errors.fechaVencimiento : undefined}
                />
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={sinVencimiento}
                onClick={() => { setSinVencimiento(!sinVencimiento); if (!sinVencimiento) set("fechaVencimiento", ""); }}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${sinVencimiento ? "bg-primary-500" : "bg-neutral-300"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${sinVencimiento ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-neutral-600">Plan sin fecha de vencimiento</span>
            </label>

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
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base md:text-sm placeholder:text-neutral-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 min-h-[80px]"
                placeholder="Condiciones especiales (máx. 1000 caracteres)"
                maxLength={1000}
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-3 md:relative md:inset-auto md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-3 z-20">
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

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">¡Contrato creado exitosamente!</h3>
                <p className="text-sm text-neutral-500">El contrato ha sido registrado en el sistema.</p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Resumen</h4>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <span className="text-neutral-500">Tenant</span>
                <span className="font-medium text-neutral-900">{selectedTenant?.nombre ?? "—"}</span>
                <span className="text-neutral-500">Cliente</span>
                <span className="font-medium text-neutral-900">{selectedEmpresa?.nombreFantasia ?? "—"}</span>
                <span className="text-neutral-500">Modo</span>
                <span className="font-medium text-neutral-900">{form.billingMode === "pagado" ? "Pagado" : form.billingMode === "trial" ? "Trial" : "—"}</span>
                {isPagado && selectedPlan && (
                  <>
                    <span className="text-neutral-500">Plan</span>
                    <span className="font-medium text-neutral-900">{selectedPlan.nombre}</span>
                  </>
                )}
                {isTrial && selectedTrialConfig && (
                  <>
                    <span className="text-neutral-500">Trial</span>
                    <span className="font-medium text-neutral-900">{selectedTrialConfig.nombre}</span>
                  </>
                )}
                <span className="text-neutral-500">Inicio</span>
                <span className="font-medium text-neutral-900">{form.fechaInicio || "—"}</span>
                <span className="text-neutral-500">Vencimiento</span>
                <span className="font-medium text-neutral-900">{sinVencimiento ? "Sin vencimiento" : form.fechaVencimiento || "—"}</span>
                {isPagado && montoBaseFinal != null && (
                  <>
                    <span className="text-neutral-500">Monto mensual</span>
                    <span className="font-medium text-neutral-900">${montoBaseFinal.toLocaleString("es-CL")} {form.moneda}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3">
              <IconInfoCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Siguiente paso:</strong> Crea el usuario administrador para este tenant.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/contratos")}>
                Ir a contratos
              </Button>
              <Button className="flex-1" onClick={() => router.push(`/usuarios/crear?tenantId=${form.tenantId}&rol=Admin+Tenant`)}>
                Crear Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
