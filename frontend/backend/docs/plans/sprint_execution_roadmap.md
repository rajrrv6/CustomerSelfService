# Sprint Execution Roadmap

This document outlines the phased backend execution roadmap to implement the multi-tenant, AI-native customer service workspace APIs and real-time systems.

---

## Sprint Overview Plan

```mermaid
gantt
    title CustomerSelfService Backend Rollout Roadmap
    dateFormat  YYYY-MM-DD
    section Backend
    Sprint 1: Auth & Foundation            :active, s1, 2026-06-11, 7d
    Sprint 2: Bots & NLU Graph             : s2, after s1, 7d
    Sprint 3: KB Ingestion & RAG           : s3, after s2, 7d
    Sprint 4: Real-time Inbox & Presences  : s4, after s3, 7d
    Sprint 5: Tickets & QA Calibration     : s5, after s4, 7d
    Sprint 6: Telemetry & Billing Ops      : s6, after s5, 7d
```

---

## Sprint Details

### Sprint 1: Core Foundation & Tenant Isolation
- **Goal**: Scaffold the project, configure database connectors, establish tenant-isolation middleware, and build the auth/MFA routes.
- **Expected Outcome**: Working auth system with cookie rotations and step-up OTP validation.
- **Dependencies**: None.
- **Risks**: Cross-tenant data leaks due to incorrect AsyncLocalStorage binding in routing handlers.
- **Manual Verification**: Run integration tests creating users across separate domains, verifying that queries on Tenant A return 404/Not Found when accessed by users authenticated on Tenant B.
- **Files Expected to Change**:
  - `package.json` [NEW]
  - `tsconfig.json` [NEW]
  - `src/index.ts` [NEW]
  - `src/common/middleware/tenant.middleware.ts` [NEW]
  - `src/modules/auth/**/*` [NEW]

---

### Sprint 2: Conversational Bots & NLU Flow Builder
- **Goal**: Implement bot configurations, intent databases, custom entity slot-fillers, and save/load endpoints for the visual Dialog Flow builder.
- **Expected Outcome**: API endpoints that store node structures and run the conversation path simulator.
- **Dependencies**: Sprint 1 complete.
- **Risks**: Dialog Flow node definitions become overly complex and trigger MongoDB document sizing limit alerts (16MB).
- **Manual Verification**: Call `/api/v1/bots/:id/simulator/run` with custom slots and verify correct node path navigation and score evaluations.
- **Files Expected to Change**:
  - `src/modules/bots/**/*` [NEW]
  - `src/modules/intents/**/*` [NEW]
  - `src/modules/dialog_flows/**/*` [NEW]

---

### Sprint 3: Knowledge Base Ingestion & Vector Search
- **Goal**: Build document parsers, crawlers, recursive chunking pipelines, and search triggers in MongoDB Atlas Vector index.
- **Expected Outcome**: Ingestion queue workers that parse documents and populate citation metadata.
- **Dependencies**: Sprint 2 complete.
- **Risks**: Memory usage spikes during PDF text extractions, triggering container crashes.
- **Manual Verification**: Upload a multi-page PDF document, monitor ingestion progress logs status transitioning from `processing` to `ready`, and run query similarity matches.
- **Files Expected to Change**:
  - `src/modules/knowledge/**/*` [NEW]
  - `src/common/services/vector.service.ts` [NEW]

---

### Sprint 4: Unified Inbox, Presence & Omnichannel Webhooks
- **Goal**: Integrate Socket.io handlers, Twilio/Meta WhatsApp inbound hooks, and supervisor whispering channels.
- **Expected Outcome**: Persistent agent websocket rooms, typing indicators, and sentiment analysis logging.
- **Dependencies**: Sprint 3 complete.
- **Risks**: Socket.io connection dropping on Render free tier during cold starts, triggering state synchronization mismatch.
- **Manual Verification**: Open two browsers (Agent workspace and Customer chat widget), send messages, check typing states, and verify sentiment metrics.
- **Files Expected to Change**:
  - `src/modules/chat/**/*` [NEW]
  - `src/common/socket/socket.handler.ts` [NEW]

---

### Sprint 5: Tickets, SLAs & QA Calibration Queue
- **Goal**: Build tickets, SLA cron alarms, scorecard builders, and QA disputed review workflows.
- **Expected Outcome**: Automated escalation status mutations when SLA time limits are exceeded.
- **Dependencies**: Sprint 4 complete.
- **Risks**: Timer synchronization drift on free-tier containers.
- **Manual Verification**: Create a ticket with an immediate SLA timer, verify that background cron schedules capture the ticket and fire an escalation webhook on trigger.
- **Files Expected to Change**:
  - `src/modules/tickets/**/*` [NEW]
  - `src/modules/qa/**/*` [NEW]

---

### Sprint 6: Cross-Tenant Telemetry & Billing Systems
- **Goal**: Implement hourly aggregators, LLM cost trackers, vector compaction sweeping hooks, and tenant metering reports.
- **Expected Outcome**: Operational metrics tables showing Deflection CSAT, LLM latency graphs, and billing audit outputs.
- **Dependencies**: Sprint 5 complete.
- **Risks**: Large rollup queries overload free MongoDB Atlas memory cache.
- **Manual Verification**: Request billing rollups and export CSV audit logs containing multi-tenant resource parameters.
- **Files Expected to Change**:
  - `src/modules/analytics/**/*` [NEW]
  - `src/modules/billing/**/*` [NEW]

---

## Recommended First Phase Implementation: Sprint 1
To kick off engineering, start strictly with **Sprint 1 (Auth & Tenant Isolation)**:
1. Initialize the Express server.
2. Register the tenant context async storage middleware.
3. Establish Mongoose connection pools to Atlas Free.
4. Implement register, sign-in, and MFA endpoints.
5. Secure this block with initial integration tests.