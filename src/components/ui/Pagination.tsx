"use client";

import { IconChevronLeft, IconChevronRight, IconChevronDown } from "@tabler/icons-react";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  if (total <= 10) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 sm:px-6 py-2">
      {/* Left: Mostrar select */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Mostrar</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 rounded-lg bg-neutral-100 pl-3 pr-8 text-sm font-medium text-neutral-600 outline-none hover:bg-neutral-200 hover:text-neutral-800 transition-colors appearance-none cursor-pointer"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <IconChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Right: nav buttons with counter between */}
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-100 px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <IconChevronLeft size={15} />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <span className="text-sm text-neutral-600 whitespace-nowrap px-2">
          {from}–{to} de {total}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-100 px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <IconChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
