# Database Architecture Document

This document outlines the MongoDB schema designs, indexing strategies, document relationships, and tenant isolation architecture for the `CustomerSelfService` backend using Mongoose ODM.

---

## 1. Multi-Tenant Isolation Strategy
To support MongoDB Atlas Free Tier constraints and allow seamless development operations, we use a **Logical Isolation** strategy.

- **Implementation**: Every data collection (except global registries) contains a indexed `tenantId` string field.
- **Enforcement**: All queries must pass through a repository layer that automatically binds the active request context's `tenantId` (e.g. `{ tenantId: context.getTenantId() }`).
- **Database Indexing**: All collection indexes are compounded with `tenantId` as the prefix to optimize search efficiency and prevent cross-tenant leak vectors.

---

## 2. Global Master Data Collections

### 1. `llm_model_registry`
Stores LLM profiles, latencies, and billing costs. Used by Super Admin.
- **Fields**:
  - `_id`: ObjectId
  - `name`: String (e.g., "gemini-1.5-flash")
  - `provider`: String (e.g., "google" | "openai" | "anthropic")
  - `costInput`: Number (per 1k tokens in USD)
  - `costOutput`: Number (per 1k tokens in USD)
  - `latencyMs`: Number (simulated baseline)
  - `contextWindow`: Number
  - `accuracyScore`: Number (percentage representation)
  - `status`: String ("active" | "deprecated" | "testing")
- **Indexes**:
  - `{ provider: 1, name: 1 }` (Unique)

### 2. `asr_tts_provider_registry`
Stores Speech-to-Text and Text-to-Speech config profiles. Used by Super Admin.
- **Fields**:
  - `_id`: ObjectId
  - `name`: String (e.g., "Google Speech-to-Text")
  - `type`: String ("ASR" | "TTS" | "both")
  - `languages`: Array<String>
  - `latencyMs`: Number
  - `costPerMin`: Number
  - `status`: String ("online" | "offline" | "degraded")

---

## 3. Tenant & Admin Configuration Collections

### 3. `tenants`
Stores corporate accounts, domains, features, and plans.
- **Fields**:
  - `_id`: ObjectId
  - `name`: String
  - `domain`: String (Unique, e.g., "acme")
  - `customDomain`: String (Optional, e.g., "support.acme.com")
  - `currentPlanId`: String
  - `status`: String ("active" | "suspended" | "expired" | "trial")
  - `billingStatus`: String ("paid" | "unpaid" | "dunning")
  - `maxSeats`: Number
  - `apiKey`: String (Hashed, used for external connectors)
  - `ipWhitelist`: Array<String>
  - `nluVersion`: String (Currently deployed bot engine version)
  - `createdAt`: Date
- **Indexes**:
  - `{ domain: 1 }` (Unique)
  - `{ apiKey: 1 }` (Unique)

### 4. `users`
System accounts across all roles (Admin, Agent, Customer, Super Admin).
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String (Optional for Super Admins)
  - `name`: String
  - `email`: String (Unique)
  - `passwordHash`: String
  - `role`: String ("super_admin" | "client_admin" | "operations_manager" | "qa_manager" | "support_agent" | "supervisor" | "customer" | "viewer")
  - `avatarUrl`: String (Optional)
  - `status`: String ("active" | "inactive" | "suspended")
  - `mfaSecret`: String (Optional, OTP seed)
  - `mfaEnabled`: Boolean
  - `lastActive`: Date
- **Indexes**:
  - `{ email: 1 }` (Unique)
  - `{ tenantId: 1, role: 1 }`

---

## 4. Bot & NLU Engineering Collections

### 5. `bots`
Chatbots linked to a tenant, their profiles, and active deflection performance.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `name`: String
  - `persona`: String (LLM Prompt Identity)
  - `status`: String ("live" | "draft" | "training")
  - `languages`: Array<String>
  - `deflectionRate`: Number (CSAT/Containment calculations)
  - `knowledgeBaseId`: ObjectId (Ref: `knowledge_bases`)
  - `createdAt`: Date
- **Indexes**:
  - `{ tenantId: 1, status: 1 }`

### 6. `intents`
Training phrases and slot validation patterns matching bot workflows.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `botId`: ObjectId (Ref: `bots`)
  - `name`: String (e.g., "refund_request")
  - `utterances`: Array<String>
  - `confidenceThreshold`: Number
  - `slots`: Array<{ name: String, type: String, required: Boolean, prompt: String }>
  - `fulfillmentType`: String ("dialog" | "webhook" | "text")
  - `fulfillmentValue`: String
  - `status`: String ("active" | "suggested")
- **Indexes**:
  - `{ tenantId: 1, botId: 1, name: 1 }`

### 7. `dialog_flows`
React Flow definitions for node structures (start, conditions, handoffs).
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `botId`: ObjectId (Ref: `bots`)
  - `nodes`: Array<Record<string, any>> # Node types matching frontend rules
  - `edges`: Array<Record<string, any>>
  - `version`: Number
  - `status`: String ("active" | "draft")
- **Indexes**:
  - `{ tenantId: 1, botId: 1, version: -1 }`

---

## 5. Knowledge Management & Vector Sync Collections

### 8. `knowledge_sources`
Files, sitemaps, and database connectors.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `name`: String
  - `type`: String ("pdf" | "url" | "confluence" | "database")
  - `status`: String ("ready" | "syncing" | "error")
  - `chunkCount`: Number
  - `sizeBytes`: Number
  - `syncSchedule`: String (Cron syntax)
  - `crawlerDetails`: { depthLimit: Number, urlCount: Number }
  - `lastIngested`: Date
- **Indexes**:
  - `{ tenantId: 1, type: 1 }`

### 9. `ingestion_logs`
Sync histories and parse latency tracking.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `sourceId`: ObjectId (Ref: `knowledge_sources`)
  - `timestamp`: Date
  - `status`: String ("success" | "failed" | "processing")
  - `chunksCount`: Number
  - `durationMs`: Number
  - `errorDetail`: String (Optional)
- **Indexes**:
  - `{ tenantId: 1, sourceId: 1, timestamp: -1 }`

---

## 6. Real-time Interactions & Ticket Flow Collections

### 10. `conversations`
Live chat metadata, assignees, priorities, and SLA deadlines.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `customerName`: String
  - `customerPhone`: String
  - `customerEmail`: String
  - `channel`: String ("whatsapp" | "web" | "voice" | "email")
  - `status`: String ("unassigned" | "active" | "resolved" | "escalated")
  - `agentId`: ObjectId (Ref: `users`, Optional)
  - `sentiment`: String ("positive" | "neutral" | "negative")
  - `lastMessage`: String
  - `lastMessageTime`: Date
  - `slaStatus`: String ("within_sla" | "breached" | "warning")
  - `slaDeadline`: Date
  - `language`: String ("en" | "ar")
  - `priority`: String ("low" | "medium" | "high" | "urgent")
  - `unreadCount`: Number
- **Indexes**:
  - `{ tenantId: 1, agentId: 1, status: 1 }`
  - `{ tenantId: 1, status: 1, slaDeadline: 1 }`

### 11. `messages`
The transcripts of chats and emails.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `conversationId`: ObjectId (Ref: `conversations`)
  - `sender`: String ("customer" | "agent" | "bot" | "system")
  - `senderName`: String
  - `text`: String
  - `translatedText`: String (Optional)
  - `sentiment`: String ("positive" | "neutral" | "negative")
  - `messageType`: String ("chat" | "email" | "voice_note" | "internal_note" | "system" | "escalation")
  - `attachments`: Array<{ name: String, url: String, sizeBytes: Number, type: String }>
  - `timestamp`: Date
- **Indexes**:
  - `{ conversationId: 1, timestamp: 1 }`

### 12. `tickets`
Static tickets submitted via Customer Portal.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `title`: String
  - `description`: String
  - `customerName`: String
  - `customerEmail`: String
  - `priority`: String ("low" | "medium" | "high" | "urgent")
  - `status`: String ("open" | "pending" | "solved" | "closed")
  - `assignedAgentId`: ObjectId (Ref: `users`, Optional)
  - `category`: String
  - `slaBreachTime`: Date
  - `createdAt`: Date
- **Indexes**:
  - `{ tenantId: 1, status: 1 }`
  - `{ customerEmail: 1 }`

---

## 7. QA Performance & Analytics Collections

### 13. `qa_reviews`
Evaluations of agents by QA managers.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `conversationId`: ObjectId (Ref: `conversations`)
  - `agentId`: ObjectId (Ref: `users`)
  - `supervisorId`: ObjectId (Ref: `users`)
  - `score`: Number
  - `status`: String ("pending" | "in_calibration" | "disputed" | "approved" | "escalated" | "coaching_assigned" | "completed")
  - `positives`: Array<String>
  - `negatives`: Array<String>
  - `coachingPoints`: Array<String>
  - `scorecardMetrics`: { compliance: Number, empathy: Number, technical: Number, resolution: Number }
  - `disputeReason`: String
  - `disputeResponse`: String
  - `date`: Date
- **Indexes**:
  - `{ tenantId: 1, agentId: 1, date: -1 }`

### 14. `analytics_hourly_metrics`
Rollup records for dashboards.
- **Fields**:
  - `_id`: ObjectId
  - `tenantId`: String
  - `hour`: Date
  - `deflectedCount`: Number
  - `handedOverCount`: Number
  - `totalModelCost`: Number
  - `averageLatencyMs`: Number
  - `averageCsat`: Number
- **Indexes**:
  - `{ tenantId: 1, hour: -1 }`