"use client";

import { IconCheck } from "@tabler/icons-react";
import type { FilterOption } from "./FilterDropdown";

interface FilterCheckboxListProps {
  options: FilterOption[];
  selected: Set<string>;
  onChange: (v: Set<string>) => void;
}

export default function FilterCheckboxList({ options, selected, onChange }: FilterCheckboxListProps) {
  const toggle = (v: string) => {
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => toggle(opt.value)}
          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
            selected.has(opt.value) ? "bg-primary-600 border-primary-600" : "border-neutral-300 bg-white"
          }`}>
            {selected.has(opt.value) && <IconCheck size={10} className="text-white" strokeWidth={3} />}
          </span>
          {opt.dot && <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dot}`} />}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
