"use client";

import DSSidebar from "@/components/design-system/DSSidebar";
import ColorsSection from "@/components/design-system/sections/ColorsSection";
import TypographySection from "@/components/design-system/sections/TypographySection";
import SpacingSection from "@/components/design-system/sections/SpacingSection";
import TokensSection from "@/components/design-system/sections/TokensSection";
import IconsSection from "@/components/design-system/sections/IconsSection";
import ButtonsSection from "@/components/design-system/sections/ButtonsSection";
import InputsSection from "@/components/design-system/sections/InputsSection";
import BadgesSection from "@/components/design-system/sections/BadgesSection";
import ToggleSection from "@/components/design-system/sections/ToggleSection";
import FormFieldsSection from "@/components/design-system/sections/FormFieldsSection";
import FiltersSection from "@/components/design-system/sections/FiltersSection";
import PaginationSection from "@/components/design-system/sections/PaginationSection";
import RowMenuSection from "@/components/design-system/sections/RowMenuSection";
import ModalsSection from "@/components/design-system/sections/ModalsSection";
import ToastsSection from "@/components/design-system/sections/ToastsSection";
import PageHeaderSection from "@/components/design-system/sections/PageHeaderSection";
import CardsSection from "@/components/design-system/sections/CardsSection";
import EmptyStateSection from "@/components/design-system/sections/EmptyStateSection";
import TablesSection from "@/components/design-system/sections/TablesSection";

export default function DesignSystemPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <DSSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 md:py-16">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-neutral-900">Amplifica Design System</h1>
            <p className="mt-2 text-base text-neutral-500">
              Fundamentos visuales, tokens y componentes del admin panel.
            </p>
          </div>

          {/* Fundamentos */}
          <ColorsSection />
          <TypographySection />
          <SpacingSection />
          <TokensSection />
          <IconsSection />

          {/* Atoms */}
          <ButtonsSection />
          <InputsSection />
          <BadgesSection />
          <ToggleSection />

          {/* Molecules */}
          <FormFieldsSection />
          <FiltersSection />
          <PaginationSection />
          <RowMenuSection />

          {/* Organisms */}
          <ModalsSection />
          <ToastsSection />
          <PageHeaderSection />
          <CardsSection />
          <EmptyStateSection />
          <TablesSection />
        </div>
      </main>
    </div>
  );
}
