"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardToolbar, { DashboardFilterButton } from "@/components/dashboard/DashboardToolbar";
import {
  IconCurrencyDollar as DollarSign,
  IconUsers as Users,
  IconCreditCard as CreditCard,
  IconActivity as Activity,
} from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { type DashboardFilters, getDashboardData } from "@/lib/dashboard-data";

/* ── Chart Configs ─────────────────────────────────────────────────────────── */
const revenueConfig = {
  pagado: { label: "Pagado", color: "#4548FF" },
  trial: { label: "Trial", color: "#8CA9FF" },
  pagadoPrev: { label: "Pagado (comp.)", color: "#4548FF" },
  trialPrev: { label: "Trial (comp.)", color: "#8CA9FF" },
} satisfies ChartConfig;

const tenantsPlanConfig = {
  activos: { label: "Activos", color: "#4548FF" },
  trial: { label: "Trial", color: "#B6CBFF" },
} satisfies ChartConfig;

const pedidosConfig = {
  pedidos: { label: "Pedidos", color: "#4548FF" },
  capacidad: { label: "Capacidad", color: "#D5D5D7" },
  pedidosPrev: { label: "Pedidos (comp.)", color: "#4548FF" },
} satisfies ChartConfig;

const clientesConfig = {
  activo: { label: "Activos", color: "#10b981" },
  suspendido: { label: "Suspendidos", color: "#f59e0b" },
  inactivo: { label: "Inactivos", color: "#a3a3a8" },
} satisfies ChartConfig;

const contratosConfig = {
  pagado: { label: "Pagados", color: "#4548FF" },
  trial: { label: "Trial", color: "#8CA9FF" },
} satisfies ChartConfig;

const topTenantsConfig = {
  pedidos: { label: "Pedidos", color: "#4548FF" },
} satisfies ChartConfig;


/* ── Helpers ────────────────────────────────────────────────────────────────── */
function ChartCard({ title, description, children, className = "" }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-5 flex flex-col ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

const fmtCLP = (v: number) => `$${(v / 1000000).toFixed(1)}M`;
const fmtNum = (n: number) => n.toLocaleString("es-CL");
const fmtMoney = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${fmtNum(n)}`;

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "12m",
    compare: "prev",
    clientId: "",
    tenantId: "",
  });

  const data = getDashboardData(filters);

  return (
    <MainLayout>
      <PageHeader
        breadcrumb={[{ label: "Inicio" }, { label: "Dashboard" }]}
        title="Dashboard"
        description="Resumen general de la plataforma"
        actions={<div className="hidden sm:block"><DashboardFilterButton filters={filters} onChange={setFilters} /></div>}
      />

      <div className="px-4 sm:px-6 pb-8 space-y-6">
        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <DashboardToolbar filters={filters} onChange={setFilters} />

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ingresos totales"
            value={fmtMoney(data.kpis.ingresos.current)}
            delta={{
              value: `+${data.kpis.ingresos.delta}%`,
              label: data.kpis.ingresos.compareLabel,
              color: Number(data.kpis.ingresos.delta) >= 0 ? "green" : "red",
            }}
            icon={<DollarSign size={18} />}
            sparkline={data.sparklines.ingresos}
          />
          <StatsCard
            title="Suscripciones"
            value={fmtNum(data.kpis.suscripciones.current)}
            delta={{
              value: `+${data.kpis.suscripciones.delta}%`,
              label: data.kpis.suscripciones.compareLabel,
              color: Number(data.kpis.suscripciones.delta) >= 0 ? "green" : "red",
            }}
            icon={<Users size={18} />}
            sparkline={data.sparklines.suscripciones}
          />
          <StatsCard
            title="Ventas"
            value={fmtNum(data.kpis.ventas.current)}
            delta={{
              value: `+${data.kpis.ventas.delta}%`,
              label: data.kpis.ventas.compareLabel,
              color: Number(data.kpis.ventas.delta) >= 0 ? "green" : "red",
            }}
            icon={<CreditCard size={18} />}
            sparkline={data.sparklines.ventas}
          />
          <StatsCard
            title="Activos ahora"
            value={fmtNum(data.kpis.activos.current)}
            delta={{
              value: `+${data.kpis.activos.delta}`,
              label: data.kpis.activos.compareLabel,
              color: "blue",
            }}
            icon={<Activity size={18} />}
            sparkline={data.sparklines.activos}
          />
        </div>

        {/* ── Row 1: Revenue Area + Tenants Bar ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Ingresos mensuales" description={`Pagado vs Trial — ${data.periodLabel}`} className="lg:col-span-2">
            <ChartContainer config={revenueConfig} className="h-[280px] w-full">
              <AreaChart accessibilityLayer data={data.revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={fmtCLP} width={52} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `$${v.toLocaleString("es-CL")}`} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <defs>
                  <linearGradient id="fillPagado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-pagado)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-pagado)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillTrial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-trial)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-trial)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                {data.showCompare && (
                  <>
                    <Area type="monotone" dataKey="pagadoPrev" fill="none" stroke="var(--color-pagadoPrev)" strokeWidth={1.5} strokeDasharray="6 4" strokeOpacity={0.35} dot={false} />
                    <Area type="monotone" dataKey="trialPrev" fill="none" stroke="var(--color-trialPrev)" strokeWidth={1.5} strokeDasharray="6 4" strokeOpacity={0.35} dot={false} />
                  </>
                )}
                <Area type="monotone" dataKey="pagado" fill="url(#fillPagado)" stroke="var(--color-pagado)" strokeWidth={2} />
                <Area type="monotone" dataKey="trial" fill="url(#fillTrial)" stroke="var(--color-trial)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Tenants por plan" description="Distribución activos vs trial">
            <ChartContainer config={tenantsPlanConfig} className="h-[280px] w-full">
              <BarChart accessibilityLayer data={data.tenantsByPlan} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="plan" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="activos" fill="var(--color-activos)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="trial" fill="var(--color-trial)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        {/* ── Row 2: Pedidos Line + Donut ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Pedidos procesados" description={`vs capacidad contratada — ${data.periodLabel}`} className="lg:col-span-2">
            <ChartContainer config={pedidosConfig} className="h-[260px] w-full">
              <LineChart accessibilityLayer data={data.pedidosChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="capacidad" stroke="var(--color-capacidad)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                {data.showCompare && (
                  <Line type="monotone" dataKey="pedidosPrev" stroke="var(--color-pedidosPrev)" strokeWidth={1.5} strokeDasharray="6 4" strokeOpacity={0.35} dot={false} />
                )}
                <Line type="monotone" dataKey="pedidos" stroke="var(--color-pedidos)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-pedidos)" }} />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Clientes por estado" description="Distribución actual">
            <ChartContainer config={clientesConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="estado" />} />
                <Pie data={data.clientesEstado} dataKey="count" nameKey="estado" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {data.clientesEstado.map((entry) => (
                    <Cell key={entry.estado} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="estado" />} />
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-900 text-2xl font-bold">{data.totalClientes}</text>
                <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs">clientes</text>
              </PieChart>
            </ChartContainer>
          </ChartCard>
        </div>

        {/* ── Row 3: Top Tenants + Contratos ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Top tenants por pedidos" description={data.periodLabel} className="lg:col-span-2">
            <ChartContainer config={topTenantsConfig} className="h-[240px] w-full">
              <BarChart accessibilityLayer data={data.topTenants} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="tenant" tickLine={false} axisLine={false} width={120} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pedidos" fill="var(--color-pedidos)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Contratos vigentes" description="Pagados vs Trial">
            <ChartContainer config={contratosConfig} className="h-[240px] w-full">
              <RadialBarChart data={data.contratosRadial} innerRadius={40} outerRadius={100} startAngle={180} endAngle={0}>
                <ChartTooltip content={<ChartTooltipContent nameKey="tipo" />} />
                <RadialBar dataKey="value" cornerRadius={6}>
                  {data.contratosRadial.map((entry) => (
                    <Cell key={entry.tipo} fill={entry.fill} />
                  ))}
                </RadialBar>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-900 text-2xl font-bold">{data.totalContratos}</text>
                <text x="50%" y="72%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs">vigentes</text>
              </RadialBarChart>
            </ChartContainer>
            <div className="flex justify-center gap-6 mt-2">
              {data.contratosRadial.map((c) => (
                <div key={c.tipo} className="flex items-center gap-1.5 text-xs text-neutral-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.fill }} />
                  {c.tipo === "pagado" ? "Pagados" : "Trial"} ({c.value})
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

      </div>
    </MainLayout>
  );
}
