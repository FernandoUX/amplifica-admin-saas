import { Empresa, Tenant, Contrato, Usuario } from "./types";

const cc = (nombre: string, cargo: string, correo: string, telefono: string) => ({ nombre, cargo, correo, telefono });
const cpMismo = () => ({ mismoQueComercial: true, nombre: "", cargo: "", correo: "", telefono: "" });
const cp = (nombre: string, cargo: string, correo: string, telefono: string) => ({ mismoQueComercial: false, nombre, cargo, correo, telefono });

export const MOCK_EMPRESAS: Empresa[] = [
  {
    id: "1", nombreFantasia: "Extra Life", nombre: "Extra Life",
    razonSocial: "Extra Life SpA", idFiscal: "96.603.490-5", pais: "Chile",
    giro: "Retail", direccion: "Av. Apoquindo 4501, Las Condes",
    contactoComercial: cc("Tamara Alve", "CEO", "tamara@extralife.cl", "+56 9 1234 5678"),
    contactoPagos: cp("Ana Torres", "CFO", "finanzas@extralife.cl", "+56 9 9876 5432"),
    notasInternas: "Cliente premium. Renovación anual en marzo.",
    planes: ["Express"], contratos: 3, tenants: 2, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2023-03-15",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "2", nombreFantasia: "ChileanBazar", nombre: "ChileanBazar",
    razonSocial: "ChileanBazar SpA", idFiscal: "76.820.690-5", pais: "Chile",
    giro: "Comercio electrónico", direccion: "Calle Falsa 123, Santiago",
    contactoComercial: cc("Pedro Muñoz", "CTO", "pedro@chileanbazar.cl", "+56 9 8765 4321"),
    contactoPagos: cpMismo(),
    planes: ["Envíos Pro"], contratos: 0, tenants: 1, tenantsTrial: 1,
    operationalStatus: "suspendido", fechaCreacion: "2023-07-22",
    estadoComercial: "Vencido", estado: "Inactivo", habilitado: false,
  },
  {
    id: "3", nombreFantasia: "MarketPlaceChile", nombre: "MarketPlaceChile",
    razonSocial: "MarketPlaceChile SpA", idFiscal: "77.100.200-K", pais: "Chile",
    giro: "Marketplace", direccion: "Teatinos 280, Santiago",
    contactoComercial: cc("Laura Soto", "CFO", "laura@mpc.cl", "+56 9 1111 2222"),
    contactoPagos: cpMismo(),
    planes: ["Express"], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2024-01-10",
    estadoComercial: "Por vencer", estado: "Activo", habilitado: true,
  },
  {
    id: "4", nombreFantasia: "E-ShopChile", nombre: "E-ShopChile",
    razonSocial: "E-ShopChile SpA", idFiscal: "76.300.100-1", pais: "Colombia",
    giro: "E-commerce", direccion: "Cra. 7 #71-21, Bogotá",
    contactoComercial: cc("Carlos Vera", "Gerente Ops", "carlos@eshop.cl", "+57 300 333 4444"),
    contactoPagos: cp("Valentina Ríos", "Contadora", "pagos@eshop.cl", "+57 300 555 6666"),
    planes: [], contratos: 2, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2024-02-28",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "5", nombreFantasia: "PatagoniaICom", nombre: "PatagoniaICom",
    razonSocial: "PatagoniaICom SpA", idFiscal: "76.500.200-3", pais: "Chile",
    giro: "Logística", direccion: "Camino Lo Barnechea 1234, Santiago",
    contactoComercial: cc("Ana Reyes", "CEO", "ana@patagonia.cl", "+56 9 5555 6666"),
    contactoPagos: cpMismo(),
    planes: ["Envíos Pro", "Multicanal"], contratos: 3, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2022-11-05",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "6", nombreFantasia: "SantiagoMarket", nombre: "SantiagoMarket",
    razonSocial: "SantiagoMarket SpA", idFiscal: "76.700.300-5", pais: "Chile",
    giro: "Retail", direccion: "Av. Libertador B. O'Higgins 1234",
    contactoComercial: cc("Mario Rojas", "Dir. Comercial", "mario@sm.cl", "+56 9 7777 8888"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 0, tenants: 0, tenantsTrial: 0,
    operationalStatus: "inactivo", fechaCreacion: "2023-05-18",
    estadoComercial: "Inactivo", estado: "Inactivo", habilitado: false,
  },
  {
    id: "7", nombreFantasia: "ChileCart", nombre: "ChileCart",
    razonSocial: "ChileCart SpA", idFiscal: "76.900.100-7", pais: "Perú",
    giro: "E-commerce", direccion: "Av. Larco 1301, Miraflores, Lima",
    contactoComercial: cc("Sofía Castro", "CEO", "sofia@chilecart.cl", "+51 9 9999 0000"),
    contactoPagos: cp("Roberto Lima", "Finanzas", "pagos@chilecart.cl", "+51 9 1111 2222"),
    planes: ["Envíos Pro"], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2024-08-30",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
];

export const MOCK_TENANTS: Tenant[] = [
  { id: "0021", empresaId: "1", razonSocial: "AndesCommerce SpA", nombre: "AndesCommerce", dominio: "www.andescommerce.com", pais: "Chile", zonaHoraria: "America/Santiago", moneda: "CLP", couriers: true, planes: ["Express", "Envíos Pro", "Multicanal"], contratos: 2, estado: "Activo", habilitado: true },
  { id: "0022", empresaId: "2", razonSocial: "ChileanBazar SpA", nombre: "ChileanBazar", dominio: "www.chileanbazar.cl", pais: "Chile", zonaHoraria: "America/Santiago", moneda: "CLP", couriers: false, planes: [], contratos: 0, estado: "Inactivo", habilitado: false },
  { id: "0023", empresaId: "3", razonSocial: "ManuelPacaChile SpA", nombre: "ManuelPacaChile", dominio: "www.mpc.cl", pais: "Chile", zonaHoraria: "America/Santiago", moneda: "CLP", couriers: true, planes: ["Express"], contratos: 1, estado: "Activo", habilitado: true },
  { id: "0024", empresaId: "4", razonSocial: "E-ShopChile SpA", nombre: "E-ShopChile", dominio: "www.eshop.cl", pais: "Chile", zonaHoraria: "America/Santiago", moneda: "CLP", couriers: true, planes: ["Multicanal"], contratos: 2, estado: "Activo", habilitado: true },
  { id: "0025", empresaId: "5", razonSocial: "PatagoniaICom SpA", nombre: "PatagoniaICom", dominio: "www.patagonia.cl", pais: "Chile", zonaHoraria: "America/Santiago", moneda: "CLP", couriers: true, planes: ["Envíos Pro", "Multicanal"], contratos: 3, estado: "Activo", habilitado: true },
];

export const MOCK_CONTRATOS: Contrato[] = [
  { id: "0001", empresaId: "1", tenantId: "0021", tenantNombre: "Extra Life", nombre: "Extra Life", razonSocial: "Extra Life SpA", planes: ["Envíos Pro", "Express"], fechaInicio: "2025-01-01", fechaVencimiento: "2026-01-01", moneda: "CLP", monto: 250000, plazoVencer: "382 días", estado: "Activo", habilitado: true },
  { id: "0002", empresaId: "1", tenantId: "0021", tenantNombre: "Amplifica", nombre: "Amplifica", razonSocial: "Amplifica SpA", planes: ["Express"], fechaInicio: "2025-06-01", fechaVencimiento: "2025-07-01", moneda: "CLP", monto: 150000, plazoVencer: "30 Días", estado: "Activo", habilitado: true },
  { id: "0003", empresaId: "1", tenantId: "0021", tenantNombre: "Amplifica", nombre: "Amplifica", razonSocial: "Amplifica SpA", planes: ["Multicanal"], fechaInicio: "2024-01-01", fechaVencimiento: "2025-01-01", moneda: "CLP", monto: 300000, plazoVencer: "15 Días", estado: "Vencido", habilitado: false },
  { id: "0004", empresaId: "5", tenantId: "0025", tenantNombre: "Amplifica", nombre: "Amplifica", razonSocial: "Amplifica SpA", planes: ["Express"], fechaInicio: "2025-03-01", fechaVencimiento: "2026-03-01", moneda: "CLP", monto: 200000, plazoVencer: "15 Días", estado: "Vigente", habilitado: true },
];

export const MOCK_USUARIOS: Usuario[] = [
  { id: "0001", tipo: "Amplifica", nombres: "Jose Antonio Car…", apellidos: "Carreño", telefono: "+56993521190", email: "jose@amplifica.cl", tenantId: "0021", rol: "Super Admin", diasRestantes: 362, estado: "Activo", habilitado: true },
  { id: "0001", tipo: "Amplifica", nombres: "Cristóbal Vila", apellidos: "Vila", telefono: "+56993521192", email: "cristobal@amplifica.cl", tenantId: "0021", rol: "Dev", diasRestantes: 362, estado: "Activo", habilitado: true },
  { id: "0001", tipo: "Amplifica", nombres: "Emiliano Loza", apellidos: "Loza", telefono: "+56993521190", email: "emiliano@amplifica.cl", tenantId: "0021", rol: "Tester", diasRestantes: 362, estado: "Inactivo", habilitado: false },
  { id: "0052", tipo: "Tenant", nombres: "Paola Martínez", apellidos: "Martínez", telefono: "+56993343280", email: "paola@tenant.cl", tenantId: "0022", rol: "nax", diasRestantes: undefined, estado: "Activo", habilitado: true },
  { id: "0053", tipo: "Amplifica", nombres: "Cristian Aceve…", apellidos: "Acevedo", telefono: "+56763011270", email: "cristian@amplifica.cl", tenantId: "0021", rol: "Vendor", diasRestantes: undefined, estado: "Inactivo", habilitado: false },
];
