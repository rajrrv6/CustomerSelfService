# Plan: Voice IVR Designer Node Graph Builder

## Goal
Implement a visual node-graph layout tool for Client Admins to design SSML-aware interactive Voice Response (IVR) phone trees, mapping numeric inputs to actions and agent queues (Inventory ID #60).

## Proposed Architecture
- **Canvas System**: A visual canvas containing draggable speech nodes (Play TTS, Collect Digits, Record Voice, Transfer Queue).
- **Node Connections**: SVG paths linking outputs to input triggers.
- **SSML Editor**: In-node text boxes with voice type validation (e.g., standard speech vs neural voice).
- **Local JSON Export**: Compiles visual trees into standard Amazon Polly/Twilio Studio compatible JSON schemas.

## Expected Outcome
- Client Admins can visually map inbound calls to specific routing queues.
- Standard nodes validate parameters (e.g., dial timeouts, digit count limit).
- Multilingual sound snippets (EN/AR) can be set directly per block.

## Current Manual Outcome
- Displaying a simple placeholder state. Basic navigation routing is handled via static text queues.

## Files Likely Affected
- `src/components/client-admin/channels/VoiceIVRDesigner.tsx` [NEW]
- `src/components/client-admin/shared/ClientAdminLayout.tsx`

## Risks / Unknowns
- Visual graph rendering library footprint (aim to implement standard lightweight SVG canvas to prevent bundle bloat).
- Arabic neural voice options validation (requires testing specific SSML accent strings).

## Out of Scope
- Direct SIP network trunk dialing tests.
- Uploading audio files (managed via standard URL bindings).
