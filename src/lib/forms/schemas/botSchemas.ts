import { z } from 'zod';

export const botProvisioningSchema = z.object({
  name: z.string().min(2, 'Bot name must be at least 2 characters'),
  description: z.string().optional(),
  domain: z.string().min(1, 'Business domain is required'),
  langs: z.array(z.string()).min(1, 'Please select at least one language'),
  personality: z.string().min(10, 'System prompt must be at least 10 characters'),
  tone: z.string().min(1, 'Tone preset is required'),
  escalationRule: z.string().min(1, 'Escalation behavior is required'),
  multilingualBehavior: z.string().min(1, 'Multilingual engine config is required'),
  channels: z.record(z.string(), z.boolean()),
  whatsappNumber: z.string().regex(/^\+?[\d\s-]{10,16}$/, 'Must be a valid phone number (e.g. +966 50 123 4567)').optional().or(z.literal('')),
  webChatColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code (e.g. #2563EB)').optional().or(z.literal('')),
  sipTrunkGateway: z.string().optional(),
  supportEmail: z.string().email('Must be a valid support email address').optional().or(z.literal('')),
  selectedKB: z.array(z.string()).min(1, 'Please link at least one Knowledge Base source'),
  embeddingModel: z.string().min(1, 'Embedding vector model selection is required'),
  confidenceThreshold: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: 'Threshold must be between 30% and 95%' }).min(0.30).max(0.95)
  ),
  fallbackBehavior: z.string().min(1, 'Fallback action is required'),
  deployEnv: z.string().default('staging'),
  deployRollout: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: 'Rollout percentage must be between 0 and 100' }).int().min(0).max(100)
  ),
  deployStatus: z.enum(['live', 'draft', 'training']).default('draft'),
});

export const intentGenerationSchema = z.object({
  intentName: z.string()
    .min(2, 'Intent name must be at least 2 characters')
    .regex(/^[a-z0-9_]+$/, 'Intent name must contain lowercase letters, numbers, and underscores only (e.g. request_refund_exemption)'),
  category: z.string().min(1, 'Category is required'),
  phrases: z.array(z.string().min(2, 'Phrase must be at least 2 characters')).min(1, 'Please add at least one training phrase'),
  selectedEntities: z.array(z.string()).default([]),
  enResponse: z.string().min(5, 'English bot reply must be at least 5 characters'),
  arResponse: z.string().min(5, 'Arabic bot reply must be at least 5 characters'),
});

export const ivrNodeWelcomeSchema = z.object({
  name: z.string().min(1, 'Node name is required'),
  textEn: z.string().min(2, 'English text prompt is required'),
  textAr: z.string().min(2, 'Arabic text prompt is required'),
  targetId: z.string().optional().or(z.literal('')),
});

export const ivrNodeMenuSchema = z.object({
  name: z.string().min(1, 'Node name is required'),
  promptEn: z.string().min(2, 'English menu prompt is required'),
  promptAr: z.string().min(2, 'Arabic menu prompt is required'),
  options: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1, 'Option label is required'),
    targetId: z.string().optional().or(z.literal('')),
  })).min(1, 'Please define at least one option route'),
});

export const ivrNodeHoursSchema = z.object({
  name: z.string().min(1, 'Node name is required'),
  openTargetId: z.string().optional().or(z.literal('')),
  closedTargetId: z.string().optional().or(z.literal('')),
  holidayTargetId: z.string().optional().or(z.literal('')),
});

export const ivrNodeQueueSchema = z.object({
  name: z.string().min(1, 'Node name is required'),
  queueType: z.enum(['sales', 'support', 'billing', 'escalation']),
  targetId: z.string().optional().or(z.literal('')),
});

export type BotProvisioningFormValues = z.infer<typeof botProvisioningSchema>;
export type IntentGenerationFormValues = z.infer<typeof intentGenerationSchema>;
export type IvrNodeWelcomeFormValues = z.infer<typeof ivrNodeWelcomeSchema>;
export type IvrNodeMenuFormValues = z.infer<typeof ivrNodeMenuSchema>;
export type IvrNodeHoursFormValues = z.infer<typeof ivrNodeHoursSchema>;
export type IvrNodeQueueFormValues = z.infer<typeof ivrNodeQueueSchema>;
