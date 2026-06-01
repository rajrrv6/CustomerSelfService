# Sprint Completion: Voice IVR Designer

## Features Delivered

### 1. Interactive Canvas Workspace
- Rendered IVR flow nodes sequentially inside a clean, light/dark styled grid/pipeline canvas.
- Integrated quick actions on cards: select node, assign start node badge, delete node, view sub-parameters.
- Supported localization dynamically (English EN and Arabic AR) with bidirectional RTL layout mirroring.

### 2. Node Capabilities System (9 Nodes)
- **Welcome Prompt**: Multilingual text-to-speech / SSML prompt parameters.
- **Menu Node**: Keypad DTMF option triggers matching digit transitions.
- **Queue Routing**: Direct dispatching rules into Support, Sales, Billing, and Escalation desks.
- **Agent Transfer**: Agent group transfer designations and custom SIP transfer reasons.
- **Business Hours**: Calendar branches routing calls differently for Open, Closed, and Holiday states.
- **Voicemail Node**: Record message checkboxes and TTS transcriptions.
- **Callback Request**: Schedule callback queue pools.
- **AI Voice Assistant**: Match confidence levels (threshold checks) against Farah AI Voice Bot models, with fallback routes.
- **End Call Node**: Hang-up speech prompt, with post-interaction CSAT survey triggers.

### 3. Real-Time Link Validation Engine
- Evaluates routes dynamically:
  - Missing route warnings for unmapped digit options or closed/open status routes.
  - Dead-end flow warnings for non-terminal nodes missing transitions.
  - Unconnected node warnings for isolated blocks.
  - Missing flow start node warnings.

### 4. Interactive Call Simulator
- Traces real phone journeys from start node to terminal transfer/end.
- Keypad click interface for DTMF digit entry.
- Time of day / shift controls (Open/Closed/Holiday) to test hours branches.
- Confidence threshold range inputs to test Farah AI Assistant matches.
- Live path tracing displaying path decision history step-by-step.
