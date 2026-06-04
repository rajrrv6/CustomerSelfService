'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, PhoneCall, Volume2, Settings, Users, Activity, Play, Plus, PhoneOff, Check, X, ShieldAlert, Search, RefreshCw 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { OperationalActivityFeed } from '@/components/client-admin/shared/OperationalActivityFeed';
import { triggerSlaBreach } from '@/stores/notifications/notificationEvents';
import { useClientAdminStore, SipLog, IvrFlow, TelephonyProvider } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { translations } from '@/i18n/translations';

export function VoiceIvrWorkspace() {
  const ivrFlows = useClientAdminStore((state) => state.ivrFlows);
  const providers = useClientAdminStore((state) => state.providers);
  const sipLogs = useClientAdminStore((state) => state.sipLogs);
  
  const addIvrFlow = useClientAdminStore((state) => state.addIvrFlow);
  const toggleIvrStatus = useClientAdminStore((state) => state.toggleIvrStatus);
  const toggleProviderStatus = useClientAdminStore((state) => state.toggleProviderStatus);
  const addSipLog = useClientAdminStore((state) => state.addSipLog);
  const clearSipLogs = useClientAdminStore((state) => state.clearSipLogs);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);

  const isAr = lang === 'ar';
  const t = translations[lang];

  // Component hydration guard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [simActiveCall, setSimActiveCall] = useState<boolean>(false);
  const [simCallLogs, setSimCallLogs] = useState<string[]>([]);
  const [lastCallPath, setLastCallPath] = useState<string[] | null>(null);
  const [sipSearch, setSipSearch] = useState('');

  const handleCreateIvr = () => {
    const name = isAr ? `مسار رد صوتي جديد #${ivrFlows.length + 1}` : `New Voice IVR Flow #${ivrFlows.length + 1}`;
    const newIvr: IvrFlow = {
      id: `ivr-${Date.now()}`,
      name,
      language: isAr ? 'عربي' : 'English Only',
      nodesCount: 5,
      callsHandled: 0,
      status: 'inactive',
    };
    addIvrFlow(newIvr);
  };

  const handleSimulateCall = (replayPath?: string[]) => {
    if (simActiveCall) {
      setSimActiveCall(false);
      setSimCallLogs([]);
      return;
    }

    setSimActiveCall(true);
    const callerNum = `+966 50 ${Math.floor(1000000 + Math.random() * 9000000)}`;
    const stepLogs = replayPath || [
      isAr ? `اتصال وارد من الرقم ${callerNum} ➔ تهيئة قناة SIP` : `Inbound SIP call from ${callerNum} ➔ initiating connection trunk`,
      isAr ? 'تشغيل البوابة الصوتيّة: نطق جملة الترحيب الموحدة' : 'IVR Node: Main Office Menu ➔ Playing welcome announcement prompt',
      isAr ? 'العميل يضغط زر "١" (دعم الفواتير ومشاكل الميزانية)' : 'DTMF Keypress: Client selected "1" (Billing & Accounts Audit)',
      isAr ? 'التحقق من السياق: تصنيف العميل VIP' : 'Checking state context: Customer segment equals VIP loyalty tag',
      isAr ? 'مستويات الدعم مشغولة ➔ تصعيد المكالمة لطابور المشرفين' : 'Agents Occupied: Routing call fallback queue ➔ Supervisor Escalations Line',
      isAr ? 'انتهت المحاكاة بنجاح' : 'Call path validation checks finished successfully'
    ];

    setSimCallLogs([isAr ? 'بدء محاكاة المكالمة الصوتيّة...' : 'Initializing mock call simulation thread...']);
    setLastCallPath(stepLogs);

    stepLogs.forEach((logText, idx) => {
      setTimeout(() => {
        setSimCallLogs(prev => [...prev, `➔ ${logText}`]);
        
        if (idx === stepLogs.length - 1) {
          setSimActiveCall(false);
          
          // Log standard SIP log item
          const newSipLog: SipLog = {
            id: `sip-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            direction: 'inbound',
            from: callerNum,
            to: '+966 11 000 8888',
            durationSec: 45 + Math.floor(Math.random() * 120),
            status: Math.random() > 0.15 ? 'completed' : 'failed',
            flowName: 'Main Office Gateway Menu',
            path: stepLogs
          };
          addSipLog(newSipLog);

          // Random SLA Breach trigger
          if (Math.random() > 0.4) {
            triggerSlaBreach('VIP Support Queue', '2m 15s', '1m 30s');
            useNotificationsStore.getState().addAuditLog('Simulated IVR Call completed with SLA breach warning', 'failed');
            
            useNotificationsStore.getState().addAlert({
              category: 'sla',
              source: 'voice',
              severity: 'critical',
              alertCode: 'IVR_QUEUE_BREACH',
              sourceEntity: 'SIP Trunk',
              title: isAr ? 'تحذير وقت انتظار المكالمات الصوتية' : 'Voice SLA Queue Waiting Breach',
              message: isAr 
                ? 'مكالمة VIP في الانتظار: تجاوز مؤقت الانتظار دقيقة و٣٠ ثانية.' 
                : 'VIP queue wait timer limit breached... raising SLA warning alert',
              metadata: { caller: callerNum }
            });
          } else {
            useNotificationsStore.getState().addAuditLog(`Simulated call completed from caller ${callerNum}`, 'success');
          }
        }
      }, (idx + 1) * 1200);
    });
  };

  const handleReplayLastCall = () => {
    if (lastCallPath) {
      handleSimulateCall(lastCallPath);
    } else {
      handleSimulateCall();
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Telephony...</span>
      </div>
    );
  }

  const filteredSipLogs = sipLogs.filter(log => 
    log.from.includes(sipSearch) || 
    log.status.includes(sipSearch) ||
    log.flowName.toLowerCase().includes(sipSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={isAr ? 'بوابات الرد الصوتي IVR' : 'Voice & IVR Telephony'}
        description={isAr ? 'تكوين بوابات الرد الصوتي التفاعلي، وإدارة قنوات اتصالات SIP، وتشغيل محاكي المكالمات للتحقق.' : 'Configure interactive voice response systems, manage SIP trunks, and run mock call path validations.'}
        action={
          <button
            onClick={handleCreateIvr}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مسار رد صوتي' : 'Add IVR Menu'}</span>
          </button>
        }
      />

      {/* Voice KPI stats sticky operational panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-blue-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'المكالمات الحالية' : 'Live Inbound Calls'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 font-mono">
              <span className={`w-2.5 h-2.5 bg-emerald-500 rounded-full ${simActiveCall ? 'animate-ping' : 'animate-pulse'}`} />
              <span>{simActiveCall ? '5' : '4'}</span>
            </span>
          </div>
          <PhoneCall className="w-5 h-5 text-emerald-500" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-indigo-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'معدل الحفاظ' : 'Containment Rate'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              72.4%
            </span>
          </div>
          <Activity className="w-5 h-5 text-blue-500" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-teal-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'زمن التحدث (المتوسط)' : 'Avg Call Duration'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              2m 45s
            </span>
          </div>
          <Settings className="w-5 h-5 text-indigo-500" />
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between border-l-4 border-red-500">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'معدل التخلي صوتاً' : 'Abandonment Rate'}
            </span>
            <span className="text-xl font-bold text-red-500 dark:text-red-400 font-mono">
              4.2%
            </span>
          </div>
          <PhoneOff className="w-5 h-5 text-red-500" />
        </OperationalCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main pane: IVR flows & SIP Connections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Telephony providers deck */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              {isAr ? 'قنوات اتصال ومزودي SIP الصوتي' : 'Connected Telephony Trunks'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((p) => (
                <OperationalCard key={p.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{p.name}</h4>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">{p.type}</span>
                    </div>
                    <button 
                      onClick={() => toggleProviderStatus(p.id)}
                      className="cursor-pointer outline-none"
                    >
                      <Badge type={p.status === 'connected' ? 'success' : p.status === 'error' ? 'error' : 'neutral'}>
                        {p.status.toUpperCase()}
                      </Badge>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold">Active Channels:</span>
                    <span className="font-mono font-black">{p.status === 'connected' ? p.activeTrunks : 0} trunks</span>
                  </div>
                </OperationalCard>
              ))}
            </div>
          </div>

          {/* Active IVR Menus layout */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              {isAr ? 'مخططات ردود الرد الصوتي IVR' : 'Interactive Response Layout Menus'}
            </h4>
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden shadow-sm">
              {ivrFlows.map((ivr) => (
                <div key={ivr.id} className="p-4.5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl text-slate-500">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-850 dark:text-white truncate">{ivr.name}</h4>
                      <div className="flex gap-2.5 text-[9px] font-bold text-slate-450 dark:text-slate-500 mt-1 font-mono uppercase">
                        <span>{ivr.language}</span>
                        <span>•</span>
                        <span>{ivr.nodesCount} steps</span>
                        <span>•</span>
                        <span>{ivr.callsHandled.toLocaleString()} routed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleIvrStatus(ivr.id)}
                      className={`relative inline-flex items-center cursor-pointer ${ivr.status === 'active' ? 'text-blue-600' : 'text-slate-400'}`}
                    >
                      <div className="w-8 h-4.5 bg-slate-800 rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                      <div className={`absolute top-[2px] start-[2px] rounded-full h-3.5 w-3.5 transition-all bg-white border border-slate-300 ${
                        ivr.status === 'active' ? 'translate-x-3.5 rtl:-translate-x-3.5' : ''
                      }`} />
                    </button>
                    <Badge type={ivr.status === 'active' ? 'success' : 'neutral'}>
                      {ivr.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Searchable SIP logs panel */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                {isAr ? 'سجل المكالمات الصادر والوارد (SIP Logs)' : 'Searchable SIP Telephony Event Logs'}
              </h4>
              <div className="relative w-full sm:w-60">
                <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-2.5 ${isAr ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={isAr ? 'البحث بالرقم أو الحالة...' : 'Search SIP logs by phone or status...'}
                  value={sipSearch}
                  onChange={(e) => setSipSearch(e.target.value)}
                  className={`w-full bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-xl py-1.5 ${
                    isAr ? 'pr-8 pl-3' : 'pl-8 pr-3'
                  } text-[11px] focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200`}
                />
              </div>
            </div>

            {filteredSipLogs.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                {isAr ? 'لا توجد مكالمات مسجلة حالياً. استخدم لوحة المحاكاة للبدء.' : 'No calls logged. Use the simulator panel to start testing.'}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850 max-h-60 overflow-y-auto">
                {filteredSipLogs.map((log) => (
                  <div key={log.id} className="p-3 text-[10px] flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.from}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-slate-500 font-mono">{log.to}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {log.timestamp} • {log.durationSec}s duration • {log.flowName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[8.5px] px-1.5 py-0.5 font-mono uppercase bg-slate-100 dark:bg-slate-850 rounded font-bold text-slate-500 max-w-40 truncate">
                        {log.path[log.path.length - 2] || 'Completed'}
                      </span>
                      <Badge type={log.status === 'completed' ? 'success' : 'error'}>
                        {log.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side pane: IVR Simulator and feeds */}
        <div className="space-y-6">
          <OperationalCard className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'محاكاة مكالمة الرد الصوتي' : 'Telephony IVR Simulator'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'تشغيل خط اتصال وهمي لفحص مسارات التوجيه الصوتي ونطق الجمل.' : 'Open a test call loop to inspect logic flows, SLA metrics, and handoff rules.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSimulateCall()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  simActiveCall ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {simActiveCall ? <PhoneOff className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{simActiveCall ? t.clientAdmin.persistence.voice.endCall : t.clientAdmin.persistence.voice.simulateCall}</span>
              </button>

              {lastCallPath && (
                <button
                  disabled={simActiveCall}
                  onClick={handleReplayLastCall}
                  className="px-3 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl cursor-pointer transition-all"
                  title={t.clientAdmin.persistence.voice.replayLastCall}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {simCallLogs.length > 0 && (
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl max-h-48 overflow-y-auto space-y-1.5 font-mono text-[9px] text-slate-350 leading-relaxed">
                {simCallLogs.map((log, idx) => (
                  <div key={idx} className={`${idx === simCallLogs.length - 1 && simActiveCall ? 'text-amber-400 animate-pulse font-bold' : ''}`}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </OperationalCard>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold font-mono uppercase text-slate-450 dark:text-slate-500 tracking-wider">
              {isAr ? 'الأحداث الصوتية والتلغراف' : 'Voice Telemetry Log Feed'}
            </h4>
            <OperationalActivityFeed filterScope="channels" limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default VoiceIvrWorkspace;
