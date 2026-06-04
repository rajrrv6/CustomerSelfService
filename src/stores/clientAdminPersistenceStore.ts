'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotificationsStore } from './notificationsStore';

export interface Campaign {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp';
  audienceSize: number;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
  sent: number;
  openRate: number;
  delivered: number;
  failedCount: number;
}

export interface IvrFlow {
  id: string;
  name: string;
  language: string;
  nodesCount: number;
  callsHandled: number;
  status: 'active' | 'inactive';
}

export interface TelephonyProvider {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'error' | 'disconnected';
  activeTrunks: number;
}

export interface SipLog {
  id: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  durationSec: number;
  status: 'completed' | 'failed' | 'dropped';
  flowName: string;
  path: string[];
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  triggerEventAr: string;
  conditions: string;
  conditionsAr: string;
  action: string;
  actionAr: string;
  enabled: boolean;
  category: 'security' | 'routing' | 'billing' | 'system';
  severity: 'info' | 'warning' | 'critical';
  triggerCount: number;
  lastExecuted: string | null;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  ruleName: string;
  eventTriggered: string;
  status: 'success' | 'failed';
  details: string;
}

export interface ExportHistoryItem {
  id: string;
  fileName: string;
  format: 'PDF' | 'CSV';
  timestamp: string;
  size: string;
  status: 'ready' | 'expired';
}

export interface ReportSchedule {
  id: string;
  name: string;
  schedule: string;
  format: 'PDF' | 'CSV';
  sendTo: string;
  nextTrigger: string;
}

export interface ClientAuditLog {
  id: string;
  timestamp: string;
  category: 'security' | 'api' | 'ai' | 'user';
  action: string;
  actionAr: string;
  actor: string;
  ip: string;
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, any>;
}

export interface ClientNotification {
  id: string;
  timestamp: string;
  category: 'sla' | 'security' | 'webhook' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
}

export interface TenantSettings {
  tenantName: string;
  logoUrl: string;
  themeMode: 'system' | 'dark' | 'light';
  accentColor: string;
  standardWait: number;
  vipWait: number;
  warnTimeout: number;
  aiDeflection: boolean;
  ragSearch: boolean;
  autoRetry: boolean;
  webhookLog: boolean;
  defaultLang: 'en' | 'ar';
}

interface ClientAdminState {
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  togglePauseCampaign: (id: string) => void;
  cloneCampaign: (id: string, isAr: boolean) => void;
  archiveCampaign: (id: string) => void;
  updateCampaignDelivery: (id: string, sent: number, delivered: number, failedCount: number, openRate: number) => void;
  clearCampaigns: () => void;

  // IVR / Telephony
  ivrFlows: IvrFlow[];
  providers: TelephonyProvider[];
  sipLogs: SipLog[];
  addIvrFlow: (flow: IvrFlow) => void;
  toggleIvrStatus: (id: string) => void;
  toggleProviderStatus: (id: string) => void;
  addSipLog: (log: SipLog) => void;
  clearSipLogs: () => void;

  // Automation
  rules: AutomationRule[];
  automationLogs: AutomationLog[];
  addAutomationRule: (rule: AutomationRule) => void;
  toggleAutomationRule: (id: string) => void;
  deleteAutomationRule: (id: string) => void;
  triggerAutomationLog: (log: AutomationLog) => void;
  incrementAutomationTrigger: (id: string, timestamp: string) => void;
  clearRules: () => void;

  // Reports
  schedules: ReportSchedule[];
  exportHistory: ExportHistoryItem[];
  addReportSchedule: (schedule: ReportSchedule) => void;
  deleteReportSchedule: (id: string) => void;
  addExportHistory: (item: ExportHistoryItem) => void;

  // Audit Logs
  auditLogs: ClientAuditLog[];
  pinnedAuditLogIds: string[];
  addAuditLog: (log: ClientAuditLog) => void;
  togglePinAuditLog: (id: string) => void;

  // Notifications
  notifications: ClientNotification[];
  addNotification: (notification: ClientNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  // Settings
  settings: TenantSettings;
  updateSettings: (settings: Partial<TenantSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: TenantSettings = {
  tenantName: 'mPaaS Saudi Telecom',
  logoUrl: 'https://cdn.mpaas.sa/logos/stc_branding.png',
  themeMode: 'system',
  accentColor: '#3b82f6',
  standardWait: 120,
  vipWait: 60,
  warnTimeout: 30,
  aiDeflection: true,
  ragSearch: true,
  autoRetry: true,
  webhookLog: false,
  defaultLang: 'en',
};

const initialCampaigns: Campaign[] = [
  { id: 'c-1', name: 'VIP Renewal Notification 2026', channel: 'whatsapp', audienceSize: 1240, status: 'running', sent: 1040, openRate: 88.5, delivered: 1020, failedCount: 20 },
  { id: 'c-2', name: 'Q2 Deflection Broadcast & Self-Service Promo', channel: 'email', audienceSize: 8500, status: 'scheduled', sent: 0, openRate: 0, delivered: 0, failedCount: 0 },
  { id: 'c-3', name: 'Cart Abandonment Recovery Flow', channel: 'sms', audienceSize: 520, status: 'paused', sent: 310, openRate: 94.2, delivered: 290, failedCount: 20 },
  { id: 'c-4', name: 'System Outage Notice Alert', channel: 'email', audienceSize: 15400, status: 'completed', sent: 15400, openRate: 74.8, delivered: 15300, failedCount: 100 },
];

const initialIvrFlows: IvrFlow[] = [
  { id: 'ivr-1', name: 'Main Office Gateway Menu', language: 'Multilingual (EN/AR)', nodesCount: 18, callsHandled: 14500, status: 'active' },
  { id: 'ivr-2', name: 'VIP Refund Verification Pipeline', language: 'Arabic Only', nodesCount: 8, callsHandled: 320, status: 'active' },
  { id: 'ivr-3', name: 'Campaign Outbound Voice IVR', language: 'English Only', nodesCount: 12, callsHandled: 2410, status: 'inactive' },
];

const initialProviders: TelephonyProvider[] = [
  { id: 'prov-1', name: 'Twilio Elastic SIP Trunk', type: 'Primary SIP Telephony', status: 'connected', activeTrunks: 120 },
  { id: 'prov-2', name: 'Vonage API Gateway', type: 'Secondary SMS/Voice Bridge', status: 'disconnected', activeTrunks: 0 },
  { id: 'prov-3', name: 'mPaaS Core SIP Trunk', type: 'Internal On-Prem SIP Gateway', status: 'connected', activeTrunks: 32 },
];

const initialRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Toxicity Escalation Block',
    triggerEvent: 'Toxicity Score Detected',
    triggerEventAr: 'درجة السمية المكتشفة',
    conditions: 'Toxicity Score > 0.85',
    conditionsAr: 'درجة السمية > 0.85',
    action: 'Block request & flag security supervisors',
    actionAr: 'حظر الطلب وتنبيه مشرفي الأمان',
    enabled: true,
    category: 'security',
    severity: 'critical',
    triggerCount: 142,
    lastExecuted: '2026-06-04 17:10:12',
  },
  {
    id: 'rule-2',
    name: 'VIP SLA Breached Priority Routing',
    triggerEvent: 'SLA Threshold Breached',
    triggerEventAr: 'انتهاك حدود SLA',
    conditions: 'Customer segment equals VIP and wait > 90s',
    conditionsAr: 'فئة العميل تساوي VIP والانتظار > ٩٠ ثانية',
    action: 'Escalate ticket priority to Urgent',
    actionAr: 'تصعيد أولوية التذكرة إلى عاجلة جداً',
    enabled: true,
    category: 'routing',
    severity: 'warning',
    triggerCount: 88,
    lastExecuted: '2026-06-04 15:42:01',
  },
  {
    id: 'rule-3',
    name: 'CSAT Follow-up Email',
    triggerEvent: 'CSAT Survey completed',
    triggerEventAr: 'إكمال استبيان CSAT',
    conditions: 'CSAT Rating < 3 stars',
    conditionsAr: 'تقييم الرضا < ٣ نجوم',
    action: 'Dispatch apologetic email & register ticket',
    actionAr: 'إرسال بريد اعتذاري وفتح تذكرة متابعة',
    enabled: false,
    category: 'system',
    severity: 'info',
    triggerCount: 12,
    lastExecuted: '2026-06-03 11:20:00',
  },
];

const initialSchedules: ReportSchedule[] = [
  { id: 'sch-1', name: 'Token Usage & Cost Allocation CSV', schedule: 'Weekly (Every Mon)', format: 'CSV', sendTo: 'finance@mPaaS.io', nextTrigger: '2026-06-08 00:00' },
  { id: 'sch-2', name: 'NLU Containment Performance Summary PDF', schedule: 'Monthly (1st of Month)', format: 'PDF', sendTo: 'admin-alerts@mPaaS.io', nextTrigger: '2026-07-01 06:00' },
];

const initialHistory: ExportHistoryItem[] = [
  { id: 'exp-1', fileName: 'nlu_deflection_may_2026.pdf', format: 'PDF', timestamp: '2026-06-01 10:20', size: '2.4 MB', status: 'ready' },
  { id: 'exp-2', fileName: 'llm_tokens_spend_q1.csv', format: 'CSV', timestamp: '2026-05-15 14:05', size: '412 KB', status: 'ready' },
  { id: 'exp-3', fileName: 'agent_sla_compliance_april.pdf', format: 'PDF', timestamp: '2026-05-01 09:12', size: '1.8 MB', status: 'expired' },
];

const initialAuditLogs: ClientAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-04 17:10:12',
    category: 'security',
    action: 'Safety Guardrail Policy modified: Toxicity threshold lowered to 0.70',
    actionAr: 'تعديل سياسة الحماية الأمنية: خفض حد السمية إلى 0.70',
    actor: 'sudhir.admin@mpaas.io',
    ip: '192.168.1.104',
    severity: 'critical',
    payload: {
      event: 'policy_update',
      guardrail_type: 'toxicity_check',
      previous_threshold: 0.85,
      new_threshold: 0.70,
      authorized_by: 'security_committee_ref_882',
    },
  },
  {
    id: 'log-2',
    timestamp: '2026-06-04 15:42:01',
    category: 'user',
    action: 'Outbound Broadcast Campaign "Q2 Deflection Broadcast" created',
    actionAr: 'إنشاء حملة البث الخارجي "بث الردود الربع الثاني"',
    actor: 'sarah.manager@mpaas.io',
    ip: '192.168.1.55',
    severity: 'info',
    payload: {
      event: 'campaign_creation',
      campaign_name: 'Q2 Deflection Broadcast',
      channel: 'email',
      audience_size: 8500,
    },
  },
  {
    id: 'log-3',
    timestamp: '2026-06-04 12:15:30',
    category: 'api',
    action: 'SIP Trunk provider "Twilio Elastic SIP" credential updated',
    actionAr: 'تحديث بيانات الاعتماد لمزود الاتصالات "Twilio Elastic SIP"',
    actor: 'sudhir.admin@mpaas.io',
    ip: '192.168.1.104',
    severity: 'warning',
    payload: {
      event: 'trunk_credential_rotation',
      trunk_name: 'Twilio Elastic SIP Trunk',
      credential_type: 'SIP Auth Key Pair',
    },
  },
  {
    id: 'log-4',
    timestamp: '2026-06-04 09:05:00',
    category: 'ai',
    action: 'Dialog Flow welcome intent utterances expanded',
    actionAr: 'توسيع قائمة عبارات مطابق نية الترحيب في مسارات الحوار',
    actor: 'amina.nlu@mpaas.io',
    ip: '192.168.2.82',
    severity: 'info',
    payload: {
      event: 'dialog_flow_nlu_expansion',
      node_id: 'node-welcome',
      intent_id: 'request_refund',
    },
  },
];

const initialNotifications: ClientNotification[] = [
  {
    id: 'notif-1',
    timestamp: 'Just now',
    category: 'sla',
    severity: 'critical',
    title: 'SLA Breach: VIP Queue waiting timer exceeded',
    titleAr: 'انتهاك اتفاقية الخدمة: تجاوز وقت الانتظار لطابور VIP',
    message: 'Active chat session with Amina Al-Farsi exceeded the maximum allowed queue time (1m 30s limit). Handoff committed.',
    messageAr: 'تجاوزت جلسة الدردشة النشطة مع أمينة الفارسي أقصى وقت انتظار مسموح به (دقيقة و٣٠ ثانية). تم النقل لمشرف.',
    read: false,
  },
  {
    id: 'notif-2',
    timestamp: '1 hour ago',
    category: 'webhook',
    severity: 'warning',
    title: 'Stripe Invoice webhook latency high',
    titleAr: 'ارتفاع زمن استجابة Stripe Webhook',
    message: 'Outgoing connection to Stripe Invoice REST API averaged 4800ms latency over the last 15 calls.',
    messageAr: 'بلغ متوسط زمن استجابة الاتصال الصادر مع واجهة فواتير Stripe حوالي ٤٨٠٠ مللي ثانية خلال آخر ١٥ استدعاء.',
    read: false,
  },
  {
    id: 'notif-3',
    timestamp: '4 hours ago',
    category: 'security',
    severity: 'critical',
    title: 'Safety Intercept: Jailbreak attempt blocked',
    titleAr: 'اعتراض أمني: تم حظر محاولة اختراق الموجهات (Jailbreak)',
    message: 'System blocked a prompt containing toxic instructions from customer session.',
    messageAr: 'حظر النظام موجه إدخال يحتوي على تعليمات خبيثة وتجاوز لحواجز الحماية في جلسة العميل.',
    read: true,
  },
  {
    id: 'notif-4',
    timestamp: '1 day ago',
    category: 'system',
    severity: 'info',
    title: 'Database connection synchronized',
    titleAr: 'مزامنة اتصال قاعدة البيانات بنجاح',
    message: 'Knowledge base RAG repository Standard Return Policy PDF loaded and indexes recompiled.',
    messageAr: 'تم تحميل ملف سياسة الاسترجاع القياسي لقاعدة معرفة RAG بنجاح وتمت إعادة تجميع المؤشرات.',
    read: true,
  },
];

function applyAccentToDom(color: string) {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--primary-accent', color);
  }
}

export const useClientAdminStore = create<ClientAdminState>()(
  persist(
    (set, get) => ({
      // Campaigns
      campaigns: initialCampaigns,
      addCampaign: (campaign) => {
        set((state) => ({ campaigns: [campaign, ...state.campaigns] }));
        useNotificationsStore.getState().addAuditLog(`Created campaign: "${campaign.name}"`, 'success');
      },
      togglePauseCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id === id) {
              const nextStatus = c.status === 'running' ? 'paused' : 'running';
              useNotificationsStore.getState().addAuditLog(`${nextStatus === 'running' ? 'Resumed' : 'Paused'} campaign: "${c.name}"`, 'success');
              return { ...c, status: nextStatus };
            }
            return c;
          }),
        }));
      },
      cloneCampaign: (id, isAr) => {
        const original = get().campaigns.find((c) => c.id === id);
        if (!original) return;
        const name = isAr ? `${original.name} (نسخة)` : `${original.name} (Copy)`;
        const cloned: Campaign = {
          ...original,
          id: `c-${Date.now()}`,
          name,
          status: 'draft',
          sent: 0,
          openRate: 0,
          delivered: 0,
          failedCount: 0,
        };
        set((state) => ({ campaigns: [cloned, ...state.campaigns] }));
        useNotificationsStore.getState().addAuditLog(`Cloned campaign: "${original.name}"`, 'success');
      },
      archiveCampaign: (id) => {
        const original = get().campaigns.find((c) => c.id === id);
        set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) }));
        if (original) {
          useNotificationsStore.getState().addAuditLog(`Archived campaign: "${original.name}"`, 'success');
        }
      },
      updateCampaignDelivery: (id, sent, delivered, failedCount, openRate) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, sent, delivered, failedCount, openRate } : c
          ),
        }));
      },
      clearCampaigns: () => {
        set({ campaigns: [] });
        useNotificationsStore.getState().addAuditLog('Cleared all campaigns registry', 'success');
      },

      // IVR / Telephony
      ivrFlows: initialIvrFlows,
      providers: initialProviders,
      sipLogs: [],
      addIvrFlow: (flow) => {
        set((state) => ({ ivrFlows: [...state.ivrFlows, flow] }));
        useNotificationsStore.getState().addAuditLog(`Created IVR Flow: "${flow.name}"`, 'success');
      },
      toggleIvrStatus: (id) => {
        set((state) => ({
          ivrFlows: state.ivrFlows.map((ivr) => {
            if (ivr.id === id) {
              const nextStatus = ivr.status === 'active' ? 'inactive' : 'active';
              useNotificationsStore.getState().addAuditLog(`${nextStatus === 'active' ? 'Activated' : 'Deactivated'} IVR flow: "${ivr.name}"`, 'success');
              return { ...ivr, status: nextStatus };
            }
            return ivr;
          }),
        }));
      },
      toggleProviderStatus: (id) => {
        set((state) => ({
          providers: state.providers.map((p) => {
            if (p.id === id) {
              const nextStatus = p.status === 'connected' ? 'disconnected' : 'connected';
              useNotificationsStore.getState().addAuditLog(`Toggled provider "${p.name}" to ${nextStatus}`, 'success');
              return { ...p, status: nextStatus };
            }
            return p;
          }),
        }));
      },
      addSipLog: (log) => {
        set((state) => ({ sipLogs: [log, ...state.sipLogs].slice(0, 100) }));
      },
      clearSipLogs: () => set({ sipLogs: [] }),

      // Automation
      rules: initialRules,
      automationLogs: [],
      addAutomationRule: (rule) => {
        set((state) => ({ rules: [rule, ...state.rules] }));
        useNotificationsStore.getState().addAuditLog(`Created automation rule: "${rule.name}"`, 'success');
      },
      toggleAutomationRule: (id) => {
        set((state) => ({
          rules: state.rules.map((r) => {
            if (r.id === id) {
              const nextState = !r.enabled;
              useNotificationsStore.getState().addAuditLog(`${nextState ? 'Activated' : 'Suspended'} automation rule: "${r.name}"`, 'success');
              return { ...r, enabled: nextState };
            }
            return r;
          }),
        }));
      },
      deleteAutomationRule: (id) => {
        const original = get().rules.find((r) => r.id === id);
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
        if (original) {
          useNotificationsStore.getState().addAuditLog(`Deleted automation rule: "${original.name}"`, 'success');
        }
      },
      triggerAutomationLog: (log) => {
        set((state) => ({ automationLogs: [log, ...state.automationLogs].slice(0, 100) }));
      },
      incrementAutomationTrigger: (id, timestamp) => {
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, triggerCount: r.triggerCount + 1, lastExecuted: timestamp } : r
          ),
        }));
      },
      clearRules: () => {
        set({ rules: [] });
        useNotificationsStore.getState().addAuditLog('Cleared all automation rules', 'success');
      },

      // Reports
      schedules: initialSchedules,
      exportHistory: initialHistory,
      addReportSchedule: (schedule) => {
        set((state) => ({ schedules: [...state.schedules, schedule] }));
        useNotificationsStore.getState().addAuditLog(`Scheduled auto-report: "${schedule.name}"`, 'success');
      },
      deleteReportSchedule: (id) => {
        const original = get().schedules.find((s) => s.id === id);
        set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) }));
        if (original) {
          useNotificationsStore.getState().addAuditLog(`Cancelled report schedule: "${original.name}"`, 'success');
        }
      },
      addExportHistory: (item) => {
        set((state) => ({ exportHistory: [item, ...state.exportHistory] }));
      },

      // Audit Logs
      auditLogs: initialAuditLogs,
      pinnedAuditLogIds: [],
      addAuditLog: (log) => {
        set((state) => ({ auditLogs: [log, ...state.auditLogs].slice(0, 500) }));
      },
      togglePinAuditLog: (id) => {
        set((state) => {
          const isPinned = state.pinnedAuditLogIds.includes(id);
          const pinnedAuditLogIds = isPinned
            ? state.pinnedAuditLogIds.filter((pId) => pId !== id)
            : [...state.pinnedAuditLogIds, id];
          
          useNotificationsStore.getState().addAuditLog(
            `${isPinned ? 'Unpinned' : 'Pinned'} audit log event ID: ${id}`,
            'success'
          );
          
          return { pinnedAuditLogIds };
        });
      },

      // Notifications
      notifications: initialNotifications,
      addNotification: (notification) => {
        set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 100) }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
        useNotificationsStore.getState().addAuditLog('Marked all active notifications as read', 'success');
      },
      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) => {
        set((state) => {
          const updated = { ...state.settings, ...newSettings };
          if (newSettings.accentColor) {
            applyAccentToDom(newSettings.accentColor);
          }
          return { settings: updated };
        });
      },
      resetSettings: () => {
        set({ settings: defaultSettings });
        applyAccentToDom(defaultSettings.accentColor);
        useNotificationsStore.getState().addAuditLog('Reset tenant configuration settings to defaults', 'success');
      },
    }),
    {
      name: 'client-admin-persistence',
      onRehydrateStorage: () => (state) => {
        if (state?.settings?.accentColor) {
          applyAccentToDom(state.settings.accentColor);
        }
      },
    }
  )
);
