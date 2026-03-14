"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Toast from "@/components/ui/Toast";
import RowMenu from "@/components/ui/RowMenu";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_PLANES, MOCK_TRIAL_CONFIGS } from "@/lib/mock-data";
import { Plan, TrialConfig } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { Layers, Plus, Search, ChevronUp, ChevronDown, Star } from "lucide-react";

/* ── Helpers ── */
const MAX_TAGS = 3;
const statusVariant = (s: string) => (s === "Activo" ? "active" : "inactive");

type PlanSortCol = "nombre" | "pedidosMax" | "sucursalesMax" | "tenantsActivos" | "estado" | null;
type TrialSortCol = "nombre" | "duracionDias" | "pedidosMax" | "sucursalesMax" | "tenantsActivos" | "estado" | null;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronUp size={11} className="text-neutral-300 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp size={11} className="text-primary-500 ml-0.5" />
    : <ChevronDown size={11} className="text-primary-500 ml-0.5" />;
}

function ModuleTags({ modulos }: { modulos: string[] }) {
  if (modulos.length === 0) return <span className="text-xs text-neutral-400">—</span>;
  const visible = modulos.slice(0, MAX_TAGS);
  const remaining = modulos.length - MAX_TAGS;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((m) => (
        <span key={m} className="inline-flex rounded-md bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600">
          {m}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex rounded-md bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">
          +{remaining}
        </span>
      )}
    </div>
  );
}

/* ── Tab components ── */

function PlanesTab() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [planes, setPlanes] = useState<Plan[]>(MOCK_PLANES);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<PlanSortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertPlan, setAlertPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  const filtered = planes.filter((p) =>
    `${p.nombre} ${p.descripcion}`.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const va = String((a as never)[sortCol] ?? "");
        const vb = String((b as never)[sortCol] ?? "");
        const cmp = isNaN(Number(va)) ? va.localeCompare(vb) : Number(va) - Number(vb);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: PlanSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleDesactivar = (plan: Plan) => setAlertPlan(plan);
  const confirmDesactivar = () => {
    if (!alertPlan) return;
    const newEstado = alertPlan.estado === "Activo" ? "Inactivo" : "Activo";
    setPlanes((prev) => prev.map((p) => p.id === alertPlan.id ? { ...p, estado: newEstado } : p));
    setToastMsg({
      title: newEstado === "Inactivo" ? "Plan desactivado" : "Plan reactivado",
      message: `"${alertPlan.nombre}" ahora está ${newEstado.toLowerCase()}.`,
    });
    setToast(true);
    setAlertPlan(null);
  };

  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <>
      {/* Search + Create */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-9 w-full sm:min-w-[280px] rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Buscar por nombre de plan"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {canCrear("Planes") && (
          <Button size="md" icon={<Plus size={14} />} onClick={() => router.push("/planes/crear")}>
            Crear plan
          </Button>
        )}
      </div>

      {filtered.length === 0 && !search ? (
        <EmptyState icon={<Layers size={24} />} title="No hay planes registrados" onCreateClick={() => router.push("/planes/crear")} />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="table-scroll">
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className={thSort} onClick={() => toggleSort("nombre")}>
                    <span className="inline-flex items-center">Nombre del plan <SortIcon active={sortCol === "nombre"} dir={sortDir} /></span>
                  </th>
                  <th className={thBase}>Módulos</th>
                  <th className={thSort} onClick={() => toggleSort("pedidosMax")}>
                    <span className="inline-flex items-center">Pedidos máx. <SortIcon active={sortCol === "pedidosMax"} dir={sortDir} /></span>
                  </th>
                  <th className={thSort} onClick={() => toggleSort("sucursalesMax")}>
                    <span className="inline-flex items-center">Sucursales máx. <SortIcon active={sortCol === "sucursalesMax"} dir={sortDir} /></span>
                  </th>
                  <th className={thSort} onClick={() => toggleSort("tenantsActivos")}>
                    <span className="inline-flex items-center">Tenants activos <SortIcon active={sortCol === "tenantsActivos"} dir={sortDir} /></span>
                  </th>
                  <th className={thSort} onClick={() => toggleSort("estado")}>
                    <span className="inline-flex items-center">Estado <SortIcon active={sortCol === "estado"} dir={sortDir} /></span>
                  </th>
                  <th className="w-10 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((plan) => (
                  <tr key={plan.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/planes/${plan.id}`)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                      >
                        {plan.nombre}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <ModuleTags modulos={plan.modulos} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">
                      {plan.pedidosMax.toLocaleString("es-CL")}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">
                      {plan.sucursalesMax}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">
                      {plan.tenantsActivos}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(plan.estado) as never}>{plan.estado}</Badge>
                    </td>
                    <td className="w-10 py-3 pr-3">
                      <RowMenu actions={[
                        { label: "Ver detalle", onClick: () => router.push(`/planes/${plan.id}`) },
                        ...(canEditar("Planes") ? [{ label: "Editar", onClick: () => router.push(`/planes/${plan.id}/editar`) }] : []),
                        ...(canDeshabilitar("Planes")
                          ? [{
                              label: plan.estado === "Activo" ? "Desactivar" : "Reactivar",
                              onClick: () => handleDesactivar(plan),
                              variant: (plan.estado === "Activo" ? "danger" : "default") as "danger" | "default",
                            }]
                          : []),
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </div>
      )}

      <AlertModal
        open={!!alertPlan}
        onClose={() => setAlertPlan(null)}
        onConfirm={confirmDesactivar}
        title={alertPlan?.estado === "Activo" ? "Desactivar plan" : "Reactivar plan"}
        message={
          alertPlan?.estado === "Activo"
            ? `Al desactivar "${alertPlan?.nombre}", no podrá ser asignado a nuevos contratos.${alertPlan?.tenantsActivos ? ` Actualmente tiene ${alertPlan.tenantsActivos} tenant(s) activos que seguirán vigentes hasta el vencimiento de sus contratos.` : ""} ¿Deseas continuar?`
            : `¿Deseas reactivar el plan "${alertPlan?.nombre}"? Volverá a estar disponible para nuevos contratos.`
        }
        confirmLabel={alertPlan?.estado === "Activo" ? "Desactivar" : "Reactivar"}
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </>
  );
}

function TrialConfigsTab() {
  const router = useRouter();
  const { canCrear, canEditar, canDeshabilitar } = useRole();
  const [configs, setConfigs] = useState<TrialConfig[]>(MOCK_TRIAL_CONFIGS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState<TrialSortCol>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertConfig, setAlertConfig] = useState<TrialConfig | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  const filtered = configs.filter((c) =>
    `${c.nombre} ${c.descripcion}`.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const va = String((a as never)[sortCol] ?? "");
        const vb = String((b as never)[sortCol] ?? "");
        const cmp = isNaN(Number(va)) ? va.localeCompare(vb) : Number(va) - Number(vb);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: TrialSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleDesactivar = (config: TrialConfig) => setAlertConfig(config);
  const confirmDesactivar = () => {
    if (!alertConfig) return;
    const newEstado = alertConfig.estado === "Activo" ? "Inactivo" : "Activo";
    setConfigs((prev) => prev.map((c) => c.id === alertConfig.id ? { ...c, estado: newEstado } : c));
    setToastMsg({
      title: newEstado === "Inactivo" ? "Configuración desactivada" : "Configuración reactivada",
      message: `"${alertConfig.nombre}" ahora está ${newEstado.toLowerCase()}.`,
    });
    setToast(true);
    setAlertConfig(null);
  };

  const thBase = "px-4 py-2.5 text-left text-xs font-semibold text-neutral-500";
  const thSort = `${thBase} cursor-pointer hover:text-neutral-700 hover:bg-neutral-100 transition-colors`;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-9 w-full sm:min-w-[280px] rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Buscar configuración de trial"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {canCrear("Planes") && (
          <Button size="md" icon={<Plus size={14} />} onClick={() => router.push("/planes/trial/crear")}>
            Crear configuración
          </Button>
        )}
      </div>

      {filtered.length === 0 && !search ? (
        <EmptyState icon={<Layers size={24} />} title="No hay configuraciones de trial" onCreateClick={() => router.push("/planes/trial/crear")} />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="table-scroll">
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className={thSort} onClick={() => toggleSort("nombre")}>
                    <span className="inline-flex items-center">Nombre <SortIcon active={sortCol === "nombre"} dir={sortDir} /></span>
                  </th>
                  <th className={thSort} onClick={() => toggleSort("duracionDias")}>
                    <span className="inline-flex items-center">Duración (días) <SortIcon active={sortCol === "duracionDias"} dir={sortDir} /></span>
                  </th>
                  <th className={thBase}>Módulos</th>
                  <th className={thSort} onClick={() => toggleSort("pedidosMax")}>
                    <span className="inline-flex items-center">Pedidos máx. <SortIcon active={sortCol === "pedidosMax"} dir={sortDir} /></span>
                  </th>
                  <th className={thSort} onClick={() => toggleSort("sucursalesMax")}>
                    <span className="inline-flex items-center">Sucursales máx. <SortIcon active={sortCol === "sucursalesMax"} dir={sortDir} /></span>
                  </th>
                  <th className={thSort} onClick={() => toggleSort("tenantsActivos")}>
                    <span className="inline-flex items-center">Tenants activos <SortIcon active={sortCol === "tenantsActivos"} dir={sortDir} /></span>
                  </th>
                  <th className={thBase}>Default</th>
                  <th className={thSort} onClick={() => toggleSort("estado")}>
                    <span className="inline-flex items-center">Estado <SortIcon active={sortCol === "estado"} dir={sortDir} /></span>
                  </th>
                  <th className="w-10 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((config) => (
                  <tr key={config.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/planes/trial/${config.id}`)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                      >
                        {config.nombre}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">{config.duracionDias}</td>
                    <td className="px-4 py-3"><ModuleTags modulos={config.modulos} /></td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">{config.pedidosMax.toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">{config.sucursalesMax}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">{config.tenantsActivos}</td>
                    <td className="px-4 py-3">
                      {config.esDefault
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700"><Star size={10} className="fill-amber-400 text-amber-400" /> Default</span>
                        : <span className="text-xs text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(config.estado) as never}>{config.estado}</Badge>
                    </td>
                    <td className="w-10 py-3 pr-3">
                      <RowMenu actions={[
                        { label: "Ver detalle", onClick: () => router.push(`/planes/trial/${config.id}`) },
                        ...(canEditar("Planes") ? [{ label: "Editar", onClick: () => router.push(`/planes/trial/${config.id}/editar`) }] : []),
                        ...(canDeshabilitar("Planes")
                          ? [{
                              label: config.estado === "Activo" ? "Desactivar" : "Reactivar",
                              onClick: () => handleDesactivar(config),
                              variant: (config.estado === "Activo" ? "danger" : "default") as "danger" | "default",
                            }]
                          : []),
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </div>
      )}

      <AlertModal
        open={!!alertConfig}
        onClose={() => setAlertConfig(null)}
        onConfirm={confirmDesactivar}
        title={alertConfig?.estado === "Activo" ? "Desactivar configuración" : "Reactivar configuración"}
        message={
          alertConfig?.estado === "Activo"
            ? `Al desactivar "${alertConfig?.nombre}", no se podrá usar en nuevos contratos trial.${alertConfig?.tenantsActivos ? ` Actualmente tiene ${alertConfig.tenantsActivos} tenant(s) usando esta configuración.` : ""} ¿Deseas continuar?`
            : `¿Deseas reactivar "${alertConfig?.nombre}"?`
        }
        confirmLabel={alertConfig?.estado === "Activo" ? "Desactivar" : "Reactivar"}
      />

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </>
  );
}

/* ── Main Page ── */

type Tab = "planes" | "trial";

export default function PlanesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("planes");

  const tabs: { key: Tab; label: string }[] = [
    { key: "planes", label: "Planes" },
    { key: "trial", label: "Configuraciones de Trial" },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Planes" }]}
          title="Planes y Licenciamientos"
          description="Administración de planes comerciales y configuraciones de trial"
        />

        <div className="flex-1 px-4 sm:px-6 pb-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b border-neutral-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-primary-600"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {activeTab === "planes" ? <PlanesTab /> : <TrialConfigsTab />}
        </div>
      </div>
    </MainLayout>
  );
}
