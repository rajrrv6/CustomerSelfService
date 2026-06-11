import { z } from 'zod';

export const superChannelConfigSchema = z.object({
  mode: z.enum(['sandbox', 'live'], {
    message: 'Mode is required',
  }),
  rateLimit: z.coerce.number().int().min(1, 'Rate limit must be at least 1 request/sec').max(10000, 'Rate limit cannot exceed 10,000 requests/sec'),
  failoverChannel: z.string().min(1, 'Failover channel selection is required'),
  aiEnabled: z.boolean().default(false),
});

export const providerCredentialsSchema = z.object({
  environment: z.enum(['sandbox', 'live'], {
    message: 'Environment is required',
  }),
  // API key validation: allow edit but validate length / pattern
  apiKey: z.string().min(10, 'API Key must be at least 10 characters').max(128, 'API Key too long'),
});

export const clientChannelConfigSchema = z.object({
  queue: z.string().min(1, 'Dispatch queue is required'),
  sla: z.string().regex(/^\d+[smhd]$/, 'SLA must be a number followed by s, m, h, or d (e.g. 5m, 2h)'),
  aiEnabled: z.boolean().default(false),
});

export type SuperChannelConfigFormValues = z.infer<typeof superChannelConfigSchema>;
export type ProviderCredentialsFormValues = z.infer<typeof providerCredentialsSchema>;
export type ClientChannelConfigFormValues = z.infer<typeof clientChannelConfigSchema>;
