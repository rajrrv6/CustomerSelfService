import { SafetyConfigFormValues, EscalationTriggerFormValues } from './schemas/safetySchemas';
import { QueueFormValues, AgentFormValues, RoutingRuleFormValues } from './schemas/routingSchemas';
import { SuperChannelConfigFormValues, ProviderCredentialsFormValues, ClientChannelConfigFormValues } from './schemas/channelSchemas';
import { BotProvisioningFormValues, IntentGenerationFormValues } from './schemas/botSchemas';

export const defaultSafetyConfig: SafetyConfigFormValues = {
  toxicityScore: 0.70,
  piiAction: 'Medium mask',
  forbiddenWordsRaw: 'spam, fraud, phishing',
};

export const defaultEscalationTrigger = (): EscalationTriggerFormValues => ({
  condition: '',
  action: 'Transfer to Live Agent',
  isActive: true,
});

export const defaultQueueConfig = (): QueueFormValues => ({
  nameEn: '',
  nameAr: '',
  maxWaitTimeMins: 3,
  slaTargetPercent: 90,
  priorityWeight: 5,
  overflowRule: 'trigger_callback',
});

export const defaultAgentConfig = (): AgentFormValues => ({
  name: '',
  email: '',
  maxChatsCount: 4,
  shift: 'Morning',
});

export const defaultRoutingRuleConfig = (): RoutingRuleFormValues => ({
  nameEn: '',
  nameAr: '',
  conditionField: 'language',
  conditionOperator: 'equals',
  conditionValue: '',
  targetQueueId: '',
  isActive: true,
});

export const defaultSuperChannelConfig = (): SuperChannelConfigFormValues => ({
  mode: 'sandbox',
  rateLimit: 100,
  failoverChannel: 'Email Connect',
  aiEnabled: false,
});

export const defaultProviderCredentials = (): ProviderCredentialsFormValues => ({
  environment: 'sandbox',
  apiKey: '',
});

export const defaultClientChannelConfig = (): ClientChannelConfigFormValues => ({
  queue: 'General Support Team',
  sla: '15m',
  aiEnabled: false,
});

export const defaultBotProvisioning = (): BotProvisioningFormValues => ({
  name: '',
  description: '',
  domain: 'Retail',
  langs: ['English', 'Arabic'],
  personality: 'An empathetic customer service virtual assistant.',
  tone: 'Friendly',
  escalationRule: 'fallback_limit',
  multilingualBehavior: 'auto_detect',
  channels: {
    web: true,
    whatsapp: false,
    email: false,
    voice: false,
    instagram: false,
    messenger: false,
  },
  whatsappNumber: '+966 50 123 4567',
  webChatColor: '#2563EB',
  sipTrunkGateway: 'VoIP Gate AST/KSA',
  supportEmail: 'support@mpaas-tenant.com',
  selectedKB: ['kb-custom'],
  embeddingModel: 'text-embedding-3-small',
  confidenceThreshold: 0.70,
  fallbackBehavior: 'search_kb',
  deployEnv: 'staging',
  deployRollout: 100,
  deployStatus: 'draft',
});

export const defaultIntentGeneration = (): IntentGenerationFormValues => ({
  intentName: '',
  category: 'billing',
  phrases: [],
  selectedEntities: [],
  enResponse: '',
  arResponse: '',
});
