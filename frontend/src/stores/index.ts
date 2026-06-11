/**
 * Store barrel export.
 *
 * Import stores from here rather than individual files to keep imports clean.
 *
 * Sprint 1 stores (cross-feature shared state only):
 * - useUIStore   → lang, theme
 * - useAuthStore → role
 * - useNotificationsStore → auditLogs, addAuditLog
 *
 * All other state (bots, intents, conversations, channels, etc.) remains in
 * AppContext because it is feature-scoped, not cross-feature shared state.
 * See docs/decisions/adr-001-zustand-migration.md for the full ownership map.
 */

export { useUIStore } from './uiStore';
export { useAuthStore } from './authStore';
export { useNotificationsStore } from './notificationsStore';
export { useConversationStore } from './conversationStore';
