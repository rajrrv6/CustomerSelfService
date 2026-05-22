'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Badge } from '@/components/shared/BadgeSystem';
import {
  MessageSquare, Mail, Phone, Globe, Radio, Camera, Send, Tv2,
  Zap, XCircle, Settings, RefreshCw, ToggleLeft, ToggleRight,
  Wifi, Bot, GitBranch, Eye, EyeOff, Copy, Smartphone, Tablet,
  ShieldCheck, Key, Link, Clock, CheckCircle, AlertTriangle,
  Lock as LockIcon
} from 'lucide-react';

// ─── Self-contained bilingual dictionary ──────────────────────────────────────
const DICT = {
  en: {
    // Page header
    title: 'Omnichannel Channels',
    description: 'Manage communication channel integrations and provider credentials across the platform.',
    // KPI labels
    activeChannels: 'Active Channels',
    connectedProviders: 'Connected Providers',
    messagesToday: 'Messages Today',
    failedDeliveries: 'Failed Deliveries',
    queueThroughput: 'Queue Throughput',
    aiAutomationRate: 'AI Automation Rate',
    // Section A — Channel Catalog
    catalogTitle: 'Channel Catalog',
    catalogDesc: 'Web / WhatsApp / SMS / Voice / Email / iOS / Android and social channels — connectivity, routing, and real-time health.',
    catalogTableTitle: 'Communication Channels',
    catalogTableDesc: 'Full channel topology with provider bindings, routing policies, and operational parameters.',
    // Section B — Provider Credentials
    credTitle: 'Channel Provider Credentials',
    credDesc: 'Twilio / Meta / Plivo / SendGrid / SIP Trunk — API keys, webhook endpoints, authentication, and sync status.',
    // Section C — Live Traffic
    liveTrafficTitle: 'Live Traffic & Delivery Health',
    liveTrafficDesc: 'Real-time throughput, webhook status, and latency indicators per active channel.',
    // Section D — AI Routing
    aiRoutingTitle: 'AI Routing & Automation',
    aiRoutingDesc: 'Configure intelligent routing thresholds, escalation rules, and per-channel automation policies.',
    // Table headers — Channel Catalog
    colChannel: 'Channel',
    colProvider: 'Provider',
    colStatus: 'Status',
    colRegion: 'Region',
    colAI: 'AI Enabled',
    colRouting: 'Routing Policy',
    colFailover: 'Failover',
    colLastSync: 'Last Sync',
    colActions: 'Actions',
    // Table headers — Provider Credentials
    colProviderName: 'Provider',
    colAuthType: 'Auth Type',
    colApiKey: 'API Key',
    colWebhook: 'Webhook URL',
    colEnvironment: 'Environment',
    colFailoverProv: 'Failover',
    colRegionProv: 'Region',
    colSyncStatus: 'Sync Status',
    colLastValidated: 'Last Validated',
    // Modal — Channel Config
    channelConfigTitle: 'Channel Configuration',
    apiKeyLabel: 'API Key / Secret',
    webhookLabel: 'Webhook Endpoint URL',
    rateLimitLabel: 'Rate Limit (msg/s)',
    failoverLabel: 'Failover Channel',
    modeLabel: 'Environment Mode',
    sandbox: 'Sandbox',
    live: 'Live',
    save: 'Save Configuration',
    cancel: 'Cancel',
    // Modal — Provider Config
    providerConfigTitle: 'Provider Credentials',
    // Health metrics
    uptime: 'Uptime',
    latency: 'Latency',
    throughput: 'Throughput',
    failedWebhooks: 'Failed Webhooks',
    deliveryHealth: 'Delivery Health',
    // Controls
    enabled: 'Enabled',
    disabled: 'Disabled',
    configure: 'Configure',
    refreshSync: 'Sync',
    viewCredentials: 'Credentials',
  },
  ar: {
    title: 'القنوات متعددة القنوات',
    description: 'إدارة تكاملات قنوات الاتصال وبيانات اعتماد الموفرين عبر المنصة.',
    activeChannels: 'القنوات النشطة',
    connectedProviders: 'الموفرون المتصلون',
    messagesToday: 'رسائل اليوم',
    failedDeliveries: 'عمليات التسليم الفاشلة',
    queueThroughput: 'إنتاجية قائمة الانتظار',
    aiAutomationRate: 'معدل أتمتة الذكاء الاصطناعي',
    catalogTitle: 'كتالوج القنوات',
    catalogDesc: 'ويب / واتساب / رسائل SMS / صوت / بريد إلكتروني / iOS / Android والقنوات الاجتماعية.',
    catalogTableTitle: 'قنوات الاتصال',
    catalogTableDesc: 'طبولوجيا القناة الكاملة مع ارتباطات الموفر وسياسات التوجيه والمعاملات التشغيلية.',
    credTitle: 'بيانات اعتماد موفري القنوات',
    credDesc: 'Twilio / Meta / Plivo / SendGrid / SIP Trunk — مفاتيح API ونقاط نهاية Webhook والمصادقة.',
    liveTrafficTitle: 'حركة المرور المباشرة وصحة التسليم',
    liveTrafficDesc: 'مقاييس الإنتاجية في الوقت الفعلي وحالة Webhook ومؤشرات زمن الوصول.',
    aiRoutingTitle: 'التوجيه والأتمتة بالذكاء الاصطناعي',
    aiRoutingDesc: 'تكوين عتبات التوجيه الذكي وقواعد التصعيد وسياسات الأتمتة لكل قناة.',
    colChannel: 'القناة',
    colProvider: 'الموفر',
    colStatus: 'الحالة',
    colRegion: 'المنطقة',
    colAI: 'الذكاء الاصطناعي',
    colRouting: 'سياسة التوجيه',
    colFailover: 'التعافي',
    colLastSync: 'آخر مزامنة',
    colActions: 'الإجراءات',
    colProviderName: 'الموفر',
    colAuthType: 'نوع المصادقة',
    colApiKey: 'مفتاح API',
    colWebhook: 'Webhook',
    colEnvironment: 'البيئة',
    colFailoverProv: 'التعافي',
    colRegionProv: 'المنطقة',
    colSyncStatus: 'حالة المزامنة',
    colLastValidated: 'آخر تحقق',
    channelConfigTitle: 'تكوين القناة',
    apiKeyLabel: 'مفتاح API / السر',
    webhookLabel: 'عنوان Webhook',
    rateLimitLabel: 'حد المعدل (رسالة/ثانية)',
    failoverLabel: 'قناة التعافي',
    modeLabel: 'وضع البيئة',
    sandbox: 'بيئة الاختبار',
    live: 'مباشر',
    save: 'حفظ التكوين',
    cancel: 'إلغاء',
    providerConfigTitle: 'بيانات اعتماد الموفر',
    uptime: 'وقت التشغيل',
    latency: 'زمن الوصول',
    throughput: 'الإنتاجية',
    failedWebhooks: 'Webhooks الفاشلة',
    deliveryHealth: 'صحة التسليم',
    enabled: 'مفعّل',
    disabled: 'معطّل',
    configure: 'تكوين',
    refreshSync: 'مزامنة',
    viewCredentials: 'بيانات الاعتماد',
  },
};

// ─── Section A: Channel Catalog seed data ────────────────────────────────────
// Covers: Web/WhatsApp/SMS/Voice/Email/iOS/Android + social (PDF ID #3)
const CHANNELS = [
  {
    id: 'ch-wa',
    name: 'WhatsApp Business',
    icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
    iconBg: 'bg-emerald-500/10',
    accentColor: 'bg-emerald-500',
    providerKey: 'twilio',
    provider: 'Twilio WhatsApp Business API',
    status: 'operational',
    region: 'ME-Central-1 (Dubai)',
    aiEnabled: true,
    routingPolicy: 'Round-Robin + AI Triage',
    failover: 'SMS Fallback',
    lastSync: '2 min ago',
    uptime: '99.97%',
    latencyMs: 142,
    msgPerSec: 88,
    failedWebhooks: 0,
    deliveryHealth: 99.8,
    apiKey: 'twilio_sk_live_••••••••••••••••••••••XKQJ',
    webhook: 'https://api.mp-core.ai/webhooks/whatsapp',
    rateLimit: 120,
    failoverChannel: 'SMS',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-wc',
    name: 'Web Chat Widget',
    icon: <Globe className="w-4 h-4 text-sky-500" />,
    iconBg: 'bg-sky-500/10',
    accentColor: 'bg-sky-500',
    providerKey: 'native',
    provider: 'Native mPaaS SDK (WebSocket)',
    status: 'operational',
    region: 'Global CDN (CloudFront)',
    aiEnabled: true,
    routingPolicy: 'AI-First + Human Escalation',
    failover: 'Email Ticket',
    lastSync: 'Just now',
    uptime: '100%',
    latencyMs: 55,
    msgPerSec: 210,
    failedWebhooks: 0,
    deliveryHealth: 100,
    apiKey: 'wc_sdk_prod_••••••••••••••••••••••••••••••',
    webhook: 'wss://api.mp-core.ai/ws/chat',
    rateLimit: 300,
    failoverChannel: 'Email',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-sm',
    name: 'SMS',
    icon: <Radio className="w-4 h-4 text-amber-500" />,
    iconBg: 'bg-amber-500/10',
    accentColor: 'bg-amber-500',
    providerKey: 'twilio',
    provider: 'Twilio SMS Programmable',
    status: 'degraded',
    region: 'US-East-1 (Virginia)',
    aiEnabled: false,
    routingPolicy: 'Broadcast (Notification Only)',
    failover: 'WhatsApp',
    lastSync: '18 min ago',
    uptime: '97.40%',
    latencyMs: 820,
    msgPerSec: 34,
    failedWebhooks: 7,
    deliveryHealth: 94.2,
    apiKey: 'AC••••••••••••••••••••••••••••••B3D7',
    webhook: 'https://api.mp-core.ai/webhooks/sms',
    rateLimit: 40,
    failoverChannel: 'WhatsApp',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-vo',
    name: 'Voice / SIP',
    icon: <Phone className="w-4 h-4 text-blue-500" />,
    iconBg: 'bg-blue-500/10',
    accentColor: 'bg-blue-500',
    providerKey: 'twilio',
    provider: 'Twilio Elastic SIP Trunking',
    status: 'operational',
    region: 'ME-Central-1 (Dubai)',
    aiEnabled: true,
    routingPolicy: 'Skill-Based (NLP Intent)',
    failover: 'WhatsApp Callback',
    lastSync: '1 min ago',
    uptime: '99.85%',
    latencyMs: 68,
    msgPerSec: 18,
    failedWebhooks: 0,
    deliveryHealth: 99.9,
    apiKey: 'AC••••••••••••••••••••••••••••••2F91',
    webhook: 'https://api.mp-core.ai/webhooks/voice',
    rateLimit: 25,
    failoverChannel: 'WhatsApp',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-em',
    name: 'Email',
    icon: <Mail className="w-4 h-4 text-violet-500" />,
    iconBg: 'bg-violet-500/10',
    accentColor: 'bg-violet-500',
    providerKey: 'sendgrid',
    provider: 'SendGrid Enterprise SMTP',
    status: 'operational',
    region: 'EU-West-1 (Frankfurt)',
    aiEnabled: true,
    routingPolicy: 'Priority Queue (SLA-based)',
    failover: 'SMTP Direct',
    lastSync: '5 min ago',
    uptime: '99.91%',
    latencyMs: 310,
    msgPerSec: 42,
    failedWebhooks: 2,
    deliveryHealth: 98.6,
    apiKey: 'SG.••••••••••••••••••••••••••••••••••••••••',
    webhook: 'https://api.mp-core.ai/webhooks/email',
    rateLimit: 50,
    failoverChannel: 'Web Chat',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-ios',
    name: 'iOS Mobile SDK',
    icon: <Smartphone className="w-4 h-4 text-slate-500" />,
    iconBg: 'bg-slate-500/10',
    accentColor: 'bg-slate-500',
    providerKey: 'native',
    provider: 'Native mPaaS iOS SDK (APNs)',
    status: 'operational',
    region: 'Global (APNs Gateway)',
    aiEnabled: true,
    routingPolicy: 'AI-First + Push Fallback',
    failover: 'Web Chat',
    lastSync: '3 min ago',
    uptime: '99.80%',
    latencyMs: 90,
    msgPerSec: 65,
    failedWebhooks: 0,
    deliveryHealth: 99.5,
    apiKey: 'apns_key_••••••••••••••••••••••••••••••',
    webhook: 'https://api.mp-core.ai/webhooks/ios',
    rateLimit: 100,
    failoverChannel: 'Web Chat',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-android',
    name: 'Android Mobile SDK',
    icon: <Tablet className="w-4 h-4 text-green-600" />,
    iconBg: 'bg-green-600/10',
    accentColor: 'bg-green-600',
    providerKey: 'native',
    provider: 'Native mPaaS Android SDK (FCM)',
    status: 'operational',
    region: 'Global (FCM Gateway)',
    aiEnabled: true,
    routingPolicy: 'AI-First + Push Fallback',
    failover: 'Web Chat',
    lastSync: '3 min ago',
    uptime: '99.75%',
    latencyMs: 105,
    msgPerSec: 71,
    failedWebhooks: 0,
    deliveryHealth: 99.3,
    apiKey: 'fcm_server_key_••••••••••••••••••••••••••',
    webhook: 'https://api.mp-core.ai/webhooks/android',
    rateLimit: 100,
    failoverChannel: 'Web Chat',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-ig',
    name: 'Instagram DM',
    icon: <Camera className="w-4 h-4 text-pink-500" />,
    iconBg: 'bg-pink-500/10',
    accentColor: 'bg-pink-500',
    providerKey: 'meta',
    provider: 'Meta Business Graph API v19',
    status: 'operational',
    region: 'EU-West-1 (Dublin)',
    aiEnabled: true,
    routingPolicy: 'AI Triage + Round-Robin',
    failover: 'Facebook Messenger',
    lastSync: '8 min ago',
    uptime: '99.60%',
    latencyMs: 195,
    msgPerSec: 28,
    failedWebhooks: 1,
    deliveryHealth: 99.1,
    apiKey: 'EAAl••••••••••••••••••••••••••••••••BAZA',
    webhook: 'https://api.mp-core.ai/webhooks/instagram',
    rateLimit: 35,
    failoverChannel: 'FB Messenger',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-fb',
    name: 'Facebook Messenger',
    icon: <Tv2 className="w-4 h-4 text-blue-600" />,
    iconBg: 'bg-blue-600/10',
    accentColor: 'bg-blue-600',
    providerKey: 'meta',
    provider: 'Meta Business Graph API v19',
    status: 'operational',
    region: 'EU-West-1 (Dublin)',
    aiEnabled: true,
    routingPolicy: 'Intent-Based Routing (NLU)',
    failover: 'Instagram DM',
    lastSync: '8 min ago',
    uptime: '99.55%',
    latencyMs: 210,
    msgPerSec: 22,
    failedWebhooks: 1,
    deliveryHealth: 98.8,
    apiKey: 'EAAl••••••••••••••••••••••••••••••••C71X',
    webhook: 'https://api.mp-core.ai/webhooks/messenger',
    rateLimit: 30,
    failoverChannel: 'Instagram',
    mode: 'live' as 'live' | 'sandbox',
  },
  {
    id: 'ch-tg',
    name: 'Telegram Bot',
    icon: <Send className="w-4 h-4 text-cyan-500" />,
    iconBg: 'bg-cyan-500/10',
    accentColor: 'bg-cyan-500',
    providerKey: 'telegram',
    provider: 'Telegram Bot API v7.2',
    status: 'inactive',
    region: 'EU-Central-1 (Frankfurt)',
    aiEnabled: false,
    routingPolicy: 'Command-Based (Bot Mode)',
    failover: 'Web Chat',
    lastSync: '2 hours ago',
    uptime: '91.20%',
    latencyMs: 480,
    msgPerSec: 5,
    failedWebhooks: 14,
    deliveryHealth: 87.3,
    apiKey: 'bot••••••••••••••••••••••••••••••:AAXX••',
    webhook: 'https://api.mp-core.ai/webhooks/telegram',
    rateLimit: 10,
    failoverChannel: 'Web Chat',
    mode: 'sandbox' as 'live' | 'sandbox',
  },
];

// ─── Section B: Provider Credentials seed data ───────────────────────────────
// Covers: Twilio / Meta / Plivo / SendGrid / SIP Trunk / Exotel (PDF ID #4)
const PROVIDERS = [
  {
    id: 'prov-twilio',
    name: 'Twilio',
    logoColor: 'text-red-500',
    logoBg: 'bg-red-500/10',
    authType: 'Account SID + Auth Token',
    apiKey: 'AC••••••••••••••••••••••••••••••XKQJ',
    webhook: 'https://api.mp-core.ai/webhooks/twilio',
    environment: 'live' as 'live' | 'sandbox',
    failover: 'Plivo',
    region: 'ME-Central-1 (Dubai)',
    syncStatus: 'synced',
    lastValidated: '4 min ago',
    channels: ['WhatsApp Business', 'SMS', 'Voice / SIP'],
  },
  {
    id: 'prov-meta',
    name: 'Meta Business API',
    logoColor: 'text-blue-600',
    logoBg: 'bg-blue-600/10',
    authType: 'OAuth 2.0 + App Secret',
    apiKey: 'EAAl••••••••••••••••••••••••••••••••META',
    webhook: 'https://api.mp-core.ai/webhooks/meta',
    environment: 'live' as 'live' | 'sandbox',
    failover: 'Web Chat',
    region: 'EU-West-1 (Dublin)',
    syncStatus: 'synced',
    lastValidated: '9 min ago',
    channels: ['Facebook Messenger', 'Instagram DM'],
  },
  {
    id: 'prov-plivo',
    name: 'Plivo',
    logoColor: 'text-orange-500',
    logoBg: 'bg-orange-500/10',
    authType: 'Auth ID + Auth Token',
    apiKey: 'MAND••••••••••••••••••••••••••••••••PLVO',
    webhook: 'https://api.mp-core.ai/webhooks/plivo',
    environment: 'sandbox' as 'live' | 'sandbox',
    failover: 'Twilio',
    region: 'AP-South-1 (Mumbai)',
    syncStatus: 'pending',
    lastValidated: '2 hours ago',
    channels: ['SMS', 'Voice / SIP'],
  },
  {
    id: 'prov-sendgrid',
    name: 'SendGrid',
    logoColor: 'text-violet-500',
    logoBg: 'bg-violet-500/10',
    authType: 'API Key (Bearer)',
    apiKey: 'SG.••••••••••••••••••••••••••••••••••••••••',
    webhook: 'https://api.mp-core.ai/webhooks/email',
    environment: 'live' as 'live' | 'sandbox',
    failover: 'SMTP Direct',
    region: 'EU-West-1 (Frankfurt)',
    syncStatus: 'synced',
    lastValidated: '6 min ago',
    channels: ['Email'],
  },
  {
    id: 'prov-sip',
    name: 'SIP Trunk',
    logoColor: 'text-blue-500',
    logoBg: 'bg-blue-500/10',
    authType: 'SIP Digest (Username + Password)',
    apiKey: 'sip_trunk_••••••••••••••••••••••••••••',
    webhook: 'sip:gateway.mp-core.ai:5060',
    environment: 'live' as 'live' | 'sandbox',
    failover: 'WhatsApp Callback',
    region: 'ME-Central-1 (Dubai)',
    syncStatus: 'synced',
    lastValidated: '2 min ago',
    channels: ['Voice / SIP'],
  },
  {
    id: 'prov-exotel',
    name: 'Exotel',
    logoColor: 'text-teal-500',
    logoBg: 'bg-teal-500/10',
    authType: 'API Key + API Token',
    apiKey: 'exo_api_••••••••••••••••••••••••••••••',
    webhook: 'https://api.mp-core.ai/webhooks/exotel',
    environment: 'sandbox' as 'live' | 'sandbox',
    failover: 'Twilio',
    region: 'AP-South-1 (Mumbai)',
    syncStatus: 'error',
    lastValidated: '3 hours ago',
    channels: ['SMS', 'Voice / SIP'],
  },
];

const AI_ROUTING_SETTINGS = [
  { id: 'auto_routing', label: 'AI Auto-Routing', labelAr: 'التوجيه التلقائي بالذكاء الاصطناعي', enabled: true, desc: 'Automatically route inbound contacts to the best-fit agent based on NLU intent classification.', descAr: 'توجيه جهات الاتصال الواردة تلقائيًا إلى أفضل وكيل بناءً على تصنيف النية.' },
  { id: 'fallback_human', label: 'Fallback to Human', labelAr: 'التحويل إلى الإنسان', enabled: true, desc: 'Trigger human escalation when AI confidence drops below 0.65 or NPS sentiment is negative.', descAr: 'تفعيل التصعيد البشري عندما تنخفض ثقة الذكاء الاصطناعي أو يكون الإنطباع سلبياً.' },
  { id: 'multilingual', label: 'Multilingual Routing', labelAr: 'التوجيه متعدد اللغات', enabled: true, desc: 'Detect customer language on first interaction and route to matching bilingual agents (AR/EN).', descAr: 'اكتشاف لغة العميل في أول تفاعل وتوجيهه إلى الوكلاء الثنائيين المناسبين.' },
  { id: 'escalation', label: 'Escalation Threshold', labelAr: 'عتبة التصعيد', enabled: true, desc: 'Escalate to Tier-2 supervisor when 3+ failed resolution attempts are detected within 10 min.', descAr: 'التصعيد إلى المشرف عند اكتشاف 3+ محاولات حل فاشلة في غضون 10 دقائق.' },
  { id: 'ch_automation', label: 'Per-Channel Automation', labelAr: 'أتمتة لكل قناة', enabled: false, desc: 'Enable channel-specific bot automation policies overriding global AI routing defaults.', descAr: 'تمكين سياسات أتمتة البوت الخاصة بالقناة بدلاً من الإعدادات الافتراضية.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function SuperAdminChannelsTab() {
  const { lang, addAuditLog } = useApp();
  const d = DICT[lang as 'en' | 'ar'] ?? DICT.en;

  // Channel Config modal
  const [selectedChannel, setSelectedChannel] = useState<typeof CHANNELS[0] | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [configMode, setConfigMode] = useState<'live' | 'sandbox'>('live');
  const [revealKey, setRevealKey] = useState(false);

  // Provider Credentials modal
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[0] | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [revealProvKey, setRevealProvKey] = useState(false);

  const [aiSettings, setAiSettings] = useState(AI_ROUTING_SETTINGS);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // KPI computations
  const activeCount = CHANNELS.filter(c => c.status === 'operational').length;
  const totalMsgs = CHANNELS.reduce((a, c) => a + c.msgPerSec * 3600, 0);
  const totalFailed = CHANNELS.reduce((a, c) => a + c.failedWebhooks, 0);
  const avgThroughput = Math.round(CHANNELS.reduce((a, c) => a + c.msgPerSec, 0));
  const aiChannels = CHANNELS.filter(c => c.aiEnabled).length;
  const aiRate = Math.round((aiChannels / CHANNELS.length) * 100);

  const openChannelConfig = (ch: typeof CHANNELS[0]) => {
    setSelectedChannel(ch);
    setConfigMode(ch.mode);
    setRevealKey(false);
    setShowChannelModal(true);
  };

  const openProviderConfig = (p: typeof PROVIDERS[0]) => {
    setSelectedProvider(p);
    setRevealProvKey(false);
    setShowProviderModal(true);
  };

  const handleSaveChannelConfig = () => {
    if (!selectedChannel) return;
    addAuditLog(`Updated channel config for ${selectedChannel.name} — mode: ${configMode}`, 'success');
    setShowChannelModal(false);
  };

  const handleSaveProviderConfig = () => {
    if (!selectedProvider) return;
    addAuditLog(`Updated provider credentials for ${selectedProvider.name}`, 'success');
    setShowProviderModal(false);
  };

  const handleSync = (ch: typeof CHANNELS[0]) => {
    setSyncingId(ch.id);
    setTimeout(() => {
      setSyncingId(null);
      addAuditLog(`Manual sync triggered for channel: ${ch.name}`, 'success');
    }, 1800);
  };

  const toggleAI = (id: string) => {
    setAiSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const setting = aiSettings.find(s => s.id === id);
    if (setting) addAuditLog(`AI Routing "${setting.label}" ${setting.enabled ? 'disabled' : 'enabled'}`, 'success');
  };

  const statusBadgeType = (status: string) => {
    if (status === 'operational' || status === 'synced') return 'success';
    if (status === 'degraded' || status === 'pending') return 'warning';
    if (status === 'error') return 'error';
    return 'inactive';
  };

  const catalogTableHeaders = [d.colChannel, d.colProvider, d.colStatus, d.colRegion, d.colAI, d.colRouting, d.colFailover, d.colLastSync, d.colActions];
  const credTableHeaders = [d.colProviderName, d.colAuthType, d.colApiKey, d.colWebhook, d.colEnvironment, d.colRegionProv, d.colSyncStatus, d.colLastValidated, d.colActions];

  const kpiCards = [
    { label: d.activeChannels, value: `${activeCount}/10`, icon: <Wifi className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', trend: 'Web·WA·SMS·Voice·Email·iOS·Android+3', trendUp: true },
    { label: d.connectedProviders, value: String(PROVIDERS.length), icon: <GitBranch className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-500/10', trend: 'Twilio · Meta · Plivo · SendGrid', trendUp: true },
    { label: d.messagesToday, value: (totalMsgs / 1000).toFixed(1) + 'K', icon: <MessageSquare className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-500/10', trend: '+12.4% vs yesterday', trendUp: true },
    { label: d.failedDeliveries, value: String(totalFailed), icon: <XCircle className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-500/10', trend: totalFailed > 10 ? 'Above SLA threshold' : 'Within SLA', trendUp: totalFailed <= 10 },
    { label: d.queueThroughput, value: `${avgThroughput} msg/s`, icon: <Zap className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/10', trend: 'Avg across all channels', trendUp: true },
    { label: d.aiAutomationRate, value: `${aiRate}%`, icon: <Bot className="w-5 h-5 text-sky-500" />, bg: 'bg-sky-500/10', trend: `${aiChannels} of 10 channels`, trendUp: true },
  ];

  return (
    <div className="space-y-10 text-xs text-slate-800 dark:text-slate-200">

      {/* ── Page Header ── */}
      <SectionHeader
        title={d.title}
        description={d.description}
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Monitoring
            </span>
            <span className="text-[10px] font-mono text-slate-400">Tenant: MP-CORE-PROD</span>
          </div>
        }
      />

      {/* ── KPI HUD Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>{card.icon}</div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{card.label}</div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white leading-none mt-1">{card.value}</div>
              <div className={`text-[9px] font-semibold mt-1 ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>{card.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION A — CHANNEL CATALOG  (PDF ID #3)
          Web / WhatsApp / SMS / Voice / Email / iOS / Android
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Section label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-900">
            A — {d.catalogTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.catalogTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.catalogDesc}</p>
        </div>

        {/* Channel health cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {CHANNELS.map(ch => (
            <div
              key={ch.id}
              className={`relative bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 duration-200 ${
                ch.status === 'operational' ? 'border-slate-200' :
                ch.status === 'degraded'    ? 'border-amber-300 dark:border-amber-800' :
                                              'border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${ch.accentColor}`} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ch.iconBg}`}>{ch.icon}</div>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px] leading-tight">{ch.name}</span>
                </div>
                <Badge type={statusBadgeType(ch.status)}>{ch.status}</Badge>
              </div>

              <div className="text-[10px] text-slate-400 font-mono mb-3 truncate">{ch.provider}</div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-400">{d.uptime}</span><span className="font-bold font-mono text-emerald-500">{ch.uptime}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.latency}</span><span className={`font-bold font-mono ${ch.latencyMs > 400 ? 'text-amber-500' : 'text-sky-500'}`}>{ch.latencyMs}ms</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.throughput}</span><span className="font-bold font-mono text-purple-500">{ch.msgPerSec}/s</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.deliveryHealth}</span><span className={`font-bold font-mono ${ch.deliveryHealth < 95 ? 'text-rose-500' : 'text-emerald-500'}`}>{ch.deliveryHealth}%</span></div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => openChannelConfig(ch)}
                  className="flex-1 py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 rounded-lg transition-colors text-center"
                >
                  {d.configure}
                </button>
                <button
                  onClick={() => handleSync(ch)}
                  aria-label="Refresh sync"
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${syncingId === ch.id ? 'animate-spin text-blue-500' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Communication Channels — full config table */}
        <div>
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.catalogTableTitle}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{d.catalogTableDesc}</p>
          </div>
          <EnterpriseTable headers={catalogTableHeaders} empty={false} emptyTitle="" emptyDesc="">
            {CHANNELS.map(ch => (
              <tr key={ch.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 text-[11px]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${ch.iconBg}`}>{ch.icon}</div>
                    <span className="font-bold text-slate-900 dark:text-white">{ch.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{ch.provider}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${ch.status === 'operational' ? 'bg-emerald-500 animate-pulse' : ch.status === 'degraded' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    <Badge type={statusBadgeType(ch.status)}>{ch.status}</Badge>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400 text-[10px]">{ch.region}</td>
                <td className="px-5 py-3.5">
                  {ch.aiEnabled
                    ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"><Bot className="w-3 h-3" />{lang === 'ar' ? 'مفعّل' : 'Yes'}</span>
                    : <span className="text-slate-400 font-semibold">{lang === 'ar' ? 'لا' : 'No'}</span>
                  }
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{ch.routingPolicy}</td>
                <td className="px-5 py-3.5 text-slate-500">{ch.failover}</td>
                <td className="px-5 py-3.5 font-mono text-slate-400 text-[10px]">{ch.lastSync}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => openChannelConfig(ch)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Settings className="w-3 h-3" />{d.configure}
                  </button>
                </td>
              </tr>
            ))}
          </EnterpriseTable>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION B — PROVIDER CREDENTIALS  (PDF ID #4)
          Twilio / Meta / Plivo / SendGrid / SIP Trunk / Exotel
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Section label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 font-mono px-3 py-1 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-900">
            B — {d.credTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.credTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.credDesc}</p>
        </div>

        {/* Provider summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map(prov => (
            <div
              key={prov.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm space-y-3 hover:-translate-y-0.5 transition-all duration-200 ${
                prov.syncStatus === 'synced'  ? 'border-slate-200 dark:border-slate-800' :
                prov.syncStatus === 'pending' ? 'border-amber-200 dark:border-amber-900/50' :
                                                'border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${prov.logoBg}`}>
                    <Key className={`w-4 h-4 ${prov.logoColor}`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-[12px]">{prov.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono">{prov.authType}</div>
                  </div>
                </div>
                <Badge type={statusBadgeType(prov.syncStatus)}>{prov.syncStatus}</Badge>
              </div>

              {/* Masked API key row */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl px-3 py-2">
                <LockIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 flex-1 truncate">{prov.apiKey}</span>
              </div>

              {/* Webhook URL */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl px-3 py-2">
                <Link className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 flex-1 truncate">{prov.webhook}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block">Environment</span>
                  <span className={`font-bold ${prov.environment === 'live' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {prov.environment === 'live' ? '● Live' : '● Sandbox'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Region</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{prov.region.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Failover</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{prov.failover}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Last Validated</span>
                  <span className="font-mono text-slate-500">{prov.lastValidated}</span>
                </div>
              </div>

              {/* Channels handled */}
              <div className="flex flex-wrap gap-1">
                {prov.channels.map(ch => (
                  <span key={ch} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono">{ch}</span>
                ))}
              </div>

              <button
                onClick={() => openProviderConfig(prov)}
                className="w-full py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 text-slate-600 dark:text-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Key className="w-3 h-3" />{d.viewCredentials}
              </button>
            </div>
          ))}
        </div>

        {/* Provider Credentials — full table */}
        <EnterpriseTable headers={credTableHeaders} empty={false} emptyTitle="" emptyDesc="">
          {PROVIDERS.map(prov => (
            <tr key={prov.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 text-[11px]">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${prov.logoBg}`}>
                    <Key className={`w-3.5 h-3.5 ${prov.logoColor}`} />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{prov.name}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{prov.authType}</td>
              <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 max-w-[120px] truncate">{prov.apiKey}</td>
              <td className="px-5 py-3.5 font-mono text-[10px] text-blue-600 dark:text-blue-400 max-w-[160px] truncate">{prov.webhook}</td>
              <td className="px-5 py-3.5">
                <span className={`font-bold ${prov.environment === 'live' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {prov.environment === 'live' ? '● Live' : '● Sandbox'}
                </span>
              </td>
              <td className="px-5 py-3.5 font-mono text-slate-400 text-[10px]">{prov.region.split(' ')[0]}</td>
              <td className="px-5 py-3.5">
                <Badge type={statusBadgeType(prov.syncStatus)}>{prov.syncStatus}</Badge>
              </td>
              <td className="px-5 py-3.5 font-mono text-slate-400 text-[10px]">{prov.lastValidated}</td>
              <td className="px-5 py-3.5">
                <button
                  onClick={() => openProviderConfig(prov)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Key className="w-3 h-3" />{d.viewCredentials}
                </button>
              </td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>

      {/* ── Live Traffic & Delivery Health (enterprise enhancement, preserved) ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.liveTrafficTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.liveTrafficDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CHANNELS.filter(c => c.status !== 'inactive').map(ch => {
            const healthColor = ch.deliveryHealth >= 99 ? 'text-emerald-500' : ch.deliveryHealth >= 95 ? 'text-amber-500' : 'text-rose-500';
            const barColor   = ch.deliveryHealth >= 99 ? 'bg-emerald-500'   : ch.deliveryHealth >= 95 ? 'bg-amber-500'   : 'bg-rose-500';
            return (
              <div key={ch.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${ch.iconBg}`}>{ch.icon}</div>
                    <span className="font-bold text-[11px] text-slate-800 dark:text-white">{ch.name}</span>
                  </div>
                  <span className={`text-xs font-black font-mono ${healthColor}`}>{ch.deliveryHealth}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${ch.deliveryHealth}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  {[
                    { label: d.throughput,     value: `${ch.msgPerSec}/s`,  color: 'text-purple-500' },
                    { label: d.latency,        value: `${ch.latencyMs}ms`,  color: ch.latencyMs > 400 ? 'text-amber-500' : 'text-sky-500' },
                    { label: d.failedWebhooks, value: String(ch.failedWebhooks), color: ch.failedWebhooks > 3 ? 'text-rose-500' : 'text-emerald-500' },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-2 text-center">
                      <div className="text-slate-400 font-mono mb-1">{m.label}</div>
                      <div className={`font-black font-mono ${m.color}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI Routing & Automation (enterprise enhancement, preserved) ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.aiRoutingTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.aiRoutingDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {aiSettings.map(setting => (
            <div
              key={setting.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all ${
                setting.enabled ? 'border-blue-200 dark:border-blue-900/50' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className={`w-4 h-4 ${setting.enabled ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-[11px] text-slate-800 dark:text-white">{lang === 'ar' ? setting.labelAr : setting.label}</span>
                </div>
                <button
                  onClick={() => toggleAI(setting.id)}
                  aria-pressed={setting.enabled}
                  aria-label={`Toggle ${setting.label}`}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
                >
                  {setting.enabled ? <ToggleRight className="w-7 h-7 text-blue-500" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{lang === 'ar' ? setting.descAr : setting.desc}</p>
              <div className="mt-2">
                <Badge type={setting.enabled ? 'success' : 'inactive'}>{setting.enabled ? d.enabled : d.disabled}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL A — Channel Configuration
      ══════════════════════════════════════════════════════════════ */}
      <ModalWrapper isOpen={showChannelModal} onClose={() => setShowChannelModal(false)} title={selectedChannel ? `${d.channelConfigTitle} — ${selectedChannel.name}` : d.channelConfigTitle} maxWidthClass="max-w-lg">
        {selectedChannel && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
              <div className={`p-2 rounded-xl ${selectedChannel.iconBg}`}>{selectedChannel.icon}</div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{selectedChannel.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selectedChannel.provider}</div>
              </div>
              <div className="ml-auto"><Badge type={statusBadgeType(selectedChannel.status)}>{selectedChannel.status}</Badge></div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.modeLabel}</label>
              <div className="flex gap-2">
                {(['sandbox', 'live'] as const).map(mode => (
                  <button key={mode} onClick={() => setConfigMode(mode)} className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${configMode === mode ? (mode === 'live' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-500') : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {mode === 'sandbox' ? d.sandbox : d.live}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.apiKeyLabel}</label>
              <div className="flex gap-2">
                <input type={revealKey ? 'text' : 'password'} readOnly value={selectedChannel.apiKey} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] focus:outline-none" />
                <button onClick={() => setRevealKey(v => !v)} aria-label={revealKey ? 'Hide' : 'Reveal'} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => navigator.clipboard.writeText(selectedChannel.apiKey)} aria-label="Copy API key" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.webhookLabel}</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={selectedChannel.webhook} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] text-blue-600 dark:text-blue-400 focus:outline-none" />
                <button onClick={() => navigator.clipboard.writeText(selectedChannel.webhook)} aria-label="Copy webhook" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.rateLimitLabel}</label>
                <input type="number" defaultValue={selectedChannel.rateLimit} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl font-mono text-[11px] focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.failoverLabel}</label>
                <select defaultValue={selectedChannel.failoverChannel} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-[11px] focus:outline-none focus:border-blue-500">
                  {CHANNELS.filter(c => c.id !== selectedChannel.id).map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-blue-500" /><span className="font-bold text-[11px]">AI Auto-Routing</span></div>
              <Badge type={selectedChannel.aiEnabled ? 'success' : 'inactive'}>{selectedChannel.aiEnabled ? d.enabled : d.disabled}</Badge>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowChannelModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">{d.cancel}</button>
              <button onClick={handleSaveChannelConfig} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md active:scale-95 transition-all">{d.save}</button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* ══════════════════════════════════════════════════════════════
          MODAL B — Provider Credentials
      ══════════════════════════════════════════════════════════════ */}
      <ModalWrapper isOpen={showProviderModal} onClose={() => setShowProviderModal(false)} title={selectedProvider ? `${d.providerConfigTitle} — ${selectedProvider.name}` : d.providerConfigTitle} maxWidthClass="max-w-lg">
        {selectedProvider && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedProvider.logoBg}`}>
                <Key className={`w-4 h-4 ${selectedProvider.logoColor}`} />
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{selectedProvider.name}</div>
                <div className="text-[10px] text-slate-400">{selectedProvider.authType}</div>
              </div>
              <div className="ml-auto"><Badge type={statusBadgeType(selectedProvider.syncStatus)}>{selectedProvider.syncStatus}</Badge></div>
            </div>

            {/* Environment toggle */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.modeLabel}</label>
              <div className="flex gap-2">
                {(['sandbox', 'live'] as const).map(mode => (
                  <button key={mode} className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${selectedProvider.environment === mode ? (mode === 'live' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-500') : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {mode === 'sandbox' ? d.sandbox : d.live}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.apiKeyLabel}</label>
              <div className="flex gap-2">
                <input type={revealProvKey ? 'text' : 'password'} readOnly value={selectedProvider.apiKey} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] focus:outline-none" />
                <button onClick={() => setRevealProvKey(v => !v)} aria-label="Toggle reveal" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{revealProvKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => navigator.clipboard.writeText(selectedProvider.apiKey)} aria-label="Copy API key" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Webhook */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.webhookLabel}</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={selectedProvider.webhook} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] text-blue-600 dark:text-blue-400 focus:outline-none" />
                <button onClick={() => navigator.clipboard.writeText(selectedProvider.webhook)} aria-label="Copy webhook" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Failover + Region */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Failover Provider</label>
                <input type="text" readOnly value={selectedProvider.failover} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Region</label>
                <input type="text" readOnly value={selectedProvider.region} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] focus:outline-none" />
              </div>
            </div>

            {/* Channels this provider handles */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Channels Handled</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedProvider.channels.map(ch => (
                  <span key={ch} className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-lg font-mono">{ch}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 text-[11px]">
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-500">Last Validated:</span></div>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedProvider.lastValidated}</span>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowProviderModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">{d.cancel}</button>
              <button onClick={handleSaveProviderConfig} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-md active:scale-95 transition-all">{d.save}</button>
            </div>
          </div>
        )}
      </ModalWrapper>

    </div>
  );
}
