import { SupportAgent, Article, ChangelogItem } from './types';
import {
  TRANSITION_STANDARD,
  TRANSITION_MICRO,
  ENTER_PANEL,
  DRAWER_ENTER_LTR,
  DRAWER_ENTER_RTL,
  PULSE,
} from '@/design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Animation Tokens (sourced from design-system/tokens)
// ─────────────────────────────────────────────────────────────────────────────

/** Standard panel/drawer transition */
export const SUPPORT_ANIMATION_TRANSITIONS = TRANSITION_STANDARD;

/** Faster micro-interaction for hover/focus state changes */
export const SUPPORT_MICRO_TRANSITION = TRANSITION_MICRO;

/** Slow entrance for content panels */
export const SUPPORT_PANEL_ENTER = ENTER_PANEL;

/** Drawer enter from right (LTR) */
export const SUPPORT_DRAWER_ENTER_LTR = DRAWER_ENTER_LTR;

/** Drawer enter from left (RTL) */
export const SUPPORT_DRAWER_ENTER_RTL = DRAWER_ENTER_RTL;

/** Streaming/typing indicator pulse */
export const SUPPORT_TYPING_PULSE = PULSE;

// ─────────────────────────────────────────────────────────────────────────────
// Mock Agent Data
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_AGENTS: Record<string, SupportAgent> = {
  nadia: {
    name: 'Nadia Vance',
    avatar: '👩‍💻',
    role: 'Technical Lead Representative',
    status: 'online'
  },
  liam: {
    name: 'Liam Bennett',
    avatar: '👨‍💻',
    role: 'Senior Support Desk Engineer',
    status: 'online'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Changelog Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CHANGELOG: ChangelogItem[] = [
  {
    id: 'ch-1',
    version: 'v2.4.0',
    title: 'Omnichannel Voice Callback & CSAT Dashboard',
    desc: 'Users can now request an automated callback from any human agent directly from the queue waiting screen. Complete CSAT and NPS surveys after closing a ticket to feed customer telemetry logs.',
    tag: 'feature',
    date: '2026-06-05',
    read: false
  },
  {
    id: 'ch-2',
    version: 'v2.3.5',
    title: 'RAG Context Citations Inspections Drawer',
    desc: 'Improved the AI assistant response interface. You can now click on source reference badges to slide open the RAG context inspector and verify documents matching score fit.',
    tag: 'improvement',
    date: '2026-05-28',
    read: true
  },
  {
    id: 'ch-3',
    version: 'v2.3.1',
    title: 'Fixed Arabic Input Overlapping in Composer',
    desc: 'Resolved character collision issues when typing Arabic inside the AI workspace bottom composer textarea. Adjusted microphone button offset for RTL locales.',
    tag: 'bugfix',
    date: '2026-05-15',
    read: true
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Regional Health Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_REGIONAL_HEALTH = [
  { region: 'US East (N. Virginia)', status: 'operational', ping: '24ms' },
  { region: 'EU West (Ireland)', status: 'operational', ping: '82ms' },
  { region: 'ME South (Bahrain)', status: 'operational', ping: '18ms' },
  { region: 'AP Southeast (Singapore)', status: 'operational', ping: '112ms' }
];

// ─────────────────────────────────────────────────────────────────────────────
// System Incident History Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_SYSTEM_INCIDENTS = [
  {
    date: '2026-06-04',
    title: 'Stripe Connector Timeout Exception',
    status: 'resolved',
    desc: 'We experienced billing lookup timeouts in Stripe endpoints between 14:00 - 15:30 UTC. Re-routed requests to failover gateways.'
  },
  {
    date: '2026-05-22',
    title: 'Pinecone Vector DB Index Latency Spike',
    status: 'resolved',
    desc: 'Pinecone semantic search query latency spiked to 900ms. Index replica nodes were added to load balance RAG vectors.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SLA Config Defaults
// ─────────────────────────────────────────────────────────────────────────────

export const SLA_DEFAULTS = {
  /** Near-breach threshold in seconds (10 minutes) */
  nearBreachThreshold: 600,
  /** Default SLA limit for live support sessions in minutes */
  liveSupportLimitMinutes: 20,
  /** Default SLA limit for open tickets in minutes */
  ticketResponseLimitMinutes: 60
} as const;
