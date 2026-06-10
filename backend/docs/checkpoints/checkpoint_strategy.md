# Checkpoint Strategy Document

This document outlines the checkpoint-driven execution and code promotion standards required before merging features.

---

## 1. Checkpoint Philosophy
- **Never Implement Large Undocumented Blobs**: Code changes must be accompanied by a matching checkpoint verification file saved inside `docs/checkpoints/`.
- **Checkpoint Scope**: A checkpoint document is required for every sprint phase.
- **Fail Early**: CI workflows and local checks must run verification scripts before git pushes occur.

---

## 2. Checkpoint Document Template
For every sprint phase, the developer (or AI Agent) must create a file:
```text
backend/docs/checkpoints/checkpoint-sprint-[XX]-phase-[YY].md
```

The file must follow this template:
```markdown
# Checkpoint Report: Sprint X Phase Y - [Phase Title]

## 1. Goal & Deliverables Completed
- [ ] Deliverable A (Description, files created/modified)
- [ ] Deliverable B

## 2. Verification Log
### Automated Tests
- Command executed: `npm run test`
- Results: X tests passed, 0 failures. Include terminal output snippets.

### Build & Compilation Checks
- Command executed: `npm run build`
- TypeScript verification command: `npm run typecheck`
- Results: Successful compilation without errors.

## 3. Tenant Boundary Verification Logs
Document the manual checks run to verify that data cannot leak between tenant domains:
- Request A (Actor on Tenant 1) -> Target URL -> Result 200 OK.
- Request B (Actor on Tenant 2) -> Same URL with Tenant 1 IDs -> Result 404/403.

## 4. Current Limitations & Carried-Forward Items
List any shortcuts or mock systems left for future sprints.
```

---

## 3. Pre-Promotion Verification Checklist
Before submitting a Pull Request for review, developers must run this checklist:

- [ ] **Type Check**: No `any` type shortcuts, build completes with 0 errors.
- [ ] **Validation Guard check**: Every new HTTP request payload has a matching Zod schema validator active in controllers.
- [ ] **Tenant Scoping check**: Every Mongoose query contains an explicit `tenantId` match parameter or passes through the tenant scope pre-query hook.
- [ ] **Mock Leak check**: Verify that no production API routes return hardcoded dummy JSON payloads.
- [ ] **Documentation check**: All schemas, API routes, and Socket events are recorded in their respective documentation files.
- [ ] **Secret Sanitization**: No credentials (e.g. API keys, secrets) are checked into source files. All keys read from `process.env`.