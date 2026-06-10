# API Standards & Contracts Document

This document outlines the REST API design conventions, endpoint naming structures, standard response envelopes, DTO validation mechanisms, and database migration safety protocols.

---

## 1. REST API Routing & Versioning
All public and internal endpoints must incorporate API versioning prefixes to prevent breaking clients during database schema upgrades:

```text
/api/v1/[domain]/[resource]
```

- **Example**: `/api/v1/tickets/open`
- **Method Mapping**:
  - `GET /api/v1/tickets`: Fetches a list of tickets.
  - `GET /api/v1/tickets/:id`: Retrieves ticket details.
  - `POST /api/v1/tickets`: Creates a new ticket.
  - `PUT /api/v1/tickets/:id`: Modifies an existing ticket.
  - `DELETE /api/v1/tickets/:id`: Archives or deletes a ticket.

---

## 2. Standard Response Envelopes
Every API endpoint returns a predictable wrapper. Do not send raw database rows or error strings.

### 1. Success Response Envelope
```json
{
  "success": true,
  "data": {
    "id": "60c72b2f9b1d8a001c8e9b1a",
    "name": "ACME Support Assistant",
    "status": "live"
  },
  "meta": {
    "timestamp": "2026-06-10T11:50:00Z"
  }
}
```

### 2. Paginated Success Response Envelope
Used when returning list queries:
```json
{
  "success": true,
  "data": [
    { "id": "1", "title": "Billing issue" },
    { "id": "2", "title": "Account locked" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 54,
    "totalPages": 6,
    "hasMore": true
  }
}
```

### 3. Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request body failed parameter verification.",
    "details": [
      {
        "field": "customerEmail",
        "issue": "Invalid email address format."
      }
    ]
  }
}
```

---

## 3. Query Parameter Standards

### Pagination Parameters
- `page`: Number (1-indexed, default `1`)
- `limit`: Number (default `20`, max `100` to prevent database query degradation)

### Filtering Parameters
Filters use a structured query syntax:
- `filter[field]=value` (Exact match)
- **Example**: `/api/v1/tickets?filter[status]=open&filter[priority]=high`

### Sorting Parameters
- `sort`: String format `field` (Ascending) or `-field` (Descending)
- **Example**: `/api/v1/tickets?sort=-createdAt`

---

## 4. Request DTO Validation Mechanics (Zod Integration)
- Every route handling inputs from the request body or parameters must register a Zod middleware guard.
- Invalid requests must throw immediately and be captured by the error-handling filter, outputting the Zod failure details inside the `error.details` envelope array.

Example Schema:
```typescript
import { z } from 'zod';

export const CreateTicketSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string()
});
```

---

## 5. Schema Evolution & Migration Safety Protocols
To ensure that database schema updates do not crash active instances during rollouts, developers must follow these schema evolution rules:

1. **Additions**: Adding new fields to database schemas is always safe. Mark them as optional or specify a default value.
2. **Deletions / Renames**: Never delete or rename database fields directly. Instead, execute a **Three-Phase Migration**:
   - **Phase A**: Add the new field, write to both fields in application services, but read from the old field.
   - **Phase B**: Deploy a background data migration script that populates the new field for all legacy records, and switch the application to read from the new field.
   - **Phase C**: Safely remove references to the old field from schemas and database collection mappings.
3. **DTO Decoupling**: Application models must map raw MongoDB schema structures into access-safe response JSON documents before serialization. Do not expose internal schema names to the frontend.