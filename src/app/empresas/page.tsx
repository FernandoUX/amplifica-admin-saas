"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Toggle from "@/components/ui/Toggle";
import Toast from "@/components/ui/Toast";
import CreateEmpresaModal from "@/components/empresas/CreateEmpresaModal";
import { MOCK_EMPRESAS } from "@/lib/mock-data";
import { Empresa } from "@/lib/types";
import { Building2, Plus, Search, MoreVertical } from "lucide-react";

const planBadgeVariant = (plan: string) => {
  if (plan === "Express") return "express";
  if (plan === "Envíos Pro") return "envios-pro";
  if (plan === "Multicanal") return "multicanal";
  return "default";
};

const estadoVariant = (e: string) => {
  if (e === "Al día" || e === "Activo") return "active";
  if (e === "Por vencer") return "pending";
  if (e === "Vencido" || e === "Inactivo") return "vencido";
  return "default";
};

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const filtered = empresas.filter((e) =>
    `${e.nombre} ${e.razonSocial}`.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreated = (e: Empresa) => {
    setEmpresas((prev) => [e, ...prev]);
    setToast(true);
  };

  const handleToggle = (id: string, val: boolean) => {
    setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, habilitado: val } : e)));
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        <PageHeader
          breadcrumb="Inicio / Empresas"
          title="Empresas"
          description="Administración y gestión de empresas con contratos"
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  className="h-8 w-56 rounded-lg border border-neutral-300 pl-8 pr-3 text-sm placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Busca por nombre o razón social"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Button size="md" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
                Crear
              </Button>
            </div>
          }
        />

        <div className="flex-1 px-6 pb-6">
          {filtered.length === 0 && !search ? (
            <EmptyState
              icon={<Building2 size={24} />}
              title="No tienes empresas creadas aún"
              onCreateClick={() => setModalOpen(true)}
            />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="table-scroll">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Nombre</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Razón Social</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Planes</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Contratos</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">E. Comercial</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500">Estado</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-neutral-500">Habilitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((empresa) => (
                      <tr key={empresa.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900">{empresa.nombre}</span>
                            <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{empresa.razonSocial}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {empresa.planes.length > 0
                              ? empresa.planes.map((p) => (
                                  <Badge key={p} variant={planBadgeVariant(p) as never}>{p}</Badge>
                                ))
                              : <span className="text-xs text-neutral-400">—</span>
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{empresa.contratos}</td>
                        <td className="px-4 py-3">
                          <Badge variant={estadoVariant(empresa.estadoComercial) as never}>
                            {empresa.estadoComercial}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={empresa.estado === "Activo" ? "active" : "inactive"}>
                            {empresa.estado}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Toggle
                            checked={empresa.habilitado}
                            onChange={(v) => handleToggle(empresa.id, v)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                total={filtered.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </div>
          )}
        </div>
      </div>

      <CreateEmpresaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <Toast
        open={toast}
        onClose={() => setToast(false)}
        type="success"
        title="¡Empresa creada!"
        message="La empresa se ha creado correctamente."
      />
    </MainLayout>
  );
}
