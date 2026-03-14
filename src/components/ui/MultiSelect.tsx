"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

interface MultiSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MultiSelect({
  label,
  required,
  error,
  placeholder = "Seleccionar...",
  options,
  value,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const remove = (opt: string) => {
    onChange(value.filter((v) => v !== opt));
  };

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && (
        <label className="text-xs font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex min-h-[36px] w-full items-center gap-1 rounded-lg border px-2.5 py-1.5 text-left text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${
            error ? "border-red-400" : "border-neutral-300"
          }`}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {value.length === 0 ? (
              <span className="text-neutral-400 text-sm">{placeholder}</span>
            ) : (
              value.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-0.5 rounded-md bg-primary-50 border border-primary-200 px-1.5 py-0.5 text-xs font-medium text-primary-700"
                >
                  {v}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(v);
                    }}
                    className="text-primary-400 hover:text-primary-700 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            size={14}
            className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => {
              const selected = value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 ${
                    selected ? "text-primary-700 font-medium" : "text-neutral-700"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      selected
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-neutral-300"
                    }`}
                  >
                    {selected && <Check size={10} />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
