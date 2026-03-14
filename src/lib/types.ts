export interface ContactoPersona {
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
}

export interface Empresa {
  id: string;
  nombreFantasia: string;
  nombre: string; // alias = nombreFantasia (backward compat)
  razonSocial: string;
  idFiscal: string;
  pais: string;
  giro: string;
  direccion: string;
  logo?: string;
  notasInternas?: string;
  contactoComercial: ContactoPersona;
  contactoPagos: { mismoQueComercial: boolean } & ContactoPersona;
  planes: string[];
  contratos: number;
  tenants: number;
  tenantsTrial: number;
  operationalStatus: "activo" | "suspendido" | "inactivo";
  fechaCreacion: string;
  estadoComercial: "Al día" | "Por vencer" | "Vencido" | "Activo" | "Inactivo";
  estado: "Activo" | "Inactivo";
  habilitado: boolean;
}

export interface Tenant {
  id: string;
  empresaId: string;
  nombre: string;
  dominio: string;
  billingMode: "trial" | "pagado" | "sin_contrato";
  planNombre: string | null;
  operationalStatus: "activo" | "suspendido" | "inactivo";
  fechaCreacion: string;
}

export interface Contrato {
  id: string;
  displayId: string;
  tenantId: string;
  billingMode: "trial" | "pagado";
  planId: string | null;
  planNombre: string | null;
  trialConfigId: string | null;
  trialConfigNombre: string | null;
  fechaInicio: string;
  fechaVencimiento: string;
  trialEndDate: string | null;
  moneda: string;
  montoBase: number | null;
  precioPedidoAdicional: number | null;
  tipoDescuento: "porcentaje" | "monto_fijo" | "precio_negociado" | null;
  valorDescuento: number | null;
  montoBaseFinal: number | null;
  overridePedidosMes: number | null;
  overrideSucursales: number | null;
  autoRenew: boolean;
  notas: string | null;
  estado: "vigente" | "inactivo";
  closureReason: "vencido" | "cancelado" | "convertido" | null;
  closureDate: string | null;
  closureNotes: string | null;
  fechaCreacion: string;
}

export interface TenantMembership {
  tenantId: string;
  rol: string; // Admin Tenant, Operador, Visor (for tenant users) — or the staff role
  fechaAsignacion: string;
}

export interface Usuario {
  id: string;
  tipo: "Usuario Tenant" | "Staff Amplifica" | "SaaS Admin";
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  memberships: TenantMembership[];
  rol: string; // Global role: Staff → Soporte/Operaciones de campo; SaaS Admin → Super Admin/Comercial/etc.; Tenant → primary display
  estado: "Pendiente de activación" | "Activo" | "Inactivo";
  fechaCreacion: string;
  ultimoLogin: string | null;
  creadoPor: string;
}

export interface Rol {
  id: string;
  nombre: string;
  permisos: {
    ver: string[];
    editar: string[];
    crear: string[];
    deshabilitar: string[];
  };
}

// ── Feature 3: Planes y Licenciamientos ──

export const MODULOS_SISTEMA = [
  "Fulfillment",
  "Devoluciones",
  "Tracking",
  "Gestión de inventario",
  "Reportería avanzada",
  "Integraciones",
  "Multi-bodega",
  "Gestión de couriers",
] as const;

export type ModuloSistema = (typeof MODULOS_SISTEMA)[number];

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  modulos: string[];
  pedidosMax: number;
  sucursalesMax: number;
  tenantsActivos: number;
  estado: "Activo" | "Inactivo";
  fechaCreacion: string;
}

export interface TrialConfig {
  id: string;
  nombre: string;
  descripcion: string;
  duracionDias: number;
  modulos: string[];
  pedidosMax: number;
  sucursalesMax: number;
  esDefault: boolean;
  tenantsActivos: number;
  estado: "Activo" | "Inactivo";
  fechaCreacion: string;
}

// ── Audit Log ──

export type AuditEntidad = "Cliente" | "Tenant" | "Contrato" | "Usuario" | "Plan" | "Trial Config";
export type AuditAccion = "Crear" | "Editar" | "Desactivar" | "Reactivar" | "Suspender" | "Eliminar" | "Reenviar invitación";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  usuarioId: string;
  usuarioNombre: string;
  entidad: AuditEntidad;
  entidadId: string;
  entidadLabel: string;
  accion: AuditAccion;
  campo: string | null;
  valorAnterior: string | null;
  valorNuevo: string | null;
  ip: string;
}
