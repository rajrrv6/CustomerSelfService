# Walkthrough — Sprint 10A Task 1: Guest → Auth Redirect Continuity
## CustomerSelfService Platform — Quality Walkthroughs

**Status:** ✅ COMPLETED (Task 1 Execution Complete)  
**Sprint Window:** Sprint 10A  
**Implementation Date:** 2026-06-09  
**Reviewer:** Senior Frontend Architect (Antigravity)

---

## 1. Summary of Changes

Implemented query-preserved, security-validated route redirection workflows to enable visitor navigation continuity from the anonymous Guest Helpdesk to the gated End-User Customer Portal.

### Affected Files
* [ProtectedRoute.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/components/auth/ProtectedRoute.tsx): Refactored the route guard to capture `pathname` and `searchParams`, encoding them into a single local query: `/login?redirect=[target]`.
* [page.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/src/app/login/page.tsx): Updated login redirection logic to parse the `redirect` search parameter. If validated as safe and local, the router forwards to the parameter path; otherwise, it falls back to default role home paths.
* [auth.test.tsx](file:///Users/sudhir88/Desktop/CustomerSelfService/frontend/tests/vitest/auth.test.tsx): Appended 3 unit tests verifying parameter generation, redirection routing, and safety prefix compliance.

---

## 2. Code Modifications

### A. ProtectedRoute Route Guard
```diff
-    if (!isAuthenticated) {
-      router.replace('/login');
-      return;
-    }
+    if (!isAuthenticated) {
+      const queryStr = searchParams ? searchParams.toString() : '';
+      const targetPath = queryStr ? `${pathname}?${queryStr}` : pathname;
+      router.replace(`/login?redirect=${encodeURIComponent(targetPath)}`);
+      return;
+    }
```

### B. Login Redirection Parser & Validator
```diff
   useEffect(() => {
     if (status === 'loading') return;
     if (isAuthenticated && user) {
-      router.replace(getHomeRouteForRole(user.role));
+      const redirect = searchParams ? searchParams.get('redirect') : null;
+      // Safety validation: Must start with '/' but reject '//', '/\', and any absolute protocol
+      const isValidRedirect = redirect && 
+        redirect.startsWith('/') && 
+        !redirect.startsWith('//') && 
+        !redirect.startsWith('/\\') && 
+        !redirect.includes('://');
+
+      if (isValidRedirect) {
+        router.replace(redirect);
+      } else {
+        router.replace(getHomeRouteForRole(user.role));
+      }
     }
```

---

## 3. Verification & Validation Results

### A. Automated Unit Tests
Executed the test suite via `npm run test`, showing that all 74 unit tests passed successfully:

```bash
✓ tests/vitest/auth.test.tsx (7 tests)
  ✓ Auth Subsystem QA Tests > renders LoginCard forms and triggers validation warnings
  ✓ Auth Subsystem QA Tests > renders MFAInput with 6 blank inputs
  ✓ Auth Subsystem QA Tests > navigates through digit fields in MFAInput
  ✓ Auth Subsystem QA Tests > ProtectedRoute displays a loading spinner when auth state is loading
  ✓ Auth Subsystem QA Tests > ProtectedRoute redirects unauthenticated users to login with encoded current path
  ✓ Auth Subsystem QA Tests > LoginPage redirects authenticated users to redirect query path if safe
  ✓ Auth Subsystem QA Tests > LoginPage redirects authenticated users to default role route if redirect query is external/unsafe

Test Files  11 passed (11)
     Tests  74 passed (74)
```

### B. Manual Validation Scenarios

#### Scenario A — Gated Navigation Continuity (Preserved Query)
1. Set authentication state to unauthenticated.
2. Attempted to load `/portal/home?view=favorites&category=billing` manually.
3. Verified the router redirected to:
   `/login?redirect=%2Fportal%2Fhome%3Fview%3Dfavorites%26category%3Dbilling`
4. Input valid customer credentials and logged in.
5. Confirmed that after authentication, the page loaded `/portal/home?view=favorites&category=billing` instead of resetting to the general `/portal/home`.

#### Scenario B — Unsafe / External Origin Rejection (Open Redirect Mitigation)
1. Attempted to trigger a redirect loop using an external address:
   `/login?redirect=https://external-malicious-site.com/steal-session`
2. Entered valid customer credentials and completed authentication.
3. Verified the system identified the prefix as external and rejected the path.
4. Confirmed the router routed the session back to the default customer home route (`/portal/home`) safely.

#### Scenario C — Protocol Relative Escape Attempt Rejection
1. Attempted to trigger protocol-relative escapes:
   `/login?redirect=//google.com`
2. Entered credentials and completed authentication.
3. Verified the validator caught the double slash and rejected the path, falling back securely to the home route.

---

## 4. Edge Cases Resolved
* **Decoded Query Handling:** React hook `useSearchParams` automatically handles decoding when fetching parameters, avoiding double-decoding syntax errors during url parsing.
* **Server/Client Hydration Mismatch:** ProtectedRoute guards use a `mounted` tracker check to delay query processing until browser hydration is complete, preventing server-side mismatches.
