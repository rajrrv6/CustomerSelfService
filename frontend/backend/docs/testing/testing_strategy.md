# Testing Strategy Document

This document outlines the testing architecture, framework configurations, and environment mocking specifications for the CustomerSelfService backend.

---

## 1. Testing Stack & Tools
- **Test Runner**: Vitest (fast in-memory runner with native TypeScript support)
- **Assertion Library**: Vitest default (Chai-based)
- **API Testing**: `supertest` (handles in-memory HTTP requests to the Express server)
- **WebSocket Testing**: `socket.io-client` (instantiates mock connections)
- **Database Mocking**: `mongodb-memory-server` (spins up a local ephemeral MongoDB database for integration suites)

---

## 2. Test Suite Categorization

```text
+--------------------------------------------------------+
|                      Test Runner                       |
+--------------------------------------------------------+
                           |
       +-------------------+-------------------+
       |                                       |
+------v-------+                       +-------v-------+
|  Unit Tests  |                       |  Integration  |
|  (Services)  |                       | (Controllers) |
+--------------+                       +---------------+
```

### 1. Unit Tests (`*.spec.ts`)
- **Focus**: Pure business logic within service layers (e.g. SLA deadline calculators, wrap-up status logic, token cost computations).
- **Mocks**: Database calls and external HTTP APIs (e.g. Gemini, Twilio) must be fully mocked using Vitest spy/mock utilities. Do not hit active databases during unit runs.

### 2. Integration Tests (`*.test.ts`)
- **Focus**: End-to-end API validations, routing middleware, and database repository validations.
- **Data Isolation**: Each integration test run spins up a fresh instance of `mongodb-memory-server` to isolate changes and verify index operations.

---

## 3. Mocking AI Providers (ModelGateway)
To prevent unexpected usage billing and pipeline blocking during local and CI test runs, **live AI provider endpoints are mocked**:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { ModelGatewayService } from './model-gateway.service';

describe('ModelGateway Mocking', () => {
  it('should mock LLM responses without hitting external APIs', async () => {
    // Inject mock provider behavior
    const mockGateway = {
      generateText: vi.fn().mockResolvedValue({
        text: "This is a simulated AI response.",
        usage: { inputTokens: 10, outputTokens: 15, totalCostUSD: 0.0001 },
        latencyMs: 120,
        providerModelUsed: "mock-gemini-model"
      })
    };

    const result = await mockGateway.generateText({
      systemPrompt: "You are an assistant.",
      userMessage: "Hello"
    });

    expect(result.text).toBe("This is a simulated AI response.");
    expect(mockGateway.generateText).toHaveBeenCalledTimes(1);
  });
});
```

---

## 4. Auth & RBAC Verification Tests
Verify route-level guards by passing mock user contexts in request headers during test executions:

```typescript
import request from 'supertest';
import { app } from '../app';

describe('RBAC Route Protection', () => {
  it('should allow super_admin access to master registry', async () => {
    const adminToken = generateMockJWT({ role: 'super_admin', tenantId: '123' });

    const response = await request(app)
      .get('/api/v1/super-admin/llm-registry')
      .set('Cookie', [`auth_token=${adminToken}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should deny support_agent access to master registry', async () => {
    const agentToken = generateMockJWT({ role: 'support_agent', tenantId: '123' });

    const response = await request(app)
      .get('/api/v1/super-admin/llm-registry')
      .set('Cookie', [`auth_token=${agentToken}`]);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
```

---

## 5. WebSocket Integration Testing
WebSocket tests run against a test server listening on a local port:
1. Spin up the Express server and bind the Socket.io adapter.
2. Instantiate two `socket.io-client` connection options.
3. Authenticate both client sockets with mock access tokens.
4. Client 1 emits `chat:message:send`.
5. Verify Client 2 receives the matching `chat:message:receive` packet.
6. Terminate sockets and shut down the test server.