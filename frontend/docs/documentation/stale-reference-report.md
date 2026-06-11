# Stale Reference Report
## CustomerSelfService Platform — Documentation Quality Control

**Audit Date:** 2026-06-03T17:13:44+05:30  
**Lead Auditor:** Senior Documentation Architect (Antigravity)  
**Status:** Action Required  

---

## 1. Stale Path & File Reference Catalog

The following table lists stale, invalid, or incorrect references found inside repository documents:

| Reference Location | Stale Link / Text | Correct Target | Severity | Status / Remediation Action |
|---|---|---|---|---|
| `docs/cleanup/archive-summary.md` (L21) | `frontend/src/archive/experimental/dialog-builder/` | `frontend/src/archive/old-builders/dialog-builder/` | 🟠 High | **Update path:** Phase-B cleanup relocated this duplicate builder directory to old-builders. |
| `docs/cleanup/enterprise-structure-summary.md` (L17) | `docs/archive/` (Under root layout description) | `frontend/docs/archive/` | 🟡 Medium | **Update mapping:** Root docs has no archive or reference folder; they reside inside frontend docs. |
| `docs/cleanup/enterprise-structure-summary.md` (L20) | `docs/reference/` (Under root layout description) | `frontend/docs/reference/` | 🟡 Medium | **Update mapping:** Point to the exact subdirectory. |
| `docs/important/customer-self-service-gap-analysis.md` (L202, L232) | `docs/repository_audit_report.md` | `frontend/docs/repository_audit_report.md` | 🟡 Medium | **Correct link path:** Add the `frontend/` folder prefix to resolve the link. |
| `docs/important/enterprise-audit-report-2026-06-03.md` (L132) | `docs/repository_audit_report.md` | `frontend/docs/repository_audit_report.md` | 🟡 Medium | **Correct link path:** Add the `frontend/` folder prefix. |

---

## 2. Relocated Developer Scripts (Reference Mapping)

During Phase-A repository hygiene sweeps, several active scripts were moved to scripts folders. Ensure links point to their new paths:

* **Python translations helper utilities:**
  - *Old Path:* `frontend/*.py`
  - *New Path:* `frontend/scripts/translations/copy_translations.py`, `merge_ar.py`, `extract_ar.py`
* **Swift file parsers:**
  - *Old Path:* `frontend/pdf2txt.swift`
  - *New Path:* `frontend/scripts/debugging/pdf2txt.swift`
* **Parsed inventory dumps:**
  - *Old Path:* `frontend/*.txt`
  - *New Path:* `frontend/docs/reference/inventory_pdf.txt`, `master_prompts_pdf.txt`, `readme_pdf.txt`

---

## 3. Recommended Path Fix Action Plan

1. **Retarget links in `archive-summary.md`:** Update lines referencing experimental/dialog-builder.
2. **Synchronize structure blueprints:** Modify directory tree text inside `enterprise-structure-summary.md` to reflect the separate `docs` and `frontend/docs` layout.
3. **Correct legacy references:** Update `gap-analysis.md` and `enterprise-audit-report-2026-06-03.md` markdown references to include the correct `/frontend/` prefix.
