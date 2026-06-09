# Sprint: Authentication & Multi-Tenant Access Foundation

## Goal
Establish the core tenant authentication structure, multi-factor authentication (MFA) challenge steps, and Role-Based Access Control (RBAC) permission logic across the CustomerSelfService frontend application.

## Scope
- Multi-step Sign-In layout shell.
- Mock MFA OTP challenge step with custom verification states.
- Client Admin, Super Admin, Agent, and QA Manager RBAC checks.
- Multilingual and RTL scaffolding per app instance.

## Major Systems Implemented
* **Authentication Flow Layout**: Form-based credential validation, redirect routing patterns, and step-up authentication.
* **MFA OTP Module**: Verification wizard step with timer counters, validation checks, and automatic audit logging triggers.
* **RBAC Engine**: Permissions manager interface (`src/lib/rbac/permissions.ts`) mapped to platform roles, dynamically mounting dashboards and restricting views (such as preventing Client Admins from seeing Super Admin provider settings).
* **Localisation Scaffolding**: Setup for Arabic (AR) and English (EN) translation files, including LTR/RTL structural mirroring.

## Decisions
- **Self-contained Auth per Application**: Configured auth structures directly inside each app route rather than a shared global SSO session, as mandated by the standalone mPaaS architecture instructions.
- **Client-Side RBAC Enforcement**: Role definitions and visibility rules are enforced locally within component templates to present role-tailored dashboard views.

## Known Carryovers
- Live Active Directory / Identity Provider OAuth federations.
- Persistent state management across browser restarts (remains simulated in memory).
