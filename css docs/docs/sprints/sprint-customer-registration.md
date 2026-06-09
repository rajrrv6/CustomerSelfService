# Sprint: Customer Registration & OTP Onboarding

## Goal
Deliver a frontend-only, enterprise-grade customer registration flow with bilingual support, RTL mirroring, simulated OTP verification, and success handoff screens.

## Scope
- Public registration route with strict client-side validation.
- Mobile OTP verification step with resend timer and invalid-code handling.
- Success completion screen with login handoff and onboarding guidance.
- Arabic/English translation coverage and mirrored layout behavior.

## Major Systems Implemented
* **Register Shell**: Split-screen onboarding layout reusing the existing auth shell pattern and dark-mode styling.
* **Validation & Mock Session Flow**: Client-side form validation, localStorage-backed registration draft/OTP/success state, and simulated API delays.
* **OTP Verification Module**: 6-digit entry control, resend cooldown, code verification state, and toast notifications.
* **Localization & RTL**: New bilingual registration copy with automatic `dir="rtl"` mirroring through the existing app language state.
* **Route Guarding**: Middleware and page-level redirects prevent authenticated users from accessing registration routes.

## Decisions
- **Frontend-Only Persistence**: Registration progress is persisted locally so the three-step flow survives navigation without introducing a backend dependency.
- **Customer-Only Self-Registration**: The module provisions a customer persona by design and routes authenticated users away from public onboarding pages.

## Known Carryovers
- No real email/SMS delivery is performed; the OTP is simulated in the frontend only.
- Identity provider / backend registration orchestration remains out of scope for this release.
