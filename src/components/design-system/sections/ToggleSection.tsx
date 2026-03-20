"use client";

import { useState } from "react";
import DSSection, { DSSubsection, DSShowcase } from "../DSSection";
import Toggle from "@/components/ui/Toggle";

export default function ToggleSection() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);

  return (
    <DSSection id="toggle" title="Toggle" description="Switch para estados binarios on/off.">
      <DSSubsection title="Estados">
        <DSShowcase>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Toggle checked={on} onChange={setOn} />
              <span className="text-sm text-neutral-700">Activo ({on ? "on" : "off"})</span>
            </div>
            <div className="flex items-center gap-4">
              <Toggle checked={off} onChange={setOff} />
              <span className="text-sm text-neutral-700">Inactivo ({off ? "on" : "off"})</span>
            </div>
            <div className="flex items-center gap-4">
              <Toggle checked={true} onChange={() => {}} disabled />
              <span className="text-sm text-neutral-400">Deshabilitado (on)</span>
            </div>
            <div className="flex items-center gap-4">
              <Toggle checked={false} onChange={() => {}} disabled />
              <span className="text-sm text-neutral-400">Deshabilitado (off)</span>
            </div>
          </div>
        </DSShowcase>
      </DSSubsection>
    </DSSection>
  );
}
