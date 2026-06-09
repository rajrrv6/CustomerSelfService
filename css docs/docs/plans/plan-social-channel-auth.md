# Plan: Social Channel OAuth Authentication Portal

## Goal
Implement a secure OAuth setup screen for Client Admins to connect business social media channels (Facebook pages, Instagram accounts, X/Twitter handles) directly to the unified workspace inbox (Inventory ID #62).

## Proposed Architecture
- **OAuth Link Cards**: Visual channel connectors detailing connection status, page names, and last sync updates.
- **Callback Handlers**: Redirect listeners capturing Meta page access tokens and registering them within the tenant context.
- **Permissions Wizard**: Step-by-step checklist ensuring the tenant grants standard page permissions (manage_messages, pages_messaging).

## Expected Outcome
- Admins can authenticate accounts using a standard pop-up OAuth workflow.
- Visual feedback displays verified profile pictures, page names, and linked handlers.
- Auto-subscribe hooks to Meta Graph webhooks after auth success.

## Current Manual Outcome
- Status values are mocked within the main catalog cards, but authentication links are static trigger actions.

## Files Likely Affected
- `src/components/client-admin/channels/SocialChannelAuth.tsx` [NEW]
- `src/components/client-admin/shared/ClientAdminLayout.tsx`

## Risks / Unknowns
- Meta/X API rate limiting boundaries during peak chat volume hours.
- Dynamic page listing changes (user adds a page on FB but needs to refresh inside the app).

## Out of Scope
- Direct Instagram / Facebook ads management.
- Post publication schedulers.
