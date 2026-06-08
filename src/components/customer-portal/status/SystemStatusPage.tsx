'use client';

import React, { useState } from 'react';
import { 
  Terminal, Book, AlertTriangle, 
  CheckCircle2, ExternalLink 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { ChangelogFeed } from '../system/ChangelogFeed';

export function SystemStatusPage({
  setActiveSubScreen
}: {
  setActiveSubScreen?: (screen: string) => void;
}) {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'status' | 'changelog' | 'api'>('status');

  // Simulated status logs
  const systems = [
    { name: isRtl ? 'بوابة الذكاء الاصطناعي Farah AI' : 'Farah AI Gateway', status: 'operational', uptime: '99.94%', latency: '640ms' },
    { name: isRtl ? 'قاعدة بيانات المتجهات Pinecone DB' : 'Pinecone Vector RAG Store', status: 'operational', uptime: '99.88%', latency: '110ms' },
    { name: isRtl ? 'موصلات الاتصال الهاتفي SIP Trunk' : 'SIP Telephony Trunk Line', status: 'operational', uptime: '100.0%', latency: '40ms' },
    { name: isRtl ? 'بوابة الفوترة Stripe Gateway' : 'Stripe Billing Connectors', status: 'operational', uptime: '99.99%', latency: '180ms' }
  ];

  const incidents = [
    { date: '2026-06-01', desc: isRtl ? 'صيانة مجدولة في بوابات الذكاء الاصطناعي (تمت بنجاح)' : 'Scheduled database optimization in Pinecone DB (Completed)', duration: '15m' },
    { date: '2026-05-18', desc: isRtl ? 'ارتفاع مؤقت في زمن الاستجابة لموصلات WhatsApp (تم حله)' : 'Minor latency spikes on WhatsApp webhook channels (Resolved)', duration: '8m' }
  ];

  const changelog = [
    {
      version: 'v1.8.0-stable',
      date: '2026-06-08',
      title: isRtl ? 'مساحة عمل الدعم المباشر وميزات الوصول' : 'Omnichannel Support Desk & Accessibility Upgrade',
      items: [
        isRtl ? 'إطلاق لوحة الدعم المباشر (Live Support Workspace) مع طابور الانتظار.' : 'Launched Live Support Desk Workspace with queue countdown loops.',
        isRtl ? 'إضافة أدوات تحسين إمكانية الوصول: تقليل الحركة، وضع السيبيا، واختصارات لوحة المفاتيح.' : 'Implemented accessibility controls: Sepia theme, Reduced Motion, Keyboard shortcut overlay.',
        isRtl ? 'ترقية صندوق تفاصيل التذكرة إلى العرض المزدوج 3-Column Split View.' : 'Redesigned Ticket Details page into 3-column metadata configuration.'
      ]
    },
    {
      version: 'v1.5.0',
      date: '2026-05-20',
      title: isRtl ? 'تحسينات محرك Farah AI ورصد التتبع' : 'Farah AI RAG & NLU Observability Console',
      items: [
        isRtl ? 'دمج ميزة تتبع الذكاء الاصطناعي (AI Trace Console) لإظهار دقة Intent و RAG.' : 'Integrated AI Trace Console exposing intent matching confidence and vector indexes.',
        isRtl ? 'إتاحة إرفاق الملفات وروابط المواقع ك chips في صندوق المدخلات.' : 'Allowed uploading files and attaching URLs as chips context inputs.',
        isRtl ? 'دعم الإدخال الصوتي ( waveform microphone) والتحويل لنصوص.' : 'Added Speech-to-text waveform microphone capture.'
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-800 dark:text-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-slate-850 pb-4 gap-4">
        <div>
          <h2 className="text-base font-extrabold leading-tight">
            {isRtl ? 'حالة النظام ومطور البرمجيات' : 'System Operations & Developer Desk'}
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            {isRtl ? 'تفقد مؤشرات الخدمة والتوثيق وإصدارات التحديثات.' : 'Inspect live telemetry logs, developer API schemas, and release updates.'}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-bold font-mono">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isRtl ? 'جميع الأنظمة تعمل بشكل طبيعي' : 'ALL SYSTEMS OPERATIONAL'}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold pb-0.5 gap-4">
        <button
          onClick={() => {
            setActiveTab('status');
            addAuditLog('Customer viewed System Status logs', 'success');
          }}
          className={`pb-2 transition-all cursor-pointer border-b-2 px-1 ${
            activeTab === 'status' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          {isRtl ? 'مؤشرات الأنظمة' : 'Uptime Telemetry'}
        </button>
        <button
          onClick={() => {
            setActiveTab('changelog');
            addAuditLog('Customer viewed Changelog releases', 'success');
          }}
          className={`pb-2 transition-all cursor-pointer border-b-2 px-1 ${
            activeTab === 'changelog' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          {isRtl ? 'سجل التغييرات وإصدارات النظام' : 'Changelog Releases'}
        </button>
        <button
          onClick={() => {
            setActiveTab('api');
            addAuditLog('Customer viewed Developer API playground', 'success');
          }}
          className={`pb-2 transition-all cursor-pointer border-b-2 px-1 ${
            activeTab === 'api' ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          {isRtl ? 'بوابة المطورين (API)' : 'Developer API SDK'}
        </button>
      </div>

      {/* Content panel */}
      <div className="text-xs">
        
        {/* Tab 1: System Telemetry */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {systems.map((sys, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-[12px] text-slate-900 dark:text-white leading-tight">{sys.name}</h5>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1 font-mono uppercase">{isRtl ? 'الاستجابة:' : 'Avg Latency:'} {sys.latency}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-500 font-mono font-bold uppercase block mb-1">
                      {isRtl ? 'يعمل' : 'OPERATIONAL'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{isRtl ? 'الجهوزية:' : 'Uptime:'} {sys.uptime}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Incidents logs timeline */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block font-mono">
                {isRtl ? 'الأحداث التشغيلية الأخيرة' : 'Historical Operational Incidents'}
              </span>

              <div className="space-y-3.5">
                {incidents.map((inc, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-start gap-4">
                    <div className="flex gap-2.5 items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-350">{inc.desc}</p>
                        <span className="text-[9px] text-slate-400 font-mono font-bold block mt-1">{inc.date}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[9px] font-bold text-slate-500 shrink-0">
                      {isRtl ? 'المدة:' : 'Duration:'} {inc.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation of System States */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl space-y-3 mt-4">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                {isRtl ? 'محاكاة الحالات التشغيلية للمؤسسة' : 'Simulate Enterprise System States'}
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    if (setActiveSubScreen) {
                      setActiveSubScreen('customer_system_403');
                      addAuditLog('Simulated HTTP 403 Forbidden page', 'success');
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  {isRtl ? 'محاكاة 403 غير مصرح' : 'Simulate 403 Forbidden'}
                </button>
                <button
                  onClick={() => {
                    if (setActiveSubScreen) {
                      setActiveSubScreen('customer_system_404');
                      addAuditLog('Simulated HTTP 404 Not Found page', 'success');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  {isRtl ? 'محاكاة 404 غير موجود' : 'Simulate 404 Not Found'}
                </button>
                <button
                  onClick={() => {
                    if (setActiveSubScreen) {
                      setActiveSubScreen('customer_system_500');
                      addAuditLog('Simulated HTTP 500 Internal Error page', 'success');
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-455 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  {isRtl ? 'محاكاة 500 خطأ داخلي' : 'Simulate 500 Server Error'}
                </button>
                <button
                  onClick={() => {
                    if (setActiveSubScreen) {
                      setActiveSubScreen('customer_system_maintenance');
                      addAuditLog('Simulated Scheduled Maintenance page', 'success');
                    }
                  }}
                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  {isRtl ? 'محاكاة وضع الصيانة' : 'Simulate Maintenance Mode'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Changelog Releases — powered by ChangelogFeed component */}
        {activeTab === 'changelog' && (
          <div className="max-w-2xl">
            <ChangelogFeed isRtl={isRtl} showSearch />
          </div>
        )}

        {/* Tab 3: Developer API Playgrounds */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left: API Docs descriptions */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-blue-500" />
                  <h5 className="font-extrabold text-[12px] text-slate-900 dark:text-white">{isRtl ? 'دليل موصلات REST SDK' : 'REST Connectors Documentation'}</h5>
                </div>
                <p className="text-slate-450 dark:text-slate-400 font-medium leading-relaxed">
                  {isRtl 
                    ? 'توفر بوابة mPaaS واجهات برمجية RESTful للمطورين لدمج تذاكر الدعم والبحث الدلالي في تطبيقاتهم الخارجية بشكل آمن.' 
                    : 'mPaaS client portals expose RESTful endpoints to query ticket telemetry, index documents into Pinecone, or trigger webhooks.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono block">{isRtl ? 'عناوين التوثيق والتوكنات' : 'Authentication Parameters'}</span>
                
                <div className="space-y-2 font-semibold">
                  <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-850 pb-1.5">
                    <span>Base URL:</span>
                    <code className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">https://api.mpaas.com/v1</code>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-850 pb-1.5">
                    <span>Auth Type:</span>
                    <span className="font-mono text-[10px]">Bearer Token / API Key</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Scopes:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[9px] font-bold">read:tickets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: API Interactive terminal console */}
            <div className="space-y-2 font-mono">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                {isRtl ? 'موجه الأوامر (API Shell)' : 'Interactive Request Playground'}
              </span>

              <div className="bg-[#03050a] text-slate-350 p-4 border border-slate-850 rounded-2xl space-y-3 text-[10px]">
                <div className="flex items-center gap-1.5 text-blue-500 font-bold border-b border-slate-900 pb-2">
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>GET /tickets/TIC-9912</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bold block">// Response Payload Header</span>
                  <pre className="text-emerald-400 leading-normal">
{`{
  "status": "success",
  "data": {
    "ticketId": "TIC-9912",
    "category": "Billing",
    "priority": "medium",
    "status": "solved",
    "adheredSla": true
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
