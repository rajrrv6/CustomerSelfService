import React from 'react';
import { SVGBarChart } from '@/components/dashboard/Charts';
import { StatusIndicator } from './shared/StatusIndicator';
import { Database, Link2, RefreshCw, AlertOctagon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface IntegrationConnector {
  name: string;
  endpoint: string;
  status: 'online' | 'busy' | 'critical';
  latencyMs: number;
  successRate: number;
}

const connectorsList: IntegrationConnector[] = [
  { name: 'SAP ERP Logistics Sync', endpoint: 'https://sap.corp.internal/v2/invoice', status: 'online', latencyMs: 240, successRate: 99.8 },
  { name: 'Salesforce CRM Lead Pipeline', endpoint: 'https://api.salesforce.com/services/data/v54.0', status: 'busy', latencyMs: 410, successRate: 98.2 },
  { name: 'Twilio Voice Gateway SIP Trunk', endpoint: 'sip:voice.twilio.com', status: 'online', latencyMs: 45, successRate: 99.95 },
  { name: 'Pinecone Vector DB Index', endpoint: 'https://kb-pinecone.io/vectors', status: 'online', latencyMs: 95, successRate: 99.9 }
];

export function IntegrationAnalytics() {
  const { lang } = useApp();
  const t = translations[lang];

  const getConnectorName = (name: string) => {
    if (lang === 'ar') {
      switch (name) {
        case 'SAP ERP Logistics Sync': return 'مزامنة لوجستيات SAP ERP';
        case 'Salesforce CRM Lead Pipeline': return 'تدفق عملاء Salesforce CRM';
        case 'Twilio Voice Gateway SIP Trunk': return 'جذع SIP لبوابة صوت Twilio';
        case 'Pinecone Vector DB Index': return 'فهرس قاعدة بيانات ناقلات Pinecone';
        default: return name;
      }
    }
    return name;
  };

  const weekdayLabels = lang === 'ar'
    ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">

      {/* Row 1: API status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {connectorsList.map((conn) => (
          <div key={conn.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <Link2 className="w-5 h-5 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1 rounded-full shrink-0" />
              <StatusIndicator 
                status={conn.status} 
                label={conn.status === 'online' ? t.analyticsCenter.integrations.healthy : t.analyticsCenter.integrations.degraded} 
              />
            </div>
            <div>
              <strong className="block font-bold text-slate-900 dark:text-white leading-tight">{getConnectorName(conn.name)}</strong>
              <span className="block text-[8px] text-slate-400 font-mono mt-0.5 truncate" title={conn.endpoint}>{conn.endpoint}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-100 dark:border-slate-850 pt-2">
              <span className="text-slate-450">{t.analyticsCenter.integrations.latency}: <span className="font-bold text-slate-850 dark:text-slate-250">{conn.latencyMs}ms</span></span>
              <span className="text-slate-455">{t.analyticsCenter.integrations.successRate}: <span className="font-bold text-emerald-600 dark:text-emerald-450">{conn.successRate}%</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Webhook Failure Trends & Retry Queue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SVGBarChart
            data={[2, 0, 1, 4, 3, 1, 0]}
            labels={weekdayLabels}
            title={t.analyticsCenter.integrations.webhookTitle}
            barColor="#f43f5e"
          />
        </div>

        {/* Retry Queue metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between" style={{ minHeight: '270px' }}>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t.analyticsCenter.integrations.retryQueueTitle}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1">{t.analyticsCenter.integrations.retryQueueSubtitle}</p>
          </div>

          <div className="space-y-4.5 py-4">
            
            {/* Retry active */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1.5 rounded-full shrink-0" />
                <div>
                  <strong className="block font-bold text-slate-800 dark:text-slate-200">{t.analyticsCenter.integrations.activeRetries}</strong>
                  <span className="text-[8px] text-slate-400">{t.analyticsCenter.integrations.attemptsRange}</span>
                </div>
              </div>
              <span className="font-mono text-base font-black text-blue-650 dark:text-blue-400">3</span>
            </div>

            {/* Hold Backoff */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded-full shrink-0" />
                <div>
                  <strong className="block font-bold text-slate-800 dark:text-slate-200">{t.analyticsCenter.integrations.backoffQueueHold}</strong>
                  <span className="text-[8px] text-slate-400">{t.analyticsCenter.integrations.delayedCalls}</span>
                </div>
              </div>
              <span className="font-mono text-base font-black text-amber-550 dark:text-amber-400">12</span>
            </div>

            {/* Dead Letters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-full shrink-0 animate-pulse" />
                <div>
                  <strong className="block font-bold text-slate-800 dark:text-slate-200 font-sans">{t.analyticsCenter.integrations.dlqTitle}</strong>
                  <span className="text-[8px] text-slate-400">{t.analyticsCenter.integrations.dlqSubtitle}</span>
                </div>
              </div>
              <span className="font-mono text-base font-black text-rose-600 dark:text-rose-455">2</span>
            </div>

          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-905 rounded-2xl text-[9px] text-slate-400 text-center font-mono">
            {t.analyticsCenter.integrations.dlqAlertHint}
          </div>
        </div>
      </div>

    </div>
  );
}
