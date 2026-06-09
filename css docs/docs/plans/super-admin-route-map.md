# Super Admin Route Mapping & URL Architecture Standards
## CustomerSelfService Platform — Routing & Layout Plans

**Last Updated:** 2026-06-03T17:44:14+05:30  
**Lead Architect:** Senior Enterprise Frontend Auditor (Antigravity)  
**Status:** Approved for Backlog Gating  

---

## 1. Naming Normalization Standards

To ensure strict compliance with the screen inventory PDF, all module and tab labels are normalized to the official terminology. Assumption-heavy or invented labels (e.g. "default prompts", "retry queues", "gateway logs", "credit sliders", "client roster") are strictly removed and replaced by inventory-safe names.

| Screen ID / Module | Current Non-Compliant Label | Normalized Compliant Naming | Screen Spec ID |
|---|---|---|---|
| **sa_llm_registry** | LLM model parameters | LLM model registry | Screen 1 |
| **sa_asr_tts_registry** | ASR / TTS speech providers | ASR / TTS provider registry | Screen 2 |
| **sa_channels** | Omnichannel settings | Channel catalog | Screen 3 |
| **sa_channel_credentials** | Channel credentials setup | Channel provider credentials | Screen 4 |
| **sa_intents** | Industry intents list | Industry intent libraries | Screen 5 |
| **sa_templates** | Response templates defaults | Industry response templates | Screen 6 |
| **sa_blocklist** | Global profanity blocklists | Profanity / safety blocklist | Screen 7 |
| **sa_pii_policy** | Platform PII redaction rules | PII redaction policy | Screen 8 |
| **sa_tenant_onboarding** | Tenant onboarding wizard / Client roster | Tenant onboarding template | Screen 9 |
| **sa_cross_tenant** | Platform containment loads | Cross-tenant analytics | Screen 10 |
| **sa_cost_benchmarks** | Model cost benchmark graphs | Model cost benchmarks | Screen 11 |
| **sa_vector_db** | Vector DB Cluster rebalancing | Vector DB cluster status | Screen 12 |
| **sa_knowledge_connectors** | RAG connectors setup | Knowledge connector registry | Screen 13 |
| **sa_number_pool** | DID phone number allocations | Number pool | Screen 14 |
| **sa_sip_trunk** | SIP Trunk trunking parameters | SIP trunk config | Screen 15 |
| **sa_billing_plans** | Pricing plan limits | Platform Billing Plans | Common Per App |
| **sa_audit_trail** | System logs / Audit SIEM | Immutable System Audit Trail | Common Per App |

---

## 2. Final URL Route Hierarchy

The platform adopts a nested Next.js App Router style structure. This architecture scales safely for 161+ screens, handles breadcrumb generation dynamically, respects RBAC gate checks, and maintains tab state persistence.

```
/super-admin/ (Default landing route redirects to: /super-admin/master-data/llm-model-registry)
│
├── master-data/ [Sidebar Section: Master Data]
│   ├── llm-model-registry/ (Screen 1) [Tab]
│   ├── asr-tts-provider-registry/ (Screen 2) [Tab]
│   ├── channel-catalog/ (Screen 3 & 4) [Tab; Credentials configuration renders in Drawer]
│   ├── nlu-governance/ (Screens 5-8) [Tab; hosts nested tabs: intents / templates / safety / pii]
│   └── tenant-onboarding-template/ (Screen 9) [Tab; onboarding wizard renders inside viewport]
│
├── analytics/ [Sidebar Section: Analytics]
│   ├── cross-tenant-analytics/ (Screen 10) [Tab]
│   └── model-cost-benchmarks/ (Screen 11) [Tab]
│
├── infra/ [Sidebar Section: Infra]
│   ├── vector-db-cluster-status/ (Screen 12) [Tab]
│   └── knowledge-connector-registry/ (Screen 13) [Tab; Notion/Drive credentials render in Modal]
│
├── telephony/ [Sidebar Section: Telephony]
│   ├── number-pool/ (Screen 14) [Tab; DID routing configurations render in Drawer]
│   └── sip-trunk-config/ (Screen 15) [Tab; details form renders inline]
│
├── billing/ [Sidebar Section: Billing]
│   └── platform-billing-plans/ (Common Per App) [Primary Page]
│
└── audit/ [Sidebar Section: Audit & Compliance]
    └── immutable-system-audit-trail/ (Common Per App) [Primary Page]
```

---

## 3. Sidebar Menu & Viewport Matrix

To avoid a flat sidebar, the operator sidebar mounts exactly **6 items** matching the inventory categories. Clicking any item opens a viewport displaying the nested tabs or standalone pages.

| Sidebar Item | Active Route Path | Default Open Tab / Component | Viewport Tabs |
|---|---|---|---|
| **1. Master Data** | `/super-admin/master-data` | `llm-model-registry` | LLM Model Registry, ASR / TTS Provider Registry, Channel Catalog, NLU Governance, Tenant Onboarding Template |
| **2. Analytics** | `/super-admin/analytics` | `cross-tenant-analytics` | Cross-Tenant Analytics, Model Cost Benchmarks |
| **3. Infra** | `/super-admin/infra` | `vector-db-cluster-status` | Vector DB Cluster Status, Knowledge Connector Registry |
| **4. Telephony** | `/super-admin/telephony` | `number-pool` | Number Pool, SIP Trunk Config |
| **5. Billing** | `/super-admin/billing` | - | Platform Billing Plans |
| **6. Audit & Compliance** | `/super-admin/audit` | - | Immutable System Audit Trail |

---

## 4. Platform Development Standards

### A. Naming Rules
*   **Sidebar Labels:** Matches category names exactly (`Master Data`, `Analytics`, `Infra`, `Telephony`, `Billing`, `Audit & Compliance`).
*   **Route URLs:** Lowercase with hyphens matching screen labels exactly (e.g., `/super-admin/master-data/llm-model-registry`).
*   **Component Components:** TitleCase ending in `Tab` or `Container` (e.g. `LlmModelRegistryTab.tsx`, `MasterDataContainer.tsx`).
*   **Active Screen IDs:** Lowercase with underscores prefixed by `sa_` (e.g. `sa_llm_model_registry`, `sa_number_pool`).

### B. Routing & Persistence
*   **Breadcrumbs:** Hydrated dynamically by splitting the pathname parts and mapping them to inventory screen labels.
*   **Tab Persistence:** Component context reads active parameters from search queries (e.g. `?tab=llm-model-registry`) on mount to ensure deep links and refresh operations do not reset layout states.
