# Repository Hygiene Recommendations
## CustomerSelfService Platform — Repo Hygiene

**Audit Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:06:48+05:30  
**Auditor:** Senior Repository Cleanup Auditor (Antigravity)  

---

## 1. Directory Structure Organization

To maintain enterprise-level code quality, the repository structure should be refactored to separate runtime code, developer scripts, reference assets, and historical documentation.

```
CustomerSelfService/
├── docs/                        ← Repository documentation
│   ├── archive/                 ← Historical documents (e.g. superseded audit reports)
│   ├── cleanup/                 ← Cleanup and audit assets (this directory)
│   ├── important/               ← High-value active audit reports and roadmap
│   └── reference/               ← PDF files and verified text dumps
├── scripts/                     ← Developer utility scripts
│   ├── merge_ar.py              ← Translation tools
│   └── pdf2txt.swift            ← File helpers
├── frontend/                    ← Next.js App Router project
│   ├── public/                  ← Static web files
│   ├── src/                     ← Next.js source directories
│   ├── package.json             ← Node package settings
│   └── tsconfig.json            ← TypeScript configurations
```

---

## 2. Specific Recommendations

### A. Establish a Dedicated `scripts/` Folder
Currently, the root directory of the Next.js app (`/frontend/`) contains multiple python (`.py`) and text (`.txt`) files.
* **Action:** Create `/Users/sudhir88/Desktop/CustomerSelfService/scripts/`.
* **Action:** Move `merge_ar.py` and `pdf2txt.swift` into `scripts/`.
* **Action:** Delete all Python files ending in `_subagent` or `check_log_contents` since they are temporary agent logs.

### B. Organize `docs/` Folders
* **Action:** Create `docs/archive/` and move the superseded `repository_audit_report.md` into it.
* **Action:** Relocate `readme_pdf.txt`, `inventory_pdf.txt`, and `master_prompts_pdf.txt` to the `frontend/docs/reference/` folder where `Common per app.pdf` and other PDF reference files live. This organizes reference data together.

### C. Improve Naming Configurations in `package.json`
* **Action:** Edit `/Users/sudhir88/Desktop/CustomerSelfService/frontend/package.json` line 2.
* **Change:** `"name": "temp-app"` ──> `"name": "customer-self-service-portal"`.
* **Rationale:** A generic name like `"temp-app"` is inappropriate for a production-ready enterprise repository.

### D. Refine `.gitignore` Settings
Add rules to prevent temporary logs and workspace-specific files from leaking into version control:
```
# Compilation outputs
tsconfig.tsbuildinfo

# macOS System Files
.DS_Store
**/ .DS_Store

# Temporary subagent log dumps
*_steps.txt
*_messages.txt
subagent_*.txt
line_context.txt
log_check.txt
```

### E. Automate Unused Key & Dead Code Checks
Integrate tools to automatically verify tree shaking and import paths:
- **eslint-plugin-import:** Warns when dead files or broken redirects exist.
- **depcheck:** Run `npx depcheck` before release phases to ensure zero unused package dependencies.
- **ts-prune:** A typescript utility to identify unused exports inside the codebase. Add `"find-dead-code": "ts-prune"` to package scripts.
```
