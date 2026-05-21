--- PAGE 1 ---
 AI-Native mPaaS — Exhaustive Screen Inventory (12 Standalone Apps)
Each app is fully standalone — its own RBAC, auth, multilingual + RTL, AI co-pilot, and public bot widget. No shared SSO.
How to read 01_Common_Per_App
02 ... 13
Persona colour legend
Super Admin Client Admin End User Public / Bot Shared
Type values
Page
Modal
Drawer / Side Panel Wizard Step Intermediate
OTP Confirmation Toast / Banner Empty State Widget
Scaffolding every app must have on its own (auth/OTP/MFA, RBAC, settings, branding, localisation/RTL, AI co-pilot, public bot widget admin, billing, audit, popups, error states). Replicated INSIDE each of the 12 apps. Module-specific screens only — what makes each app unique. Super Admin master data, Client Admin operations, End User self-service, module popups + bot flows.
Platform operator — master data, multi-tenant control, models, billing plans.
Tenant admin / business user — configures the app for their organisation.
The persona the module serves (employee / vendor / customer / agent / candidate / field rep / community member / subscriber / requestor). Unauthenticated visitor reaching the embedded bot widget or public surfaces.
Used by all personas (auth, search, error states, etc.).
Full route / screen
Overlay dialog requiring action
Slide-in panel that doesn't block primary screen
Step inside a multi-step flow
Loading / progress / processing / verifying state One-time-password / MFA challenge step
Destructive or irreversible confirm (often type-to-confirm) Non-blocking notification
Zero-data / no-permission state
Embeddable / floating element

--- PAGE 2 ---
 Mobile
Apps in this inventory
02_EmployeeSelfService
03_CustomerSelfService
04_LeadGeneration
05_VendorSelfService
06_TicketingSystem
07_Procurement
08_SurveyPoll
09_FieldForce
10_Community
11_CallCenter
12_Marketing
13_HiringTalent Cross-cutting reminders
RTL / Localisation AI Co-pilot
Public Bot Widget
Mobile-specific variant (touch + offline)
HR self-service: onboarding, attendance, leave, payroll, performance, LMS, expenses, exits. AI chatbot + agent desk for support across web/WhatsApp/SMS/email/voice.
Capture, enrich, score, route, sequence; SDR + AE workbench; ABM.
Vendor onboarding, KYB, compliance, portal, RFx, performance.
ITSM/ESM — incidents, problems, changes, CMDB, runbooks, requestor + agent. PR-to-Pay: requisitions, RFx, POs, GRN, 3-way match, invoices, payments. Surveys, polls, NPS/CSAT/CES, conversational surveys, panel + close-the-loop. Beat/route, geo check-in, orders, audits, collections, image-AI, offline mobile. Multi-community: spaces, moderation, gamification, events, UGC. Inbound/outbound voice, IVR, voicebot, dialer, WFM, QA, conversation intel. Omnichannel journeys, email/SMS/WhatsApp/push, loyalty, CDP, attribution.
ATS + sourcing + AI screening + interviewing + offer + pre-boarding.
Every screen supports per-user language switch AND RTL mirroring. Localisation tooling, RTL preview, AI auto-translate in Common Per-App. Every app embeds a co-pilot (panel + slash + voice). Admin co-pilot screens in Common Per-App; module-specific actions per app.
Every app ships an embeddable bot for public visitors. Admin config in Common Per-App; conversational flows per app.

