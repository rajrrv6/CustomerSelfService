# Architectural Decision Record (ADR)

## Title
0003-omnichannel-separation-strategy

## Status
Accepted

## Context
Both the Super Admin and Client Admin roles require views for managing "Omnichannel Channels". However, their operational scopes are vastly different. Super Admin handles platform-wide infrastructure credentials, SIP trunk configs, and multi-tenant billing, while Client Admin focuses solely on business customizations, support hours, templates, and UI appearance for a single tenant.

## Decision
We enforce strict layout and routing separation:
1. Super Admin: Maintain the `SuperAdminChannelsTab.tsx` dashboard containing the Channel Catalog and critical Provider Credentials lists (exposing API keys, environment settings, and failover endpoints).
2. Client Admin: Maintain the `ChannelsTab.tsx` containing the Business Customizer, support hours selections, template registers, and live chat widget previews.
3. Exclude all provider credentials and credentials tables from the Client Admin workspace entirely, routing all API settings under platform operator tokens.

## Consequences
- **Pros**: Prevents API secret leakage and credential tampering at the tenant level; maintains visual styling consistency while strictly respecting permission limits.
- **Cons**: Configuration changes at the API level must be requested from the platform operator.

## Alternatives Considered
- **Unified Channel Tab with Role Toggles**: Rejected as embedding platform credentials inside client-accessible components risks token leakage.
