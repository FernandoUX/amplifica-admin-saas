"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

// ─── Chart Config ─────────────────────────────────────────────────────────────

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: { light: string; dark: string };
  }
>;

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within <ChartContainer>");
  return ctx;
}

// ─── Chart Container ──────────────────────────────────────────────────────────

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { config: ChartConfig; children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"] }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={`flex aspect-auto justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-neutral-500 dark:[&_.recharts-cartesian-axis-tick_text]:fill-neutral-400 [&_.recharts-cartesian-grid_line]:stroke-neutral-200 dark:[&_.recharts-cartesian-grid_line]:stroke-neutral-700 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-neutral-200 dark:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-neutral-700 [&_.recharts-polar-grid_[stroke]]:stroke-neutral-200 dark:[&_.recharts-polar-grid_[stroke]]:stroke-neutral-700 [&_.recharts-radial-bar-background-sector]:fill-neutral-100 dark:[&_.recharts-radial-bar-background-sector]:fill-neutral-800 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-neutral-100 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-neutral-800 [&_.recharts-reference-line_[stroke]]:stroke-neutral-200 dark:[&_.recharts-reference-line_[stroke]]:stroke-neutral-700 [&_.recharts-sector[stroke]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none ${className}`}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

// ─── Chart Style (CSS Variables) ──────────────────────────────────────────────

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color || cfg.theme);
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
${colorConfig
  .map(([key, cfg]) => {
    const color = cfg.theme ? cfg.theme.light : cfg.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
html.dark [data-chart="${id}"] {
${colorConfig
  .map(([key, cfg]) => {
    const color = cfg.theme ? cfg.theme.dark : cfg.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}`,
      }}
    />
  );
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    dataKey?: string;
    color?: string;
    payload?: Record<string, unknown>;
    fill?: string;
  }>;
  label?: string;
  labelKey?: string;
  nameKey?: string;
  indicator?: "dot" | "line" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  formatter?: (value: number, name: string) => React.ReactNode;
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, labelKey, nameKey, indicator = "dot", hideLabel = false, hideIndicator = false, formatter, className }, ref) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={`rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg ${className || ""}`}
      >
        {!hideLabel && (
          <p className="mb-1.5 font-medium text-neutral-700">
            {labelKey && payload[0]?.payload ? String(payload[0].payload[labelKey]) : label}
          </p>
        )}
        <div className="flex flex-col gap-1">
          {payload.map((item, i) => {
            const key = nameKey ? String(item.payload?.[nameKey] ?? item.name) : String(item.dataKey ?? item.name);
            const cfg = config[key] || {};
            const color = item.color || item.fill || `var(--color-${key})`;
            const displayName = cfg.label || key;

            return (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {!hideIndicator && (
                    indicator === "dot" ? (
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    ) : indicator === "line" ? (
                      <span className="h-0.5 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    ) : (
                      <span className="h-0.5 w-3 rounded-full flex-shrink-0 border-b border-dashed" style={{ borderColor: color }} />
                    )
                  )}
                  <span className="text-neutral-500">{String(displayName)}</span>
                </div>
                <span className="font-medium text-neutral-900 tabular-nums">
                  {formatter ? formatter(item.value ?? 0, String(displayName)) : item.value?.toLocaleString("es-CL")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// ─── Chart Legend ─────────────────────────────────────────────────────────────

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends React.ComponentProps<"div"> {
  payload?: Array<{ value: string; color?: string; dataKey?: string }>;
  nameKey?: string;
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ payload, nameKey, className }, ref) => {
    const { config } = useChart();
    if (!payload?.length) return null;

    return (
      <div ref={ref} className={`flex items-center justify-center gap-4 pt-3 ${className || ""}`}>
        {payload.map((item) => {
          const key = nameKey ? item.value : String(item.dataKey ?? item.value);
          const cfg = config[key] || {};
          const color = item.color || `var(--color-${key})`;

          return (
            <div key={item.value} className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span>{String(cfg.label || key)}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent };
