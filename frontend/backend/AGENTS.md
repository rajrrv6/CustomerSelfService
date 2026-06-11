# AI Agent Guidelines & Backend Repository Governance (AGENTS.md)

Welcome, AI Developer. This repository backend is an AI-Native enterprise CustomerSelfService server built using Node.js, Express, TypeScript, Mongoose, and Socket.io. 

These guidelines are permanent repository governance rules. You must strictly adhere to them for every code modification, implementation plan, database schema update, and verification pass.

---

## 1. Monolith-First Modular Boundaries
- All business logic lives in `src/modules/[module_name]`.
- Do not introduce random helper scripts or utility routes outside feature modules.
- **Cross-module calls**: Services of module A must not access the MongoDB models of module B directly. If Module A needs data from Module B, it must fetch it by calling Module B's exposed Service layer.
- Ensure that modules are structured so they can easily be extracted into standalone microservices in the future.

## 2. Layered Architecture (Controller-Service-Repository)
To prevent hidden coupling and spaghetti code, enforce the following patterns:
- **Routes Layer**: Handles routing and maps REST endpoints to controller methods.
- **Middleware Layer**: Enforces authentication, tenant context setting, validation (Zod), and rate limiting before invoking business handlers.
- **Controllers**: Handle HTTP serialization/deserialization. Controllers must never contain SQL/NoSQL query logic or business rules. They parse request parameters, call services, and wrap response data.
- **Services**: Contain pure business logic (calculations, workflow transitions, triggering events, orchestrating RAG pipelines).
- **Repositories / Models**: Manage persistence. All Mongoose queries (e.g., `.find()`, `.aggregate()`) must remain inside database repository classes. Do not invoke mongoose query methods in services or controllers.

## 3. Strict Type Safety & Null Safety
- Write strict TypeScript. Enable `strictNullChecks` and `noImplicitAny`.
- Never bypass type checks with `any`. Use `unknown` or define proper interfaces/types.
- Database results must be typed with Mongoose document types or raw database interface maps.

## 4. Multi-Tenant Scoping Safety
- Every MongoDB schema that holds tenant data must contain a indexed `tenantId` string field.
- Every incoming HTTP request and WebSocket event must go through a tenant-context parser middleware that extracts the tenant identifier from the subdomain, API key, or JWT payload.
- All repository queries must implicitly append `{ tenantId }` to filter clauses. Never perform collection-wide operations without specifying a `tenantId` index scope.

## 5. API Response Contracts
- All HTTP responses must return a standard envelope structure:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "page": 1, "limit": 10, "total": 100 }
  }
  ```
- Error states must return standard error envelopes:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Required fields are missing.",
      "details": [ ... ]
    }
  }
  ```

## 6. Real-time Communications & Presences
- All WebSocket events use namespace and room partitioning.
- Never broadcast globally across tenants. Room names must be tenant-scoped (e.g., `tenant:[tenantId]:agents` or `tenant:[tenantId]:ticket:[ticketId]`).
- Authenticate WebSocket handshakes using JWT cookies or Bearer tokens. Reject unauthenticated socket connections.

## 7. AI & Gateway Integrations
- Abstract all LLM provider calls (Gemini, OpenAI, Anthropic) under a unified `ModelProviderService`.
- Always wrap model calls in cost and token count audit middleware. Log latency, tokens, cost, and safety scores.
- RAG search results must display source citations and similarity scores.

## 8. Development Workflow
1. **Design Documentation first**: Create or update relevant markdown files under `docs/` before making changes.
2. **Review task.md**: Update your checkpoint and tasks checklist in `task.md`.
3. **Write strict validations**: Always validate request DTOs using Zod schemas at the controller boundary.
4. **Compile and test**: Verify that `npm run build` compiles without any errors.