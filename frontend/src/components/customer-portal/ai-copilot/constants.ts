/**
 * AI Copilot Workspace — Component Constants
 * Imports shared tokens from the design system registry.
 */
import {
  TRANSITION_STANDARD,
  DRAWER_ENTER_LTR, DRAWER_ENTER_RTL,
  ENTER_FADE, ENTER_PANEL,
  TYPING_PULSE, STREAMING_CURSOR,
  CHAT_MSG_ENTER
} from '@/design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Re-export design system tokens under legacy names (backwards compat)
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Use TRANSITION_STANDARD from design-system/tokens */
export const ANIMATION_TRANSITIONS = TRANSITION_STANDARD;

// ─────────────────────────────────────────────────────────────────────────────
// Re-export shared tokens for AI workspace consumers
// ─────────────────────────────────────────────────────────────────────────────
export {
  TRANSITION_STANDARD,
  DRAWER_ENTER_LTR,
  DRAWER_ENTER_RTL,
  ENTER_FADE,
  ENTER_PANEL,
  TYPING_PULSE,
  STREAMING_CURSOR,
  CHAT_MSG_ENTER
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Workspace-specific constants
// ─────────────────────────────────────────────────────────────────────────────

export const EXPORT_FORMATS = ['pdf', 'md', 'json'] as const;

export const getSlashCommands = (isRtl: boolean) => [
  { cmd: '/help', label: isRtl ? 'مساعدة النظام' : 'General help', desc: isRtl ? 'إرشادات تصفح البوابة' : 'Portal help and guide', icon: '❓' },
  { cmd: '/ticket', label: isRtl ? 'إنشاء تذكرة' : 'Create ticket', desc: isRtl ? 'رفع تذكرة دعم جديدة' : 'Submit support ticket', icon: '🎫' },
  { cmd: '/status', label: isRtl ? 'حالة الموصلات' : 'Connector status', desc: isRtl ? 'عرض زمن استجابة API' : 'Check operational telemetry', icon: '⚡' },
  { cmd: '/refund', label: isRtl ? 'طلب استرجاع' : 'Refund request', desc: isRtl ? 'معالجة استثناء مالي للطلب' : 'Request invoice credit check', icon: '💳' }
];

export const getTraceSteps = (isRtl: boolean) => [
  { intent: 'MATCH_INTENT: "refund_billing"', details: 'Matched threshold: 0.942', colorClass: 'text-emerald-400', step: '1' },
  { intent: 'QUERY_VECTOR_DB: "ks-1 saas refund"', details: 'Docs loaded: art-1', colorClass: 'text-blue-400', step: '2' },
  { intent: 'REDACT_PII_DATA: "ORD-99881"', details: 'Redaction logic: Cleared', colorClass: 'text-purple-400', step: '3' },
  { intent: 'STREAM_TOKENS: "Farah-Llama-3"', details: '', colorClass: 'text-yellow-400', step: '4' }
];
