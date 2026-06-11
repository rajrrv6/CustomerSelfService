import { z } from 'zod';

export const safetyConfigSchema = z.object({
  toxicityScore: z.coerce.number().min(0).max(1, 'Toxicity score must be between 0 and 1'),
  piiAction: z.enum(['Strict block', 'Medium mask', 'Log only'], {
    message: 'Please select a PII action',
  }),
  forbiddenWordsRaw: z.string().optional(),
});

export const escalationTriggerSchema = z.object({
  id: z.string().optional(),
  condition: z.string().min(3, 'Condition must be at least 3 characters'),
  action: z.string().min(2, 'Escalation action is required'),
  isActive: z.boolean().default(true),
});

export type SafetyConfigFormValues = z.infer<typeof safetyConfigSchema>;
export type EscalationTriggerFormValues = z.infer<typeof escalationTriggerSchema>;
