"use client";

import { useState } from "react";
import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Modal from "@/components/ui/Modal";
import AlertModal from "@/components/ui/AlertModal";
import Button from "@/components/ui/Button";

export default function ModalsSection() {
  const [modal, setModal] = useState(false);
  const [alert, setAlert] = useState(false);

  return (
    <DSSection id="modals" title="Modales" description="Modal genérico y AlertModal para confirmaciones destructivas.">
      <DSSubsection title="Modal">
        <DSShowcase label="Modal genérico con header, body scrollable y footer">
          <Button variant="secondary" onClick={() => setModal(true)}>Abrir Modal</Button>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            title="Título del modal"
            subtitle="Subtítulo opcional"
            footer={
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
                <Button onClick={() => setModal(false)}>Confirmar</Button>
              </div>
            }
          >
            <p className="text-sm text-neutral-600">
              Contenido del modal. El body es scrollable cuando excede la altura máxima (90vh).
              El modal se cierra con Escape o click en el backdrop.
            </p>
          </Modal>
        </DSShowcase>
      </DSSubsection>

      <DSSubsection title="AlertModal">
        <DSShowcase label="Modal de confirmación con acción destructiva">
          <Button variant="danger" onClick={() => setAlert(true)}>Abrir AlertModal</Button>
          <AlertModal
            open={alert}
            onClose={() => setAlert(false)}
            onConfirm={() => setAlert(false)}
            title="Suspender cliente"
            message={'Al suspender "Extra Life", todos sus tenants quedarán bloqueados y los usuarios no podrán acceder. ¿Deseas continuar?'}
            confirmLabel="Confirmar suspensión"
            cancelLabel="Cancelar"
          />
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
