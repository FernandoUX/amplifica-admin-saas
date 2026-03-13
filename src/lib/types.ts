export interface Empresa {
  id: string;
  nombre: string;
  razonSocial: string;
  nombreFantasia: string;
  pais: string;
  idFiscal: string;
  giro: string;
  direccion: string;
  nombreContacto: string;
  cargo: string;
  correoContacto: string;
  telefonoPrincipal: string;
  planes: string[];
  contratos: number;
  estadoComercial: "Al día" | "Por vencer" | "Vencido" | "Activo" | "Inactivo";
  estado: "Activo" | "Inactivo";
  habilitado: boolean;
}

export interface Tenant {
  id: string;
  empresaId: string;
  razonSocial: string;
  nombre: string;
  dominio: string;
  pais: string;
  zonaHoraria: string;
  moneda: string;
  nota?: string;
  couriers: boolean;
  planes: string[];
  contratos: number;
  estado: "Activo" | "Inactivo";
  habilitado: boolean;
}

export interface Contrato {
  id: string;
  empresaId: string;
  tenantId: string;
  tenantNombre: string;
  nombre: string;
  razonSocial: string;
  planes: string[];
  fechaInicio: string;
  fechaVencimiento: string;
  moneda: string;
  monto: number;
  plazoVencer: string;
  estado: "Activo" | "Inactivo" | "Vencido" | "Vigente";
  habilitado: boolean;
}

export interface Usuario {
  id: string;
  tipo: "Amplifica" | "Tenant" | "Staff";
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  empresaId?: string;
  tenantId?: string;
  rol: string;
  diasRestantes?: number;
  estado: "Activo" | "Inactivo";
  habilitado: boolean;
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
