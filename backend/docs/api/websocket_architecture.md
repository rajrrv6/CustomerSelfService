# WebSocket & Socket.io Architecture Document

This document outlines the real-time websocket namespaces, client subscription rooms, event payloads, rate limits, and authentication workflows.

---

## 1. Connection Lifecycle & Authentication
All WebSocket connections use Socket.io. Clients connect via:
```text
wss://yourdomain.com/socket.io/
```

1. **Handshake Guard**: The client passes the JWT access token in the `auth` credentials packet.
2. **Signature Verification**: The connection is rejected immediately if the signature is invalid or has expired.
3. **Tenant Context Extraction**: The server reads the user's `tenantId` from the verified token payload.
4. **Tenant Scoped Subscriptions**: The socket joins a generic tenant-wide channel: `socket.join(`tenant:${tenantId}`)`.

---

## 2. Namespace & Room Strategy
To ensure strict security boundaries and prevent cross-tenant packet leakage, we partition sockets into nested Socket.io rooms:

```text
Namespaces
  └── "/" (Root namespace containing all connections)
       ├── Rooms: "tenant:[tenantId]" (Tenant global events, e.g. system warnings)
       ├── Rooms: "tenant:[tenantId]:agents" (Broadcasts active presence shifts)
       ├── Rooms: "tenant:[tenantId]:conversation:[conversationId]" (Conversation messages)
       └── Rooms: "tenant:[tenantId]:supervisors" (Barge-in notifications)
```

| Room Naming Template | Target Audience | Example Usage |
| :--- | :--- | :--- |
| `tenant:[tenantId]` | All active tenant users | Global system maintenance announcements |
| `tenant:[tenantId]:agents` | Online customer support agents | Dispatching routing updates from queue |
| `tenant:[tenantId]:conv:[id]`| Joined conversation participants | Live chat typing and message bubbles |
| `tenant:[tenantId]:supervisors`| Managers & Supervisors | Sentiment alarms and SLA breach notifications |

---

## 3. WebSocket Event Registry

### 1. Agent Presence & Aux States
- **Event**: `agent:presence:update` (Bidirectional)
  - **Payload**:
    ```json
    {
      "agentId": "60c72b2f9b1d8a001c8e9b1a",
      "status": "online" | "away" | "busy" | "offline",
      "auxCode": "break" | "coaching" | "meeting" | "none",
      "timestamp": "2026-06-10T17:20:00Z"
    }
    ```

### 2. Live Conversations
- **Event**: `chat:message:send` (Client $\rightarrow$ Server)
  - **Payload**:
    ```json
    {
      "conversationId": "507f1f77bcf86cd799439011",
      "text": "Hello, I need assistance with my payment",
      "messageType": "chat" | "internal_note"
    }
    ```
- **Event**: `chat:message:receive` (Server $\rightarrow$ Client)
  - **Payload**:
    ```json
    {
      "messageId": "60c72b2f9b1d8a001c8e9b1f",
      "conversationId": "507f1f77bcf86cd799439011",
      "sender": "customer" | "agent" | "bot" | "system",
      "senderName": "Jane Doe",
      "text": "Hello, I need assistance with my payment",
      "timestamp": "2026-06-10T17:20:02Z",
      "sentiment": "neutral"
    }
    ```

### 3. Supervisor Wiretap & Barge-In
- **Event**: `supervisor:whisper` (Supervisor $\rightarrow$ Agent)
  - Sends a whisper coaching text to the agent, not visible to the customer.
- **Event**: `supervisor:barge_in` (Supervisor $\rightarrow$ Conversation)
  - Triggers agent transfer node logic to instantly join the supervisor as a conversation participant.

### 4. AI Ingestion and Streaming
- **Event**: `ai:stream:chunk` (Server $\rightarrow$ Client)
  - Emits incremental character tokens to support real-time chat widgets:
    ```json
    {
      "conversationId": "507f1f77bcf86cd799439011",
      "chunk": " payment",
      "isComplete": false
    }
    ```

---

## 4. Heartbeats, Throttling & Reconnections
- **Ping / Pong Interval**: Set to 25 seconds. If no response is received within 60 seconds (`pingTimeout`), the server disconnects the socket and broadcasts `agent:presence:update` with status `offline`.
- **Typing Indicator Throttle**: Client typing events (`chat:typing`) must be throttled to emit at most once every 3 seconds to prevent backend CPU exhaustion.
- **Reconnection Logic**: The frontend uses incremental backoff: `[1s, 2s, 5s, 10s, 30s]`. Upon successful reconnect, the client must trigger an `/auth/sync` API call to fetch missed message packets.