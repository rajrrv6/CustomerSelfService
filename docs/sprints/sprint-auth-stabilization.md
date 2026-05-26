# Sprint Summary: Auth Routing Stabilization and Separation

## Goals Achieved
1. **Public vs Private Customer Gating**: Configured Next.js middleware and route definitions to cleanly split unauthenticated public surfaces (`/kb`, `/bot`, `/callback`, `/portal/public`) from protected customer dashboards (`/portal/home`, `/portal/tickets/*`, `/portal/profile`).
2. **Security Hardening**: Replaced regex domain wildcard prefix inferences (which allowed any email starting with `superadmin@` to escalate privileges) with a strict, exact-match `MOCK_STAFF_REGISTRY`. Unrecognized corporate logins now default to `'customer'` instead of a privileged administrative role.
3. **Customer-Only Registration Form**: Updated wording, translation keys, and added clear UI notice alerts informing corporate staff that they cannot self-register and must be invited.
4. **Verification**: Checked TypeScript safety, verified production Next.js compilation, and ran E2E Playwright tests to ensure 100% test compatibility.
