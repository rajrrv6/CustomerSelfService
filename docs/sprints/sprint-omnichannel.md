# Sprint: Omnichannel Channels & Customization

## Goal
Build and refine the Omnichannel Channels management portals across both Super Admin (platform credentials) and Client Admin (business customization) directories, maintaining visual consistency while enforcing tenant access boundaries.

## Scope
- Super Admin "Omnichannel Channels" dashboard.
- Client Admin "Omnichannel Channels" customizer dashboard.
- WhatsApp message template preview grids.
- Web Chat Widget theme color pickers and live mockup previews.
- Localized Arabic (RTL) translation mapping.

## Major Systems Implemented
* **Super Admin Omnichannel Controls**: Global channel catalogs, live traffic graphs, AI routing toggles, and provider credential configuration drawers.
* **Client Admin Customizer**: Business KPI HUD cards, simplified channel catalogs, support hours toggles (Business Hours vs 24/7), default dispatch queues, and AI triage sliders.
* **WhatsApp Template Center**: Template management table sorting approvals, categories, languages, usage sent, delivery rates, and modal preview templates.
* **Web Chat Live Preview**: Customizer tools (theme color HEX picker, launcher position toggles, welcome texts, avatar toggles, and offline behaviors) hooked directly to a responsive chat window mock preview.

## Decisions
* **Strict Permission Boundaries**: Client Admin views are prohibited from accessing API keys, secrets, webhooks, or trunking variables. They manage metadata parameters (greetings, queues, styling) only.
* **Mock Preview Interactivity**: Built a direct reactive bindings state between the color pickers/text boxes and the simulated preview window.

## Known Carryovers
- Live WhatsApp templates creation forms matching Meta API schema directly.
