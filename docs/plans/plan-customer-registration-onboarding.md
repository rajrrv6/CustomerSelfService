# Plan: Customer Registration Onboarding Extensions

## Goal
Keep the public registration flow customer-only while preserving a lightweight first-run onboarding handoff for verified customer accounts.

## Proposed Architecture
- **Profile Completion Card**: Post-signup screen for optional profile details and preferred support channels.
- **Notification Preferences**: Local, client-side settings for email, SMS, and WhatsApp contact permissions.
- **Onboarding Tour**: Lightweight stepper to orient first-time customers inside the portal home screen.
- **Customer Role Registry**: Persist the public registration role as `customer` so future login and route guards continue to resolve the correct persona.

## Expected Outcome
- Public registration always provisions a customer account only.
- Verified customer accounts can continue into the portal with the correct RBAC role preserved.
- All onboarding copy remains bilingual and RTL-safe.

## Current Manual Outcome
- The registration flow is complete up to the verified customer success screen.

## Files Likely Affected
- `src/app/register/*`
- `src/context/AuthContext.tsx`
- `src/lib/auth/authStorage.ts`
- `src/features/auth/register/*`

## Risks / Unknowns
- Avoid introducing speculative backend dependencies for profile persistence.
- Keep the onboarding flow lightweight so it does not block first login.

## Out of Scope
- Server-side account provisioning.
- Email or SMS delivery infrastructure.
- Internal invite-based registration flows.
