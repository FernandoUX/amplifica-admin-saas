import DSSection, { DSSubsection, DSShowcase } from "../DSSection";

const typeScale = [
  { name: "3xl", size: "24px", lineHeight: "32px", usage: "Títulos de página", weight: "700" },
  { name: "2xl", size: "20px", lineHeight: "26px", usage: "Encabezados de sección", weight: "700" },
  { name: "xl", size: "18px", lineHeight: "24px", usage: "Subencabezados", weight: "600" },
  { name: "lg", size: "16px", lineHeight: "24px", usage: "Texto destacado", weight: "600" },
  { name: "base", size: "14px", lineHeight: "20px", usage: "Cuerpo de texto (default)", weight: "400" },
  { name: "sm", size: "13px", lineHeight: "18px", usage: "Labels, textos UI", weight: "500" },
  { name: "xs", size: "12px", lineHeight: "16px", usage: "Captions, hints, badges", weight: "400" },
];

const weights = [
  { value: "400", name: "Regular", sample: "El zorro marrón rápido salta la valla." },
  { value: "500", name: "Medium", sample: "El zorro marrón rápido salta la valla." },
  { value: "600", name: "Semibold", sample: "El zorro marrón rápido salta la valla." },
  { value: "700", name: "Bold", sample: "El zorro marrón rápido salta la valla." },
];

export default function TypographySection() {
  return (
    <DSSection id="typography" title="Tipografía" description="Familia tipográfica, escala de tamaños y pesos.">
      <DSSubsection title="Font Family">
        <DSShowcase>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-neutral-900">Inter</span>
            <span className="text-sm text-neutral-500">-apple-system, sans-serif</span>
          </div>
          <p className="mt-3 text-base text-neutral-600">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%
          </p>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Escala tipográfica">
        <div className="rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-semibold text-neutral-600">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Line Height</th>
                <th className="px-4 py-3 hidden sm:table-cell">Peso típico</th>
                <th className="px-4 py-3 hidden md:table-cell">Uso</th>
                <th className="px-4 py-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {typeScale.map((t) => (
                <tr key={t.name} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-primary-700">text-{t.name}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 font-mono">{t.size}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700 font-mono">{t.lineHeight}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">{t.weight}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{t.usage}</td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: t.size, lineHeight: t.lineHeight, fontWeight: Number(t.weight) }} className="text-neutral-900">
                      Amplifica
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DSSubsection>

      <DSSubsection title="Desktop vs Mobile">
        <DSShowcase label="Tamaños responsive: los inputs y botones usan text-base (14px) en mobile y text-sm (13px) en desktop para mayor legibilidad táctil.">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-2">Mobile (&lt;768px)</p>
              <p style={{ fontSize: "14px" }} className="text-neutral-900">text-base → 14px</p>
              <p style={{ fontSize: "16px" }} className="text-neutral-600 mt-1">Labels → 16px</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-2">Desktop (md+)</p>
              <p style={{ fontSize: "13px" }} className="text-neutral-900">text-sm → 13px</p>
              <p style={{ fontSize: "13px" }} className="text-neutral-600 mt-1">Labels → 13px</p>
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Pesos">
        <DSShowcase>
          <div className="flex flex-col gap-4">
            {weights.map((w) => (
              <div key={w.value} className="flex items-baseline gap-4">
                <span className="w-20 text-xs font-mono text-neutral-500 flex-shrink-0">{w.value} {w.name}</span>
                <span className="text-lg text-neutral-900" style={{ fontWeight: Number(w.value) }}>
                  {w.sample}
                </span>
              </div>
            ))}
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
