# Translation Keys Audit & Synchronization Report
## CustomerSelfService Platform — Repo Hygiene

**Audit Date:** 2026-06-03  
**Last Updated:** 2026-06-03T16:06:48+05:30  
**Auditor:** Senior Repository Cleanup Auditor (Antigravity)  

---

## 1. Executive Summary

This report presents a validation check between English and Arabic translation dictionaries:

* **Source Files:** `frontend/src/i18n/en.ts` and `frontend/src/i18n/ar.ts`
* **Translation Key Size:** **1,043 keys** in each dictionary.
* **Synchronization Level:** **100% matched.** There are zero keys present in English that are missing in Arabic, and zero keys present in Arabic that are missing in English.
* **Integrity:** The bilingual coverage is comprehensive and requires no immediate key removals or fixes. 

---

## 2. Dictionaries Analysis

The i18n corpora are organized in nesting configurations matching Next.js layout layers:

```
translations/
├── en / ar
│   ├── auth / login / register  (Login inputs and OTP screens)
│   ├── dashboard                (Nav bars, Sidebar buttons)
│   ├── customerPortal           (Home KB cards, Ticket submits, Callback schedules)
│   │   ├── home / kb / tickets / liveChat / callbacks / refunds / feedback / settings
│   ├── agentWorkspace           (Inbox channels list, 360 profile tabs, aux break buttons)
│   │   ├── inbox / voice / chat / timeline / analytics / tools / settings
│   ├── clientAdmin              (Safety guardrail configs, NLU slot rules, analytics logs)
│   │   ├── botSettings / safety / analytics / operations / training / billing / rbac
│   └── superAdmin               (ASR/TTS Speeches registry, Vector compaction triggers)
```

Both `en.ts` (52KB) and `ar.ts` (75KB) cover all 1,043 paths recursively.

---

## 3. Maintenance Recommendations

1. **Keep Keys Intact:** Do not prune any translation paths. The dictionaries are fully synchronized.
2. **Translation Verification Script:** Commit the verification script [verify_translations.js](file:///Users/sudhir88/.gemini/antigravity/brain/d5dedb27-283a-4398-99d0-acc96b029de0/scratch/verify_translations.js) to the `scripts/` folder as a CI check to prevent future key drift.
3. **Module Partitioning (Future Scalability):** If the dictionaries grow beyond 100KB, split `en.ts` and `ar.ts` into feature namespaces (e.g. `customer-portal.ts`, `agent-workspace.ts`) to avoid massive single-file imports.
