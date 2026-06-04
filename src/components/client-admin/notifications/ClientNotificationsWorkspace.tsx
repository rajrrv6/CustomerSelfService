'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, RefreshCw, X, Radio, ArrowRight, Search 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { EmptyState } from '@/components/shared/EmptyState';
import { triggerWebhookFailure, triggerAiDegradation } from '@/stores/notifications/notificationEvents';
import { useClientAdminStore, ClientNotification } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';

export function ClientNotificationsWorkspace() {
  const notifications = useClientAdminStore((state) => state.notifications);
  const addNotification = useClientAdminStore((state) => state.addNotification);
  const markNotificationRead = useClientAdminStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useClientAdminStore((state) => state.markAllNotificationsRead);
  const dismissNotification = useClientAdminStore((state) => state.dismissNotification);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);

  const isAr = lang === 'ar';

  // Hydration safety check
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'sla' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Background automated telemetry alarm dispatches simulation loop
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      // 10% chance to trigger a background webhook or token alert every 12 seconds
      if (Math.random() > 0.85) {
        const isTokenAlert = Math.random() > 0.5;

        if (isTokenAlert) {
          const usageCount = Math.floor(100000 + Math.random() * 200000);
          const newNotif: ClientNotification = {
            id: `notif-${Date.now()}`,
            timestamp: 'Just now',
            category: 'system',
            severity: 'warning',
            title: 'AI Prompt Token Usage Spike',
            titleAr: 'ارتفاع استهلاك رموز الذكاء الاصطناعي',
            message: `Gemini Flash API registered excessive batch volume usage: ${usageCount.toLocaleString()} tokens in 5m.`,
            messageAr: `سجلت واجهة Gemini Flash استهلاك دفعة رموز زائدة بمقدار ${usageCount.toLocaleString()} رمز خلال ٥ دقائق.`,
            read: false
          };
          addNotification(newNotif);

          useNotificationsStore.getState().addAlert({
            category: 'operations',
            source: 'AI-training',
            severity: 'warning',
            alertCode: 'TOKEN_SPIKE_DETECTED',
            sourceEntity: 'Gemini Broker',
            title: isAr ? 'ارتفاع استهلاك رموز LLM' : 'LLM Token Spike Alert',
            message: isAr 
              ? `سجل البوت استهلاك زائد بمقدار ${usageCount.toLocaleString()} رمز.` 
              : `Token consumption spiked to ${usageCount.toLocaleString()} in 5m.`,
            metadata: { tokenCount: usageCount }
          });
        } else {
          const latency = `${Math.floor(3500 + Math.random() * 2000)}ms`;
          const newNotif: ClientNotification = {
            id: `notif-${Date.now()}`,
            timestamp: 'Just now',
            category: 'webhook',
            severity: 'warning',
            title: 'High Latency on CRM Webhook',
            titleAr: 'تأخر استجابة عالية في ربط CRM Webhook',
            message: `Salesforce synchronization webhook averaged latency of ${latency}, exceeding SLA limits.`,
            messageAr: `بلغ متوسط زمن استجابة Salesforce webhook حوالي ${latency}، متجاوزاً حدود SLA.`,
            read: false
          };
          addNotification(newNotif);

          useNotificationsStore.getState().addAlert({
            category: 'webhook',
            source: 'omnichannel',
            severity: 'warning',
            alertCode: 'WEBHOOK_TIMEOUT',
            sourceEntity: 'Salesforce Pipeline',
            title: isAr ? 'تأخر استجابة Salesforce Webhook' : 'Salesforce Webhook Latency',
            message: isAr ? `زمن استجابة ربط الـ CRM تجاوز ${latency}.` : `CRM webhook response exceeded ${latency}.`,
            metadata: { latency }
          });
        }

        useNotificationsStore.getState().addAuditLog('Automated telemetry monitoring triggered warning alarm', 'success');
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [addNotification, isMounted, isAr]);

  const handleMarkAsRead = (id: string) => {
    markNotificationRead(id);
  };

  const handleRemove = (id: string) => {
    dismissNotification(id);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleSimulateAlert = (type: 'latency' | 'accuracy') => {
    if (type === 'latency') {
      triggerWebhookFailure('Stripe Invoices', 'https://api.stripe.com/v1/invoices', '4820ms');
      const newNotif: ClientNotification = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        category: 'webhook',
        severity: 'critical',
        title: 'Critical Outage: Stripe Webhook Timeout',
        titleAr: 'انقطاع حرج: انتهاء وقت استجابة Stripe Webhook',
        message: 'Stripe webhook latency spiked above SLA threshold of 3000ms (Recorded: 4820ms). Endpoint failed to acknowledge.',
        messageAr: 'ارتفع زمن استجابة Stripe Webhook فوق الحد المسموح به في SLA والبالغ ٣٠٠٠ مللي ثانية (المسجل: ٤٨٢٠ مللي ثانية).',
        read: false
      };
      addNotification(newNotif);

      useNotificationsStore.getState().addAlert({
        category: 'webhook',
        source: 'omnichannel',
        severity: 'critical',
        alertCode: 'WEBHOOK_OUTAGE',
        sourceEntity: 'Stripe Gateway',
        title: isAr ? 'انقطاع بوابة الدفع Stripe' : 'Critical Payment Gateway Outage',
        message: isAr ? 'انقطاع الاتصال مع بوابة الدفع Stripe.' : 'Stripe billing api gateway returned timeout failures.',
        metadata: { latency: '4820ms' }
      });
      
      useNotificationsStore.getState().addAuditLog('Simulated critical webhook outage alert event', 'failed');
    } else {
      triggerAiDegradation(0.42, 'RAG FAQ Matching Engine');
      const newNotif: ClientNotification = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        category: 'system',
        severity: 'warning',
        title: 'NLU Containment Performance Alert',
        titleAr: 'تنبيه تدني أداء احتواء المحادثات الذكي',
        message: 'AI deflection accuracy fell below confidence boundary of 0.70 (Recorded: 0.42). Model fallback triggered.',
        messageAr: 'انخفضت دقة مطابقة النية ومستوى الثقة للذكاء الاصطناعي عن ٠.٧٠ (المسجل: ٠.٤٢).',
        read: false
      };
      addNotification(newNotif);

      useNotificationsStore.getState().addAlert({
        category: 'operations',
        source: 'AI-training',
        severity: 'warning',
        alertCode: 'AI_DEGRADATION',
        sourceEntity: 'RAG FAQs matching engine',
        title: isAr ? 'تراجع أداء نموذج الذكاء الاصطناعي' : 'NLU Accuracy Degradation',
        message: isAr ? 'انخفاض دقة احتواء المحادثات التلقائي.' : 'NLU matching scores dropped below confidence threshold.',
        metadata: { score: 0.42 }
      });

      useNotificationsStore.getState().addAuditLog('Simulated NLU containment accuracy alert event', 'failed');
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Notifications...</span>
      </div>
    );
  }

  // Filter Logic
  const filteredNotifs = notifications.filter(n => {
    const matchSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.messageAr.toLowerCase().includes(searchQuery.toLowerCase());

    let matchTab = true;
    if (activeTab === 'unread') matchTab = !n.read;
    else if (activeTab === 'sla') matchTab = n.category === 'sla';
    else if (activeTab === 'system') matchTab = n.category === 'system' || n.category === 'security';

    return matchSearch && matchTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getSeverityIcon = (sev: ClientNotification['severity']) => {
    switch (sev) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBorder = (sev: ClientNotification['severity']) => {
    switch (sev) {
      case 'critical':
        return 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-800';
      case 'warning':
        return 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800';
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={isAr ? 'مركز التنبيهات التشغيلية' : 'Operational Notifications'}
        description={isAr ? 'إشعارات حية حول نشاط النظم، وانتهاكات SLA، واستدعاءات الويب ومحاكاة التحذيرات.' : 'Live warning alerts, API timeouts, webhook latencies, and SLA breaches logs.'}
        action={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-705 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark All Read'}</span>
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main notifications feed list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            {/* Category switcher */}
            <div className="flex gap-1 bg-slate-105 dark:bg-slate-955 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 max-w-sm flex-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                  activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-805 dark:hover:text-slate-250'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'unread' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-805 dark:hover:text-slate-250'
                }`}
              >
                <span>{isAr ? 'غير المقروء' : 'Unread'}</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('sla')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                  activeTab === 'sla' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-805 dark:hover:text-slate-250'
                }`}
              >
                {isAr ? 'التزامات SLA' : 'SLA Alerts'}
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                  activeTab === 'system' ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-805 dark:hover:text-slate-250'
                }`}
              >
                {isAr ? 'النظام' : 'System'}
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className={`w-3.5 h-3.5 text-slate-450 absolute top-2.5 ${isAr ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={isAr ? 'البحث في الإشعارات...' : 'Search alerts...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 ${
                  isAr ? 'pr-8 pl-3' : 'pl-8 pr-3'
                } text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100`}
              />
            </div>
          </div>

          {/* Render List */}
          {filteredNotifs.length === 0 ? (
            <EmptyState
              title={isAr ? 'صندوق الإشعارات فارغ' : 'All Caught Up!'}
              description={isAr ? 'لا توجد تنبيهات نشطة غير مقروءة في هذا التصنيف.' : 'There are no active alerts in this notification filter.'}
            />
          ) : (
            <div className="space-y-3.5">
              {filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white dark:bg-[#111827] border rounded-2xl p-4 transition-all hover:scale-[1.005] flex gap-3.5 items-start ${getSeverityBorder(
                    n.severity
                  )} ${n.read ? 'opacity-70 border-slate-150 dark:border-slate-850' : 'border-slate-200 dark:border-slate-800 shadow-xs'}`}
                >
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shrink-0 flex items-center justify-center">
                    {getSeverityIcon(n.severity)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-black text-slate-850 dark:text-white leading-tight">
                        {isAr ? n.titleAr : n.title}
                      </h4>
                      <span className="font-mono text-[8px] text-slate-400 dark:text-slate-550 shrink-0 font-bold uppercase">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-405 leading-relaxed font-semibold">
                      {isAr ? n.messageAr : n.message}
                    </p>

                    <div className="flex gap-2.5 pt-1.5 items-center text-xs font-semibold">
                      <Badge type={n.category === 'sla' ? 'error' : n.category === 'security' ? 'error' : 'info'}>
                        {n.category.toUpperCase()}
                      </Badge>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-[9.5px] font-bold text-blue-650 hover:underline cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        >
                          {isAr ? 'تحديد كمقروء' : 'Mark as read'}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(n.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right pane: Alert simulator controls */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 font-mono tracking-wider">
            {isAr ? 'محاكاة وإرسال تنبيهات للنظام' : 'Trigger Simulation Alerts'}
          </h3>

          <OperationalCard className="p-5 space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>{isAr ? 'محاكي إنذارات الذكاء والشبكات' : 'Real-time Telemetry Dispatcher'}</span>
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 leading-normal">
                {isAr ? 'إرسال تنبيهات فورية لوحدات القيادة لمحاكاة حالات الفشل والأعطال.' : 'Manually dispatch network failure and AI degradation events to the active layout.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <button
                onClick={() => handleSimulateAlert('latency')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>{isAr ? 'محاكاة تأخر Stripe Webhook' : 'Trigger Stripe Webhook Alert'}</span>
                <ArrowRight className={`w-3.5 h-3.5 text-blue-500 ${isAr ? 'scale-x-[-1]' : ''}`} />
              </button>

              <button
                onClick={() => handleSimulateAlert('accuracy')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>{isAr ? 'محاكاة فشل RAG للذكاء الاصطناعي' : 'Trigger RAG Accuracy Failure'}</span>
                <ArrowRight className={`w-3.5 h-3.5 text-blue-500 ${isAr ? 'scale-x-[-1]' : ''}`} />
              </button>
            </div>
          </OperationalCard>
        </div>
      </div>
    </div>
  );
}
export default ClientNotificationsWorkspace;
