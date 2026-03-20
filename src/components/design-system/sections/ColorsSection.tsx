import DSSection, { DSSubsection } from "../DSSection";

const primaryScale = [
  { name: "primary-25", hex: "#EBF1FF", text: "dark" },
  { name: "primary-50", hex: "#D6E2FF", text: "dark" },
  { name: "primary-100", hex: "#B6CBFF", text: "dark" },
  { name: "primary-200", hex: "#8CA9FF", text: "dark" },
  { name: "primary-300", hex: "#637BFF", text: "light" },
  { name: "primary-400", hex: "#4548FF", text: "light" },
  { name: "primary-500", hex: "#2F30FF", text: "light" },
  { name: "primary-600", hex: "#1F1DDE", text: "light" },
  { name: "primary-700", hex: "#1B1CAD", text: "light" },
  { name: "primary-800", hex: "#1D2084", text: "light" },
  { name: "primary-900", hex: "#141449", text: "light" },
];

const neutralScale = [
  { name: "neutral-50", hex: "#FAFAFA", text: "dark" },
  { name: "neutral-100", hex: "#F4F4F5", text: "dark" },
  { name: "neutral-200", hex: "#E5E5E6", text: "dark" },
  { name: "neutral-300", hex: "#D5D5D7", text: "dark" },
  { name: "neutral-400", hex: "#A3A3A8", text: "dark" },
  { name: "neutral-500", hex: "#737378", text: "light" },
  { name: "neutral-600", hex: "#545459", text: "light" },
  { name: "neutral-700", hex: "#414144", text: "light" },
  { name: "neutral-800", hex: "#282829", text: "light" },
  { name: "neutral-900", hex: "#1D1D1F", text: "light" },
  { name: "neutral-950", hex: "#09090B", text: "light" },
];

const semanticColors = [
  { name: "Activo", bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  { name: "Inactivo", bg: "bg-neutral-100", text: "text-neutral-700", dot: "bg-neutral-400" },
  { name: "Pendiente", bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  { name: "Vencido", bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" },
  { name: "Trial", bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500" },
  { name: "Express", bg: "bg-violet-50", text: "text-violet-800", dot: "bg-violet-500" },
  { name: "Multicanal", bg: "bg-orange-50", text: "text-orange-800", dot: "bg-orange-500" },
];

const darkElevation = [
  { level: "Base (page)", color: "#1D1D1F", token: "neutral-900" },
  { level: "+1 Cards/Panels", color: "#282829", token: "neutral-800" },
  { level: "+2 Headers/Hover", color: "#414144", token: "neutral-700" },
  { level: "+3 Active", color: "#545459", token: "neutral-600" },
];

function ColorSwatch({ hex, name, textColor }: { hex: string; name: string; textColor: string }) {
  return (
    <div className="flex flex-col">
      <div
        className="h-16 rounded-lg border border-neutral-200 flex items-end p-2"
        style={{ backgroundColor: hex }}
      >
        <span className={`text-[10px] font-mono font-medium ${textColor === "light" ? "text-white" : "text-neutral-900"}`}>
          {hex}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-medium text-neutral-700">{name}</p>
    </div>
  );
}

export default function ColorsSection() {
  return (
    <DSSection id="colors" title="Colores" description="Paleta de colores del sistema, escalas y uso semántico.">
      <DSSubsection title="Primary (Brand blue-violet)">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
          {primaryScale.map((c) => (
            <ColorSwatch key={c.name} hex={c.hex} name={c.name} textColor={c.text} />
          ))}
        </div>
        <div className="mt-4 flex gap-3 items-center">
          <div className="flex gap-1">
            <div className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: "#4648FF" }}>Base</div>
            <div className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: "#1F1DDE" }}>Hover</div>
            <div className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: "#1B1CAD" }}>Active</div>
          </div>
          <span className="text-xs text-neutral-500">Estados interactivos (light)</span>
        </div>
      </DSSubsection>

      <DSSubsection title="Neutral (Grayscale)">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
          {neutralScale.map((c) => (
            <ColorSwatch key={c.name} hex={c.hex} name={c.name} textColor={c.text} />
          ))}
        </div>
      </DSSubsection>

      <DSSubsection title="Semánticos (Badges & estados)">
        <div className="flex flex-wrap gap-3">
          {semanticColors.map((c) => (
            <div key={c.name} className={`${c.bg} ${c.text} rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2`}>
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              {c.name}
            </div>
          ))}
        </div>
      </DSSubsection>

      <DSSubsection title="Dark mode — Elevación">
        <div className="rounded-xl overflow-hidden border border-neutral-700">
          {darkElevation.map((e) => (
            <div
              key={e.level}
              className="flex items-center justify-between px-5 py-4"
              style={{ backgroundColor: e.color }}
            >
              <span className="text-sm font-medium text-neutral-200">{e.level}</span>
              <span className="text-xs font-mono text-neutral-400">{e.token} — {e.color}</span>
            </div>
          ))}
        </div>
      </DSSubsection>
    </DSSection>
  );
}
