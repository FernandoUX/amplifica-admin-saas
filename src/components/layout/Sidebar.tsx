"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useRole, ROLES } from "@/lib/role-context";
import {
  Building2,
  Server,
  Layers,
  FileText,
  Receipt,
  Users,
  ShieldCheck,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Clientes",        href: "/clientes",       icon: Building2,  ruta: "Clientes" },
  { label: "Tenants",         href: "/tenants",        icon: Server,     ruta: "Tenants" },
  { label: "Planes",          href: "/planes",         icon: Layers,     ruta: "Planes" },
  { label: "Contratos",       href: "/contratos",      icon: FileText,   ruta: "Contratos" },
  { label: "Usuarios",        href: "/usuarios",       icon: Users,      ruta: "Usuarios" },
  { label: "Reportes de uso", href: "/reportes",       icon: Receipt,    ruta: "Reportes" },
  { label: "Audit Log",       href: "/auditlog",       icon: ShieldCheck, ruta: "Audit Log" },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { rol, setRolId, canVer } = useRole();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visibleItems = NAV_ITEMS.filter((item) => canVer(item.ruta));

  return (
    <aside
      className="flex h-screen w-52 flex-shrink-0 flex-col border-r"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <Image src="/logo-amplifica.svg" alt="Amplifica" width={110} height={25} className="h-[25px] w-auto" />
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/10 hover:text-neutral-200 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scroll-minimal">
        <ul className="flex flex-col gap-0.5 px-2">
          {visibleItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
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

      {/* User + Role Switcher */}
      <div ref={menuRef} className="relative border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-xs font-semibold text-neutral-200">
            {rol.iniciales}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium text-neutral-200 truncate">{rol.nombre}</span>
            <span className="text-[10px] text-neutral-500">Cambiar rol</span>
          </div>
          <ChevronDown size={14} className={`text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-xl z-50">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Cambiar rol</p>
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRolId(r.id); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
                  r.id === rol.id ? "text-primary-400 font-medium" : "text-neutral-300"
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                  r.id === rol.id ? "bg-primary-500/20 text-primary-400" : "bg-neutral-700 text-neutral-400"
                }`}>
                  {r.iniciales}
                </div>
                <span className="flex-1 truncate">{r.nombre}</span>
                {r.id === rol.id && <Check size={13} className="text-primary-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
