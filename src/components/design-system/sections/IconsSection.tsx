import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import {
  IconBriefcase, IconBuildingStore, IconFileText, IconUsers, IconChartBar,
  IconShieldCheck, IconStack, IconPlus, IconX, IconCheck, IconSearch,
  IconChevronDown, IconChevronLeft, IconChevronRight, IconMenu2,
  IconDotsVertical, IconAlertTriangle, IconAlertCircle, IconCircleCheck,
  IconCalendar, IconSettings, IconSunFilled, IconMoon, IconLogout,
  IconEye, IconPencil, IconTrash, IconLoader2, IconCopy,
} from "@tabler/icons-react";

const iconList = [
  { icon: <IconBriefcase size={20} />, name: "Briefcase", usage: "Clientes" },
  { icon: <IconBuildingStore size={20} />, name: "BuildingStore", usage: "Tenants" },
  { icon: <IconFileText size={20} />, name: "FileText", usage: "Contratos" },
  { icon: <IconUsers size={20} />, name: "Users", usage: "Usuarios" },
  { icon: <IconChartBar size={20} />, name: "ChartBar", usage: "Reportes" },
  { icon: <IconShieldCheck size={20} />, name: "ShieldCheck", usage: "Audit Log" },
  { icon: <IconStack size={20} />, name: "Stack", usage: "Planes" },
  { icon: <IconPlus size={20} />, name: "Plus", usage: "Crear/Agregar" },
  { icon: <IconX size={20} />, name: "X", usage: "Cerrar/Eliminar" },
  { icon: <IconCheck size={20} />, name: "Check", usage: "Confirmación" },
  { icon: <IconSearch size={20} />, name: "Search", usage: "Buscar" },
  { icon: <IconChevronDown size={20} />, name: "ChevronDown", usage: "Expandir" },
  { icon: <IconChevronLeft size={20} />, name: "ChevronLeft", usage: "Volver" },
  { icon: <IconChevronRight size={20} />, name: "ChevronRight", usage: "Siguiente" },
  { icon: <IconMenu2 size={20} />, name: "Menu2", usage: "Menú mobile" },
  { icon: <IconDotsVertical size={20} />, name: "DotsVertical", usage: "RowMenu" },
  { icon: <IconAlertTriangle size={20} />, name: "AlertTriangle", usage: "Warning" },
  { icon: <IconAlertCircle size={20} />, name: "AlertCircle", usage: "Error" },
  { icon: <IconCircleCheck size={20} />, name: "CircleCheck", usage: "Success" },
  { icon: <IconCalendar size={20} />, name: "Calendar", usage: "Fecha" },
  { icon: <IconSettings size={20} />, name: "Settings", usage: "Config" },
  { icon: <IconSunFilled size={20} />, name: "SunFilled", usage: "Light mode" },
  { icon: <IconMoon size={20} />, name: "Moon", usage: "Dark mode" },
  { icon: <IconLogout size={20} />, name: "Logout", usage: "Cerrar sesión" },
  { icon: <IconEye size={20} />, name: "Eye", usage: "Ver detalle" },
  { icon: <IconPencil size={20} />, name: "Pencil", usage: "Editar" },
  { icon: <IconTrash size={20} />, name: "Trash", usage: "Eliminar" },
  { icon: <IconLoader2 size={20} className="animate-spin" />, name: "Loader2", usage: "Loading" },
  { icon: <IconCopy size={20} />, name: "Copy", usage: "Copiar" },
];

const sizes = [14, 16, 18, 20, 24];

export default function IconsSection() {
  return (
    <DSSection id="icons" title="Iconografía" description="Librería @tabler/icons-react — iconos más usados en la app.">
      <DSSubsection title="Tamaños">
        <DSShowcase>
          <div className="flex items-end gap-6">
            {sizes.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <IconBriefcase size={s} className="text-neutral-700" />
                <span className="text-[10px] font-mono text-neutral-500">{s}px</span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Iconos del sistema">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1">
          {iconList.map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-100 p-4 hover:bg-neutral-50 transition-colors">
              <span className="text-neutral-700">{item.icon}</span>
              <span className="text-[10px] font-mono text-neutral-600">{item.name}</span>
              <span className="text-[9px] text-neutral-400">{item.usage}</span>
            </div>
          ))}
        </div>
      </DSSubsection>
    </DSSection>
  );
}
