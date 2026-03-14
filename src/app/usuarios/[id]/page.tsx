"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import AlertModal from "@/components/ui/AlertModal";
import { MOCK_USUARIOS, MOCK_TENANTS, MOCK_EMPRESAS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { Pencil, UserCircle, Mail, Send } from "lucide-react";

/* ── Helpers ── */

const tipoBadge = (tipo: string) => {
  if (tipo === "SaaS Admin") return { variant: "default", label: "SaaS Admin" };
  if (tipo === "Staff Amplifica") return { variant: "pending", label: "Staff Amplifica" };
  return { variant: "active", label: "Usuario Tenant" };
};

const estadoBadge = (estado: string) => {
  if (estado === "Activo") return { variant: "active", label: "Activo" };
  if (estado === "Pendiente de activación") return { variant: "pending", label: "Pendiente de activación" };
  return { variant: "inactive", label: "Inactivo" };
};

const tenantMap = Object.fromEntries(MOCK_TENANTS.map((t) => [t.id, t]));
const empresaMap = Object.fromEntries(MOCK_EMPRESAS.map((e) => [e.id, e]));

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 mb-0.5">{label}</p>
      {children ?? <p className="text-sm text-neutral-900">{value || "—"}</p>}
    </div>
  );
}

const TABS = ["Información general", "Membresías", "Audit Log"] as const;
type Tab = typeof TABS[number];

export default function UsuarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { canEditar, canDeshabilitar } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>("Información general");
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: "", message: "" });

  const usuario = MOCK_USUARIOS.find((u) => u.id === id);

  if (!usuario) {
    return (
      <MainLayout narrow>
        <div className="px-4 sm:px-6 pt-5 pb-4">
          <nav className="flex items-center gap-1 text-xs text-neutral-400 mb-3">
            <Link href="/" className="hover:text-neutral-600">Inicio</Link>
            <span>/</span>
            <Link href="/usuarios" className="hover:text-neutral-600">Usuarios</Link>
            <span>/</span>
            <span>No encontrado</span>
          </nav>
          <h1 className="text-xl font-bold text-neutral-900">Usuario no encontrado</h1>
        </div>
      </MainLayout>
    );
  }

  const tipo = tipoBadge(usuario.tipo);
  const estado = estadoBadge(usuario.estado);
  const initials = `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase();

  const showMemberships = usuario.tipo !== "SaaS Admin";

  return (
    <MainLayout narrow>
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 pt-5 pb-0">
        <nav className="flex items-center gap-1 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/usuarios" className="hover:text-neutral-600 transition-colors">Usuarios</Link>
          <span>/</span>
          <span>{usuario.nombres} {usuario.apellidos}</span>
        </nav>
      </div>

      {/* Hero header */}
      <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-base shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900">{usuario.nombres} {usuario.apellidos}</h1>
              <Badge variant={estado.variant as never}>{estado.label}</Badge>
              <Badge variant={tipo.variant as never}>{tipo.label}</Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">{usuario.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {usuario.estado === "Pendiente de activación" && (
            <Button
              size="lg"
              variant="secondary"
              icon={<Send size={14} />}
              onClick={() => { setToastMsg({ title: "Invitación reenviada", message: `Se reenvió la invitación a ${usuario.email}` }); setToast(true); }}
            >
              Reenviar invitación
            </Button>
          )}
          {canEditar("Usuarios") && usuario.estado !== "Inactivo" && (
            <Button
              size="lg"
              variant="secondary"
              icon={<Pencil size={14} />}
              onClick={() => router.push(`/usuarios/${id}/editar`)}
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 border-b border-neutral-200">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.filter((tab) => tab !== "Membresías" || showMemberships).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary-500 text-primary-600"
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
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Datos personales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre" value={usuario.nombres} />
                <Field label="Apellido" value={usuario.apellidos} />
                <Field label="Correo electrónico" value={usuario.email} />
                <Field label="Teléfono" value={usuario.telefono || "—"} />
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Acceso y rol</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tipo de usuario">
                  <Badge variant={tipo.variant as never}>{tipo.label}</Badge>
                </Field>
                <Field label="Rol principal" value={usuario.rol} />
                <Field label="Estado">
                  <Badge variant={estado.variant as never}>{estado.label}</Badge>
                </Field>
                {showMemberships && (
                  <Field label="Membresías activas" value={`${usuario.memberships.length} tenant(s)`} />
                )}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Datos del sistema</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="ID interno" value={usuario.id} />
                <Field label="Fecha de creación" value={new Date(usuario.fechaCreacion).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })} />
                <Field label="Último login" value={usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleString("es-CL", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Nunca"} />
                <Field label="Creado por" value={(() => {
                  if (usuario.creadoPor === "Sistema") return "Sistema";
                  const creador = MOCK_USUARIOS.find((u) => u.id === usuario.creadoPor);
                  return creador ? `${creador.nombres} ${creador.apellidos}` : usuario.creadoPor;
                })()} />
              </div>
            </section>
          </>
        )}

        {/* ── Membresías ── */}
        {activeTab === "Membresías" && showMemberships && (
          <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Membresías de tenant ({usuario.memberships.length})</h2>
            </div>
            {usuario.memberships.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
                <UserCircle size={24} />
                <p className="text-sm">Sin membresías asignadas</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {usuario.memberships.map((m) => {
                  const t = tenantMap[m.tenantId];
                  const e = t ? empresaMap[t.empresaId] : null;
                  return (
                    <div key={m.tenantId} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/tenants/${m.tenantId}`)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {t?.nombre ?? m.tenantId}
                          </button>
                          {e && (
                            <span className="text-xs text-neutral-400">({e.nombreFantasia})</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Rol: {m.rol} · Asignado: {new Date(m.fechaAsignacion).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <Badge variant={t?.operationalStatus === "activo" ? "active" : "inactive"}>
                        {t?.operationalStatus === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  );
                })}
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

      <Toast open={toast} onClose={() => setToast(false)} type="success" title={toastMsg.title} message={toastMsg.message} />
    </MainLayout>
  );
}
