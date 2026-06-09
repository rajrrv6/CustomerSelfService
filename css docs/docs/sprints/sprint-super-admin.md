# Sprint: Super Admin Orchestration Dashboard

## Goal
Implement the master data, infrastructure cluster status registries, and global channel credential orchestrations for the platform-level operator dashboard.

## Scope
- LLM model registry listings.
- Vector DB cluster status indicators.
- Channel Catalog master definitions (WhatsApp, Web Chat, SMS, Voice, Email, iOS, Android, Instagram, Facebook Messenger, Telegram).
- Provider Credentials mapping (Twilio, Meta, Plivo, SendGrid, SIP Trunk, Exotel).

## Major Systems Implemented
* **Super Admin Layout Switcher**: Sidebar layout mounting appropriate tabs (`/admin/infrastructure` and others) according to the operator persona.
* **Channel Catalog**: A unified card grid and full configuration table showing operational statuses, regions, AI configurations, and manual synchronization tools.
* **Provider Credentials Manager**: A dedicated credentials grid and table showing auth types, webhook URLs, environments (Sandbox/Live), regions, and last validated times.
* **Credentials Modal**: Focus-controlled wrapper allowing administrators to toggle environment states, reveal/hide API keys, copy keys to clipboard, and save configurations with audit logs.

## Decisions
* **Bilingual Translation Dictionary**: Localized EN/AR labels directly within the component to prevent global TypeScript namespace collision.
* **Visual Separation of Concerns**: Kept channel configuration cataloging distinct from API provider credentials to reflect the inventory separation of IDs #3 and #4.

## Known Carryovers
- Live webhooks status verification and live telemetry API calls (simulated locally).
