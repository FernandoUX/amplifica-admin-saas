"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const RUTAS = ["Dashboard", "Empresas", "Tenants", "Planes", "Contratos", "Couriers", "Facturación", "Usuarios", "Configuración"];

export interface RolDef {
  id: string;
  nombre: string;
  iniciales: string;
  permisos: { ver: string[]; editar: string[]; crear: string[]; deshabilitar: string[] };
}

export const ROLES: RolDef[] = [
  {
    id: "sa",
    nombre: "Super Admin",
    iniciales: "SA",
    permisos: { ver: [...RUTAS], editar: [...RUTAS], crear: [...RUTAS], deshabilitar: [...RUTAS] },
  },
  {
    id: "staff",
    nombre: "Staff Amplifica SaaS",
    iniciales: "ST",
    permisos: {
      ver: [...RUTAS],
      editar: ["Empresas", "Tenants", "Contratos", "Couriers", "Usuarios"],
      crear: ["Empresas", "Tenants", "Contratos", "Usuarios"],
      deshabilitar: ["Empresas", "Tenants", "Contratos", "Usuarios"],
    },
  },
  {
    id: "finanzas",
    nombre: "Finanzas SaaS",
    iniciales: "FN",
    permisos: { ver: [...RUTAS], editar: [], crear: [], deshabilitar: [] },
  },
];

interface RoleContextType {
  rol: RolDef;
  setRolId: (id: string) => void;
  canVer: (ruta: string) => boolean;
  canEditar: (ruta: string) => boolean;
  canCrear: (ruta: string) => boolean;
  canDeshabilitar: (ruta: string) => boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [rolId, setRolId] = useState("sa");
  const rol = ROLES.find((r) => r.id === rolId) || ROLES[0];

  const canVer = (ruta: string) => rol.permisos.ver.includes(ruta);
  const canEditar = (ruta: string) => rol.permisos.editar.includes(ruta);
  const canCrear = (ruta: string) => rol.permisos.crear.includes(ruta);
  const canDeshabilitar = (ruta: string) => rol.permisos.deshabilitar.includes(ruta);

  return (
    <RoleContext.Provider value={{ rol, setRolId, canVer, canEditar, canCrear, canDeshabilitar }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
