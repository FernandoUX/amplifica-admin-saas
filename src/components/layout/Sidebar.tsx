"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Server,
  Layers,
  FileText,
  Truck,
  Receipt,
  Users,
  Settings,
  LayoutGrid,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Empresas",      href: "/empresas",     icon: Building2 },
  { label: "Tenants",       href: "/tenants",      icon: Server },
  { label: "Planes",        href: "/planes",       icon: Layers },
  { label: "Contratos",     href: "/contratos",    icon: FileText },
  { label: "Couriers",      href: "/couriers",     icon: Truck },
  { label: "Facturación",   href: "/facturacion",  icon: Receipt },
  { label: "Usuarios",      href: "/usuarios",     icon: Users },
  { label: "Configuración", href: "/configuracion",icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-52 flex-shrink-0 flex-col border-r"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-1.5">
          <LayoutGrid size={18} className="text-primary-400" />
          <span className="text-sm font-bold text-white tracking-tight">amplifica</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scroll-minimal">
        <ul className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "font-semibold text-white"
                      : "font-normal text-neutral-400 hover:text-neutral-200"
                  }`}
                  style={active ? { backgroundColor: "var(--sidebar-active)" } : undefined}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  <Icon size={16} className={active ? "text-primary-400" : "text-neutral-500"} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 border-t px-4 py-3" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-xs font-semibold text-neutral-200">
          AU
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-neutral-200 truncate">Nombre de Usuario</span>
          <span className="text-xs text-neutral-500">Admin</span>
        </div>
      </div>
    </aside>
  );
}
