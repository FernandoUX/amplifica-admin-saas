"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Menu, ChevronDown, Check } from "lucide-react";
import Sidebar from "./Sidebar";
import { useRole, ROLES } from "@/lib/role-context";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const { rol, setRolId } = useRole();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    if (roleOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [roleOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-52">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content + mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-neutral-800 px-4 md:hidden" style={{ backgroundColor: "#1d1d1f" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Centered logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/logo-amplifica.svg"
              alt="Amplifica"
              width={100}
              height={23}
              className="h-[23px] w-auto"
            />
          </div>

          {/* Role switcher */}
          <div ref={roleRef} className="relative">
            <button
              onClick={() => setRoleOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-1.5 py-1.5 hover:bg-white/10 transition-colors"
            >
              {/* Avatar with badge overlapping bottom */}
              <div className="relative pb-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-semibold text-neutral-200">
                  {rol.iniciales}
                </div>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded bg-primary-400 px-1 py-0.5 text-[9px] font-semibold text-white leading-none">
                  {rol.nombre}
                </span>
              </div>
              <ChevronDown
                size={13}
                className={`text-neutral-500 transition-transform ${roleOpen ? "rotate-180" : ""}`}
              />
            </button>

            {roleOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-neutral-200 bg-white py-1 shadow-xl z-50">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Cambiar rol
                </p>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setRolId(r.id); setRoleOpen(false); }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-50 ${
                      r.id === rol.id ? "text-primary-600 font-medium" : "text-neutral-700"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                        r.id === rol.id ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {r.iniciales}
                    </div>
                    <span className="flex-1 truncate">{r.nombre}</span>
                    {r.id === rol.id && <Check size={13} className="text-primary-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scroll-minimal pb-20 md:pb-0">
          <div className="mx-auto max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
