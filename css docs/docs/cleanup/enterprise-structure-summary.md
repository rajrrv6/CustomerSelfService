# Enterprise Structure Summary
## CustomerSelfService Platform — Structure Stabilization

**Cleanup Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:30:58+05:30  
**Auditor / Architect:** Senior Frontend Architecture Maintainer (Antigravity)  

---

## 1. Directory Blueprint

The repository structure now conforms to an enterprise-grade standard, separating active application resources, testing harnesses, archived code blocks, reference files, and developer utilities.

```
CustomerSelfService/
├── docs/                        ← Workspace-level documentation
│   ├── checkpoints/             ← Release gating checklists
│   ├── cleanup/                 ← Cleanup logs, catalogs, and summaries
│   ├── documentation/           ← Documentation validation & quality audits
│   ├── important/               ← Active audit reports and master roadmap
│   ├── reports/                 ← ROI matrix and remaining work reports
│   └── sprints/                 ← Active sprint plans (01-05)
├── frontend/                    ← Next.js App Router codebase
│   ├── docs/                    ← Code-level duplicate & reference documentation
│   │   ├── archive/             ← Stale audit files & historical logs
│   │   ├── decisions/           ← Architectural Decision Records (ADRs)
│   │   ├── plans/               ← Legacy feature specification plans
│   │   ├── reference/           ← Reference inventory PDFs and text parses
│   │   └── [synchronized]       ← Checkpoints, sprints, and reports copies
│   ├── public/                  ← Web assets
│   ├── scripts/                 ← Developer workflow scripts
│   │   ├── debugging/           ← Swift extraction helpers
│   │   └── translations/        ← Python key-merging scripts
│   ├── src/                     ← Application source code
│   │   ├── app/                 ← App routing layouts & pages
│   │   ├── components/          ← Active role-scoped UI namespaces
│   │   │   ├── agent-workspace/ ← Omnichannel support console
│   │   │   ├── analytics/       ← Incident graphs, SLA breaching boards
│   │   │   ├── client-admin/    ← Business calendars, NLU visual builders
│   │   │   ├── customer-portal/ ← CSAT stars, refund OTP wizards
│   │   │   ├── integrations/    ← Active webhooks, API vaults
│   │   │   ├── voice/           ← Dialer pads, supervisor monitoring consoles
│   │   │   └── shared/          ← Layout headers, sidebar nav lists, standard buttons
│   │   ├── archive/             ← Safe code archiving namespaces
│   │   │   ├── forms/           ← Unused shared inputs
│   │   │   ├── responsive/      ← Obsolete responsive containers
│   │   │   └── old-builders/    ← Duplicate builders
│   │   ├── context/             ← State contexts
│   │   ├── stores/              ← Zustand stores
│   │   ├── hooks/               ← Reusable custom hooks
│   │   ├── data/                ← Seed data list files
│   │   ├── i18n/                ← Bilingual dictionaries
│   │   └── types/               ← Typescript interfaces
│   ├── tests/                   ← Automated testing suite
│   │   ├── vitest/              ← Unit and layout component tests
│   │   └── playwright/          ← End-to-end integration tests
│   ├── package.json             ← Node package settings
│   └── tsconfig.json            ← TypeScript configurations
```

---

## 2. Integrity Verification

To maintain strict safety policies, the structural changes avoid breaking dependencies:
* **Active Routing:** The App Router folder (`src/app/`) remains entirely untouched to ensure Next.js route mapping is unchanged.
* **Orphan Verification:** Telephony voice components (`src/components/voice/`) and integration tools (`src/components/integrations/`) are verified as actively imported. They remain fully linked within their active parent scopes.
* **Type Safety:** The archive directory is ignored during compile steps by using exclusions in `tsconfig.json`. This keeps `npm run typecheck` functional and clean.
* **Testing suite:** Vitest tests compile and pass (24/24 passed).
