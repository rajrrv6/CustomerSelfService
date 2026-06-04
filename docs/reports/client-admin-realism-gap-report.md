# Client Admin Realism Gap Report

This gap report evaluates the fidelity boundaries of the Sprint 09 Phase 06 persistent workspaces, outlining the differences between the current high-realism local simulator system and a production backend implementation.

---

## 1. Operational Realism Gap Matrix

| Feature Area | Current Persistent Simulation | Production API Endpoint (Target) | Gap Complexity |
| :--- | :--- | :--- | :--- |
| **Campaigns** | In-memory loop updatessent delivery statistics every 3 seconds; local state cloning. | `POST /api/v1/campaigns` & WebSocket updates from broadcast provider | Medium (Needs messaging broker integration) |
| **Voice & IVR** | Local DTMF sequence simulators; logs SIP call timelines locally. | SIP Media gateway interface integrations and VoIP active trunk APIs | High (Requires telephony carrier setup) |
| **Automation** | Local simulator triggers execution counts and mock pipeline step logs. | Server-less events listener; event broker queues (RabbitMQ/Kafka) | High (Requires backend scheduler engine) |
| **Reports** | In-browser CSV compilation; downloads dynamic Blobs directly. | Async background job runners compiling database records to S3 URLs | Medium (Requires S3 file server) |
| **Audit Logs** | Zustand persistence manages logs; pins logs to LocalStorage. | Immutable database entries (e.g. AWS CloudTrail, SIEM pipeline) | Medium (Needs database constraints) |
| **Brand Settings** | Accent color updates document styles via HTML custom variables. | DB schema configuration load; server-side rendering theme hydration | Low (Requires profile settings database table) |

---

## 2. Recommended API Integrations & Contracts

If this system transitions from local Zustand storage to a true backend, the following schema models and payloads are recommended:

### A. Campaigns Sync Target
```json
{
  "endpoint": "POST /api/v1/campaigns/broadcast",
  "payload": {
    "name": "VIP Renewal Notification 2026",
    "channel": "whatsapp",
    "audienceSize": 1240,
    "templateId": "wa_renewal_v2"
  },
  "response": {
    "campaignId": "c-1",
    "status": "scheduled",
    "estimatedStartTime": "2026-06-05T08:00:00Z"
  }
}
```

### B. SIP Event Gateway Target
```json
{
  "endpoint": "POST /api/v1/telephony/simulate-event",
  "payload": {
    "from": "+966501234567",
    "trunkId": "prov-1",
    "ivrFlowId": "ivr-1"
  },
  "response": {
    "callId": "sip-123456",
    "status": "ringing",
    "mosQuality": 4.5
  }
}
```

### C. Automated Rule Exporter Target
```json
{
  "endpoint": "POST /api/v1/reports/async-compile",
  "payload": {
    "reportType": "CSAT_SUMMARY",
    "format": "CSV",
    "recipientEmail": "finance@mpaas.sa"
  },
  "response": {
    "jobId": "job-rep-992",
    "status": "processing",
    "checkBackSeconds": 15
  }
}
```
