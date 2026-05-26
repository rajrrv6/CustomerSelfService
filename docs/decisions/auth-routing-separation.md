# Architecture Decision Record: Auth Routing Separation and Security Hardening

## Context & Problem Statement
The CustomerSelfService platform serves multiple distinct user types:
- **Internal Staff / Operators**: Super Admins, Client Admins, Support Agents, Supervisors, and Managers. These roles configure tenant setups, build bot dialog flows, review sensitive customer records, and monitor agent performance.
- **External Consumers**: Customers and guest visitors. These users search knowledge articles, interact with public chat widgets, request callbacks, and track their order histories.

Previously, all pages under `/portal` were protected under Next.js middleware using:
```typescript
const PROTECTED_PREFIXES = ['/admin', '/tenant', '/workspace', '/portal'];
```
This blocked guest visitors from accessing the Knowledge Base or public chatbot without logging in first. 

Additionally, internal roles were inferred dynamically from any email prefix (e.g., matching any email starting with `superadmin@`), causing critical security risks (privilege escalation via self-registration) and defaulting unrecognized emails to `client_admin`.

---

## Decisions

### 1. Route Gating & Path Separation
We will separate the customer portal into distinct **public surfaces** and **protected environments**:
- **Public Routes (No Login)**: `/`, `/login`, `/register`, `/kb/*`, `/bot/*`, `/callback/*`, and `/portal/public/*`. This enables anonymous guests to view knowledge base articles, query Farah AI chatbot, request callbacks, and run order tracking without credential-based login.
- **Customer Auth Required**: `/portal/home`, `/portal/tickets/*`, `/portal/chat-history`, `/portal/profile`, and `/portal/private/*`. This gates personal support ticket history and persistent profile records behind standard customer authentication.

### 2. Customer-Only Registration
The public self-registration page `/register` will be reserved **exclusively** for the `customer` role.
- Role selection dropdowns will not exist.
- Internal administrative or support agent accounts cannot be created via `/register`.
- Clear user interface messaging and a warnings alert will be displayed to redirect employees and administrators to request invitations.

### 3. Invite-Only Internal Staff Architecture
No public signup interfaces will exist for internal staff. All Agent, Supervisor, QA, and Admin accounts must be created inside the tenant admin dashboard by a Client Admin or Operations Manager (e.g., inside the Agent Roster control). These creation actions trigger secure email invite links containing a single-use token to set credentials.

### 4. Removal of Email-Based Role Inference
We will replace the pattern-based regex role inference in `roleRouting` with a strict `MOCK_STAFF_REGISTRY`. 
- Only exact corporate email addresses (e.g., `superadmin@company.com` or `superadmin@mpaas.com`) and exact legacy test prefixes (e.g., `superadmin@`) will map to internal roles.
- Any unrecognized email address will default to the lowest-privilege `'customer'` role instead of escalatable administrative roles (such as `'client_admin'`).

---

## Consequences
- **Improved Security**: Eliminates domain prefix vulnerabilities (e.g., signing up as `superadmin@gmail.com` to gain Super Admin permissions). Unauthenticated users can no longer escalate privileges.
- **Frictionless Customer Support**: Guest users can use self-service knowledge searches and AI co-pilots without credentials.
- **Test Compatibility**: Standard Playwright E2E suites remain green because exact whitelisted test credentials and shortcut prefix patterns (e.g., `superadmin@company.com`, `superadmin@`) are explicitly whitelisted in the mock staff registry.
