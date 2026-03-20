import DSSection, { DSSubsection, DSShowcase } from "../DSSection";

const breakpoints = [
  { name: "Base", width: "0px", desc: "Mobile first" },
  { name: "sm", width: "640px", desc: "Tablets" },
  { name: "md", width: "768px", desc: "Sidebar visible" },
  { name: "lg", width: "1024px", desc: "Desktop" },
  { name: "xl", width: "1280px", desc: "Wide desktop" },
  { name: "2xl", width: "1536px", desc: "Ultra wide" },
];

const heights = [
  { token: "h-5", px: "20px", usage: "Toggle switch" },
  { token: "h-6", px: "24px", usage: "Botones xs" },
  { token: "h-7", px: "28px", usage: "Nav items, close buttons" },
  { token: "h-8", px: "32px", usage: "Botones sm" },
  { token: "h-9", px: "36px", usage: "RowMenu trigger" },
  { token: "h-11", px: "44px", usage: "Inputs, botones md (default)" },
  { token: "h-12", px: "48px", usage: "Botones lg/xl" },
  { token: "h-14", px: "56px", usage: "Botones 2xl" },
];

const gaps = [
  { token: "gap-0.5", px: "2px" },
  { token: "gap-1", px: "4px" },
  { token: "gap-1.5", px: "6px" },
  { token: "gap-2", px: "8px" },
  { token: "gap-3", px: "12px" },
  { token: "gap-4", px: "16px" },
  { token: "gap-6", px: "24px" },
  { token: "gap-8", px: "32px" },
];

export default function SpacingSection() {
  return (
    <DSSection id="spacing" title="Espaciado & Grid" description="Breakpoints, sistema de alturas, gaps y layout grid.">
      <DSSubsection title="Breakpoints">
        <div className="rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-600">
                <th className="px-4 py-3">Breakpoint</th>
                <th className="px-4 py-3">Min-width</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 hidden sm:table-cell">Preview</th>
              </tr>
            </thead>
            <tbody>
              {breakpoints.map((b) => (
                <tr key={b.name} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-primary-700">{b.name}</code>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-neutral-700">{b.width}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{b.desc}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="h-2 rounded-full bg-primary-100" style={{ width: `${Math.min(parseInt(b.width) / 15, 100)}%`, minWidth: "8px" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DSSubsection>

      <DSSubsection title="Layout principal">
        <DSShowcase label="Sidebar + Content area">
          <div className="flex gap-2 items-stretch h-32">
            <div className="bg-neutral-800 rounded-lg flex items-center justify-center text-white text-xs font-mono" style={{ width: "60px" }}>
              <div className="text-center">
                <p>230px</p>
                <p className="text-neutral-400 text-[10px]">sidebar</p>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg border border-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">max-w-1360px</p>
                <p className="text-xs text-neutral-400">content area</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">Sidebar: 230px (default) → 260px (1680px+) → 320px (2000px+)</p>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Touch targets (alturas)">
        <DSShowcase>
          <div className="flex flex-col gap-2">
            {heights.map((h) => (
              <div key={h.token} className="flex items-center gap-3">
                <code className="w-12 text-xs font-mono text-neutral-500 flex-shrink-0">{h.token}</code>
                <div
                  className="bg-primary-100 rounded flex items-center px-3"
                  style={{ height: h.px, minWidth: "80px" }}
                >
                  <span className="text-[11px] font-mono text-primary-800">{h.px}</span>
                </div>
                <span className="text-xs text-neutral-500">{h.usage}</span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Escala de gaps">
        <DSShowcase>
          <div className="flex flex-col gap-2">
            {gaps.map((g) => (
              <div key={g.token} className="flex items-center gap-3">
                <code className="w-16 text-xs font-mono text-neutral-500 flex-shrink-0">{g.token}</code>
                <div className="bg-primary-300 rounded" style={{ width: g.px, height: "16px" }} />
                <span className="text-xs font-mono text-neutral-400">{g.px}</span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
