import { MOCK_EMPRESAS as EMPRESAS, MOCK_TENANTS as TENANTS } from "./mock-data";

/* ── Types ─────────────────────────────────────────────────────────────────── */
export type PeriodKey = "1m" | "3m" | "6m" | "12m";
export type CompareKey = "prev" | "yoy" | "none";

export interface DashboardFilters {
  period: PeriodKey;
  compare: CompareKey;
  clientId: string; // "" = todos
  tenantId: string; // "" = todos
}

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "1m", label: "Este mes" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "12m", label: "Últimos 12 meses" },
];

export const COMPARE_OPTIONS: { value: CompareKey; label: string }[] = [
  { value: "prev", label: "Período anterior" },
  { value: "yoy", label: "Mismo período, año anterior" },
  { value: "none", label: "Sin comparación" },
];

/* ── Seeded random for consistent mock data ────────────────────────────────── */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* ── Month helpers ─────────────────────────────────────────────────────────── */
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getMonthRange(period: PeriodKey): { labels: string[]; count: number } {
  const counts: Record<PeriodKey, number> = { "1m": 1, "3m": 3, "6m": 6, "12m": 12 };
  const count = counts[period];
  const now = 2; // March index (0-based) — "current" month for mock
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const idx = ((now - i) % 12 + 12) % 12;
    labels.push(MONTH_NAMES[idx]);
  }
  return { labels, count };
}

function compareLabel(compare: CompareKey, period: PeriodKey): string {
  if (compare === "none") return "";
  if (compare === "yoy") return "vs mismo período 2025";
  const p = { "1m": "mes", "3m": "trimestre", "6m": "semestre", "12m": "año" }[period];
  return `vs ${p} anterior`;
}

/* ── Data generators ───────────────────────────────────────────────────────── */

function generateTimeSeries(count: number, base: number, growth: number, variance: number, seed: number) {
  const rng = seeded(seed);
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    const trend = base + (growth * i);
    const noise = trend * variance * (rng() - 0.4);
    values.push(Math.round(trend + noise));
  }
  return values;
}

/* ── Public API ────────────────────────────────────────────────────────────── */

export function getClientOptions() {
  return [
    { value: "", label: "Todos los clientes" },
    ...EMPRESAS.map((e) => ({ value: String(e.id), label: e.nombreFantasia })),
  ];
}

export function getTenantOptions(clientId: string) {
  const filtered = clientId ? TENANTS.filter((t) => String(t.empresaId) === clientId) : TENANTS;
  return [
    { value: "", label: "Todos los tenants" },
    ...filtered.map((t) => ({ value: t.id, label: t.nombre })),
  ];
}

export function getDashboardData(filters: DashboardFilters) {
  const { period, compare } = filters;
  const { labels, count } = getMonthRange(period);
  const clientSeed = filters.clientId ? parseInt(filters.clientId) * 7 : 42;

  // Scale factor based on filter (fewer clients = smaller numbers)
  const scale = filters.clientId ? 0.15 : filters.tenantId ? 0.08 : 1;

  /* ── KPIs ── */
  const ingresoCurrent = Math.round(45231890 * scale * (count / 12));
  const ingresoPrev = Math.round(ingresoCurrent * (1 - 0.201));
  const suscCurrent = Math.round(2350 * scale);
  const suscPrev = Math.round(suscCurrent / 2.8);
  const ventasCurrent = Math.round(12234 * scale);
  const ventasPrev = Math.round(ventasCurrent * 0.84);
  const activosCurrent = Math.round(573 * scale);
  const activosPrev = activosCurrent - Math.round(201 * scale);

  const cLabel = compareLabel(compare, period);
  const showCompare = compare !== "none";

  const kpis = {
    ingresos: { current: ingresoCurrent, previous: ingresoPrev, delta: ((ingresoCurrent - ingresoPrev) / ingresoPrev * 100).toFixed(1), compareLabel: cLabel },
    suscripciones: { current: suscCurrent, previous: suscPrev, delta: ((suscCurrent - suscPrev) / suscPrev * 100).toFixed(1), compareLabel: cLabel },
    ventas: { current: ventasCurrent, previous: ventasPrev, delta: ((ventasCurrent - ventasPrev) / ventasPrev * 100).toFixed(1), compareLabel: cLabel },
    activos: { current: activosCurrent, previous: activosPrev, delta: String(activosCurrent - activosPrev), compareLabel: cLabel, isAbsolute: true },
  };

  /* ── Revenue time series ── */
  const revPagado = generateTimeSeries(count, 2800000 * scale, 380000 * scale, 0.12, clientSeed + 1);
  const revTrial = generateTimeSeries(count, 420000 * scale, 15000 * scale, 0.2, clientSeed + 2);
  const revPagadoPrev = showCompare ? generateTimeSeries(count, 2200000 * scale, 300000 * scale, 0.15, clientSeed + 3) : [];
  const revTrialPrev = showCompare ? generateTimeSeries(count, 350000 * scale, 10000 * scale, 0.2, clientSeed + 4) : [];

  const revenueChart = labels.map((month, i) => ({
    month,
    pagado: revPagado[i],
    trial: revTrial[i],
    ...(showCompare ? { pagadoPrev: revPagadoPrev[i], trialPrev: revTrialPrev[i] } : {}),
  }));

  /* ── Pedidos time series ── */
  const ped = generateTimeSeries(count, 1200 * scale, 380 * scale, 0.1, clientSeed + 5);
  const cap = generateTimeSeries(count, 3000 * scale, 250 * scale, 0.02, clientSeed + 6).map((v) => Math.round(v / 500) * 500);
  const pedPrev = showCompare ? generateTimeSeries(count, 900 * scale, 300 * scale, 0.12, clientSeed + 7) : [];

  const pedidosChart = labels.map((month, i) => ({
    month,
    pedidos: ped[i],
    capacidad: cap[i],
    ...(showCompare ? { pedidosPrev: pedPrev[i] } : {}),
  }));

  /* ── Sparklines (last 7 data points for KPI cards) ── */
  const sparkIngresos = generateTimeSeries(7, 3500000 * scale, 500000 * scale, 0.1, clientSeed + 10);
  const sparkSusc = generateTimeSeries(7, 1600 * scale, 100 * scale, 0.15, clientSeed + 11);
  const sparkVentas = generateTimeSeries(7, 8000 * scale, 600 * scale, 0.08, clientSeed + 12);
  const sparkActivos = generateTimeSeries(7, 400 * scale, 25 * scale, 0.2, clientSeed + 13);

  /* ── Tenants by plan (snapshot, no time series) ── */
  const tenantsByPlan = [
    { plan: "Starter", activos: Math.round(7 * scale) || 1, trial: Math.round(4 * scale) },
    { plan: "Growth", activos: Math.round(8 * scale) || 1, trial: Math.round(3 * scale) },
    { plan: "Enterprise", activos: Math.round(3 * scale), trial: Math.round(1 * scale) },
    { plan: "Express", activos: 0, trial: Math.round(2 * scale) },
  ];

  /* ── Clientes por estado ── */
  const totalClientes = filters.clientId ? 1 : 30;
  const clientesEstado = filters.clientId
    ? [{ estado: "activo", count: 1, fill: "#10b981" }]
    : [
        { estado: "activo", count: 25, fill: "#10b981" },
        { estado: "suspendido", count: 2, fill: "#f59e0b" },
        { estado: "inactivo", count: 3, fill: "#a3a3a8" },
      ];

  /* ── Top tenants ── */
  const allTopTenants = [
    { tenant: "Extra Life Store", pedidos: Math.round(1350 * (count / 12)) },
    { tenant: "Gohard Store", pedidos: Math.round(980 * (count / 12)) },
    { tenant: "Vivo Sano", pedidos: Math.round(720 * (count / 12)) },
    { tenant: "Fórmula Verde", pedidos: Math.round(650 * (count / 12)) },
    { tenant: "Mara", pedidos: Math.round(540 * (count / 12)) },
  ];
  const topTenants = filters.clientId
    ? allTopTenants.filter((t) => {
        const empresa = EMPRESAS.find((e) => String(e.id) === filters.clientId);
        return empresa && t.tenant.toLowerCase().includes(empresa.nombreFantasia.toLowerCase().split(" ")[0]);
      })
    : allTopTenants;

  /* ── Contratos ── */
  const totalContratos = filters.clientId ? Math.round(29 * 0.1) || 2 : 29;
  const contratosRadial = [
    { tipo: "pagado", value: Math.round(totalContratos * 0.62), fill: "#4548FF" },
    { tipo: "trial", value: Math.round(totalContratos * 0.38), fill: "#8CA9FF" },
  ];

  /* ── OR Monitor ── */
  const orByStatus = [
    { estado: "Creado", count: 4, fill: "#a3a3a8" },
    { estado: "Programado", count: 12, fill: "#3b82f6" },
    { estado: "Rec. bodega", count: 3, fill: "#8b5cf6" },
    { estado: "En conteo", count: 2, fill: "#f59e0b" },
    { estado: "Pend. aprob.", count: 5, fill: "#f97316" },
    { estado: "Completada", count: 11, fill: "#10b981" },
    { estado: "Cancelada", count: 2, fill: "#ef4444" },
  ];

  const orTimeline = labels.map((month, i) => ({
    month,
    creadas: generateTimeSeries(1, 6, 1, 0.3, clientSeed + 20 + i)[0],
    completadas: generateTimeSeries(1, 4, 1.2, 0.25, clientSeed + 40 + i)[0],
    canceladas: generateTimeSeries(1, 1, 0.1, 0.5, clientSeed + 60 + i)[0],
  }));

  const orAvgDays = [
    { etapa: "Creación → Programado", dias: 1.2 },
    { etapa: "Programado → Rec. bodega", dias: 3.8 },
    { etapa: "Rec. bodega → Conteo", dias: 0.5 },
    { etapa: "Conteo → Aprobación", dias: 2.1 },
    { etapa: "Aprobación → Completada", dias: 0.8 },
  ];

  return {
    kpis,
    revenueChart,
    pedidosChart,
    tenantsByPlan,
    clientesEstado,
    totalClientes,
    topTenants: topTenants.length ? topTenants : allTopTenants.slice(0, 3),
    contratosRadial,
    totalContratos,
    sparklines: { ingresos: sparkIngresos, suscripciones: sparkSusc, ventas: sparkVentas, activos: sparkActivos },
    or: { byStatus: orByStatus, timeline: orTimeline, avgDays: orAvgDays, total: 39 },
    showCompare: compare !== "none",
    periodLabel: PERIOD_OPTIONS.find((p) => p.value === period)?.label || "",
  };
}
