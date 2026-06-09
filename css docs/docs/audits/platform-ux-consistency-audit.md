# Platform UX Consistency Audit

**Audit Date:** 2026-06-04  
**Auditor:** Antigravity — Code inspection & UX analysis  

---

## 1. Status Badges Consistency

**Current State:**
* `AuditStatusBadge.tsx`: Renders a plain HSL border/text badge. No colored indicator dot. Uses different padding (`px-2.5`) than other modules.
* `BillingStatusBadge.tsx`: Renders HSL border/text and a small dot using `bg-current`. Spacing: `px-2 py-0.5`.
* `KnowledgeConnectorStatusBadge.tsx`: Renders HSL border/text and a small dot using `bg-current`. Spacing: `px-2 py-0.5`.
* `TelephonyStatusBadge.tsx`: Renders HSL border/text and a small dot using `bg-current`. Spacing: `px-2 py-0.5`.
* `SystemOpsStatusBadge.tsx`: Renders HSL border/text and a small dot using custom Tailwind backgrounds (`bg-emerald-500`, etc.) instead of `bg-current`. Spacing: `px-2.5 py-0.5`.
* `TenantListTab.tsx`: Contains an inline status badge mapping `getStatusBadge` duplicating the Tailwind styles of `BillingStatusBadge`.

**Target Standard:**
* All status badges must share consistent spacing: `px-2.5 py-0.5 text-[10px] font-bold border rounded-full`.
* All badges with status states (active, healthy, offline, pending, degraded, etc.) should render a small leading indicator dot (`w-1.5 h-1.5 rounded-full shrink-0`) using `bg-current` for unified color consistency, separated by an RTL-safe margin (`mr-1.5 rtl:ml-1.5 rtl:mr-0`).

---

## 2. Drawers & Modals Close/Esc/Backdrop Behaviors

**Current State:**
* `TenantDetailDrawer.tsx` slide-over handles click-out and Escape key bindings manually. Width is `max-w-lg`. It does not support focus trapping.
* `TenantProvisioningWizard.tsx` is wrapped in `ModalWrapper` which properly supports focus trapping, Escape handling, and overlay clicks.
* Other dialogs (e.g. `BillingPlanModal.tsx`, `SipTrunkConfig` drawers/modals) handle overlays and Escape events manually, causing inconsistent modal closing behavior.

**Target Standard:**
* Slide-overs and modals must trap focus.
* Overlay backdrops must block background interactions and use identical styling (`bg-slate-900/40 backdrop-blur-[2px]`).
* Escape key listener and mouse-click-outside listeners must be consistently wired to trigger close callbacks unless specifically prevented (e.g., during active provisioning).

---

## 3. EmptyState Spacing & Copywriting

**Current State:**
* EmptyStates in `TenantListTab`, `JobsQueueTab`, `ErrorMonitoringTab`, and `llm-registry` vary in margin sizes and padding styles.
* Some sub-features use unaligned layouts or basic text fallbacks instead of standard icon/title/description EmptyStates.

**Target Standard:**
* EmptyStates must align: centered icon (gray, `w-12 h-12`), bold title (`text-sm font-bold text-slate-800 dark:text-white mt-3`), and description text (`text-xs text-slate-400 dark:text-slate-500 mt-1`).

---

## 4. Query-Sync Persistence Fallbacks

**Current State:**
* Tab containers utilize `useTabQueryState` which parses query parameters on mount.
* If a query parameter like `?tab=invalid_tab` is passed, some containers fallback to the default tab visually but do not reset the URL parameter, leaving the path mismatching.

**Target Standard:**
* Verify that `useTabQueryState` redirects the browser routing path to default values when invalid URL queries are parsed.
