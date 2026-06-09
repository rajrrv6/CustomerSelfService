# Moved Files Log (Utility Relocations)
## CustomerSelfService Platform — Repo Hygiene

**Cleanup Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:26:14+05:30  
**Auditor:** Senior Frontend Repository Maintainer (Antigravity)  

---

## 1. Overview & Summary

This log tracks all active developer utilities, parsed reference docs, and release-specific markdowns that were moved from the root of `/frontend/` into structured sub-directories. This improves repository aesthetics and cleans root-level clutter.

---

## 2. Relocated Files Inventory

### A. Translation Script Utilities
Moved to `/frontend/scripts/translations/`:
- **`copy_translations.py`** (Original: root `frontend/`)
- **`merge_ar.py`** (Original: root `frontend/`)
- **`extract_ar.py`** (Original: root `frontend/`)
- **`extract_ar_portal.py`** (Original: root `frontend/`)
- **`extract_ar_prompt.py`** (Original: root `frontend/`)

### B. Debugging / Extraction Utilities
Moved to `/frontend/scripts/debugging/`:
- **`pdf2txt.swift`** (Original: root `frontend/`)

### C. Reference Text Extractions
Moved to `/frontend/docs/reference/` (aligned with the PDFs reference namespace):
- **`inventory_pdf.txt`** (Original: root `frontend/`)
- **`master_prompts_pdf.txt`** (Original: root `frontend/`)
- **`readme_pdf.txt`** (Original: root `frontend/`)

### D. Architectural Reports & Translation Source Backup
Moved to `/frontend/docs/archive/`:
- **`ACCESSIBILITY_IMPLEMENTATION_REPORT.md`** (Original: root `frontend/`)
- **`ADDITIONAL_VISIBILITY_FIXES.md`** (Original: root `frontend/`)
- **`CTA_VISIBILITY_FIXES.md`** (Original: root `frontend/`)
- **`SUBMIT_TICKET_PAGE_FIX.md`** (Original: root `frontend/`)
- **`UNIFIED_INBOX_FIX.md`** (Original: root `frontend/`)
- **`translations_complete_from_subagent.ts`** (Original: root `frontend/`)

---

## 3. Verification & Cleanup Status

* **Command Executed:** `mkdir -p scripts/translations scripts/migration scripts/cleanup scripts/debugging docs/archive && mv copy_translations.py merge_ar.py extract_ar.py extract_ar_portal.py extract_ar_prompt.py scripts/translations/ && mv pdf2txt.swift scripts/debugging/ && mv inventory_pdf.txt master_prompts_pdf.txt readme_pdf.txt docs/reference/ && mv ACCESSIBILITY_IMPLEMENTATION_REPORT.md ADDITIONAL_VISIBILITY_FIXES.md CTA_VISIBILITY_FIXES.md SUBMIT_TICKET_PAGE_FIX.md UNIFIED_INBOX_FIX.md translations_complete_from_subagent.ts docs/archive/`
* **Status:** Complete
* **Verification:** The project root is clean. Scripts are organized into self-documenting sub-directories under `scripts/`.
