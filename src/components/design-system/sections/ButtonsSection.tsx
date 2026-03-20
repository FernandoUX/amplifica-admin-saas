"use client";

import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Button from "@/components/ui/Button";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

const variants = ["primary", "secondary", "ghost", "danger"] as const;
const sizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

export default function ButtonsSection() {
  return (
    <DSSection id="buttons" title="Botones" description="Variantes, tamaños y estados del componente Button.">
      <DSSubsection title="Variantes">
        <DSShowcase>
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((v) => (
              <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Tamaños">
        <DSShowcase>
          <div className="flex flex-wrap items-end gap-3">
            {sizes.map((s) => (
              <Button key={s} size={s}>Botón {s}</Button>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Con icono">
        <DSShowcase>
          <div className="flex flex-wrap items-center gap-3">
            <Button icon={<IconPlus size={16} />}>Crear</Button>
            <Button variant="secondary" icon={<IconPencil size={14} />}>Editar</Button>
            <Button variant="danger" icon={<IconTrash size={14} />}>Eliminar</Button>
            <Button variant="ghost" icon={<IconPlus size={14} />}>Agregar</Button>
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Estados">
        <DSShowcase>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Normal</Button>
            <Button loading>Cargando</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </DSShowcase>
        <DSShowcase label="Todas las variantes deshabilitadas">
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((v) => (
              <Button key={v} variant={v} disabled>{v}</Button>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Props">
        <div className="rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-600">
                <th className="px-4 py-3">Prop</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Default</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700">
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">variant</td><td className="px-4 py-2 text-xs">{`"primary" | "secondary" | "ghost" | "danger"`}</td><td className="px-4 py-2 text-xs">{`"primary"`}</td></tr>
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">size</td><td className="px-4 py-2 text-xs">{`"xs" | "sm" | "md" | "lg" | "xl" | "2xl"`}</td><td className="px-4 py-2 text-xs">{`"md"`}</td></tr>
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">loading</td><td className="px-4 py-2 text-xs">boolean</td><td className="px-4 py-2 text-xs">false</td></tr>
              <tr className="border-t border-neutral-100"><td className="px-4 py-2 font-mono text-xs">icon</td><td className="px-4 py-2 text-xs">ReactNode</td><td className="px-4 py-2 text-xs">—</td></tr>
            </tbody>
          </table>
        </div>
      </DSSubsection>
    </DSSection>
  );
}
