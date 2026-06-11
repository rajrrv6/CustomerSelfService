# Super Admin Screen Validation Audit

This audit document details the visual and operational verification of all Super Admin screens against the official inventory definitions and layout expectations.

---

## 1. Screen Matrix & Classification

| Inventory ID | Screen / Modal Name | Persona | Category | Status Class | Rationale & Stabilization Action |
|--------------|---------------------|---------|----------|--------------|----------------------------------|
| 1 | LLM model registry | Super Admin | Master Data | **Valid** | Already fully implemented. Supports register wizard, skeleton search loaders, and local stores. |
| 2 | ASR / TTS provider registry | Super Admin | Master Data | **Partial** | Speech providers are loaded, but missing Edit/Delete actions in the table, language config fields are hardcoded, and search empty state is weak. *Action: Add Edit/Delete row actions, comma-separated language input, and standard EmptyState.* |
| 3 | Channel catalog | Super Admin | Master Data | **Valid** | Detailed visual grids mapping channels to providers. Fully consistent. |
| 4 | Channel credentials | Super Admin | Master Data | **Valid** | Modal configurations for WhatsApp, Twilio, SMS APIs fully configured. |
| 5 | Industry intent libraries | Super Admin | Master Data | **Valid** | Renders pre-built lists of intents by domain. |
| 6 | Industry response templates | Super Admin | Master Data | **Valid** | Composable pre-built brackets template layout. |
| 7 | Profanity / safety blocklist | Super Admin | Master Data | **Valid** | Redaction blocklists and custom words tables functioning. |
| 8 | PII redaction policy | Super Admin | Master Data | **Valid** | Strict/Medium/Log rules slider configuration operating properly. |
| 9 | Tenant onboarding template | Super Admin | Master Data | **Missing** | Missing screen. *Action: Deferred to a dedicated future sprint.* |
| 10 | Cross-tenant analytics | Super Admin | Analytics | **Valid** | Multi-client table, token volumes, loads and trends are dynamic and bilingual. |
| 11 | Model cost benchmarks | Super Admin | Analytics | **Partial** | Missing Output Cost chart; only input cost bar chart is shown. *Action: Restore Output Tokens Cost chart side-by-side with Input chart.* |
| 12 | Vector DB cluster status | Super Admin | Infra | **Valid** | Vectors metrics, dimension partitions, and node rebalancing simulation are fully written. |
| 13 | Knowledge connector registry | Super Admin | Infra | **Partial** | Component files exist but not mounted inside the main view. *Action: Lazily import and mount inside InfrastructureContainer.* |
| 14 | Number pool | Super Admin | Telephony | **Placeholder** | Fallback is rendered. *Action: Build a DID number pool component with DID inventory table, status filters, and reserve controls.* |
| 15 | SIP trunk config | Super Admin | Telephony | **Placeholder** | Standard static read-only card. *Action: Replace with an operational SIP Trunk table, metadata stats, and a provision/edit modal.* |
| N/A | Global Billing Settings | Super Admin | Billing | **Placeholder** | Renders blank fallback. *Action: Replace with coming soon placeholder using HTML ID `id="h2db4u"`.* |
| N/A | Global Audit Settings | Super Admin | Audit | **Placeholder** | Renders blank fallback. *Action: Replace with coming soon placeholder using HTML ID `id="h2db4u"`.* |

---

## 2. Reusable Canonical UI Patterns

To keep the interface clean, lightweight, and responsive across all languages, the following components are prioritized:
- **`EnterpriseTable`**: Displays structured listings (ASR/TTS, SIP Trunks, DID Number Pool) with sticky headers, loading skeletons, and localized column headers.
- **`ModalWrapper`**: Manages CRUD triggers (Register, Edit, Provision) with keyboard trapping, focus outlines, and responsive padding.
- **`OperationalCard`**: Encapsulates metrics and health indicators with smooth dark/light borders and clean typography.
- **`Badge`**: Highlights status (Active, Inactive, Online, Offline, Degraded) with tailor-made tailwind HSL styles.

---

## 3. Rewrite and Refactor Recommendations

- **Telephony Store**: Future integration should abstract SIP trunk and DID number pool states into a shared telephony store hook, keeping component rendering light.
- **Analytics Visualizations**: If telemetry scales, standard SVG charts should be migrated to lightweight chart containers for better time-series responsiveness.

---

## 4. Deferred and Long-Term Work

- **Tenant Onboarding Wizard (ID 9)**: This requires multi-tenant registration validation pipelines, automated tenant workspace initialization, and default template seed scripts. Deferred to a dedicated sprint.
- **Live VoIP Call Gateway Simulation**: The SIP Trunk status and DID reservation represent provisioning layouts. Interactive dial tone feedback and actual caller routing are deferred to live SIP testing integrations.
