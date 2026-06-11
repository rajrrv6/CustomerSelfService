# Manual Review Required Analysis (Verify Before Deleting)
## CustomerSelfService Platform — Repo Hygiene

**Audit Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:06:48+05:30  
**Auditor:** Senior Repository Cleanup Auditor (Antigravity)  

---

## 1. Overview & Summary

This report identifies files, components, and reference documents that are **unwired** or **superseded** in the current workspace. However, unlike the "Safe-to-Delete" candidates, these assets contain historical records, draft features, or utility code that might be useful for future development. They must be reviewed manually by the architectural leads before being deleted or archived.

---

## 2. Inventory of Manual-Review-Required Files

### A. Draft / Unwired Feature Components
These components exist in the active namespaces but are not imported by parent layouts or routing nodes. They represent unfinished or placeholder views.

| File Path | Description / Purpose | Reasons to Review / Risk | Recommendation |
|---|---|---|---|
| `frontend/src/components/client-admin/operations/SlaTab.tsx` | A draft component representing a rules-builder configuration for SLA policies. | Exists in client-admin operations but is superseded by the 86KB [SlaAnalytics.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/src/components/analytics/SlaAnalytics.tsx) which displays SLA breach lists. However, `SlaTab` contains a visual layout for CRUD actions that `SlaAnalytics` lacks. | **Keep & Reference.** Do not delete. Use `SlaTab` code as a template when building SLA Rule CRUD operations in Sprint 3. |

---

### B. Superseded Architecture & Audit Reports
Historical documentation from previous development stages.

| File Path | File Size | Description / Purpose | Reasons to Review / Risk | Recommendation |
|---|---|---|---|---|
| `frontend/docs/repository_audit_report.md` | 29.8 KB | Previous enterprise audit report dated 2026-06-01. | Contains several incorrect assertions regarding the Customer Portal (marked Screens 122–124 as "Not Implemented"). Superseded by the new [enterprise-audit-report-2026-06-03.md](file:///Users/sudhir88/Desktop/CustomerSelfService/docs/important/enterprise-audit-report-2026-06-03.md). | **Archive.** Move to a new `docs/archive/` folder to maintain historical auditing trails without confusing future auditors. |

---

### C. Reference PDF Text Extractions & Script Tools
Text files containing parsed contents of reference PDFs, and custom parser scripts.

| File Path | File Size | Description / Purpose | Reasons to Review / Risk | Recommendation |
|---|---|---|---|---|
| `frontend/pdf2txt.swift` | 507 B | A Swift utility script to convert PDF files into text dumps. | Only useful if reference PDFs are updated or new ones are introduced. | **Archive to `scripts/`** folder if kept; otherwise delete. |
| `frontend/readme_pdf.txt` | 3.3 KB | Text conversion dump of `00_README.pdf` reference. | Plain text representation of reference document. | **Archive to `docs/reference/`** or delete, since the PDF file exists. |
| `frontend/inventory_pdf.txt` | 12.7 KB | Text conversion dump of the 161 screen inventory reference. | Very useful for searching screen descriptions using standard string search tools. | **Archive to `docs/reference/`** as it is a helpful search index. |
| `frontend/master_prompts_pdf.txt` | 43.9 KB | Text conversion dump of `Master UI Prompts-JH.pdf` reference. | Plain text dump of prompt requirements. | **Archive to `docs/reference/`** or delete. |

---

## 3. Recommended Actions

1. **Review SLA Tab Code:** Confirm if `SlaTab.tsx` should be integrated as an editing panel within `SlaAnalytics.tsx`.
2. **Setup Reference Folder:** Relocate text dumps from the root of `frontend/` to the existing [docs/reference/](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/docs/reference) directory where the original PDF references live.
3. **Establish Archive Directory:** Move the superseded `repository_audit_report.md` to `frontend/docs/archive/repository_audit_report_2026-06-01.md`.
