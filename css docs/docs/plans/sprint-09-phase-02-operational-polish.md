# Sprint 09 Phase 2 Plan: Client Admin Operational Polish & Workflow Continuity

## 1. Goal & Objectives

Perform a full operational polish, workflow continuity, and enterprise UX refinement pass across the Client Admin ecosystem. This sprint transitions the workspace from feature-complete to operationally cohesive.

- **Dashboard Workflow Continuity:** Build custom sub-categorized quick actions launcher card, timeline feeds, and dynamic SLA warnings in `BotsTab.tsx`.
- **Cross-Module Activity Linking:** Connect `KnowledgeBaseTab`, `DialogFlowCanvas`, `ChannelsTab`, `ExecutiveDashboard`, and `GuardrailsTab` through contextual actions and quick-jump triggers.
- **EmptyStates Operational Refinement:** Replace major Client Admin empty layouts with guided onboarding flows and CTA stacks.
- **Unified Event Feed:** Add reusable `<OperationalActivityFeed />` telemetry component reflecting Zustand alerts and audit logs.
- **Overlays & Drawers UX:** Validate accessibility, focus traps, focus restoration, and keyboard tab loops in RTL layouts.

---

## 2. Proposed Changes

1. **Activity Feed Component (`OperationalActivityFeed.tsx`):**
   - Live telemetry rendering based on global alert store filters (`all` | `bots` | `knowledge` | `analytics` | `channels` | `guardrails`).
2. **Dashboard Polish (`BotsTab.tsx`):**
   - Integrate feed, display warning alerts, and categorize launcher cards.
3. **Cross-Module Activity Linking:**
   - Link knowledge ingestion, dialog graphs, safety guardrails, and analytics dashboard with drilldowns.
4. **EmptyStates Refinement:**
   - Upgrade `KnowledgeBaseTab` empty states to include Upload File / Crawl URL / Connect DB cards.
5. **Accessibility & Overlays:**
   - Review focus restoration and RTL mirror transformations.

---

## 3. Verification Plan

### Automated
- Compile and build workspace:
  ```bash
  cd frontend
  npm run typecheck
  npm run build
  ```

### Manual
- Validate quick-action redirection and deep-link navigations.
- Check live reactivity of the timeline feed to configuration changes.
- Verify focus-visible styling and keyboard support.
