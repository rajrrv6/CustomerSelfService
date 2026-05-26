# Plan: Knowledge Connectors & Vector DB Indexing Portal

## Goal
Build the integration interface for Client Admins to connect, crawl, and sync third-party knowledge bases (Notion, Confluence, Google Drive) with the vector storage systems used for RAG chatbot responses (Inventory IDs #46, #47, #50).

## Proposed Architecture
- **Connector Configuration Forms**: Fields for Confluence space keys, Notion OAuth credentials, and SQL DB read parameters.
- **Sync Scheduler**: Allows setting incremental updates (hourly, daily, weekly) or immediate sync commands.
- **Chunking & Embedding Customizer**: Configuration controls for chunk size limits, overlap padding, and embedding models.
- **Reindexing Confirmation Dialog**: Action warning modal prompting user to type-to-confirm chunk replacements.

## Expected Outcome
- Admins can link files, websites, and workspaces to index indices.
- Embedded crawler calculates page counts and index ingestion logs.
- AI co-pilot references correct citations during testing simulations.

## Current Manual Outcome
- Knowledge bases upload standard files but do not fetch from third-party workspaces dynamically.

## Files Likely Affected
- `src/components/client-admin/knowledge/KnowledgeConnectors.tsx` [NEW]
- `src/components/client-admin/shared/ClientAdminLayout.tsx`

## Risks / Unknowns
- Large workspace indexing times (indexing over 10,000 docs can trigger timeout limits).
- Token allocation pricing during initial indexing stages.

## Out of Scope
- Direct PDF chunk inspection tools.
- Vector database cluster deployment (handled in Super Admin operator console).
