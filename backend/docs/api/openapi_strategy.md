# OpenAPI / Swagger Documentation Strategy

This document outlines the strategy for exposing, annotating, and testing RESTful APIs using Swagger/OpenAPI specifications.

---

## 1. Tooling & Setup
To automate API documentation and avoid desynchronization between code and documentation, the project uses:
- **`swagger-jsdoc`**: Reads inline JSDoc decorators inside routers and controllers to assemble the OpenAPI specification dynamically.
- **`swagger-ui-express`**: Exposes a standard graphical interface for testing endpoints under `/api/docs`.

### Bootstrapping Configuration (Express)
```typescript
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CustomerSelfService API',
      version: '1.0.0',
      description: 'AI-Native Enterprise Customer Portal & Agent Workspace APIs'
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
          description: 'JWT authorization token stored in HTTP-Only cookie'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts']
};

export const swaggerSpec = swaggerJSDoc(options);
```

---

## 2. Route Annotation Standards
Every controller and route must include structured JSDoc descriptions containing inputs, validation schemas, expected responses, and tenant boundary requirements:

```typescript
/**
 * @openapi
 * /tickets:
 *   post:
 *     summary: Submit a customer support ticket
 *     tags: [Tickets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - priority
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Invoicing discrepancy on Order #98221"
 *               description:
 *                 type: string
 *                 example: "The checkout page charged VAT twice."
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: "high"
 *               category:
 *                 type: string
 *                 example: "Billing"
 *     responses:
 *       201:
 *         description: Ticket registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *       400:
 *         description: Validation payload mismatch
 *       401:
 *         description: Unauthorized session state
 */
```

---

## 3. Component Schema Reuse
To maintain visual consistency and dry endpoints:
- Declare standard wrapper models under `components/schemas` in a central routing file.
- Standard definitions must include schemas for:
  - `StandardResponse` (Common envelope)
  - `PaginatedResponse`
  - `ValidationError`

---

## 4. Tenant-Aware Testing and Headers
When developers test APIs inside `/api/docs`:
- Enforce the inclusion of a tenant mapping header (e.g. `X-Tenant-Domain` or cookie context mapping).
- Provide default values in parameter examples (e.g. `"acme"`, `"globex"`) so that trial users do not run into database scope missing exceptions.