"use client";

import { useState } from "react";
import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Pagination from "@/components/ui/Pagination";

export default function PaginationSection() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  return (
    <DSSection id="pagination" title="Paginación" description="Control de paginación con selector de tamaño de página.">
      <DSSubsection title="Interactivo">
        <DSShowcase label="30 registros totales — navega entre páginas">
          <Pagination
            page={page}
            total={30}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="Pocos registros (oculto automáticamente)">
        <DSShowcase label="Con 8 registros y pageSize=20, la paginación se oculta">
          <Pagination
            page={1}
            total={8}
            pageSize={20}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
          />
          <p className="text-xs text-neutral-500 mt-2">La paginación no se muestra cuando total &le; 10</p>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
