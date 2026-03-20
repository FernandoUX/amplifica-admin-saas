"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useRole, ROLES } from "@/lib/role-context";
import { useSidebar } from "@/lib/sidebar-context";
import {
  IconBriefcase,
  IconBriefcaseFilled,
  IconShoppingCart,
  IconShoppingCartFilled,
  IconStack,
  IconStackFilled,
  IconFileText,
  IconFileTextFilled,
  IconUser,
  IconUserFilled,
  IconReportAnalytics,
  IconReportAnalyticsFilled,
  IconShieldCheck,
  IconShieldCheckFilled,
  IconChevronDown,
  IconCheck,
  IconX,
  IconSunFilled,
  IconMoon,
  IconSettings,
  IconChevronsLeft,
  IconChevronsRight,
  IconLogout,
  IconLayoutDashboard,
  IconLayoutDashboardFilled,
} from "@tabler/icons-react";
import { useTheme } from "@/lib/theme-context";

type TablerIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface NavItem {
  label: string;
  href: string;
  icon: TablerIcon;
  iconFilled: TablerIcon | null;
  ruta: string;
}

const MENU_ITEMS: NavItem[] = [
  { label: "Clientes",   href: "/clientes",  icon: IconBriefcase,    iconFilled: IconBriefcaseFilled,    ruta: "Clientes" },
  { label: "Tenants",    href: "/tenants",   icon: IconShoppingCart, iconFilled: IconShoppingCartFilled, ruta: "Tenants" },
  { label: "Contratos",  href: "/contratos", icon: IconFileText,     iconFilled: IconFileTextFilled,     ruta: "Contratos" },
  { label: "Usuarios",   href: "/usuarios",  icon: IconUser,         iconFilled: IconUserFilled,         ruta: "Usuarios" },
];

const CONFIG_ITEMS: NavItem[] = [
  { label: "Planes",     href: "/planes",    icon: IconStack,        iconFilled: IconStackFilled,        ruta: "Planes" },
];

const REPORT_ITEMS: NavItem[] = [
  { label: "Reportes de uso",       href: "/reportes", icon: IconReportAnalytics, iconFilled: IconReportAnalyticsFilled, ruta: "Reportes" },
  { label: "Registros de auditoría", href: "/auditlog", icon: IconShieldCheck,     iconFilled: IconShieldCheckFilled,     ruta: "Audit Log" },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { rol, setRolId, canVer } = useRole();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggleCollapsed } = useSidebar();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // For mobile drawer, never show collapsed
  const isCollapsed = !onClose && collapsed;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visibleMenu = MENU_ITEMS.filter((item) => canVer(item.ruta));
  const visibleConfig = CONFIG_ITEMS.filter((item) => canVer(item.ruta));
  const visibleReports = REPORT_ITEMS.filter((item) => canVer(item.ruta));

  /* ── Shared nav-item renderer ── */
  const renderNavItem = ({ label, href, icon: Icon, iconFilled: IconFilled }: NavItem) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    const ActiveIcon = (active && IconFilled) ? IconFilled : Icon;
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={onClose}
          title={isCollapsed ? label : undefined}
          className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-2.5"} rounded-lg ${isCollapsed ? "px-0" : "px-3"} min-h-[44px] text-base transition-colors ${
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
          <ActiveIcon
            size={isCollapsed ? 20 : 18}
            strokeWidth={active ? (IconFilled ? 1.5 : 2.5) : 1.75}
            className={`shrink-0 ${active ? "text-white" : "text-neutral-500"}`}
          />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className="flex h-dvh flex-shrink-0 flex-col transition-all duration-200"
      style={{
        width: onClose ? "100%" : isCollapsed ? "64px" : "var(--sidebar-w)",
        backgroundColor: onClose ? "#1d1d1f" : "var(--sidebar-bg)",
      }}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-4"} pt-5 ${onClose ? "pb-4" : "pb-6"}`}>
        {!onClose ? (
          <>
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <Image src="/logo-amplifica-icon.svg" alt="Amplifica" width={28} height={28} className="h-7 w-7" />
                <button
                  onClick={toggleCollapsed}
                  title="Expandir sidebar"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
                >
                  <IconChevronsRight size={14} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <>
                <Image src="/logo-amplifica.svg" alt="Amplifica" width={131} height={30} className="h-[30px] w-auto" />
                <button
                  onClick={toggleCollapsed}
                  title="Colapsar sidebar"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
                >
                  <IconChevronsLeft size={16} strokeWidth={1.75} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex w-full items-center justify-end">
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/10 hover:text-neutral-200 transition-colors"
            >
              <IconX size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-dark">
        {/* Dashboard — top-level, outside groups */}
        <ul className={`flex flex-col gap-0.5 ${isCollapsed ? "px-2" : "px-4"}`}>
          {renderNavItem({ label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard, iconFilled: IconLayoutDashboardFilled, ruta: "Dashboard" })}
        </ul>

        {/* Menu label */}
        {!isCollapsed && (
          <div className="px-4 mt-4 mb-2">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Menú</span>
          </div>
        )}
        {isCollapsed && <div className="mt-3 mx-3 border-t border-white/10" />}

        <ul className={`flex flex-col gap-0.5 ${isCollapsed ? "px-2 mt-2" : "px-4"}`}>
          {visibleMenu.map(renderNavItem)}
        </ul>

        {visibleReports.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-4 mt-5 mb-2">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Reportería</span>
              </div>
            )}
            {isCollapsed && <div className="mt-4 mx-3 border-t border-white/10" />}
            <ul className={`flex flex-col gap-0.5 ${isCollapsed ? "px-2 mt-2" : "px-4"}`}>
              {visibleReports.map(renderNavItem)}
            </ul>
          </>
        )}

        {visibleConfig.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-4 mt-5 mb-2">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Planes</span>
              </div>
            )}
            {isCollapsed && <div className="mt-4 mx-3 border-t border-white/10" />}
            <ul className={`flex flex-col gap-0.5 ${isCollapsed ? "px-2 mt-2" : "px-4"}`}>
              {visibleConfig.map(renderNavItem)}
            </ul>
          </>
        )}
      </nav>

      {/* Bottom section */}
      {isCollapsed ? (
        /* ── Collapsed: avatar + collapse toggle ── */
        <div className="mt-auto flex flex-col items-center gap-2 pb-4 px-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors"
          >
            {theme === "light"
              ? <IconMoon size={16} strokeWidth={1.75} className="text-neutral-500" />
              : <IconSunFilled size={16} className="text-amber-400" />
            }
          </button>
          {/* Logout */}
          <button
            title="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <IconLogout size={16} strokeWidth={1.75} className="text-neutral-500" />
          </button>
          {/* Avatar */}
          <button
            onClick={() => setOpen((v) => !v)}
            title={rol.nombre}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-600 text-xs font-bold text-neutral-100 hover:ring-2 hover:ring-white/20 transition-all"
          >
            {rol.iniciales}
          </button>
        </div>
      ) : (
        /* ── Expanded: full user card ── */
        <div ref={menuRef} className="relative mt-auto mx-4 mb-4 rounded-xl bg-white/[0.06]">
          {/* User row */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-t-xl px-3.5 py-3 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-600 text-xs font-bold text-neutral-100 shrink-0">
              {rol.iniciales}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-neutral-200 truncate leading-tight">Fernando Roblero</span>
              <span className="text-[11px] text-neutral-500 truncate leading-tight">{rol.nombre}</span>
            </div>
            <IconChevronDown size={14} strokeWidth={2} className={`text-neutral-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
          </button>

          {/* Divider */}
          <div className="mx-3.5 border-t border-white/5" />

          {/* Theme */}
          <div className="flex flex-col gap-0.5 px-2 py-2">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 min-h-[34px] text-base text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors"
            >
              {theme === "light"
                ? <IconMoon size={15} strokeWidth={1.75} className="text-neutral-500" />
                : <IconSunFilled size={15} className="text-amber-400" />
              }
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </button>
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-2 min-h-[34px] text-base text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            >
              <IconLogout size={15} strokeWidth={1.75} className="text-neutral-500" />
              Cerrar sesión
            </button>
          </div>

          {/* Role switcher popup */}
          {open && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-xl z-50">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Cambiar rol</p>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRolId(r.id); setOpen(false); }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
                    r.id === rol.id ? "text-white font-medium" : "text-neutral-300"
                  }`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                    r.id === rol.id ? "bg-white/15 text-white" : "bg-neutral-700 text-neutral-400"
                  }`}>
                    {r.iniciales}
                  </div>
                  <span className="flex-1 truncate">{r.nombre}</span>
                  {r.id === rol.id && <IconCheck size={13} strokeWidth={2.5} className="text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
