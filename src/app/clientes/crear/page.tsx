"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconMapPin, IconSearch, IconChevronDown, IconInfoCircle, IconUpload, IconX as IconXMark } from "@tabler/icons-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { addEmpresa } from "@/lib/mock-data";

const PAISES = ["Chile", "Colombia", "Perú", "Argentina", "México", "España", "Brasil", "Otro"];

/** Auto-format Chilean RUT: 12345678-9 → 12.345.678-9 */
function formatRut(raw: string): string {
  // Strip everything except digits and kK
  const clean = raw.replace(/[^0-9kK]/gi, "");
  if (!clean) return "";
  // Separate body from verifier digit
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!body) return dv;
  // Add dots to body from right
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

/* ── Country-specific fiscal & geo config ── */
interface PaisConfig {
  fiscalLabel: string;
  fiscalPlaceholder: string;
  fiscalRegex: RegExp;
  fiscalError: string;
  fiscalAutoFormat?: boolean;
  /** First geo level (e.g. Región, Departamento) */
  geo1Label: string;
  geo1Options: string[];
  /** Second geo level (e.g. Comuna, Municipio) — mapped from geo1 key */
  geo2Label: string;
  geo2Map: Record<string, string[]>;
}

const PAIS_CONFIG: Record<string, PaisConfig> = {
  Chile: {
    fiscalLabel: "RUT",
    fiscalPlaceholder: "12.345.678-9",
    fiscalRegex: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
    fiscalError: "Formato: 12.345.678-9",
    fiscalAutoFormat: true,
    geo1Label: "Región",
    geo1Options: ["Metropolitana", "Valparaíso", "Biobío", "Araucanía", "Los Lagos", "O'Higgins", "Maule", "Coquimbo", "Antofagasta", "Tarapacá", "Atacama", "Los Ríos", "Aysén", "Magallanes", "Arica y Parinacota", "Ñuble"],
    geo2Label: "Comuna",
    geo2Map: {
      Metropolitana: ["Santiago", "Providencia", "Las Condes", "Ñuñoa", "Vitacura", "La Florida", "Maipú", "Puente Alto", "San Bernardo", "Lo Barnechea"],
      Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Con Con"],
      Biobío: ["Concepción", "Talcahuano", "Los Ángeles", "Chillán", "Coronel"],
      Araucanía: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón"],
      "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Puerto Varas"],
    },
  },
  Colombia: {
    fiscalLabel: "NIT",
    fiscalPlaceholder: "900.123.456-7",
    fiscalRegex: /^\d{3}\.\d{3}\.\d{3}-\d$/,
    fiscalError: "Formato: 900.123.456-7",
    geo1Label: "Departamento",
    geo1Options: ["Bogotá D.C.", "Antioquia", "Valle del Cauca", "Atlántico", "Santander", "Cundinamarca", "Bolívar", "Nariño"],
    geo2Label: "Municipio",
    geo2Map: {
      "Bogotá D.C.": ["Bogotá"],
      Antioquia: ["Medellín", "Envigado", "Bello", "Itagüí", "Rionegro"],
      "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá"],
      Atlántico: ["Barranquilla", "Soledad", "Malambo"],
    },
  },
  Perú: {
    fiscalLabel: "RUC",
    fiscalPlaceholder: "20123456789",
    fiscalRegex: /^\d{11}$/,
    fiscalError: "Debe tener 11 dígitos",
    geo1Label: "Departamento",
    geo1Options: ["Lima", "Arequipa", "La Libertad", "Piura", "Cusco", "Lambayeque", "Junín", "Callao"],
    geo2Label: "Distrito",
    geo2Map: {
      Lima: ["Lima", "Miraflores", "San Isidro", "Surco", "San Borja", "Barranco", "La Molina"],
      Arequipa: ["Arequipa", "Cayma", "Cerro Colorado", "Yanahuara"],
      Cusco: ["Cusco", "San Jerónimo", "Santiago", "Wanchaq"],
    },
  },
  Argentina: {
    fiscalLabel: "CUIT",
    fiscalPlaceholder: "20-12345678-9",
    fiscalRegex: /^\d{2}-\d{8}-\d$/,
    fiscalError: "Formato: 20-12345678-9",
    geo1Label: "Provincia",
    geo1Options: ["Buenos Aires", "CABA", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Entre Ríos", "Salta"],
    geo2Label: "Localidad",
    geo2Map: {
      CABA: ["Palermo", "Recoleta", "Belgrano", "San Telmo", "Caballito", "Núñez"],
      "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Avellaneda"],
      Córdoba: ["Córdoba", "Villa Carlos Paz", "Río Cuarto"],
    },
  },
  México: {
    fiscalLabel: "RFC",
    fiscalPlaceholder: "XAXX010101000",
    fiscalRegex: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i,
    fiscalError: "Formato: 3-4 letras + 6 dígitos + 3 caracteres",
    geo1Label: "Estado",
    geo1Options: ["CDMX", "Jalisco", "Nuevo León", "Puebla", "Guanajuato", "Estado de México", "Querétaro", "Yucatán"],
    geo2Label: "Municipio",
    geo2Map: {
      CDMX: ["Cuauhtémoc", "Miguel Hidalgo", "Benito Juárez", "Álvaro Obregón", "Coyoacán"],
      Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"],
      "Nuevo León": ["Monterrey", "San Pedro Garza García", "Guadalupe", "Apodaca"],
    },
  },
  España: {
    fiscalLabel: "NIF/CIF",
    fiscalPlaceholder: "B12345678",
    fiscalRegex: /^[A-Z]\d{7}[A-Z0-9]$/i,
    fiscalError: "Formato: letra + 7 dígitos + dígito/letra",
    geo1Label: "Comunidad Autónoma",
    geo1Options: ["Madrid", "Cataluña", "Andalucía", "Valencia", "País Vasco", "Galicia", "Castilla y León", "Canarias"],
    geo2Label: "Provincia",
    geo2Map: {
      Madrid: ["Madrid"],
      Cataluña: ["Barcelona", "Tarragona", "Girona", "Lleida"],
      Andalucía: ["Sevilla", "Málaga", "Granada", "Córdoba", "Cádiz"],
      Valencia: ["Valencia", "Alicante", "Castellón"],
    },
  },
  Brasil: {
    fiscalLabel: "CNPJ",
    fiscalPlaceholder: "12.345.678/0001-90",
    fiscalRegex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    fiscalError: "Formato: 12.345.678/0001-90",
    geo1Label: "Estado",
    geo1Options: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná", "Rio Grande do Sul", "Santa Catarina", "Distrito Federal"],
    geo2Label: "Município",
    geo2Map: {
      "São Paulo": ["São Paulo", "Campinas", "Santos", "Guarulhos", "Osasco"],
      "Rio de Janeiro": ["Rio de Janeiro", "Niterói", "Petrópolis"],
      "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
    },
  },
  Otro: {
    fiscalLabel: "ID Fiscal",
    fiscalPlaceholder: "Número de identificación fiscal",
    fiscalRegex: /.{3,}/,
    fiscalError: "Mínimo 3 caracteres",
    geo1Label: "Región / Estado",
    geo1Options: [],
    geo2Label: "Ciudad",
    geo2Map: {},
  },
};

const EMPTY_CONTACTO = { nombre: "", cargo: "", correo: "", telefono: "" };

const EMPTY = {
  nombreFantasia: "",
  razonSocial: "",
  idFiscal: "",
  pais: "Chile",
  geo1: "",
  geo2: "",
  giro: "",
  direccion: "",
  contactoComercial: { ...EMPTY_CONTACTO },
  mismoQueComercial: true,
  contactoPagos: { ...EMPTY_CONTACTO },
  notasInternas: "",
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-neutral-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function selectClass(error?: boolean) {
  return `h-[44px] w-full rounded-lg border ${error ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-500 focus:ring-primary-100"} px-3 pr-8 text-base md:text-sm text-neutral-900 bg-white outline-none focus:ring-2 appearance-none`;
}

function SelectChevron() {
  return <IconChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />;
}

function textareaClass() {
  return "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-base md:text-sm text-neutral-900 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none";
}

/* ── Simulated address autocomplete ── */
const MOCK_ADDRESSES: Record<string, { address: string; detail: string }[]> = {
  Chile: [
    { address: "Av. Providencia 1234, Providencia", detail: "Región Metropolitana, Chile" },
    { address: "Av. Apoquindo 4500, Las Condes", detail: "Región Metropolitana, Chile" },
    { address: "Av. Libertador Bernardo O'Higgins 1449, Santiago", detail: "Región Metropolitana, Chile" },
    { address: "Av. Vicuña Mackenna 3456, Ñuñoa", detail: "Región Metropolitana, Chile" },
    { address: "Av. Andrés Bello 2711, Las Condes", detail: "Región Metropolitana, Chile" },
    { address: "Av. Italia 900, Providencia", detail: "Región Metropolitana, Chile" },
    { address: "Calle Merced 380, Santiago Centro", detail: "Región Metropolitana, Chile" },
    { address: "Av. Pedro de Valdivia 291, Providencia", detail: "Región Metropolitana, Chile" },
    { address: "Av. 11 de Septiembre 2155, Providencia", detail: "Región Metropolitana, Chile" },
    { address: "Camino El Alba 11969, Las Condes", detail: "Región Metropolitana, Chile" },
  ],
  Colombia: [
    { address: "Carrera 7 #71-21, Bogotá", detail: "Bogotá D.C., Colombia" },
    { address: "Calle 93 #11A-28, Bogotá", detail: "Bogotá D.C., Colombia" },
    { address: "Carrera 43A #1-50, Medellín", detail: "Antioquia, Colombia" },
    { address: "Av. El Dorado #68B-85, Bogotá", detail: "Bogotá D.C., Colombia" },
  ],
  Perú: [
    { address: "Av. Javier Prado Este 4200, Surco", detail: "Lima, Perú" },
    { address: "Av. Larco 1301, Miraflores", detail: "Lima, Perú" },
    { address: "Calle Las Begonias 415, San Isidro", detail: "Lima, Perú" },
  ],
  Argentina: [
    { address: "Av. Corrientes 1234, CABA", detail: "Buenos Aires, Argentina" },
    { address: "Av. Santa Fe 3253, Palermo", detail: "Buenos Aires, Argentina" },
    { address: "Florida 165, Microcentro", detail: "Buenos Aires, Argentina" },
  ],
  México: [
    { address: "Paseo de la Reforma 250, Cuauhtémoc", detail: "CDMX, México" },
    { address: "Av. Insurgentes Sur 1602, Benito Juárez", detail: "CDMX, México" },
    { address: "Blvd. Manuel Ávila Camacho 40, Naucalpan", detail: "Edo. de México, México" },
  ],
  España: [
    { address: "Paseo de la Castellana 259, Madrid", detail: "Madrid, España" },
    { address: "Calle Serrano 41, Madrid", detail: "Madrid, España" },
    { address: "Av. Diagonal 477, Barcelona", detail: "Cataluña, España" },
  ],
  Brasil: [
    { address: "Av. Paulista 1374, Bela Vista", detail: "São Paulo, Brasil" },
    { address: "Av. Brigadeiro Faria Lima 3400, Itaim Bibi", detail: "São Paulo, Brasil" },
    { address: "Rua Visconde de Pirajá 572, Ipanema", detail: "Rio de Janeiro, Brasil" },
  ],
};

/* ── Simulated spell-correction for Giro comercial ── */
const GIRO_CORRECTIONS: Record<string, string> = {
  "comercio electronico": "Comercio electrónico",
  "comercio eletronico": "Comercio electrónico",
  "tecnologia": "Tecnología",
  "tecnologias": "Tecnologías",
  "tecnologias de la informacion": "Tecnologías de la información",
  "consultoria": "Consultoría",
  "consultoria empresarial": "Consultoría empresarial",
  "construccion": "Construcción",
  "educacion": "Educación",
  "comunicacion": "Comunicación",
  "comunicaciones": "Comunicaciones",
  "alimentacion": "Alimentación",
  "distribucion": "Distribución",
  "logistica": "Logística",
  "logistica y transporte": "Logística y transporte",
  "fabricacion": "Fabricación",
  "importacion y exportacion": "Importación y exportación",
  "publicidad y comunicacion": "Publicidad y comunicación",
  "produccion audiovisual": "Producción audiovisual",
  "administracion": "Administración",
  "administracion de empresas": "Administración de empresas",
  "asesoria legal": "Asesoría legal",
  "asesoria financiera": "Asesoría financiera",
  "ingenieria": "Ingeniería",
  "mineria": "Minería",
  "agricultura": "Agricultura",
  "gastronomia": "Gastronomía",
  "farmaceutica": "Farmacéutica",
  "telecomunicaciones": "Telecomunicaciones",
  "informatica": "Informática",
  "servicios financieros": "Servicios financieros",
  "salud y bienestar": "Salud y bienestar",
  "diseno grafico": "Diseño gráfico",
  "diseño grafico": "Diseño gráfico",
};

function autoCorrectGiro(value: string): string {
  if (!value.trim()) return value;
  const key = value.trim().toLowerCase();
  if (GIRO_CORRECTIONS[key]) return GIRO_CORRECTIONS[key];
  // Capitalize first letter if unchanged
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function AddressAutocomplete({ value, onChange, pais }: { value: string; onChange: (v: string) => void; pais: string }) {
  const [focused, setFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const addresses = MOCK_ADDRESSES[pais] || MOCK_ADDRESSES.Chile;
  const query = value.toLowerCase().trim();
  const suggestions = query.length >= 2
    ? addresses.filter(a => a.address.toLowerCase().includes(query) || a.detail.toLowerCase().includes(query)).slice(0, 5)
    : [];

  // Simulate search delay
  useEffect(() => {
    if (query.length >= 2) {
      setSearching(true);
      const t = setTimeout(() => setSearching(false), 300);
      return () => clearTimeout(t);
    }
    setSearching(false);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = focused && query.length >= 2;

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1">
      <label className="text-xs font-medium text-neutral-700">Dirección</label>
      <div className="relative">
        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          className="h-[44px] w-full rounded-lg border border-neutral-300 pl-8 pr-3 text-base md:text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          placeholder="Buscar dirección..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
        />
      </div>
      {showDropdown && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
          {searching ? (
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
              <span className="text-xs text-neutral-500">Buscando direcciones...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { onChange(s.address); setFocused(false); }}
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors"
              >
                <IconMapPin size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{s.address}</p>
                  <p className="text-xs text-neutral-500">{s.detail}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-3">
              <p className="text-xs text-neutral-500">No se encontraron resultados para &quot;{value}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CrearClientePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdEmpresaId, setCreatedEmpresaId] = useState<string>("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Logo upload
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError("El archivo debe ser una imagen");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.width < 150 || img.height < 150) {
        setLogoError("La imagen debe ser de al menos 150×150px");
        setLogoPreview(null);
      } else if (Math.abs(img.width - img.height) > img.width * 0.1) {
        setLogoError("La imagen debe ser cuadrada (proporción 1:1)");
        setLogoPreview(null);
      } else {
        setLogoPreview(URL.createObjectURL(file));
        setDirty(true);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const paisConfig = PAIS_CONFIG[form.pais] || PAIS_CONFIG.Otro;
  const geo2Options = paisConfig.geo2Map[form.geo1] || [];

  const setField = (k: string, v: string | boolean) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // Reset geo fields when country changes
      if (k === "pais") {
        next.idFiscal = "";
        next.geo1 = "";
        next.geo2 = "";
      }
      // Reset geo2 when geo1 changes
      if (k === "geo1") {
        next.geo2 = "";
      }
      return next;
    });
    setDirty(true);
  };

  const setCC = (k: string, v: string) => {
    setForm((f) => ({ ...f, contactoComercial: { ...f.contactoComercial, [k]: v } }));
    setDirty(true);
  };

  const setCP = (k: string, v: string) => {
    setForm((f) => ({ ...f, contactoPagos: { ...f.contactoPagos, [k]: v } }));
    setDirty(true);
  };

  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const idFiscalValid = paisConfig.fiscalRegex.test(form.idFiscal.trim());

  const errors = {
    nombreFantasia: touched.nombreFantasia && form.nombreFantasia.length < 2,
    razonSocial: touched.razonSocial && form.razonSocial.length < 3,
    idFiscal: touched.idFiscal && !idFiscalValid,
    pais: touched.pais && !form.pais,
    ccNombre: touched.ccNombre && !form.contactoComercial.nombre,
    ccCorreo: touched.ccCorreo && !form.contactoComercial.correo.includes("@"),
  };

  const valid =
    form.nombreFantasia.length >= 2 &&
    form.razonSocial.length >= 3 &&
    idFiscalValid &&
    !!form.pais &&
    !!form.contactoComercial.nombre &&
    form.contactoComercial.correo.includes("@");

  const handleSubmit = async () => {
    if (!valid) {
      setTouched({ nombreFantasia: true, razonSocial: true, idFiscal: true, pais: true, ccNombre: true, ccCorreo: true });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    const created = addEmpresa({
      nombreFantasia: form.nombreFantasia,
      nombre: form.nombreFantasia,
      razonSocial: form.razonSocial,
      idFiscal: form.idFiscal,
      pais: form.pais,
      giro: form.giro,
      direccion: form.direccion,
      notasInternas: form.notasInternas || undefined,
      operationalStatus: "activo",
      contactoComercial: form.contactoComercial,
      contactoPagos: form.mismoQueComercial
        ? { mismoQueComercial: true, nombre: "", cargo: "", correo: "", telefono: "" }
        : { mismoQueComercial: false, ...form.contactoPagos },
    });
    setCreatedEmpresaId(created.id);
    setShowSuccess(true);
  };

  const handleCancel = () => {
    if (dirty) setConfirmCancel(true);
    else router.push("/clientes");
  };

  return (
    <MainLayout narrow>
      <PageHeader
        breadcrumb={[
          { label: "Inicio", href: "/" },
          { label: "Clientes", href: "/clientes" },
          { label: "Crear cliente" },
        ]}
        title="Crear cliente"
        description="Complete los datos para registrar un nuevo cliente."
      />

      <div className="px-4 sm:px-6 pb-20 md:pb-10">
        <div className="flex flex-col gap-6">

          {/* Datos de la empresa */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Datos de la empresa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Nombre de fantasía"
                  required
                  placeholder="Nombre comercial visible"
                  value={form.nombreFantasia}
                  onChange={(e) => setField("nombreFantasia", e.target.value)}
                  onBlur={() => blur("nombreFantasia")}
                />
                {errors.nombreFantasia && <p className="text-xs text-red-500 mt-1">Mínimo 2 caracteres</p>}
              </div>
              <div>
                <Input
                  label="Razón Social"
                  required
                  placeholder="Razón social legal"
                  value={form.razonSocial}
                  onChange={(e) => setField("razonSocial", e.target.value)}
                  onBlur={() => blur("razonSocial")}
                />
                {errors.razonSocial && <p className="text-xs text-red-500 mt-1">Mínimo 3 caracteres</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel label="País" required />
                <div className="relative">
                  <select
                    className={selectClass(errors.pais)}
                    value={form.pais}
                    onChange={(e) => setField("pais", e.target.value)}
                    onBlur={() => blur("pais")}
                  >
                    <option value="">Seleccionar país</option>
                    {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <SelectChevron />
                </div>
                {errors.pais && <p className="text-xs text-red-500 mt-1">Selecciona un país</p>}
              </div>
              <div>
                <Input
                  label={paisConfig.fiscalLabel}
                  required
                  placeholder={paisConfig.fiscalPlaceholder}
                  value={form.idFiscal}
                  onChange={(e) => setField("idFiscal", paisConfig.fiscalAutoFormat ? formatRut(e.target.value) : e.target.value)}
                  onBlur={() => blur("idFiscal")}
                />
                {errors.idFiscal && <p className="text-xs text-red-500 mt-1">{paisConfig.fiscalError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paisConfig.geo1Options.length > 0 ? (
                <div>
                  <FieldLabel label={paisConfig.geo1Label} />
                  <div className="relative">
                    <select
                      className={selectClass()}
                      value={form.geo1}
                      onChange={(e) => setField("geo1", e.target.value)}
                    >
                      <option value="">Seleccionar {paisConfig.geo1Label.toLowerCase()}</option>
                      {paisConfig.geo1Options.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              ) : (
                <Input
                  label={paisConfig.geo1Label}
                  placeholder={`Ingrese ${paisConfig.geo1Label.toLowerCase()}`}
                  value={form.geo1}
                  onChange={(e) => setField("geo1", e.target.value)}
                />
              )}
              {geo2Options.length > 0 ? (
                <div>
                  <FieldLabel label={paisConfig.geo2Label} />
                  <div className="relative">
                    <select
                      className={selectClass()}
                      value={form.geo2}
                      onChange={(e) => setField("geo2", e.target.value)}
                    >
                      <option value="">Seleccionar {paisConfig.geo2Label.toLowerCase()}</option>
                      {geo2Options.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              ) : (
                <Input
                  label={paisConfig.geo2Label}
                  placeholder={form.geo1 ? `Ingrese ${paisConfig.geo2Label.toLowerCase()}` : `Selecciona ${paisConfig.geo1Label.toLowerCase()} primero`}
                  value={form.geo2}
                  onChange={(e) => setField("geo2", e.target.value)}
                  disabled={paisConfig.geo1Options.length > 0 && !form.geo1}
                />
              )}
            </div>

            <Input label="Giro comercial" placeholder="Ej. Comercio electrónico" value={form.giro} onChange={(e) => setField("giro", e.target.value)} onBlur={() => setField("giro", autoCorrectGiro(form.giro))} spellCheck />
            <AddressAutocomplete value={form.direccion} onChange={(v) => setField("direccion", v)} pais={form.pais} />
          </section>

          {/* Logo del cliente */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-neutral-700">Logo del cliente</h2>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-lg border border-neutral-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setLogoPreview(null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-red-600 transition-colors"
                  >
                    <IconXMark size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <IconUpload size={20} />
                  <span className="text-[10px] font-medium">Subir</span>
                </button>
              )}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-neutral-500">Imagen cuadrada, mínimo 150×150px</p>
                <p className="text-xs text-neutral-400">Formatos: PNG, JPG, SVG</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium text-left"
                  >
                    Cambiar imagen
                  </button>
                )}
              </div>
            </div>
            {logoError && <p className="text-xs text-red-500">{logoError}</p>}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
          </section>

          {/* Contacto comercial */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto comercial</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Nombre"
                  required
                  placeholder="Nombre del contacto"
                  value={form.contactoComercial.nombre}
                  onChange={(e) => setCC("nombre", e.target.value)}
                  onBlur={() => blur("ccNombre")}
                />
                {errors.ccNombre && <p className="text-xs text-red-500 mt-1">Campo requerido</p>}
              </div>
              <Input label="Cargo" placeholder="Ej. CEO, Dir. Comercial" value={form.contactoComercial.cargo} onChange={(e) => setCC("cargo", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Correo"
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={form.contactoComercial.correo}
                  onChange={(e) => setCC("correo", e.target.value)}
                  onBlur={() => blur("ccCorreo")}
                />
                {errors.ccCorreo && <p className="text-xs text-red-500 mt-1">Ingrese un correo válido</p>}
              </div>
              <Input label="Teléfono" placeholder="+56 9 1234 5678" value={form.contactoComercial.telefono} onChange={(e) => setCC("telefono", e.target.value)} />
            </div>
          </section>

          {/* Contacto de pagos */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-neutral-700">Contacto de pagos y finanzas</h2>
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-400 cursor-pointer"
                checked={form.mismoQueComercial}
                onChange={(e) => setField("mismoQueComercial", e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Mismo que contacto comercial</span>
            </label>
            {!form.mismoQueComercial && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Nombre" placeholder="Nombre del contacto de pagos" value={form.contactoPagos.nombre} onChange={(e) => setCP("nombre", e.target.value)} />
                  <Input label="Cargo" placeholder="Ej. CFO, Contador" value={form.contactoPagos.cargo} onChange={(e) => setCP("cargo", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Correo" type="email" placeholder="pagos@empresa.com" value={form.contactoPagos.correo} onChange={(e) => setCP("correo", e.target.value)} />
                  <Input label="Teléfono" placeholder="+56 9 1234 5678" value={form.contactoPagos.telefono} onChange={(e) => setCP("telefono", e.target.value)} />
                </div>
              </>
            )}
          </section>

          {/* Notas internas */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-neutral-700">Notas internas</h2>
            <div>
              <FieldLabel label="Notas" />
              <textarea
                className={textareaClass()}
                rows={3}
                placeholder="Notas visibles solo para el equipo de Amplifica…"
                value={form.notasInternas}
                onChange={(e) => setField("notasInternas", e.target.value)}
              />
            </div>
          </section>

          {!valid && (
            <p className="text-xs text-neutral-400">* Completa los campos obligatorios para continuar</p>
          )}

          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-3 md:relative md:inset-auto md:border-0 md:bg-transparent md:px-0 md:py-0 md:pt-3 md:justify-end z-20">
            <Button variant="secondary" size="lg" className="flex-1 md:flex-initial" onClick={handleCancel}>Cancelar</Button>
            <Button size="lg" className="flex-1 md:flex-initial" disabled={false} loading={loading} onClick={handleSubmit}>Guardar</Button>
          </div>
        </div>
      </div>

      {/* Success modal with summary */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">¡Cliente creado exitosamente!</h3>
                <p className="text-sm text-neutral-500">El cliente ha sido registrado en el sistema.</p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Resumen</h4>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <span className="text-neutral-500">Nombre</span>
                <span className="font-medium text-neutral-900">{form.nombreFantasia}</span>
                <span className="text-neutral-500">Razón Social</span>
                <span className="font-medium text-neutral-900">{form.razonSocial}</span>
                <span className="text-neutral-500">{paisConfig.fiscalLabel}</span>
                <span className="font-medium text-neutral-900">{form.idFiscal}</span>
                <span className="text-neutral-500">País</span>
                <span className="font-medium text-neutral-900">{form.pais}</span>
                {form.geo1 && (
                  <>
                    <span className="text-neutral-500">{paisConfig.geo1Label}</span>
                    <span className="font-medium text-neutral-900">{form.geo1}</span>
                  </>
                )}
                {form.geo2 && (
                  <>
                    <span className="text-neutral-500">{paisConfig.geo2Label}</span>
                    <span className="font-medium text-neutral-900">{form.geo2}</span>
                  </>
                )}
                {form.giro && (
                  <>
                    <span className="text-neutral-500">Giro</span>
                    <span className="font-medium text-neutral-900">{form.giro}</span>
                  </>
                )}
                <span className="text-neutral-500">Contacto</span>
                <span className="font-medium text-neutral-900">{form.contactoComercial.nombre} ({form.contactoComercial.correo})</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 px-4 py-3">
              <IconInfoCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Siguiente paso:</strong> Crea un tenant para que este cliente pueda operar en la plataforma.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/clientes")}>Ir a clientes</Button>
              <Button className="flex-1" onClick={() => router.push(`/tenants/crear?empresaId=${createdEmpresaId}`)}>Crear tenant</Button>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmCancel(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl mx-4 p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-neutral-900">¿Estás seguro?</h3>
            <p className="text-sm text-neutral-500">Los cambios no guardados se perderán.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmCancel(false)}>Seguir editando</Button>
              <Button variant="danger" className="flex-1" onClick={() => router.push("/clientes")}>Descartar</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
