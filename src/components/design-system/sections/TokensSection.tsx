import DSSection, { DSSubsection, DSShowcase } from "../DSSection";

const radii = [
  { token: "rounded-md", value: "6px" },
  { token: "rounded-lg", value: "8px" },
  { token: "rounded-xl", value: "12px" },
  { token: "rounded-2xl", value: "16px" },
  { token: "rounded-full", value: "9999px" },
];

const shadows = [
  { token: "shadow-sm", desc: "Inputs con focus" },
  { token: "shadow-md", desc: "Dropdowns, cards elevados" },
  { token: "shadow-lg", desc: "Toasts, modales" },
  { token: "shadow-xl", desc: "Modal panel principal" },
];

const zIndexes = [
  { value: "z-10", usage: "Sticky headers, elevated cards" },
  { value: "z-40", usage: "Sidebar (mobile drawer)" },
  { value: "z-50", usage: "Modales, AlertModal" },
  { value: "z-[100]", usage: "Toasts" },
  { value: "z-[9999]", usage: "RowMenu portal, FilterDropdown" },
];

const transitions = [
  { duration: "100ms", usage: "Botones (hover/active)" },
  { duration: "150ms", usage: "Toggle, inputs" },
  { duration: "200ms", usage: "Sidebar, modales" },
  { duration: "250ms", usage: "Animaciones de entrada (bulk-bar)" },
  { duration: "350ms", usage: "Sidebar bounce animation" },
];

export default function TokensSection() {
  return (
    <DSSection id="tokens" title="Tokens & Variables" description="Variables CSS, border radius, shadows, z-index y transiciones.">
      <DSSubsection title="Border Radius">
        <DSShowcase>
          <div className="flex flex-wrap gap-4 items-end">
            {radii.map((r) => (
              <div key={r.token} className="flex flex-col items-center gap-2">
                <div className={`h-16 w-16 bg-primary-100 border-2 border-primary-400`} style={{ borderRadius: r.value }} />
                <code className="text-[10px] font-mono text-neutral-600">{r.token}</code>
                <span className="text-[10px] text-neutral-400">{r.value}</span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Shadows">
        <DSShowcase>
          <div className="flex flex-wrap gap-6">
            {shadows.map((s) => (
              <div key={s.token} className="flex flex-col items-center gap-2">
                <div className={`h-20 w-28 rounded-xl bg-white ${s.token} border border-neutral-100 flex items-center justify-center`}>
                  <code className="text-[10px] font-mono text-neutral-600">{s.token}</code>
                </div>
                <span className="text-[10px] text-neutral-500">{s.desc}</span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Z-index">
        <div className="rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-600">
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Uso</th>
              </tr>
            </thead>
            <tbody>
              {zIndexes.map((z) => (
                <tr key={z.value} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-primary-700">{z.value}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{z.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DSSubsection>

      <DSSubsection title="Transiciones">
        <DSShowcase>
          <div className="flex flex-col gap-3">
            {transitions.map((t) => (
              <div key={t.duration} className="flex items-center gap-4">
                <code className="w-14 text-xs font-mono text-primary-700 flex-shrink-0">{t.duration}</code>
                <div className="h-2 rounded-full bg-primary-200" style={{ width: `${parseInt(t.duration) / 4}%` }} />
                <span className="text-xs text-neutral-500">{t.usage}</span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
