import { Empresa, Tenant, Contrato, Usuario, Plan, TrialConfig, AuditLogEntry } from "./types";

const cc = (nombre: string, cargo: string, correo: string, telefono: string) => ({ nombre, cargo, correo, telefono });
const cpMismo = () => ({ mismoQueComercial: true, nombre: "", cargo: "", correo: "", telefono: "" });
const cp = (nombre: string, cargo: string, correo: string, telefono: string) => ({ mismoQueComercial: false, nombre, cargo, correo, telefono });

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_EMPRESAS — 30 clientes activos (habilitado:true) + 76 growth-metric stubs (habilitado:false)
// Growth math (today = 2026-03-16):
//   Last 30d [2026-02-14, 2026-03-16): 10 clients
//   30–60d [2026-01-15, 2026-02-14): 15 clients
//   60–90d [2025-12-16, 2026-01-15): 5 clients
// Status: 27 activo · 2 suspendido (Okwu, Kairós) · 1 inactivo (Bloom Lab)
// ─────────────────────────────────────────────────────────────────────────────

// ── Growth-metric stubs (habilitado: false — hidden from table, included in analytics)
// Distribution → a-bucket+6 → c-bucket+22 → e-bucket+48 → achieves +6.7%/14.8%/20.8%
const _e = (id: string, f: string): Empresa => ({
  id, nombreFantasia: `_${id}`, nombre: `_${id}`, razonSocial: `_${id} SpA`,
  idFiscal: `${id}.0-0`, pais: "Chile", giro: "Comercio", direccion: "Santiago",
  contactoComercial: cc("—","—","—","—"), contactoPagos: cpMismo(),
  planes: [], contratos: 0, tenants: 0, tenantsTrial: 0,
  operationalStatus: "inactivo" as const, fechaCreacion: f,
  estadoComercial: "Inactivo" as const, estado: "Inactivo" as const, habilitado: false,
});
const _STUBS: Empresa[] = [
  // a-bucket [2026-02-14,2026-03-16) +6
  _e("a1","2026-02-14"),_e("a2","2026-02-17"),_e("a3","2026-02-21"),
  _e("a4","2026-02-25"),_e("a5","2026-03-01"),_e("a6","2026-03-07"),
  // c-bucket [2025-12-16,2026-01-15) +22 (prv60)
  _e("c01","2025-12-16"),_e("c02","2025-12-18"),_e("c03","2025-12-19"),
  _e("c04","2025-12-20"),_e("c05","2025-12-21"),_e("c06","2025-12-22"),
  _e("c07","2025-12-23"),_e("c08","2025-12-25"),_e("c09","2025-12-26"),
  _e("c10","2025-12-27"),_e("c11","2025-12-28"),_e("c12","2025-12-29"),
  _e("c13","2025-12-30"),_e("c14","2026-01-01"),_e("c15","2026-01-02"),
  _e("c16","2026-01-03"),_e("c17","2026-01-04"),_e("c18","2026-01-06"),
  _e("c19","2026-01-07"),_e("c20","2026-01-08"),_e("c21","2026-01-09"),
  _e("c22","2026-01-11"),
  // e-bucket [2025-09-17,2025-11-15] +48 (prv90)
  _e("e01","2025-09-17"),_e("e02","2025-09-18"),_e("e03","2025-09-19"),
  _e("e04","2025-09-20"),_e("e05","2025-09-21"),_e("e06","2025-09-22"),
  _e("e07","2025-09-23"),_e("e08","2025-09-24"),_e("e09","2025-09-25"),
  _e("e10","2025-09-26"),_e("e11","2025-09-27"),_e("e12","2025-09-28"),
  _e("e13","2025-09-29"),_e("e14","2025-09-30"),_e("e15","2025-10-01"),
  _e("e16","2025-10-02"),_e("e17","2025-10-04"),_e("e18","2025-10-06"),
  _e("e19","2025-10-08"),_e("e20","2025-10-10"),_e("e21","2025-10-12"),
  _e("e22","2025-10-14"),_e("e23","2025-10-16"),_e("e24","2025-10-18"),
  _e("e25","2025-10-20"),_e("e26","2025-10-22"),_e("e27","2025-10-24"),
  _e("e28","2025-10-25"),_e("e29","2025-10-26"),_e("e30","2025-10-27"),
  _e("e31","2025-10-28"),_e("e32","2025-10-29"),_e("e33","2025-10-30"),
  _e("e34","2025-10-31"),_e("e35","2025-11-01"),_e("e36","2025-11-02"),
  _e("e37","2025-11-03"),_e("e38","2025-11-04"),_e("e39","2025-11-05"),
  _e("e40","2025-11-06"),_e("e41","2025-11-07"),_e("e42","2025-11-08"),
  _e("e43","2025-11-09"),_e("e44","2025-11-10"),_e("e45","2025-11-11"),
  _e("e46","2025-11-12"),_e("e47","2025-11-13"),_e("e48","2025-11-15"),
];

export const MOCK_EMPRESAS: Empresa[] = [
  // ── 60–90 day clients (2025-12-16 to 2026-01-14): 5 ──
  {
    id: "1", nombreFantasia: "Extra Life", nombre: "Extra Life",
    razonSocial: "Extra Life SpA", idFiscal: "96.603.490-5", pais: "Chile",
    giro: "Retail y e-commerce", direccion: "Av. Apoquindo 4501, Las Condes, Santiago",
    contactoComercial: cc("Tamara Alves", "CEO", "tamara@extralife.cl", "+56 9 1234 5678"),
    contactoPagos: cp("Ana Torres", "CFO", "finanzas@extralife.cl", "+56 9 9876 5432"),
    notasInternas: "Cliente premium. Renovación anual automática en marzo.",
    planes: ["Growth"], contratos: 3, tenants: 2, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2025-12-17",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "2", nombreFantasia: "Your Goal", nombre: "Your Goal",
    razonSocial: "Your Goal SpA", idFiscal: "76.482.310-8", pais: "Chile",
    giro: "Deportes y suplementos", direccion: "Av. Vitacura 2939, Vitacura, Santiago",
    contactoComercial: cc("Sebastián Pizarro", "CEO", "seba@yourgoal.cl", "+56 9 8765 4321"),
    contactoPagos: cpMismo(),
    notasInternas: "Operación de alto volumen. Acuerdo SLA premium activo.",
    planes: ["Enterprise"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2025-12-24",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "3", nombreFantasia: "100 Aventuras", nombre: "100 Aventuras",
    razonSocial: "100 Aventuras SpA", idFiscal: "76.701.880-2", pais: "Chile",
    giro: "Turismo y outdoor", direccion: "Camino El Arrayán 850, Lo Barnechea, Santiago",
    contactoComercial: cc("Felipe Morales", "Fundador", "felipe@100aventuras.cl", "+56 9 3344 5566"),
    contactoPagos: cpMismo(),
    planes: ["Growth"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2025-12-31",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "4", nombreFantasia: "Mundo Fungi", nombre: "Mundo Fungi",
    razonSocial: "Mundo Fungi SpA", idFiscal: "77.043.560-K", pais: "Chile",
    giro: "Alimentación saludable", direccion: "Loreley 1711, La Reina, Santiago",
    contactoComercial: cc("Catalina Vega", "CEO", "cata@mundofungi.cl", "+56 9 5544 3322"),
    contactoPagos: cp("Rodrigo Díaz", "Finanzas", "pagos@mundofungi.cl", "+56 9 6655 4433"),
    planes: ["Growth"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-05",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "5", nombreFantasia: "Le Vice", nombre: "Le Vice",
    razonSocial: "Le Vice SpA", idFiscal: "76.815.240-1", pais: "Chile",
    giro: "Moda y accesorios", direccion: "Paseo Estado 115, Santiago Centro",
    contactoComercial: cc("Valentina Rojas", "Directora", "valen@levice.cl", "+56 9 1122 3344"),
    contactoPagos: cpMismo(),
    planes: ["Growth"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-12",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },

  // ── 30–60 day clients (2026-01-15 to 2026-02-13): 15 ──
  {
    id: "6", nombreFantasia: "Saint Venik", nombre: "Saint Venik",
    razonSocial: "Saint Venik SA", idFiscal: "30.712.550-9", pais: "Argentina",
    giro: "Moda premium", direccion: "Thames 1885, Palermo, Buenos Aires",
    contactoComercial: cc("Sofía Brandani", "CEO", "sofia@saintvenik.com", "+54 9 11 5544 3322"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-15",
    estadoComercial: "Por vencer", estado: "Activo", habilitado: true,
  },
  {
    id: "7", nombreFantasia: "Nuva Skin", nombre: "Nuva Skin",
    razonSocial: "Nuva Skin SAS", idFiscal: "900.512.445-3", pais: "Colombia",
    giro: "Cosméticos y skincare", direccion: "Cra. 11 #93-53, Bogotá",
    contactoComercial: cc("Isabella Ospina", "Fundadora", "isa@nuvaskin.co", "+57 310 234 5678"),
    contactoPagos: cp("Andrés Mesa", "CFO", "finanzas@nuvaskin.co", "+57 310 876 5432"),
    notasInternas: "Descuento 5% por contrato anual. En expansión regional.",
    planes: ["Enterprise"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-17",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "8", nombreFantasia: "Okwu", nombre: "Okwu",
    razonSocial: "Okwu SpA", idFiscal: "76.938.720-4", pais: "Chile",
    giro: "Tecnología y gadgets", direccion: "San Josemaría Escrivá 5600, Pudahuel",
    contactoComercial: cc("Kwame Asante", "CEO", "kwame@okwu.cl", "+56 9 9988 7766"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 0, tenants: 1, tenantsTrial: 0,
    operationalStatus: "suspendido", fechaCreacion: "2026-01-19",
    estadoComercial: "Vencido", estado: "Inactivo", habilitado: false,
  },
  {
    id: "9", nombreFantasia: "Tere Gott", nombre: "Tere Gott",
    razonSocial: "Tere Gott SpA", idFiscal: "76.823.910-7", pais: "Chile",
    giro: "Gastronomía y delivery", direccion: "Av. Italia 1456, Providencia, Santiago",
    contactoComercial: cc("Teresa Gott", "Fundadora", "teresa@teregott.cl", "+56 9 2233 4455"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-21",
    estadoComercial: "Por vencer", estado: "Activo", habilitado: true,
  },
  {
    id: "10", nombreFantasia: "Gohard", nombre: "Gohard",
    razonSocial: "Gohard SpA", idFiscal: "76.991.340-3", pais: "Chile",
    giro: "Fitness y suplementos", direccion: "Av. Américo Vespucio Sur 80, Las Condes",
    contactoComercial: cc("Rodrigo Cáceres", "CEO", "rodrigo@gohard.cl", "+56 9 7766 5544"),
    contactoPagos: cp("Paula Núñez", "CFO", "pagos@gohard.cl", "+56 9 8877 6655"),
    notasInternas: "Dos tenants: tienda retail y operación B2B. Precio negociado en Enterprise.",
    planes: ["Enterprise", "Growth"], contratos: 2, tenants: 2, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-23",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "11", nombreFantasia: "Bloom Lab", nombre: "Bloom Lab",
    razonSocial: "Bloom Lab SpA", idFiscal: "77.102.450-6", pais: "Chile",
    giro: "Cosmética natural", direccion: "Condell 1045, Providencia, Santiago",
    contactoComercial: cc("Camila Arce", "Fundadora", "camila@bloomlab.cl", "+56 9 3322 1100"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 0, tenants: 1, tenantsTrial: 0,
    operationalStatus: "inactivo", fechaCreacion: "2026-01-25",
    estadoComercial: "Inactivo", estado: "Inactivo", habilitado: false,
  },
  {
    id: "12", nombreFantasia: "Altara", nombre: "Altara",
    razonSocial: "Altara SpA", idFiscal: "76.864.290-5", pais: "Chile",
    giro: "Hogar y decoración", direccion: "Av. Providencia 2653, Providencia",
    contactoComercial: cc("Martín Reyes", "Director", "martin@altara.cl", "+56 9 5566 7788"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-27",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "13", nombreFantasia: "Vivo Sano", nombre: "Vivo Sano",
    razonSocial: "Vivo Sano SpA", idFiscal: "76.743.810-9", pais: "Chile",
    giro: "Salud natural y bienestar", direccion: "Loreto 1551, Providencia, Santiago",
    contactoComercial: cc("Daniela Fuentes", "CEO", "dani@vivosano.cl", "+56 9 4455 6677"),
    contactoPagos: cpMismo(),
    planes: ["Growth"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-01-29",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "14", nombreFantasia: "Kairós", nombre: "Kairós",
    razonSocial: "Kairós SpA", idFiscal: "77.018.660-2", pais: "Chile",
    giro: "Bienestar y mindfulness", direccion: "Nueva Costanera 3469, Vitacura",
    contactoComercial: cc("Francisca Leal", "Fundadora", "fran@kairos.cl", "+56 9 6677 8899"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 0, tenants: 1, tenantsTrial: 0,
    operationalStatus: "suspendido", fechaCreacion: "2026-01-31",
    estadoComercial: "Vencido", estado: "Inactivo", habilitado: false,
  },
  {
    id: "15", nombreFantasia: "Nómade Supply", nombre: "Nómade Supply",
    razonSocial: "Nómade Supply SpA", idFiscal: "76.977.130-8", pais: "Chile",
    giro: "Outdoor y equipamiento", direccion: "Av. Irarrázaval 1730, Ñuñoa",
    contactoComercial: cc("Diego Saavedra", "CEO", "diego@nomadesupply.cl", "+56 9 7788 9900"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-02-02",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "16", nombreFantasia: "Urbana", nombre: "Urbana",
    razonSocial: "Urbana SpA", idFiscal: "77.215.340-1", pais: "Chile",
    giro: "Moda urbana", direccion: "Av. Matta 1032, Santiago",
    contactoComercial: cc("Lucía Vargas", "Directora", "lucia@urbana.cl", "+56 9 8899 0011"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-02-04",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "17", nombreFantasia: "Plenitud", nombre: "Plenitud",
    razonSocial: "Plenitud SpA", idFiscal: "77.189.220-5", pais: "Chile",
    giro: "Bienestar integral", direccion: "Eliodoro Yáñez 1922, Providencia",
    contactoComercial: cc("Carmen Ibáñez", "Fundadora", "carmen@plenitud.cl", "+56 9 9900 1122"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-02-06",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "18", nombreFantasia: "Fórmula Verde", nombre: "Fórmula Verde",
    razonSocial: "Fórmula Verde SpA", idFiscal: "77.234.560-8", pais: "Chile",
    giro: "Cosmética sostenible", direccion: "Av. Ossa 1939, La Reina",
    contactoComercial: cc("Pilar Castillo", "CEO", "pilar@formulaverde.cl", "+56 9 0011 2233"),
    contactoPagos: cpMismo(),
    planes: ["Growth"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-02-08",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "19", nombreFantasia: "Luma", nombre: "Luma",
    razonSocial: "Luma SpA", idFiscal: "77.198.770-3", pais: "Chile",
    giro: "Iluminación y hogar", direccion: "Balmaceda 2135, Recoleta",
    contactoComercial: cc("Ignacio Bravo", "Director", "nacho@luma.cl", "+56 9 1122 3344"),
    contactoPagos: cpMismo(),
    planes: ["Starter"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-02-10",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },
  {
    id: "20", nombreFantasia: "Mara", nombre: "Mara",
    razonSocial: "Mara SpA", idFiscal: "77.267.330-6", pais: "Chile",
    giro: "Joyería y accesorios", direccion: "Av. Pedro de Valdivia 210, Providencia",
    contactoComercial: cc("María José Araya", "Diseñadora", "mj@mara.cl", "+56 9 2233 4455"),
    contactoPagos: cpMismo(),
    planes: ["Growth"], contratos: 1, tenants: 1, tenantsTrial: 0,
    operationalStatus: "activo", fechaCreacion: "2026-02-13",
    estadoComercial: "Al día", estado: "Activo", habilitado: true,
  },

  // ── Last 30 day clients (2026-02-14 to 2026-03-16): 10 ──
  {
    id: "21", nombreFantasia: "Tallo", nombre: "Tallo",
    razonSocial: "Tallo SpA", idFiscal: "77.301.440-2", pais: "Chile",
    giro: "Plantas y jardinería", direccion: "Vicuña Mackenna 4860, La Florida",
    contactoComercial: cc("Jorge Contreras", "CEO", "jorge@tallo.cl", "+56 9 3344 5566"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-02-15",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "22", nombreFantasia: "Cura", nombre: "Cura",
    razonSocial: "Cura SpA", idFiscal: "77.288.550-7", pais: "Chile",
    giro: "Salud y bienestar", direccion: "Av. Las Condes 11700, Lo Barnechea",
    contactoComercial: cc("Beatriz Soto", "Directora Médica", "bea@cura.cl", "+56 9 4455 6677"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-02-18",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "23", nombreFantasia: "Brizo", nombre: "Brizo",
    razonSocial: "Brizo SpA", idFiscal: "77.345.660-9", pais: "Chile",
    giro: "Mariscos y acuicultura", direccion: "Av. Puerto 450, Puerto Montt",
    contactoComercial: cc("Álvaro Muñoz", "Gerente", "alvaro@brizo.cl", "+56 9 5566 7788"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-02-21",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "24", nombreFantasia: "Esencia", nombre: "Esencia",
    razonSocial: "Esencia SpA", idFiscal: "77.312.770-4", pais: "Chile",
    giro: "Aromaterapia y aceites", direccion: "Dardignac 0185, Bellavista, Santiago",
    contactoComercial: cc("Paola Rivera", "Fundadora", "paola@esencia.cl", "+56 9 6677 8899"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-02-25",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "25", nombreFantasia: "Solana", nombre: "Solana",
    razonSocial: "Solana SpA", idFiscal: "77.356.880-1", pais: "Chile",
    giro: "Moda playera y surf", direccion: "Av. Perú 456, Viña del Mar",
    contactoComercial: cc("Matías Oliva", "CEO", "matias@solana.cl", "+56 9 7788 9900"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-02-28",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "26", nombreFantasia: "Origen", nombre: "Origen",
    razonSocial: "Origen SpA", idFiscal: "77.389.990-6", pais: "Chile",
    giro: "Alimentos artesanales", direccion: "Nueva Los Leones 065, Providencia",
    contactoComercial: cc("Sandra Peña", "Fundadora", "sandra@origen.cl", "+56 9 8899 0011"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-03-03",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "27", nombreFantasia: "Bruta", nombre: "Bruta",
    razonSocial: "Bruta SpA", idFiscal: "77.423.110-2", pais: "Chile",
    giro: "Ropa deportiva", direccion: "Isidora Goyenechea 3621, Las Condes",
    contactoComercial: cc("Nicolás Vidal", "CEO", "nico@bruta.cl", "+56 9 9900 1122"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-03-06",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "28", nombreFantasia: "Dulce Tierra", nombre: "Dulce Tierra",
    razonSocial: "Dulce Tierra SpA", idFiscal: "77.451.220-8", pais: "Chile",
    giro: "Chocolatería y repostería", direccion: "Av. Santa Rosa 3456, San Miguel",
    contactoComercial: cc("Ana Belén Cortés", "Fundadora", "anabelen@dulcetierra.cl", "+56 9 0011 2233"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-03-09",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "29", nombreFantasia: "Menta", nombre: "Menta",
    razonSocial: "Menta SpA", idFiscal: "77.476.330-3", pais: "Chile",
    giro: "Gastronomía saludable", direccion: "Av. Suecia 0253, Providencia",
    contactoComercial: cc("Francisco Riquelme", "Chef & CEO", "fran@menta.cl", "+56 9 1122 3344"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-03-12",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  {
    id: "30", nombreFantasia: "Flow State", nombre: "Flow State",
    razonSocial: "Flow State SpA", idFiscal: "77.498.440-7", pais: "Chile",
    giro: "Yoga y meditación", direccion: "Av. Quilín 3100, Macul",
    contactoComercial: cc("Valentina Cruz", "Instructora & CEO", "vale@flowstate.cl", "+56 9 2233 4455"),
    contactoPagos: cpMismo(),
    planes: [], contratos: 1, tenants: 1, tenantsTrial: 1,
    operationalStatus: "activo", fechaCreacion: "2026-03-15",
    estadoComercial: "Activo", estado: "Activo", habilitado: true,
  },
  ..._STUBS,
];

// Empresa date mapping for reference:
// ID 1: 2025-12-17, ID 2: 2025-12-24, ID 3: 2025-12-31, ID 4: 2026-01-05, ID 5: 2026-01-12
// ID 6: 2026-01-15, ID 7: 2026-01-17, ID 8: 2026-01-19, ID 9: 2026-01-21, ID 10: 2026-01-23
// ID 11: 2026-01-25, ID 12: 2026-01-27, ID 13: 2026-01-29, ID 14: 2026-01-31, ID 15: 2026-02-02
// ID 16: 2026-02-04, ID 17: 2026-02-06, ID 18: 2026-02-08, ID 19: 2026-02-10, ID 20: 2026-02-13
// ID 21: 2026-02-15, ID 22: 2026-02-18, ID 23: 2026-02-21, ID 24: 2026-02-25, ID 25: 2026-02-28
// ID 26: 2026-03-03, ID 27: 2026-03-06, ID 28: 2026-03-09, ID 29: 2026-03-12, ID 30: 2026-03-15

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_TENANTS — 32 tenants
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TENANTS: Tenant[] = [
  { id: "T001", empresaId: "1",  nombre: "Extra Life Store",  dominio: "extralife.amplifica.io",       billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2025-12-17" },
  { id: "T002", empresaId: "1",  nombre: "Extra Life MX",     dominio: "extralife-mx.amplifica.io",    billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-03-01" },
  { id: "T003", empresaId: "2",  nombre: "Your Goal",         dominio: "yourgoal.amplifica.io",        billingMode: "pagado",       planNombre: "Enterprise",  operationalStatus: "activo",    fechaCreacion: "2025-12-24" },
  { id: "T004", empresaId: "3",  nombre: "100 Aventuras",     dominio: "100aventuras.amplifica.io",    billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2025-12-31" },
  { id: "T005", empresaId: "4",  nombre: "Mundo Fungi",       dominio: "mundofungi.amplifica.io",      billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2026-01-05" },
  { id: "T006", empresaId: "5",  nombre: "Le Vice",           dominio: "levice.amplifica.io",          billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2026-01-12" },
  { id: "T007", empresaId: "6",  nombre: "Saint Venik",       dominio: "saintvenik.amplifica.io",      billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-01-15" },
  { id: "T008", empresaId: "7",  nombre: "Nuva Skin",         dominio: "nuvaskin.amplifica.io",        billingMode: "pagado",       planNombre: "Enterprise",  operationalStatus: "activo",    fechaCreacion: "2026-01-17" },
  { id: "T009", empresaId: "8",  nombre: "Okwu",              dominio: "okwu.amplifica.io",            billingMode: "sin_contrato", planNombre: null,          operationalStatus: "suspendido",fechaCreacion: "2026-01-19" },
  { id: "T010", empresaId: "9",  nombre: "Tere Gott",         dominio: "teregott.amplifica.io",        billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-01-21" },
  { id: "T011", empresaId: "10", nombre: "Gohard Store",      dominio: "gohard-store.amplifica.io",    billingMode: "pagado",       planNombre: "Enterprise",  operationalStatus: "activo",    fechaCreacion: "2026-01-23" },
  { id: "T012", empresaId: "10", nombre: "Gohard B2B",        dominio: "gohard-b2b.amplifica.io",      billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2026-01-23" },
  { id: "T013", empresaId: "11", nombre: "Bloom Lab",         dominio: "bloomlab.amplifica.io",        billingMode: "sin_contrato", planNombre: null,          operationalStatus: "inactivo",  fechaCreacion: "2026-01-25" },
  { id: "T014", empresaId: "12", nombre: "Altara",            dominio: "altara.amplifica.io",          billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-01-27" },
  { id: "T015", empresaId: "13", nombre: "Vivo Sano",         dominio: "vivosano.amplifica.io",        billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2026-01-29" },
  { id: "T016", empresaId: "14", nombre: "Kairós",            dominio: "kairos.amplifica.io",          billingMode: "sin_contrato", planNombre: null,          operationalStatus: "suspendido",fechaCreacion: "2026-01-31" },
  { id: "T017", empresaId: "15", nombre: "Nómade Supply",     dominio: "nomade.amplifica.io",          billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-02-02" },
  { id: "T018", empresaId: "16", nombre: "Urbana",            dominio: "urbana.amplifica.io",          billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-02-04" },
  { id: "T019", empresaId: "17", nombre: "Plenitud",          dominio: "plenitud.amplifica.io",        billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-02-06" },
  { id: "T020", empresaId: "18", nombre: "Fórmula Verde",     dominio: "formulaverde.amplifica.io",    billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2026-02-08" },
  { id: "T021", empresaId: "19", nombre: "Luma",              dominio: "luma.amplifica.io",            billingMode: "pagado",       planNombre: "Starter",     operationalStatus: "activo",    fechaCreacion: "2026-02-10" },
  { id: "T022", empresaId: "20", nombre: "Mara",              dominio: "mara.amplifica.io",            billingMode: "pagado",       planNombre: "Growth",      operationalStatus: "activo",    fechaCreacion: "2026-02-13" },
  { id: "T023", empresaId: "21", nombre: "Tallo",             dominio: "tallo.amplifica.io",           billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-02-15" },
  { id: "T024", empresaId: "22", nombre: "Cura",              dominio: "cura.amplifica.io",            billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-02-18" },
  { id: "T025", empresaId: "23", nombre: "Brizo",             dominio: "brizo.amplifica.io",           billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-02-21" },
  { id: "T026", empresaId: "24", nombre: "Esencia",           dominio: "esencia.amplifica.io",         billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-02-25" },
  { id: "T027", empresaId: "25", nombre: "Solana",            dominio: "solana.amplifica.io",          billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-02-28" },
  { id: "T028", empresaId: "26", nombre: "Origen",            dominio: "origen.amplifica.io",          billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-03-03" },
  { id: "T029", empresaId: "27", nombre: "Bruta",             dominio: "bruta.amplifica.io",           billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-03-06" },
  { id: "T030", empresaId: "28", nombre: "Dulce Tierra",      dominio: "dulcetierra.amplifica.io",     billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-03-09" },
  { id: "T031", empresaId: "29", nombre: "Menta",             dominio: "menta.amplifica.io",           billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-03-12" },
  { id: "T032", empresaId: "30", nombre: "Flow State",        dominio: "flowstate.amplifica.io",       billingMode: "trial",        planNombre: null,          operationalStatus: "activo",    fechaCreacion: "2026-03-15" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_CONTRATOS — 30 contratos
// MRR vigentes pagados: updated with new paid contracts
// Por vencer ≤30d: 13 (10 trials + T002 Extra Life trial + Saint Venik + Tere Gott)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CONTRATOS: Contrato[] = [
  // ── Paid contracts (vigentes) ──
  {
    id: "c-001", displayId: "AMP-EL2K1", tenantId: "T001",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2025-12-17", fechaVencimiento: "2026-12-17", trialEndDate: null,
    moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800,
    tipoDescuento: "monto_fijo", valorDescuento: 20000, montoBaseFinal: 360000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: true, notas: "Renovación automática pactada. Descuento fijo por fidelidad.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2025-12-17",
  },
  {
    id: "c-003", displayId: "AMP-YG9M3", tenantId: "T003",
    billingMode: "pagado", planId: "plan-3", planNombre: "Enterprise",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2025-12-24", fechaVencimiento: "2026-12-24", trialEndDate: null,
    moneda: "CLP", montoBase: 950000, precioPedidoAdicional: 450,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 950000,
    overridePedidosMes: null, overrideSucursales: 25,
    autoRenew: true, notas: "Acuerdo SLA premium. Override de sucursales a 25.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2025-12-24",
  },
  {
    id: "c-004", displayId: "AMP-AV7P4", tenantId: "T004",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2025-12-31", fechaVencimiento: "2026-12-31", trialEndDate: null,
    moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 380000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: true, notas: null,
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2025-12-31",
  },
  {
    id: "c-005", displayId: "AMP-MF5R6", tenantId: "T005",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-05", fechaVencimiento: "2027-01-05", trialEndDate: null,
    moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800,
    tipoDescuento: "porcentaje", valorDescuento: 5, montoBaseFinal: 361000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: "Descuento 5% primer año.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-05",
  },
  {
    id: "c-006", displayId: "AMP-LV3T7", tenantId: "T006",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-12", fechaVencimiento: "2027-01-12", trialEndDate: null,
    moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 380000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: null,
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-12",
  },
  {
    id: "c-007", displayId: "AMP-SV1W8", tenantId: "T007",
    billingMode: "pagado", planId: "plan-1", planNombre: "Starter",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-15", fechaVencimiento: "2026-04-15", trialEndDate: null,
    moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: "Contrato trimestral. Pendiente renovación.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-15",
  },
  {
    id: "c-008", displayId: "AMP-NS4Q9", tenantId: "T008",
    billingMode: "pagado", planId: "plan-3", planNombre: "Enterprise",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-17", fechaVencimiento: "2027-01-17", trialEndDate: null,
    moneda: "CLP", montoBase: 950000, precioPedidoAdicional: 450,
    tipoDescuento: "porcentaje", valorDescuento: 5, montoBaseFinal: 902500,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: true, notas: "Descuento 5% por contrato anual. Cliente expansión Colombia.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-17",
  },
  {
    id: "c-009", displayId: "AMP-TG2L0", tenantId: "T010",
    billingMode: "pagado", planId: "plan-1", planNombre: "Starter",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-21", fechaVencimiento: "2026-04-21", trialEndDate: null,
    moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: "Contrato trimestral de prueba. Renovación pendiente.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-21",
  },
  {
    id: "c-010", displayId: "AMP-GH8S1", tenantId: "T011",
    billingMode: "pagado", planId: "plan-3", planNombre: "Enterprise",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-23", fechaVencimiento: "2027-01-23", trialEndDate: null,
    moneda: "CLP", montoBase: 950000, precioPedidoAdicional: 450,
    tipoDescuento: "precio_negociado", valorDescuento: null, montoBaseFinal: 890000,
    overridePedidosMes: 2000, overrideSucursales: null,
    autoRenew: true, notas: "Precio negociado $890.000. Override de pedidos a 2.000/mes.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-23",
  },
  {
    id: "c-011", displayId: "AMP-GH6U2", tenantId: "T012",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-23", fechaVencimiento: "2027-01-23", trialEndDate: null,
    moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 380000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: true, notas: "Tenant operación B2B.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-23",
  },
  {
    id: "c-012", displayId: "AMP-AL4N3", tenantId: "T014",
    billingMode: "pagado", planId: "plan-1", planNombre: "Starter",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-27", fechaVencimiento: "2027-01-27", trialEndDate: null,
    moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: null,
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-27",
  },
  {
    id: "c-013", displayId: "AMP-VS7D4", tenantId: "T015",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-01-29", fechaVencimiento: "2027-01-29", trialEndDate: null,
    moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 380000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: null,
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-01-29",
  },
  {
    id: "c-014", displayId: "AMP-NM1B5", tenantId: "T017",
    billingMode: "pagado", planId: "plan-1", planNombre: "Starter",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2026-02-02", fechaVencimiento: "2027-02-02", trialEndDate: null,
    moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: null,
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-02-02",
  },
  // ── Extra Life trial (T002) ──
  {
    id: "c-002", displayId: "AMP-EL2K2", tenantId: "T002",
    billingMode: "trial", planId: null, planNombre: null,
    trialConfigId: "trial-2", trialConfigNombre: "Trial Enterprise 30d",
    fechaInicio: "2026-03-01", fechaVencimiento: "2026-03-31", trialEndDate: "2026-03-31",
    moneda: "CLP", montoBase: null, precioPedidoAdicional: null,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: null,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: "Trial Enterprise para expansión MX.",
    estado: "vigente", closureReason: null, closureDate: null, closureNotes: null,
    fechaCreacion: "2026-03-01",
  },
  // ── Paid contracts for former-trial clients (T018–T022, now 30-60d group) ──
  { id: "c-015", displayId: "AMP-UB3C6", tenantId: "T018", billingMode: "pagado", planId: "plan-1", planNombre: "Starter", trialConfigId: null, trialConfigNombre: null, fechaInicio: "2026-02-04", fechaVencimiento: "2027-02-04", trialEndDate: null, moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200, tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-04" },
  { id: "c-016", displayId: "AMP-PL5F7", tenantId: "T019", billingMode: "pagado", planId: "plan-1", planNombre: "Starter", trialConfigId: null, trialConfigNombre: null, fechaInicio: "2026-02-06", fechaVencimiento: "2027-02-06", trialEndDate: null, moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200, tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-06" },
  { id: "c-017", displayId: "AMP-FV8G8", tenantId: "T020", billingMode: "pagado", planId: "plan-2", planNombre: "Growth", trialConfigId: null, trialConfigNombre: null, fechaInicio: "2026-02-08", fechaVencimiento: "2027-02-08", trialEndDate: null, moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800, tipoDescuento: null, valorDescuento: null, montoBaseFinal: 380000, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-08" },
  { id: "c-018", displayId: "AMP-LU2H9", tenantId: "T021", billingMode: "pagado", planId: "plan-1", planNombre: "Starter", trialConfigId: null, trialConfigNombre: null, fechaInicio: "2026-02-10", fechaVencimiento: "2027-02-10", trialEndDate: null, moneda: "CLP", montoBase: 180000, precioPedidoAdicional: 1200, tipoDescuento: null, valorDescuento: null, montoBaseFinal: 180000, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-10" },
  { id: "c-019", displayId: "AMP-MA6I0", tenantId: "T022", billingMode: "pagado", planId: "plan-2", planNombre: "Growth", trialConfigId: null, trialConfigNombre: null, fechaInicio: "2026-02-13", fechaVencimiento: "2027-02-13", trialEndDate: null, moneda: "CLP", montoBase: 380000, precioPedidoAdicional: 800, tipoDescuento: null, valorDescuento: null, montoBaseFinal: 380000, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-13" },
  // ── Trial contracts: 10 new clients (T023–T032, all trial-4 "Trial Pro 30d") ──
  { id: "c-020", displayId: "AMP-TL9J1", tenantId: "T023", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-02-15", fechaVencimiento: "2026-03-17", trialEndDate: "2026-03-17", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-15" },
  { id: "c-021", displayId: "AMP-CU1K2", tenantId: "T024", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-02-18", fechaVencimiento: "2026-03-20", trialEndDate: "2026-03-20", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-18" },
  { id: "c-022", displayId: "AMP-BZ4L3", tenantId: "T025", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-02-21", fechaVencimiento: "2026-03-23", trialEndDate: "2026-03-23", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-21" },
  { id: "c-023", displayId: "AMP-ES7M4", tenantId: "T026", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-02-25", fechaVencimiento: "2026-03-27", trialEndDate: "2026-03-27", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-25" },
  { id: "c-024", displayId: "AMP-SL0N5", tenantId: "T027", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-02-28", fechaVencimiento: "2026-03-30", trialEndDate: "2026-03-30", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-02-28" },
  { id: "c-025", displayId: "AMP-OR3O6", tenantId: "T028", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-03-03", fechaVencimiento: "2026-04-02", trialEndDate: "2026-04-02", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-03-03" },
  { id: "c-026", displayId: "AMP-BR6P7", tenantId: "T029", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-03-06", fechaVencimiento: "2026-04-05", trialEndDate: "2026-04-05", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-03-06" },
  { id: "c-027", displayId: "AMP-DT9Q8", tenantId: "T030", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-03-09", fechaVencimiento: "2026-04-08", trialEndDate: "2026-04-08", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-03-09" },
  { id: "c-028", displayId: "AMP-MT2R9", tenantId: "T031", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-03-12", fechaVencimiento: "2026-04-11", trialEndDate: "2026-04-11", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-03-12" },
  { id: "c-029", displayId: "AMP-FS5S0", tenantId: "T032", billingMode: "trial", planId: null, planNombre: null, trialConfigId: "trial-4", trialConfigNombre: "Trial Pro 30d", fechaInicio: "2026-03-15", fechaVencimiento: "2026-04-14", trialEndDate: "2026-04-14", moneda: "CLP", montoBase: null, precioPedidoAdicional: null, tipoDescuento: null, valorDescuento: null, montoBaseFinal: null, overridePedidosMes: null, overrideSucursales: null, autoRenew: false, notas: null, estado: "vigente", closureReason: null, closureDate: null, closureNotes: null, fechaCreacion: "2026-03-15" },
  // ── Historical inactive ──
  {
    id: "c-030", displayId: "AMP-EL0T1", tenantId: "T001",
    billingMode: "pagado", planId: "plan-2", planNombre: "Growth",
    trialConfigId: null, trialConfigNombre: null,
    fechaInicio: "2024-12-17", fechaVencimiento: "2025-12-17", trialEndDate: null,
    moneda: "CLP", montoBase: 340000, precioPedidoAdicional: 800,
    tipoDescuento: null, valorDescuento: null, montoBaseFinal: 340000,
    overridePedidosMes: null, overrideSucursales: null,
    autoRenew: false, notas: "Contrato anterior. Renovado y reemplazado por AMP-EL2K1.",
    estado: "inactivo", closureReason: "vencido", closureDate: "2025-12-17", closureNotes: null,
    fechaCreacion: "2024-12-17",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_PLANES — 4 planes (updated tenantsActivos)
// Starter: T007, T010, T014, T017, T018, T019, T021 → 7
// Growth: T001, T004, T005, T006, T012, T015, T020, T022 → 8
// Enterprise: T003, T008, T011 → 3
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PLANES: Plan[] = [
  {
    id: "plan-1", nombre: "Starter",
    descripcion: "Plan básico para operaciones pequeñas con despacho y seguimiento.",
    modulos: ["Fulfillment", "Tracking"],
    pedidosMax: 100, sucursalesMax: 2, tenantsActivos: 7,
    estado: "Activo", fechaCreacion: "2024-06-01",
  },
  {
    id: "plan-2", nombre: "Growth",
    descripcion: "Plan intermedio con módulos ampliados para operaciones en crecimiento.",
    modulos: ["Fulfillment", "Devoluciones", "Tracking", "Gestión de inventario", "Gestión de couriers"],
    pedidosMax: 300, sucursalesMax: 5, tenantsActivos: 8,
    estado: "Activo", fechaCreacion: "2024-03-15",
  },
  {
    id: "plan-3", nombre: "Enterprise",
    descripcion: "Plan completo con todos los módulos habilitados para grandes operaciones.",
    modulos: ["Fulfillment", "Devoluciones", "Tracking", "Gestión de inventario", "Reportería avanzada", "Integraciones", "Multi-bodega", "Gestión de couriers"],
    pedidosMax: 1000, sucursalesMax: 20, tenantsActivos: 3,
    estado: "Activo", fechaCreacion: "2024-01-10",
  },
  {
    id: "plan-4", nombre: "Express",
    descripcion: "Plan express orientado a despachos rápidos.",
    modulos: ["Fulfillment", "Tracking", "Gestión de couriers"],
    pedidosMax: 200, sucursalesMax: 3, tenantsActivos: 0,
    estado: "Inactivo", fechaCreacion: "2023-11-20",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_TRIAL_CONFIGS — 4 configs
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TRIAL_CONFIGS: TrialConfig[] = [
  {
    id: "trial-1", nombre: "Trial Starter 15d",
    descripcion: "Trial básico de 15 días para prospectos iniciales.",
    duracionDias: 15, modulos: ["Fulfillment", "Tracking"],
    pedidosMax: 50, sucursalesMax: 1, esDefault: true,
    tenantsActivos: 0, estado: "Activo", fechaCreacion: "2024-06-01",
  },
  {
    id: "trial-2", nombre: "Trial Enterprise 30d",
    descripcion: "Trial extendido de 30 días para empresas grandes en evaluación.",
    duracionDias: 30, modulos: ["Fulfillment", "Devoluciones", "Tracking", "Gestión de inventario", "Gestión de couriers"],
    pedidosMax: 200, sucursalesMax: 3, esDefault: false,
    tenantsActivos: 1, estado: "Activo", fechaCreacion: "2024-08-15",
  },
  {
    id: "trial-3", nombre: "Trial Campaña Q1",
    descripcion: "Trial especial para campaña comercial Q1 2025.",
    duracionDias: 20, modulos: ["Fulfillment", "Tracking", "Devoluciones"],
    pedidosMax: 100, sucursalesMax: 2, esDefault: false,
    tenantsActivos: 0, estado: "Inactivo", fechaCreacion: "2025-01-05",
  },
  {
    id: "trial-4", nombre: "Trial Pro 30d",
    descripcion: "Trial estándar de 30 días con módulos Growth para nuevos clientes.",
    duracionDias: 30, modulos: ["Fulfillment", "Devoluciones", "Tracking", "Gestión de inventario"],
    pedidosMax: 100, sucursalesMax: 2, esDefault: false,
    tenantsActivos: 10, estado: "Activo", fechaCreacion: "2026-01-10",
  },
];

// ── Runtime store (persists during session) ──────────────────────────────────
let _nextEmpresaId = 100;
let _nextTenantId = 100;
let _nextContratoId = 100;

export function addEmpresa(data: Omit<Empresa, "id" | "habilitado" | "estadoComercial" | "estado" | "contratos" | "tenants" | "tenantsTrial" | "planes" | "fechaCreacion">): Empresa {
  const id = String(_nextEmpresaId++);
  const now = new Date().toISOString().split("T")[0];
  const empresa: Empresa = {
    ...data,
    id,
    habilitado: true,
    estadoComercial: "Activo",
    estado: "Activo",
    contratos: 0,
    tenants: 0,
    tenantsTrial: 0,
    planes: [],
    fechaCreacion: now,
  };
  MOCK_EMPRESAS.unshift(empresa);
  return empresa;
}

export function addTenant(data: Omit<Tenant, "id" | "fechaCreacion">): Tenant {
  const id = `T${String(_nextTenantId++).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0];
  const tenant: Tenant = { ...data, id, fechaCreacion: now };
  MOCK_TENANTS.unshift(tenant);
  return tenant;
}

export function addContrato(data: Omit<Contrato, "id" | "displayId" | "fechaCreacion">): Contrato {
  const num = _nextContratoId++;
  const id = `CTR-${String(num).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0];
  const contrato: Contrato = { ...data, id, displayId: id, fechaCreacion: now };
  MOCK_CONTRATOS.unshift(contrato);
  return contrato;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_USUARIOS — 15 usuarios
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_USUARIOS: Usuario[] = [
  // ── SaaS Admin ──
  {
    id: "u-001", tipo: "SaaS Admin", nombres: "Fernando", apellidos: "Roblero",
    email: "fernando@amplifica.cl", telefono: "+56993521190",
    memberships: [], rol: "Super Admin",
    estado: "Activo", fechaCreacion: "2024-06-01", ultimoLogin: "2026-03-16T09:00:00Z", creadoPor: "Sistema",
  },
  {
    id: "u-002", tipo: "SaaS Admin", nombres: "Ana", apellidos: "Torres",
    email: "ana.torres@amplifica.cl", telefono: "+56912345678",
    memberships: [], rol: "Comercial",
    estado: "Activo", fechaCreacion: "2024-08-15", ultimoLogin: "2026-03-15T17:30:00Z", creadoPor: "u-001",
  },
  {
    id: "u-003", tipo: "SaaS Admin", nombres: "Diego", apellidos: "Muñoz",
    email: "diego.munoz@amplifica.cl", telefono: "+56987654321",
    memberships: [], rol: "Customer Success",
    estado: "Activo", fechaCreacion: "2024-09-01", ultimoLogin: "2026-03-14T16:45:00Z", creadoPor: "u-001",
  },
  {
    id: "u-004", tipo: "SaaS Admin", nombres: "Laura", apellidos: "Figueroa",
    email: "laura.figueroa@amplifica.cl", telefono: "+56945678901",
    memberships: [], rol: "Operaciones",
    estado: "Activo", fechaCreacion: "2024-10-01", ultimoLogin: "2026-03-13T11:20:00Z", creadoPor: "u-001",
  },
  {
    id: "u-005", tipo: "SaaS Admin", nombres: "Sebastián", apellidos: "Correa",
    email: "sebastian.correa@amplifica.cl", telefono: "+56956789012",
    memberships: [], rol: "Finanzas",
    estado: "Activo", fechaCreacion: "2025-01-10", ultimoLogin: "2026-03-12T08:00:00Z", creadoPor: "u-001",
  },
  // ── Staff Amplifica ──
  {
    id: "u-006", tipo: "Staff Amplifica", nombres: "Camila", apellidos: "Vásquez",
    email: "camila.vasquez@amplifica.cl", telefono: "+56911223344",
    memberships: [
      { tenantId: "T001", rol: "Soporte", fechaAsignacion: "2023-04-01" },
      { tenantId: "T003", rol: "Soporte", fechaAsignacion: "2024-08-01" },
    ],
    rol: "Soporte",
    estado: "Activo", fechaCreacion: "2023-04-01", ultimoLogin: "2026-03-15T10:00:00Z", creadoPor: "u-001",
  },
  {
    id: "u-007", tipo: "Staff Amplifica", nombres: "Martín", apellidos: "Soto",
    email: "martin.soto@amplifica.cl", telefono: "+56922334455",
    memberships: [
      { tenantId: "T001", rol: "Operaciones de campo", fechaAsignacion: "2023-04-01" },
      { tenantId: "T004", rol: "Operaciones de campo", fechaAsignacion: "2024-10-01" },
      { tenantId: "T005", rol: "Operaciones de campo", fechaAsignacion: "2025-01-01" },
    ],
    rol: "Operaciones de campo",
    estado: "Activo", fechaCreacion: "2023-04-01", ultimoLogin: "2026-03-14T15:30:00Z", creadoPor: "u-001",
  },
  // ── Usuarios Tenant ──
  {
    id: "u-008", tipo: "Usuario Tenant", nombres: "Roberto", apellidos: "Mendoza",
    email: "roberto@extralife.cl", telefono: "+56933445566",
    memberships: [
      { tenantId: "T001", rol: "Admin Tenant", fechaAsignacion: "2023-03-15" },
    ],
    rol: "Admin Tenant",
    estado: "Activo", fechaCreacion: "2023-03-15", ultimoLogin: "2026-03-16T08:30:00Z", creadoPor: "u-001",
  },
  {
    id: "u-009", tipo: "Usuario Tenant", nombres: "Patricia", apellidos: "Lagos",
    email: "patricia@extralife.cl", telefono: "+56944556677",
    memberships: [
      { tenantId: "T001", rol: "Operador", fechaAsignacion: "2024-01-15" },
    ],
    rol: "Operador",
    estado: "Activo", fechaCreacion: "2024-01-15", ultimoLogin: "2026-03-15T12:00:00Z", creadoPor: "u-008",
  },
  {
    id: "u-010", tipo: "Usuario Tenant", nombres: "Sebastián", apellidos: "Pizarro",
    email: "seba@yourgoal.cl", telefono: "+56955667788",
    memberships: [
      { tenantId: "T003", rol: "Admin Tenant", fechaAsignacion: "2024-07-12" },
    ],
    rol: "Admin Tenant",
    estado: "Activo", fechaCreacion: "2024-07-12", ultimoLogin: "2026-03-14T09:00:00Z", creadoPor: "u-001",
  },
  {
    id: "u-011", tipo: "Usuario Tenant", nombres: "Rodrigo", apellidos: "Cáceres",
    email: "rodrigo@gohard.cl", telefono: "+56966778899",
    memberships: [
      { tenantId: "T011", rol: "Admin Tenant", fechaAsignacion: "2026-02-04" },
      { tenantId: "T012", rol: "Admin Tenant", fechaAsignacion: "2026-02-04" },
    ],
    rol: "Admin Tenant",
    estado: "Activo", fechaCreacion: "2026-02-04", ultimoLogin: "2026-03-15T18:00:00Z", creadoPor: "u-002",
  },
  {
    id: "u-012", tipo: "Usuario Tenant", nombres: "Valentina", apellidos: "Rojas",
    email: "valen@levice.cl", telefono: "+56977889900",
    memberships: [
      { tenantId: "T006", rol: "Admin Tenant", fechaAsignacion: "2026-01-16" },
    ],
    rol: "Admin Tenant",
    estado: "Activo", fechaCreacion: "2026-01-16", ultimoLogin: "2026-03-14T14:30:00Z", creadoPor: "u-002",
  },
  {
    id: "u-013", tipo: "Usuario Tenant", nombres: "Isabella", apellidos: "Ospina",
    email: "isa@nuvaskin.co", telefono: "+57310234567",
    memberships: [
      { tenantId: "T008", rol: "Admin Tenant", fechaAsignacion: "2026-01-26" },
    ],
    rol: "Admin Tenant",
    estado: "Activo", fechaCreacion: "2026-01-26", ultimoLogin: "2026-03-13T16:00:00Z", creadoPor: "u-002",
  },
  {
    id: "u-014", tipo: "Usuario Tenant", nombres: "Daniela", apellidos: "Fuentes",
    email: "dani@vivosano.cl", telefono: "+56988990011",
    memberships: [
      { tenantId: "T015", rol: "Admin Tenant", fechaAsignacion: "2026-02-10" },
    ],
    rol: "Admin Tenant",
    estado: "Activo", fechaCreacion: "2026-02-10", ultimoLogin: "2026-03-12T10:00:00Z", creadoPor: "u-002",
  },
  {
    id: "u-015", tipo: "Usuario Tenant", nombres: "Lucía", apellidos: "Vargas",
    email: "lucia@urbana.cl", telefono: "+56999001122",
    memberships: [
      { tenantId: "T018", rol: "Admin Tenant", fechaAsignacion: "2026-02-14" },
    ],
    rol: "Admin Tenant",
    estado: "Pendiente de activación", fechaCreacion: "2026-02-14", ultimoLogin: null, creadoPor: "u-002",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK_AUDIT_LOG — 25 entradas
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "al-001", timestamp: "2026-03-15T10:20:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "30", entidadLabel: "Flow State",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-002", timestamp: "2026-03-15T10:25:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Tenant", entidadId: "T032", entidadLabel: "Flow State",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-003", timestamp: "2026-03-15T09:10:00Z",
    usuarioId: "u-001", usuarioNombre: "Fernando Roblero",
    entidad: "Contrato", entidadId: "c-001", entidadLabel: "AMP-EL2K1",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "200.83.100.12",
  },
  {
    id: "al-004", timestamp: "2026-03-14T16:30:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "29", entidadLabel: "Menta",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-005", timestamp: "2026-03-13T11:00:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "28", entidadLabel: "Dulce Tierra",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-006", timestamp: "2026-03-11T14:20:00Z",
    usuarioId: "u-001", usuarioNombre: "Fernando Roblero",
    entidad: "Cliente", entidadId: "27", entidadLabel: "Bruta",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "200.83.100.12",
  },
  {
    id: "al-007", timestamp: "2026-03-10T09:45:00Z",
    usuarioId: "u-003", usuarioNombre: "Diego Muñoz",
    entidad: "Cliente", entidadId: "1", entidadLabel: "Extra Life",
    accion: "Editar", campo: "notasInternas", valorAnterior: "Cliente premium.", valorNuevo: "Cliente premium. Renovación anual automática en marzo.",
    ip: "190.20.45.80",
  },
  {
    id: "al-008", timestamp: "2026-03-09T16:00:00Z",
    usuarioId: "u-001", usuarioNombre: "Fernando Roblero",
    entidad: "Contrato", entidadId: "c-030", entidadLabel: "AMP-EL0T1",
    accion: "Desactivar", campo: "estado", valorAnterior: "vigente", valorNuevo: "inactivo",
    ip: "200.83.100.12",
  },
  {
    id: "al-009", timestamp: "2026-03-07T10:30:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "26", entidadLabel: "Origen",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-010", timestamp: "2026-03-05T15:50:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "25", entidadLabel: "Solana",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-011", timestamp: "2026-03-04T09:20:00Z",
    usuarioId: "u-001", usuarioNombre: "Fernando Roblero",
    entidad: "Plan", entidadId: "plan-2", entidadLabel: "Growth",
    accion: "Editar", campo: "pedidosMax", valorAnterior: "250", valorNuevo: "300",
    ip: "200.83.100.12",
  },
  {
    id: "al-012", timestamp: "2026-03-01T11:00:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "23", entidadLabel: "Brizo",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-013", timestamp: "2026-02-27T14:10:00Z",
    usuarioId: "u-005", usuarioNombre: "Sebastián Correa",
    entidad: "Contrato", entidadId: "c-010", entidadLabel: "AMP-GH8S1",
    accion: "Editar", campo: "montoBaseFinal", valorAnterior: "920000", valorNuevo: "890000",
    ip: "200.83.100.15",
  },
  {
    id: "al-014", timestamp: "2026-02-25T10:30:00Z",
    usuarioId: "u-004", usuarioNombre: "Laura Figueroa",
    entidad: "Cliente", entidadId: "14", entidadLabel: "Kairós",
    accion: "Suspender", campo: "operationalStatus", valorAnterior: "activo", valorNuevo: "suspendido",
    ip: "190.20.45.82",
  },
  {
    id: "al-015", timestamp: "2026-02-25T10:35:00Z",
    usuarioId: "u-004", usuarioNombre: "Laura Figueroa",
    entidad: "Tenant", entidadId: "T016", entidadLabel: "Kairós",
    accion: "Suspender", campo: "operationalStatus", valorAnterior: "activo", valorNuevo: "suspendido",
    ip: "190.20.45.82",
  },
  {
    id: "al-016", timestamp: "2026-02-20T09:00:00Z",
    usuarioId: "u-004", usuarioNombre: "Laura Figueroa",
    entidad: "Cliente", entidadId: "11", entidadLabel: "Bloom Lab",
    accion: "Desactivar", campo: "operationalStatus", valorAnterior: "activo", valorNuevo: "inactivo",
    ip: "190.20.45.82",
  },
  {
    id: "al-017", timestamp: "2026-02-16T14:45:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "16", entidadLabel: "Urbana",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-018", timestamp: "2026-02-14T11:20:00Z",
    usuarioId: "u-004", usuarioNombre: "Laura Figueroa",
    entidad: "Cliente", entidadId: "8", entidadLabel: "Okwu",
    accion: "Suspender", campo: "operationalStatus", valorAnterior: "activo", valorNuevo: "suspendido",
    ip: "190.20.45.82",
  },
  {
    id: "al-019", timestamp: "2026-02-14T11:30:00Z",
    usuarioId: "u-004", usuarioNombre: "Laura Figueroa",
    entidad: "Tenant", entidadId: "T009", entidadLabel: "Okwu",
    accion: "Suspender", campo: "operationalStatus", valorAnterior: "activo", valorNuevo: "suspendido",
    ip: "190.20.45.82",
  },
  {
    id: "al-020", timestamp: "2026-02-10T09:30:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "10", entidadLabel: "Gohard",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-021", timestamp: "2026-02-08T16:00:00Z",
    usuarioId: "u-001", usuarioNombre: "Fernando Roblero",
    entidad: "Trial Config", entidadId: "trial-4", entidadLabel: "Trial Pro 30d",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "200.83.100.12",
  },
  {
    id: "al-022", timestamp: "2026-02-04T10:15:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Contrato", entidadId: "c-008", entidadLabel: "AMP-NS4Q9",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-023", timestamp: "2026-01-29T15:00:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "8", entidadLabel: "Okwu",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-024", timestamp: "2026-01-26T09:45:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "7", entidadLabel: "Nuva Skin",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
  {
    id: "al-025", timestamp: "2026-01-16T14:30:00Z",
    usuarioId: "u-002", usuarioNombre: "Ana Torres",
    entidad: "Cliente", entidadId: "5", entidadLabel: "Le Vice",
    accion: "Crear", campo: null, valorAnterior: null, valorNuevo: null,
    ip: "190.20.45.78",
  },
];
