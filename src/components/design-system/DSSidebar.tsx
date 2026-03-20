"use client";

import { useEffect, useState } from "react";
import {
  IconPalette,
  IconTypography,
  IconLayoutGrid,
  IconVariable,
  IconIcons,
  IconSquare,
  IconForms,
  IconFilter,
  IconArrowsSort,
  IconDotsVertical,
  IconLayoutList,
  IconAlertTriangle,
  IconBell,
  IconColumns3,
  IconCards,
  IconMoodEmpty,
  IconTable,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Fundamentos",
    items: [
      { id: "colors", label: "Colores", icon: <IconPalette size={16} /> },
      { id: "typography", label: "Tipografía", icon: <IconTypography size={16} /> },
      { id: "spacing", label: "Espaciado & Grid", icon: <IconLayoutGrid size={16} /> },
      { id: "tokens", label: "Tokens & Variables", icon: <IconVariable size={16} /> },
      { id: "icons", label: "Iconografía", icon: <IconIcons size={16} /> },
    ],
  },
  {
    title: "Atoms",
    items: [
      { id: "buttons", label: "Botones", icon: <IconSquare size={16} /> },
      { id: "inputs", label: "Inputs", icon: <IconForms size={16} /> },
      { id: "badges", label: "Badges", icon: <IconLayoutList size={16} /> },
      { id: "toggle", label: "Toggle", icon: <IconArrowsSort size={16} /> },
    ],
  },
  {
    title: "Molecules",
    items: [
      { id: "form-fields", label: "Campos de formulario", icon: <IconColumns3 size={16} /> },
      { id: "filters", label: "Filtros", icon: <IconFilter size={16} /> },
      { id: "pagination", label: "Paginación", icon: <IconArrowsSort size={16} /> },
      { id: "row-menu", label: "Menú contextual", icon: <IconDotsVertical size={16} /> },
    ],
  },
  {
    title: "Organisms",
    items: [
      { id: "modals", label: "Modales", icon: <IconAlertTriangle size={16} /> },
      { id: "toasts", label: "Toasts", icon: <IconBell size={16} /> },
      { id: "page-header", label: "Page Header", icon: <IconColumns3 size={16} /> },
      { id: "cards", label: "Cards", icon: <IconCards size={16} /> },
      { id: "empty-state", label: "Empty State", icon: <IconMoodEmpty size={16} /> },
      { id: "tables", label: "Tabla completa", icon: <IconTable size={16} /> },
    ],
  },
];

export default function DSSidebar() {
  const [activeId, setActiveId] = useState("colors");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const ids = sections.flatMap((s) => s.items.map((i) => i.id));
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    setActiveId(id);
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const navContent = (
    <nav className="flex flex-col gap-6 py-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-4 py-2 text-sm transition-colors ${
                    activeId === item.id
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-neutral-200 shadow-md md:hidden"
      >
        <IconMenu2 size={20} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
              <span className="text-sm font-semibold text-neutral-900">Design System</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-neutral-100">
                <IconX size={18} />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-neutral-200 bg-white h-screen sticky top-0 overflow-y-auto scroll-minimal">
        <div className="px-4 py-5 border-b border-neutral-100">
          <p className="text-base font-bold text-neutral-900">Design System</p>
          <p className="text-xs text-neutral-500 mt-0.5">Amplifica Admin</p>
        </div>
        {navContent}
      </aside>
    </>
  );
}
