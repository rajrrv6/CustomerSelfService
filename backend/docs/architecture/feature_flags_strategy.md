# Feature Flag Architecture

This document describes the design and implementation of feature flags (feature toggles) and rollout configurations. This architecture allows developers to control feature activation, gate premium AI modules, and run A/B weight split rollouts.

---

## 1. Storage & Schema Design
To keep infrastructure free and simple, we store feature flags directly inside the MongoDB `tenants` collection or a dedicated tenant configuration schema (`tenant_feature_flags`):

```typescript
interface ITenantFeatureFlag {
  _id: ObjectId;
  tenantId: string;
  key: string;              // e.g. "voice-ivr-designer"
  name: string;             // Human-readable description
  description: string;
  enabled: boolean;         // Global toggle for tenant
  rules: {
    userEmails?: string[];  // Beta testers whitelist
    rolloutPercentage?: number; // 0 to 100 for canary drops
    billingPlans?: string[]; // Gating based on plan (e.g. ['premium', 'enterprise'])
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Indexing
- `{ tenantId: 1, key: 1 }` (Unique)

---

## 2. In-Memory Caching Strategy
Evaluating feature flags on every single service call by querying MongoDB degrades performance. The system uses a cached evaluation pattern:
1. **Local Memory Map**: The `FeatureFlagService` maintains a fast-lookup map in Node memory.
2. **TTL Cache / Event Invalidation**: When a tenant feature is enabled or updated via the Admin settings panel, the controller triggers a refresh event (`WsEvent` or local event) which clears the caching map for that specific tenant domain, forcing a reload on the next check.

---

## 3. Flag Checking Middleware & Decorators
Endpoints are gated at the routing layer using validation wrappers:

```typescript
import { Request, Response, NextFunction } from 'express';
import { FeatureFlagService } from '@/common/services/feature-flag.service';

export function checkFeatureFlag(flagKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.tenantId;
    const userEmail = req.user?.email;

    const isEnabled = await FeatureFlagService.evaluate(tenantId, flagKey, { email: userEmail });
    if (isEnabled) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FEATURE_DISABLED',
        message: `The feature flag '${flagKey}' is not active for this account tier.`
      }
    });
  };
}
```

---

## 4. Rollout Strategy: A/B Canary Splits
For NLU deployments or new prompt updates:
1. When routing a customer session, retrieve the bot's canary rollout parameter (e.g. `rolloutWeight: 20` representing 20% canary traffic).
2. Generate a pseudo-random hash using the conversation's UUID:
   ```typescript
   const userHash = hashUUIDToIntRange(conversationId); // Outputs 0 to 99
   const routeToCanary = userHash < bot.rolloutWeight;
   ```
3. Route the message request to the candidate canary LLM model if `routeToCanary` evaluates to `true`, logging performance metrics (sentiment, deflection success) separately to run split tests.