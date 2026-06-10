# LLM Development Guidelines (GEMINI.md)

Welcome, AI coder. This document provides precise rules for how you must read, write, and modify code within the `CustomerSelfService` backend workspace.

---

## 1. Zero-Leak Mock Policy
- When implementing APIs or services, **do not write hardcoded mock return objects inside production logic**.
- Database interactions must run through Mongoose models. If a database is not active, implement standard error catch blocks rather than returning fake static JSON arrays.
- Seed data must live strictly inside `src/database/seed/` and be loaded via CLI migration scripts, not hardcoded inside controllers.

## 2. API Versioning Compliance
- All routes must be registered under the `/api/v1/` prefix.
- Never modify existing endpoints to introduce breaking changes without planning. Use DTO translation layers if the DB schema deviates from the frontend expectations.

## 3. Strict Folder Boundaries
When adding a new feature or domain, structure it as follows:
- `src/modules/[feature]/routes/[feature].routes.ts` - HTTP routing definition.
- `src/modules/[feature]/controllers/[feature].controller.ts` - Request mapping & validation.
- `src/modules/[feature]/services/[feature].service.ts` - Business logic orchestration.
- `src/modules/[feature]/repositories/[feature].repository.ts` - Mongoose queries.
- `src/modules/[feature]/models/[feature].model.ts` - Mongoose schema Definition.

Do not write routes that call database queries directly. Every query MUST pass through a Repository.

## 4. Error Handling & Response Contracts
- Always catch database or connection failures and pass them to the global Express error-handling middleware.
- Throw custom domain exceptions (e.g., `UnauthorizedException`, `NotFoundException`, `TenantMismatchException`) and map them to their corresponding HTTP status codes via standard exception filters.
- Ensure that stack traces are hidden in production environment settings.

## 5. Security & Rate Limiting Enforcement
- Every route handling user-facing forms must use the Zod request validator.
- Include rate-limiting metadata in headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`).
- Redact PII parameters (credit cards, social security numbers, MFA keys) at the log serializer layer.