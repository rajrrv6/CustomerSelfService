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
├── docs/                        ← Repository documentation
│   ├── archive/                 ← Superseded audit documents
│   ├── cleanup/                 ← Cleanup logs, catalogs, and summaries
│   ├── important/               ← Active audit reports and roadmap
│   └── reference/               ← PDFs andparsed text inventory references
├── frontend/                    ← Next.js App Router codebase
│   ├── public/                  ← Web assets (manifest, icon logs)
│   ├── scripts/                 ← Developer workflow automation scripts
│   │   ├── debugging/           ← Swift extraction helpers
│   │   └── translations/        ← Python i18n key-merging scripts
│   ├── src/                     ← Application source code
│   │   ├── app/                 ← Next.js page routes, layouts, and API routes
│   │   ├── components/          ← Role-scoped UI modular namespaces
│   │   │   ├── agent-workspace/ ← Omnichannel support console
│   │   │   ├── analytics/       ← Incident graphs, SLA breaching boards
│   │   │   ├── client-admin/    ← Business calendars, NLU visual builders
│   │   │   ├── customer-portal/ ← CSAT stars, refund OTP wizards
│   │   │   ├── integrations/    ← Active webhooks, API vaults
│   │   │   ├── voice/           ← Dialer pads, supervisor monitoring consoles
│   │   │   └── shared/          ← Layout headers, sidebar nav lists, standard buttons
│   │   ├── archive/             ← Cleaned-up code history logs
│   │   │   ├── forms/           ← Unused shared fields
│   │   │   ├── responsive/      ← Obsolete layouts
│   │   │   └── old-builders/    ← Duplicate visual builders
│   │   ├── context/             ← AppContext and AuthContext wrappers
│   │   ├── stores/              ← Global Zustand states (UI, permissions, auth)
│   │   ├── hooks/               ← Reusable custom hooks
│   │   ├── data/                ← Seed lists
│   │   ├── i18n/                ← Bilingual translation maps
│   │   └── types/               ← TypeScript type scopes
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
```
