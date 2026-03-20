"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { MOCK_EMPRESAS, MOCK_TENANTS, MOCK_CONTRATOS, MOCK_USUARIOS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { IconPencil as Pencil, IconBuilding as Building2, IconChevronRight } from "@tabler/icons-react";

const COUNTRY_FLAG: Record<string, string> = {
  Chile: "🇨🇱", Colombia: "🇨🇴", Perú: "🇵🇪",
  Argentina: "🇦🇷", México: "🇲🇽", España: "🇪🇸", Brasil: "🇧🇷",
};

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
const estadoVariant = (e: string) => {
  if (e === "Al día" || e === "Activo" || e === "Vigente") return "active";
  if (e === "Por vencer") return "pending";
  return "inactive";
};

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-500 mb-0.5">{label}</p>
      <p className="text-base text-neutral-900">{value || "—"}</p>
    </div>
  );
}

const TABS = ["Información general", "Tenants", "Contratos", "Usuarios", "Audit Log"] as const;
type Tab = typeof TABS[number];

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>("Información general");

  const empresa = MOCK_EMPRESAS.find((e) => e.id === id);
  const tenants = MOCK_TENANTS.filter((t) => t.empresaId === id);
  const tenantIds = tenants.map((t) => t.id);
  const contratos = MOCK_CONTRATOS.filter((c) => tenantIds.includes(c.tenantId));
  const usuarios = MOCK_USUARIOS.filter((u) => u.memberships.some((m) => tenants.some((t) => t.id === m.tenantId)));

  if (!empresa) {
    return (
      <MainLayout narrow>
        <div className="px-4 sm:px-6 pt-5 pb-4">
          <nav className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
            <Link href="/" className="hover:text-neutral-600">Inicio</Link>
            <IconChevronRight size={12} className="text-neutral-400" />
            <Link href="/clientes" className="hover:text-neutral-600">Clientes</Link>
            <IconChevronRight size={12} className="text-neutral-400" />
            <span>No encontrado</span>
          </nav>
          <h1 className="text-2xl font-bold text-neutral-900">Cliente no encontrado</h1>
        </div>
      </MainLayout>
    );
  }

  const initials = empresa.nombreFantasia.slice(0, 2).toUpperCase();

  return (
    <MainLayout narrow>
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 pt-5 pb-0">
        <nav className="flex items-center gap-1 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600 transition-colors">Inicio</Link>
          <IconChevronRight size={12} className="text-neutral-400" />
          <Link href="/clientes" className="hover:text-neutral-600 transition-colors">Clientes</Link>
          <IconChevronRight size={12} className="text-neutral-400" />
          <span>{empresa.nombreFantasia}</span>
        </nav>
      </div>

      {/* Hero header */}
      <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-base shrink-0">
            {empresa.logo
              ? <img src={empresa.logo} alt={empresa.nombreFantasia} className="w-full h-full rounded-xl object-cover" />
              : <span>{initials}</span>}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-neutral-900">{empresa.nombreFantasia}</h1>
              <Badge variant={statusVariant(empresa.operationalStatus) as never}>
                {statusLabel(empresa.operationalStatus)}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">{empresa.razonSocial}</p>
          </div>
        </div>
        {canEditar("Clientes") && (
          <Button
            size="lg"
            variant="secondary"
            icon={<Pencil size={14} />}
            onClick={() => router.push(`/clientes/${id}/editar`)}
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
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Datos de la empresa</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre de fantasía" value={empresa.nombreFantasia} />
                <Field label="Razón Social" value={empresa.razonSocial} />
                <Field label="ID Fiscal (RUT)" value={empresa.idFiscal} />
                <Field label="País" value={`${COUNTRY_FLAG[empresa.pais] ?? "🌎"} ${empresa.pais}`} />
                <Field label="Giro comercial" value={empresa.giro} />
                <Field label="Dirección" value={empresa.direccion} />
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Contacto comercial</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre" value={empresa.contactoComercial.nombre} />
                <Field label="Cargo" value={empresa.contactoComercial.cargo} />
                <Field label="Correo" value={empresa.contactoComercial.correo} />
                <Field label="Teléfono" value={empresa.contactoComercial.telefono} />
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-700">Contacto de pagos y finanzas</h2>
                {empresa.contactoPagos.mismoQueComercial && (
                  <span className="text-xs text-neutral-400 italic">Mismo que comercial</span>
                )}
              </div>
              {empresa.contactoPagos.mismoQueComercial ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre" value={empresa.contactoComercial.nombre} />
                  <Field label="Cargo" value={empresa.contactoComercial.cargo} />
                  <Field label="Correo" value={empresa.contactoComercial.correo} />
                  <Field label="Teléfono" value={empresa.contactoComercial.telefono} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre" value={empresa.contactoPagos.nombre} />
                  <Field label="Cargo" value={empresa.contactoPagos.cargo} />
                  <Field label="Correo" value={empresa.contactoPagos.correo} />
                  <Field label="Teléfono" value={empresa.contactoPagos.telefono} />
                </div>
              )}
            </section>

            {empresa.notasInternas && (
              <section className="rounded-xl border border-neutral-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-neutral-700 mb-2">Notas internas</h2>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap">{empresa.notasInternas}</p>
              </section>
            )}

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-neutral-700 mb-4">Datos del sistema</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Fecha de creación" value={new Date(empresa.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })} />
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-0.5">Estado comercial</p>
                  <Badge variant={estadoVariant(empresa.estadoComercial) as never}>{empresa.estadoComercial}</Badge>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Tenants ── */}
        {activeTab === "Tenants" && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-700">Tenants ({tenants.length})</h2>
            </div>
            {tenants.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
                <Building2 size={24} />
                <p className="text-sm">Sin tenants asociados</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {tenants.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{t.nombre}</p>
                      <p className="text-xs text-neutral-400">{t.dominio} · ID: {t.id}</p>
                    </div>
                    <Badge variant={t.operationalStatus === "activo" ? "active" : "inactive"}>{t.operationalStatus === "activo" ? "Activo" : t.operationalStatus === "suspendido" ? "Suspendido" : "Inactivo"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Contratos ── */}
        {activeTab === "Contratos" && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-700">Contratos ({contratos.length})</h2>
            </div>
            {contratos.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
                <p className="text-sm">Sin contratos asociados</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {contratos.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{c.displayId} {c.planNombre ? `· ${c.planNombre}` : "· Trial"}</p>
                      <p className="text-xs text-neutral-400">Vence: {c.fechaVencimiento}</p>
                    </div>
                    <Badge variant={c.estado === "vigente" ? "active" : "inactive"}>{c.estado === "vigente" ? "Vigente" : "Inactivo"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Usuarios ── */}
        {activeTab === "Usuarios" && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-700">Usuarios ({usuarios.length})</h2>
            </div>
            {usuarios.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
                <p className="text-sm">Sin usuarios asociados</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {usuarios.map((u, i) => (
                  <div key={`${u.id}-${i}`} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{u.nombres} {u.apellidos}</p>
                      <p className="text-xs text-neutral-400">{u.email} · {u.rol}</p>
                    </div>
                    <Badge variant={u.estado === "Activo" ? "active" : u.estado === "Pendiente de activación" ? "pending" : "inactive"}>{u.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Audit Log ── */}
        {activeTab === "Audit Log" && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-700">Audit Log</h2>
            </div>
            <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
              <p className="text-sm">Sin registros de auditoría</p>
            </div>
          </section>
        )}

      </div>
    </MainLayout>
  );
}
