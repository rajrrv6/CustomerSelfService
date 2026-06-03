# Dependency Cleanup Analysis
## CustomerSelfService Platform — Repo Hygiene

**Audit Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:06:48+05:30  
**Auditor:** Senior Repository Cleanup Auditor (Antigravity)  

---

## 1. Executive Summary

This audit scans `package.json` configurations and import declarations in `src/` to identify unused npm packages, overlapping dependencies, or redundant dev dependencies. 

* **Active Dependencies:** 10 out of 10 dependencies are imported and used in the codebase. There are **zero** unused production npm packages.
* **Active Dev Dependencies:** All 18 dev dependencies are active in compilation, styling, linting, or vitest/playwright test suites.

---

## 2. Package Dependency Mapping

| Package Name | Usage in Code | Status | Recommendation |
|---|---|---|---|
| `next` (16.2.6) | App Router core framework | ✅ Active | Keep |
| `react` (19.2.4) | UI runtime library | ✅ Active | Keep |
| `react-dom` (19.2.4) | Web virtual DOM renderer | ✅ Active | Keep |
| `zustand` (5.0.14) | Global state management stores | ✅ Active | Keep |
| `react-hook-form` (7.77.0) | Form fields validation engine | ✅ Active | Keep |
| `@hookform/resolvers` (5.4.0) | Zod validator bridge for react-hook-form | ✅ Active | Keep |
| `zod` (4.4.3) | Declarative form parsing schemas | ✅ Active | Keep |
| `reactflow` (11.11.4) | Visual canvas nodes layout (Dialog Builder) | ✅ Active | Keep |
| `@tanstack/react-table` (8.21.3) | Grid/table pagination and sorting APIs | ✅ Active | Keep |
| `lucide-react` (1.16.0) | System SVG icons corpus | ✅ Active | Keep |

---

## 3. Dev Dependencies Audit

- **Vitest Testing Stack:** `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` are actively used inside the `tests/vitest/` directory to run unit tests.
- **Playwright Stack:** `@playwright/test` runs end-to-end tests inside the `tests/playwright/` folder.
- **Styling Stack:** `tailwindcss` and `@tailwindcss/postcss` compile styling definitions inside `postcss.config.mjs` and `src/app/globals.css`.
- **TypeScript:** `typescript` and `@types/node`/`@types/react` are used to build the Next.js target.

---

## 4. Key Findings & Actions

1. **No Unused Packages:** No action is needed for removing unused dependencies.
2. **Rename Package Target:** The `"name": "temp-app"` key at line 2 of `package.json` must be updated to the actual project name (`"name": "customer-self-service-portal"`).
3. **Keep Tooling:** All libraries are highly focused and there is no overlap (e.g. no duplicate charts or state managers).
