# Documentation Governance Charter

**Effective Date**: 2026-06-04  
**Authority**: Platform Engineering — Super Admin Domain  
**Review Cadence**: Per major sprint milestone

---

## 1. Canonical Documentation Root

All platform documentation is maintained in a **single authoritative location**:

```
CustomerSelfService/docs/
```

The `CustomerSelfService/frontend/docs/` directory is a **legacy secondary root** maintained only for tooling compatibility (AI agent sprint output). During active sprint work, agent-generated docs may land in `frontend/docs/` and must be migrated to the canonical root at sprint close.

---

## 2. Directory Structure

```
docs/
├── architecture/       ← System-level design decisions, IA maps, routing
├── archive/            ← Superseded docs, cleanup logs, obsolete records
│   └── cleanup/        ← Repo hygiene records from prior cleanup passes
├── audits/             ← Validation reports, gap audits, screen inventories
├── checkpoints/        ← Per-sprint/phase milestone completion records
├── decisions/          ← Architectural Decision Records (ADRs)
├── documentation/      ← Documentation health reports (meta-docs)
├── important/          ← Critical gap analyses, roadmaps, production readiness
├── plans/              ← Implementation plans for sprints and features
├── reference/          ← Source PDFs, screen inventory files, training docs
├── reports/            ← Operational reports, backlogs, priority matrices
├── sprints/            ← Sprint history files (one per sprint/phase)
├── walkthroughs/       ← Post-implementation summaries and technical walkthroughs
└── repository_audit_report.md
```

---

## 3. Naming Conventions

### Sprint Plans
```
plans/sprint-{NN}-phase-{MM}-{slug}.md
plans/sprint-{NN}-{slug}.md
```
Examples: `sprint-08-phase-03-stabilization.md`, `sprint-06-super-admin.md`

### Checkpoints
```
checkpoints/checkpoint-sprint-{NN}-phase-{MM}.md
checkpoints/checkpoint-phase-{slug}.md
checkpoints/checkpoint-{descriptive-name}.md
```
Examples: `checkpoint-sprint-08-phase-05.md`, `checkpoint-final-interaction-pass.md`

### Walkthroughs
```
walkthroughs/sprint-{NN}-phase-{MM}-walkthrough.md
walkthroughs/{feature-slug}-walkthrough.md
```
Examples: `sprint-08-phase-02-walkthrough.md`, `final-settings-persistence-walkthrough.md`

### Audits
```
audits/{subject}-audit.md
audits/{subject}-validation-audit.md
```
Examples: `super-admin-domain-consolidation-audit.md`, `documentation-consolidation-audit.md`

### ADRs
```
decisions/adr-{NNN}-{slug}.md
decisions/{slug}.md
```
Examples: `adr-001-zustand-migration.md`, `auth-routing-separation.md`

### Reports
```
reports/{slug}-report.md
reports/{sprint}-{slug}-audit.md
```
Examples: `final-super-admin-backlog-report.md`, `technical-debt-roadmap.md`

---

## 4. Checkpoint Standards

Every sprint phase **must** produce a checkpoint document containing:

| Section | Required | Notes |
| :--- | :---: | :--- |
| Sprint Objective | ✅ | Brief single-sentence goal |
| Completed Tasks | ✅ | Bullet list of implemented items with file links |
| Validation Results | ✅ | `npm run typecheck` + `npm run build` output |
| Deferred Items | ⚠️ | Optional — only if scope was reduced |

Template:
```markdown
# Checkpoint: [Sprint Phase Name]

## Sprint Objective
[Single sentence goal]

## Completed Tasks
- [Component name](file:///path/to/file): Description of what was done.

## Validation Results
- TypeScript (`npm run typecheck`): ✓ 0 errors
- Production build (`npm run build`): ✓ N static routes compiled

## Deferred Items (if any)
- [Item]: Reason for deferral
```

---

## 5. Walkthrough Standards

Walkthroughs document the "why" behind implementation changes:

| Section | Required |
| :--- | :---: |
| Overview / Problem Statement | ✅ |
| Architectural pattern or diagram | ⚠️ (recommended) |
| Modified Files (with links) | ✅ |
| Manual Verification Checklist | ✅ |
| Automated Validation Results | ✅ |

---

## 6. Audit Standards

Audit documents must include:

| Section | Required |
| :--- | :---: |
| Audit scope and date | ✅ |
| Inventory matrix (table) | ✅ |
| Classification: Complete / Partial / Missing | ✅ |
| Duplicate / Overlap detection | ✅ |
| Formal verdict and recommendation | ✅ |

---

## 7. Archive Rules

A document is eligible for archival when:

1. It has been superseded by a newer document covering the same scope.
2. The implementation it documented has been replaced or removed.
3. It is an intermediate draft that was absorbed into a final document.
4. It is a cleanup/hygiene log with no ongoing operational relevance.

**Archive process**: Move to `docs/archive/` with original path preserved as subfolder. Never delete without explicit approval.

---

## 8. Sprint Close Documentation Requirements

At the close of every sprint phase, the following documents must exist in the canonical root:

| Document | Path Template |
| :--- | :--- |
| Implementation Plan | `plans/sprint-{NN}-phase-{MM}-{slug}.md` |
| Checkpoint | `checkpoints/checkpoint-sprint-{NN}-phase-{MM}.md` |
| Walkthrough | `walkthroughs/sprint-{NN}-phase-{MM}-walkthrough.md` |
| Sprint History | `sprints/sprint-{NN}-{slug}.md` (if new sprint) |

---

## 9. Reference Materials Policy

PDF screen inventories and training handbooks live in:

```
docs/reference/
```

These are **read-only source-of-truth** artifacts. Do not modify or delete them. They are the authoritative design inventory for the entire platform.

---

## 10. Governance Violation Checklist

Avoid the following anti-patterns:

| Anti-Pattern | Correct Action |
| :--- | :--- |
| Creating docs in `frontend/docs/` as final home | Migrate to canonical `docs/` at sprint close |
| Duplicate sprint plans in both roots | Single canonical copy in `docs/plans/` |
| Missing checkpoint after sprint phase | Always create before sprint is closed |
| Hardcoded absolute file paths in markdown | Use relative links within docs subtree |
| Silently deleting superseded docs | Archive in `docs/archive/` with rationale note |
| Inventing new top-level doc folders | Propose via ADR before creating |
