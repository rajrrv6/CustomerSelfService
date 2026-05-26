# Plan: Mobile SDK API Keys Generation Portal

## Goal
Provide Client Admins with an interface to generate, rotate, and manage secure application keys and push certificates for native iOS (APNs) and Android (FCM) chat bindings (Inventory ID #61).

## Proposed Architecture
- **Key Registry Table**: Displays active keys, application identifiers (Bundle IDs), creation dates, and statuses.
- **Generation Dialog**: Wizard prompt allowing clients to input App Name, select Platform, upload certificates (.p12 / google-services.json), and generate client-side client tokens.
- **Webhook Logs Panel**: Lists delivery reports, push latency metrics, and error rates per device registration token.

## Expected Outcome
- Admins can create and rotate iOS/Android API access tokens.
- Safe uploading of FCM JSON configurations.
- Metric indicators detailing total active mobile app sessions.

## Current Manual Outcome
- Standard native channel configurations are initialized with placeholder strings.

## Files Likely Affected
- `src/components/client-admin/channels/MobileSDKKeys.tsx` [NEW]
- `src/components/client-admin/shared/ClientAdminLayout.tsx`

## Risks / Unknowns
- Handling complex FCM certificate schema parses in frontend validation checks.
- Enforcing file extension restrictions (.p12, .pem, .json) securely.

## Out of Scope
- Direct push notifications dispatching (handled by separate backend notification service).
