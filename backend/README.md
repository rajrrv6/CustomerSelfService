# CustomerSelfService Backend (Modular Monolith)

This is the backend for the AI-Native enterprise CustomerSelfService platform, built with Node.js, Express, TypeScript, Mongoose, and Socket.io.

## Stack Overview
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Caching & Queues**: Optional Redis (via self-hosted or free tier Upstash), falling back to in-memory caching and MongoDB-based queues.

## Directory Structure
```text
backend/
├── src/
│   ├── common/         # Global utilities, standard middlewares, base classes
│   ├── config/         # System configurations (DB, Port, AI gateways, logger)
│   ├── database/       # DB connection initialization and seeding engines
│   ├── modules/        # Domain-driven modules (Auth, Bots, Tickets, Chats, AI, QA)
│   │   ├── [domain]/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── types/
│   │   └── ...
│   └── index.ts        # App bootstrapper and Socket.io registration
├── docs/               # Architecture, API, database, and operational blueprints
└── package.json
```

## Setup & Running
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment parameters:
   ```bash
   cp .env.example .env
   ```
4. Spin up local development server:
   ```bash
   npm run dev
   ```

## Development Principles
- **Monolith First**: Strictly modular monolith structure inside `src/modules/*` with clean boundaries. Do not cross-reference repository models across domains directly; use injected services.
- **Type-Safety**: Enforce strict TypeScript types. Avoid the use of `any`.
- **API First**: Build restful APIs scoped under `/api/v1/` following standard response envelopes.
- **Documentation First**: Maintain documents under `docs/` for every schema or workflow change.