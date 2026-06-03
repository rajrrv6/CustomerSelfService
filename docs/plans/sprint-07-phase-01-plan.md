# Sprint 07 Phase 1 — Knowledge Connector Registry Operational Foundation Plan

## Goal
Transform the newly stabilized Knowledge Connector Registry into a scalable operational registry foundation supporting full CRUD management, enable/disable toggle actions, custom endpoint placeholders, filtering, search, and simulated mock sync transitions.

---

## 1. Objectives & Scope
- **Status Set Expansion**: Add `synchronizing` status with blue styling and ping indicator animations.
- **Enable/Disable Toggles**: Implement row actions using `ToggleLeft` and `ToggleRight` icons.
- **Form Custom Protocols**: Add URL validations that allow `gdrive://` and `file://` protocols. Add input placeholders mapping connector categories.
- **Empty States**: If zero items remain, show a centered card detailing RAG benefits and a large "Add Connector" CTA.

---

## 2. Affected Files

| Component | File Path | Action |
|-----------|-----------|--------|
| Types | [knowledgeConnector.ts](file:///c:/Users/rajrr/CustomerSelfService/src/types/knowledgeConnector.ts) | Modify |
| Registry UI | [KnowledgeConnectorStatusBadge.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/infrastructure/KnowledgeConnectorStatusBadge.tsx) | Modify |
| Registry UI | [KnowledgeConnectorTable.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/infrastructure/KnowledgeConnectorTable.tsx) | Modify |
| Registry UI | [KnowledgeConnectorFormModal.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/infrastructure/KnowledgeConnectorFormModal.tsx) | Modify |
| Registry UI | [KnowledgeConnectorRegistry.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/infrastructure/KnowledgeConnectorRegistry.tsx) | Modify |

---

## 3. Verification Plan

### Automated Checks
- Run typecheck: `npm run typecheck`
- Run build check: `npm run build`

### Manual Verification
- Add, Edit, and Delete connectors.
- Click "Sync Now" to verify the transition: `Pending/Active → Synchronizing → Active/Error`.
- Click Enable/Disable toggles.
- Delete all items to check the full EmptyState page.
- Switch locale context to Arabic and verify mirroring.
