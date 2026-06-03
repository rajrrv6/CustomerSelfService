# Sprint 07 Phase 0 — Super Admin Screen Audit & Corrective Stabilization Plan

## Goal
Audit all existing Super Admin business screens against the official inventory PDFs and apply only the minimal corrective stabilization required to align the platform with inventory workflows.

---

## 1. Scope of Work

### Master Data
- **ASR/TTS Speech Registry**: 
  - Add Edit and Delete action buttons to the table rows.
  - Convert languages list to an editable comma-separated text input.
  - Implement full save, update, delete simulation, and EmptyState handling.

### Infrastructure
- **Knowledge Connectors**:
  - Lazily import and wire `KnowledgeConnectorRegistry` into `InfrastructureContainer`.
  - Enable full tab synchronization via URL.

### Telephony
- **SIP Trunk Config**:
  - Stabilize the scaffolding screen into a high-fidelity operational view.
  - Display trunks table with concurrency and IP address metadata.
  - Implement provision and edit workflows with a modal.
- **DID Number Pool**:
  - Build a DID numbers inventory table.
  - Support status filtering (All, Assigned, Available) and number reservation addition.

### Analytics
- **Cost Benchmarks**:
  - Restore input and output token cost comparison bar charts.
  - Draw cost metrics dynamically from active models configuration.

### Billing & Audit Placeholders
- **Coming Soon Fallbacks**:
  - Add coming soon placeholder states containing HTML ID `id="h2db4u"` in billing and audit tabs.

---

## 2. Affected Files

| Component | File Path | Type | Action |
|-----------|-----------|------|--------|
| Infrastructure | [InfrastructureContainer.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/containers/InfrastructureContainer.tsx) | Component | Modify |
| Master Data | [AsrTtsRegistryTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/speech-providers/AsrTtsRegistryTab.tsx) | Component | Modify |
| Telephony | [TelephonyContainer.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/containers/TelephonyContainer.tsx) | Component | Modify |
| Telephony | [SipTrunkConfigTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/telephony/SipTrunkConfigTab.tsx) | Component | Modify |
| Telephony | [NumberPoolTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/telephony/NumberPoolTab.tsx) | Component | New |
| Analytics | [SuperAdminAnalyticsTab.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/analytics/SuperAdminAnalyticsTab.tsx) | Component | Modify |
| Layout | [SuperAdminLayout.tsx](file:///c:/Users/rajrr/CustomerSelfService/src/components/super-admin/shared/SuperAdminLayout.tsx) | Layout | Modify |

---

## 3. Architecture Constraints
- **Preserve Sprint 06 Navigation**: Do not modify routing, sidebars, context layers, or URL parameter-syncing patterns.
- **State-Driven Mock Data**: Keep simulations local and state-driven without remote REST/GraphQL connections.
- **Bilingual & Responsive**: Ensure RTL Arabic layout mirroring works without visual regressions.

---

## 4. Verification & Testing

### Automated Checks
- Run Typechecking: `npm run typecheck`
- Run Build Verification: `npm run build`

### Manual Checks
- Verify layout direction when changing language context to Arabic.
- Test modal closing, focus trapping, and validation errors.
