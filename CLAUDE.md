# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amplifica Admin SaaS — an internal admin panel for managing a multi-tenant SaaS platform. Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and TypeScript. The UI is in Spanish.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build (also validates TypeScript)
- `npm run lint` — run ESLint
- No test framework is configured.

## Architecture

**Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript (strict). No backend — all data comes from `src/lib/mock-data.ts`.

**Path alias:** `@/*` maps to `./src/*`.

**Layout hierarchy:**
- `src/app/layout.tsx` — root layout wrapping three client-side context providers: `ThemeProvider` → `RoleProvider` → `SidebarProvider`
- Pages use `MainLayout` (`src/components/layout/MainLayout.tsx`) which renders the `Sidebar` + responsive mobile drawer + main content area (max-width 1360px)

**Routing (App Router):** Each entity has a CRUD pattern:
- `/clientes`, `/tenants`, `/contratos`, `/usuarios`, `/planes` — list pages
- `/[entity]/crear` — create form
- `/[entity]/[id]` — detail view
- `/[entity]/[id]/editar` — edit form
- Additional: `/planes/trial/*` for trial configs, `/dashboard`, `/reportes`, `/auditlog`, `/couriers`, `/facturacion`, `/configuracion`

**Role-based access:** `src/lib/role-context.tsx` defines 5 roles (Super Admin, Comercial, Customer Success, Operaciones, Finanzas) with permission checks `canVer`, `canEditar`, `canCrear`, `canDeshabilitar`. The Sidebar and pages filter visibility based on these. Role is switchable in the UI for demo purposes.

**Theming:** `src/lib/theme-context.tsx` manages light/dark mode by toggling `html.dark` class. CSS variables in `globals.css` define the dark-mode palette. Sidebar always uses a dark background.

**Design system:** Custom color scales defined in `globals.css` under `@theme` — primary (blue-violet) and neutral palettes. Font sizes are a custom scale (xs=12px through 3xl=24px). All UI components are in `src/components/ui/` (Button, Input, Select, Modal, Badge, Pagination, Toast, etc.) — these are project-specific, not from an external library.

**Icons:** Uses `@tabler/icons-react` as the primary icon library. Some components also use `lucide-react`.

**Data layer:** `src/lib/mock-data.ts` contains all mock entities (Empresas, Tenants, Contratos, Usuarios, Plans, TrialConfigs, AuditLog). `src/lib/types.ts` has all TypeScript interfaces. All pages are client-side ("use client") since there is no real API.

**All components are client components** — every page and component uses `"use client"` directive since the app relies on React state, context, and browser APIs throughout.
