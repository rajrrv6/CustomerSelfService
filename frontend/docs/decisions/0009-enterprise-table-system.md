# ADR-009 — Enterprise Table System

**Date:** 2026-06-01  
**Status:** Accepted  
**Sprint:** Sprint 2 — Enterprise Table System

---

## Context

The platform has many tabular views (e.g. CSR query lists, active client tenant lists, audit compliance logs, surveys, WhatsApp template catalogs).
Previously, these tables were built using ad-hoc custom grids, list maps, and a simple custom styled `<EnterpriseTable headers={...}>` wrapper. These ad-hoc custom grids lacked core enterprise features like interactive column-based sorting, query text filtering, density switching, column visibility toggles, standard client-side pagination, bulk selections, and sub-row detail expansion.

## Decision

We will implement a reusable, highly scalable, and type-safe table infrastructure built on top of `@tanstack/react-table` (`react-table` v8).
We will create a core generic table component (`EnterpriseTable.tsx`) and separate the layout into small, decoupled sub-components (search, filters, bulk actions, column toggles, pagination) to avoid a massive "God Component" structure.

## Core Component Map

| Component | Responsibility |
|---|---|
| `EnterpriseTable.tsx` | Orcherstrates the TanStack `useReactTable` hook, renders grid layout, handles loading/empty fallbacks. |
| `TableToolbar.tsx` | Layout wrapper for the top toolbar. |
| `TableSearchInput.tsx` | Debounced text filtering hook trigger. |
| `TableFilterDropdown.tsx` | Popover selector for discrete column value filtering. |
| `TableColumnVisibility.tsx` | Checkbox dropdown list to hide/show specific ColumnDefs. |
| `TablePagination.tsx` | Standard Next/Prev buttons, items-per-page dropdowns, and "Page X of Y" layout. |
| `TableBulkActions.tsx` | Slide-up confirmation overlay when row selection keys > 0. |

## Consequences

- **Performant Rerendering:** TanStack table leverages lightweight react-table states, reducing rerenders during text filtering or column toggling.
- **Strict Type-Safety:** Leverages generic types (`TData`) to bind custom cell formatters, action menus, and callback hooks correctly.
- **RTL & Dynamic i18n support:** Preserves mirroring dynamically (`dir="rtl"` and custom translation lookups).
- **Separation of Concerns:** Business logic (merge/archive callbacks, CRUD actions) is declared as configuration-driven ColumnDefs inside parent tabs, keeping the shared table infrastructure completely decoupled from business logic.
