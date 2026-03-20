"use client";

import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Badge from "@/components/ui/Badge";
import RowMenu from "@/components/ui/RowMenu";

const rows = [
  { name: "Extra Life", rut: "96.603.490-5", pais: "CL", tenants: 2, trial: "1 trial", estado: "active" as const, fecha: "16 dic 2025" },
  { name: "Gohard", rut: "76.991.340-3", pais: "CL", tenants: 2, trial: "—", estado: "active" as const, fecha: "22 ene 2026" },
  { name: "Kairós", rut: "77.018.660-2", pais: "CL", tenants: 1, trial: "—", estado: "inactive" as const, fecha: "30 ene 2026" },
  { name: "Nuva Skin", rut: "900.512.445-3", pais: "CO", tenants: 1, trial: "—", estado: "active" as const, fecha: "16 ene 2026" },
  { name: "Bloom Lab", rut: "77.102.450-6", pais: "CL", tenants: 1, trial: "—", estado: "pending" as const, fecha: "24 ene 2026" },
];

const flags: Record<string, string> = { CL: "🇨🇱", CO: "🇨🇴", AR: "🇦🇷" };
const statusLabels: Record<string, string> = { active: "Activo", inactive: "Suspendido", pending: "Pendiente" };

export default function TablesSection() {
  return (
    <DSSection id="tables" title="Tabla completa" description="Patrón de tabla con header sticky, checkboxes, badges y RowMenu.">
      <DSSubsection title="Tabla de ejemplo">
        <DSShowcase className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-600">
                  <th className="px-4 py-3 w-10"><span className="inline-block h-4 w-4 rounded border border-neutral-300 bg-white" /></th>
                  <th className="px-4 py-3 cursor-pointer hover:text-neutral-900">Nombre de fantasía</th>
                  <th className="px-4 py-3">ID Fiscal</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-neutral-900">Tenants</th>
                  <th className="px-4 py-3">En trial</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-neutral-900">Estado</th>
                  <th className="px-4 py-3">Creación</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3"><span className="inline-block h-4 w-4 rounded border border-neutral-300 bg-white" /></td>
                    <td className="px-4 py-3">
                      <button className="text-sm font-medium text-primary-600 hover:underline">{r.name}</button>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 font-mono">{r.rut}</td>
                    <td className="px-4 py-3 text-sm">{flags[r.pais]}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{r.tenants}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.trial !== "—" ? <Badge variant="trial">{r.trial}</Badge> : <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={r.estado}>{statusLabels[r.estado]}</Badge></td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{r.fecha}</td>
                    <td className="px-4 py-3">
                      <RowMenu actions={[
                        { label: "Ver detalle", onClick: () => {} },
                        { label: "Editar", onClick: () => {} },
                        { label: "Suspender", onClick: () => {}, variant: "danger" },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
