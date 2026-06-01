import { z } from 'zod';

const toInt = (min: number, max: number, msg: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: msg }).int().min(min, msg).max(max, msg)
  );

export const queueSchema = z.object({
  id: z.string().optional(),
  nameEn: z.string().min(2, 'English name must be at least 2 characters'),
  nameAr: z.string().min(2, 'Arabic name must be at least 2 characters'),
  maxWaitTimeMins: toInt(1, 60, 'Max wait must be between 1 and 60 minutes'),
  slaTargetPercent: toInt(50, 100, 'SLA target must be between 50% and 100%'),
  priorityWeight: toInt(1, 10, 'Priority weight must be between 1 and 10'),
  overflowRule: z.enum(['vip_redirect', 'trigger_callback', 'voicemail', 'secondary_pool'], {
    message: 'Overflow rule is required',
  }),
});

export const agentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Agent name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  maxChatsCount: toInt(1, 20, 'Chat capacity must be between 1 and 20'),
  shift: z.string().min(1, 'Active shift selection is required'),
});

export const routingRuleSchema = z.object({
  id: z.string().optional(),
  nameEn: z.string().min(2, 'Rule name (EN) must be at least 2 characters'),
  nameAr: z.string().min(2, 'Rule name (AR) must be at least 2 characters'),
  conditionField: z.string().min(1, 'Condition field is required'),
  conditionOperator: z.string().min(1, 'Condition operator is required'),
  conditionValue: z.string().min(1, 'Value is required'),
  targetQueueId: z.string().min(1, 'Target queue is required'),
  isActive: z.boolean().default(true),
});

export type QueueFormValues = z.infer<typeof queueSchema>;
export type AgentFormValues = z.infer<typeof agentSchema>;
export type RoutingRuleFormValues = z.infer<typeof routingRuleSchema>;
