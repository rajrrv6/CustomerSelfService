# Documentation Structure Recommendations
## CustomerSelfService Platform — Documentation Quality Control

**Audit Date:** 2026-06-03T17:13:44+05:30  
**Lead Auditor:** Senior Documentation Architect (Antigravity)  
**Status:** Recommendations Pending Implementation  

---

## 1. Directory Structure Improvements

Currently, the repository contains two separate documentation hubs:
1. Root-level `docs/` containing checkpoints, sprints, cleanup records, and reports.
2. App-specific `frontend/docs/` containing legacy plans, Decisions (ADRs), Reference PDFs, and archived documents.

### Recommendation 1: Consolidate Split Hierarchies
To maintain a single source of truth and reduce duplicated files, we recommend consolidating all documentation folders into the root-level `docs/` directory under a unified scheme:
```
docs/
├── decisions/        ← ADR files (0001-0010, auth, notifications)
├── important/        ← Active audit reports and roadmap
├── cleanup/          ← Execution logs and catalogs
├── sprints/          ← active Sprint Plans (01–05)
├── checkpoints/      ← Readiness checklists
├── reports/          ← Priority matrix, tech debt roadmap
├── reference/        ← PDF manuals and text inventory
└── archive/          ← Superseded audits and legacy sprint logs
```
This consolidation removes the need for twin `docs/` directories and keeps the `frontend/` folder focused exclusively on code, styles, and test files.

---

## 2. Archival Actions

### Recommendation 2: Relocate Superseded Audit
* **Action:** Move the outdated `frontend/docs/repository_audit_report.md` (dated 2026-06-01) to `frontend/docs/archive/repository_audit_report_2026-06-01.md`.
* **Rationale:** This document has incorrect Customer Portal completion statuses and is superseded by the `docs/important/enterprise-audit-report-2026-06-03.md` file.

### Recommendation 3: Archive Legacy Sprint Files
* **Action:** Move legacy sprint plans (e.g. `sprint-auth-foundation.md`, `sprint-voice-ivr.md`, etc. — 16 files in total) and checkpoints (15 files in total) located in the active `frontend/docs/sprints/` and `frontend/docs/checkpoints/` paths into a new `docs/archive/sprints/` subdirectory.
* **Rationale:** The project has transitioned to the unified, phased sprint system (Sprint 01–05). Leaving older sprint stubs in active folders clutters development tracking.

---

## 3. Implementation Plan (Hygiene Pass)

1. **Step 1:** Complete the stale reference updates inside `archive-summary.md` and `enterprise-structure-summary.md`.
2. **Step 2:** Relocate `repository_audit_report.md` to `frontend/docs/archive/`.
3. **Step 3:** Perform a file migration moving decisions, reference, and archive directories from `frontend/docs/` to the root `docs/` directory.
4. **Step 4:** Clear the empty legacy folders inside `frontend/docs/`.
