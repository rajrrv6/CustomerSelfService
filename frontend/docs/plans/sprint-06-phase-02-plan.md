# Implementation Plan - Sprint 06 Phase 2: Super Admin Nested Module Container Architecture

Introduce scalable container-based architecture for normalized Super Admin modules while preserving all existing working business screens and routing behavior.

## User Review Required

> [!IMPORTANT]
> - We will create 4 new container components under `src/components/super-admin/containers/`: `MasterDataContainer.tsx`, `AnalyticsContainer.tsx`, `InfrastructureContainer.tsx`, and `TelephonyContainer.tsx`.
> - **Do not introduce new visual systems, redesigns, or placeholder dashboards.**
> - We will use lightweight local state for tab switching within each container. Backward compatibility aliases will be routed to the containers with the corresponding tab active.
> - For unreleased screens (like Knowledge Connectors and Number Pool), we will render the layout's default fallback screen.
> - `sa_dashboard` will render a lightweight overview shell using existing layout primitives (`SectionHeader`, `OperationalCard`) only.

## Proposed Changes

### Internationalization

#### [MODIFY] [en.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/i18n/en.ts)
- Add English translation keys for the container headers:
  - `saMasterDataTitle`: 'Master Data Management'
  - `saMasterDataDesc`: 'Configure global LLM models, ASR/TTS engines, omnichannel communication channels, and NLU profiles.'
  - `saAnalyticsTitle`: 'System Analytics & Benchmarks'
  - `saAnalyticsDesc`: 'Monitor cross-tenant inference volumes, response speed latency, and token budget analytics.'
  - `saInfrastructureTitle`: 'Infrastructure Orchestration'
  - `saInfrastructureDesc`: 'Verify vector database index counts, partitioning throughput, and global search integrations.'
  - `saTelephonyTitle`: 'Telephony Integration & SIP Trunks'
  - `saTelephonyDesc`: 'Configure enterprise voice connectivity, phone number pools, and media gateway routing.'

#### [MODIFY] [ar.ts](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/i18n/ar.ts)
- Add Arabic translation keys for the container headers:
  - `saMasterDataTitle`: 'إدارة البيانات الرئيسية'
  - `saMasterDataDesc`: 'تهيئة نماذج الذكاء الاصطناعي العالمية، محركات التعرف على الكلام، القنوات الموحدة وحوكمة NLU.'
  - `saAnalyticsTitle`: 'التحليلات ومؤشرات الأداء'
  - `saAnalyticsDesc`: 'مراقبة أحجام مكالمات الاستدلال عبر المشتركين، وتحليلات تكلفة الرموز وزمن الاستجابة.'
  - `saInfrastructureTitle`: 'إدارة البنية التحتية'
  - `saInfrastructureDesc`: 'مراقبة فهارس المتجهات، أداء ومعدلات تخزين قواعد البيانات ونظم البحث الدلالي.'
  - `saTelephonyTitle`: 'الاتصالات الهاتفية وخطوط SIP'
  - `saTelephonyDesc`: 'إعداد قنوات الاتصال الهاتفي، خطوط ربط SIP Trunk وإدارة حزم أرقام الاتصال الواردة.'

### Containers Layer

#### [NEW] [MasterDataContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/MasterDataContainer.tsx)
- Create a container displaying a bilingual Module Header and a lightweight sub-navigation tab bar for Master Data modules:
  - **LLM Registry** (`llm_registry`) -> `<LlmRegistryTab />`
  - **ASR/TTS Registry** (`asr_tts_registry`) -> `<AsrTtsRegistryTab />`
  - **Omnichannel Channels** (`channels`) -> `<SuperAdminChannelsTab />`
  - **NLU Governance** (`nlu_governance`) -> `<NluGovernanceTab />`
- Synchronize tab state with an optional `activeTab` prop for backward compatibility aliases.

#### [NEW] [AnalyticsContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/AnalyticsContainer.tsx)
- Create a container displaying a bilingual Module Header and a lightweight tab bar for Analytics modules:
  - **Cross-Tenant Analytics** (`cross_tenant_analytics`) -> `<SuperAdminAnalyticsTab activeSubScreen="cross_tenant_analytics" />`
  - **Cost Benchmarks** (`cost_benchmarks`) -> `<SuperAdminAnalyticsTab activeSubScreen="cost_benchmarks" />`

#### [NEW] [InfrastructureContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/InfrastructureContainer.tsx)
- Create a container displaying a bilingual Module Header and a lightweight tab bar for Infrastructure modules:
  - **Vector DB Status** (`vector_db`) -> `<VectorDbStatusTab />`
  - **Knowledge Connectors** (`knowledge_connectors`) -> Default layout "Screen not implemented" fallback component.

#### [NEW] [TelephonyContainer.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/containers/TelephonyContainer.tsx)
- Create a container displaying a bilingual Module Header and a lightweight tab bar for Telephony modules:
  - **SIP Trunk Config** (`sip_trunk`) -> `<SipTrunkConfigTab />`
  - **Number Pool** (`number_pool`) -> Default layout "Screen not implemented" fallback component.

### Routing Layer

#### [MODIFY] [SuperAdminLayout.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/super-admin/shared/SuperAdminLayout.tsx)
- Refactor the view dispatcher to mount the new containers:
  - `sa_dashboard` -> Renders a lightweight overview dashboard layout.
  - `sa_master_data` or `llm_registry` -> `<MasterDataContainer activeTab="llm_registry" />`
  - `asr_tts_registry` -> `<MasterDataContainer activeTab="asr_tts_registry" />`
  - `channels` -> `<MasterDataContainer activeTab="channels" />`
  - `nlu_governance` -> `<MasterDataContainer activeTab="nlu_governance" />`
  - `sa_analytics` or `cross_tenant_analytics` -> `<AnalyticsContainer activeTab="cross_tenant_analytics" />`
  - `cost_benchmarks` -> `<AnalyticsContainer activeTab="cost_benchmarks" />`
  - `sa_infra` or `vector_db` -> `<InfrastructureContainer activeTab="vector_db" />`
  - `sa_telephony` or `sip_trunk` -> `<TelephonyContainer activeTab="sip_trunk" />`
  - `sa_billing` & `sa_audit` -> Falls back to default "Screen not implemented" view.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to verify TypeScript compile integrity.

### Manual Verification
- Log in as a Super Admin in sandbox mode.
- Confirm exactly 7 modules are visible in the sidebar.
- Click **Master Data**, **Analytics**, **Infrastructure**, and **Telephony**. Verify they open containerized tab layouts.
- Toggle tabs inside the containers. Verify they render correctly and toggle active highlighting.
- Toggle between RTL/Arabic and LTR/English to verify translation mirroring and layouts.
