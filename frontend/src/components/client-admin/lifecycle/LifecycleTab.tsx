'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, GitCommit, CheckCircle2, AlertCircle, PlayCircle, Clock } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Badge } from '@/components/shared/BadgeSystem';

export function LifecycleTab() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const defaultPipeline = [
    { name: isRtl ? 'البناء والاختبار' : 'Build & Test', status: 'completed', time: '10:24 AM' },
    { name: isRtl ? 'بيئة الاختبار' : 'Staging (QA)', status: 'completed', time: '10:45 AM' },
    { name: isRtl ? 'موافقة أمن المعلومات' : 'SecOps Approval', status: 'completed', time: '11:15 AM' },
    { name: isRtl ? 'النشر التدريجي' : 'Canary Rollout', status: 'active', time: 'In Progress' },
    { name: isRtl ? 'الإنتاج الشامل' : 'Full Production', status: 'pending', time: 'Scheduled' }
  ];

  const [deployState, setDeployState] = useState<'idle' | 'running' | 'success' | 'rolledback'>('idle');
  const [pipelineState, setPipelineState] = useState(defaultPipeline);
  const [trafficA, setTrafficA] = useState(80);
  const [trafficB, setTrafficB] = useState(20);
  const [logs, setLogs] = useState<string[]>([]);
  
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const startDeployment = () => {
    clearTimers();
    setDeployState('running');
    setTrafficA(80);
    setTrafficB(20);
    setPipelineState([
      { name: isRtl ? 'البناء والاختبار' : 'Build & Test', status: 'completed', time: '10:24 AM' },
      { name: isRtl ? 'بيئة الاختبار' : 'Staging (QA)', status: 'completed', time: '10:45 AM' },
      { name: isRtl ? 'موافقة أمن المعلومات' : 'SecOps Approval', status: 'completed', time: '11:15 AM' },
      { name: isRtl ? 'النشر التدريجي' : 'Canary Rollout', status: 'active', time: 'In Progress' },
      { name: isRtl ? 'الإنتاج الشامل' : 'Full Production', status: 'pending', time: 'Scheduled' }
    ]);
    addAuditLog('Started production canary rollout for Release v2.4.1', 'success');

    const newLogs = [
      `[${new Date().toLocaleTimeString()}] INITIATING CANARY DEPLOYMENT FOR RELEASE v2.4.1`,
      `[${new Date().toLocaleTimeString()}] Fetching release branch artifact: main@a9f2b8c`,
      `[${new Date().toLocaleTimeString()}] Build & Test check: OK`,
      `[${new Date().toLocaleTimeString()}] SecOps security vulnerabilities audit scan: 0 critical issues found`,
      `[${new Date().toLocaleTimeString()}] Routing 20% of HTTP traffic to Variant B nodes...`
    ];
    setLogs(newLogs);

    // Timeout 1: Shard checking
    const t1 = setTimeout(() => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Checking cluster metrics: latency p99 26ms, CPU load 12%. Status: Stable.`]);
    }, 1200);

    // Timeout 2: Progressive traffic shift (50/50)
    const t2 = setTimeout(() => {
      setTrafficA(50);
      setTrafficB(50);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Shifting traffic split to 50% Variant A | 50% Variant B...`]);
      setPipelineState(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: 'completed', time: 'Success' } : s));
    }, 2400);

    // Timeout 3: Progressive traffic shift (20/80)
    const t3 = setTimeout(() => {
      setTrafficA(20);
      setTrafficB(80);
      setPipelineState(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'active', time: 'In Progress' } : s));
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Shifting traffic split to 20% Variant A | 80% Variant B...`]);
    }, 3600);

    // Timeout 4: Production Rollout Complete (0/100)
    const t4 = setTimeout(() => {
      setTrafficA(0);
      setTrafficB(100);
      setPipelineState(prev => prev.map((s, idx) => idx === 4 ? { ...s, status: 'completed', time: 'Completed' } : s));
      setDeployState('success');
      addAuditLog('Production canary rollout completed successfully for v2.4.1', 'success');
      setLogs(prev => [...prev, 
        `[${new Date().toLocaleTimeString()}] Full production rollout verified. Deprecating Variant A nodes.`,
        `[${new Date().toLocaleTimeString()}] CANARY DEPLOYMENT SUCCESSFUL.`
      ]);
    }, 4800);

    timersRef.current = [t1, t2, t3, t4];
  };

  const rollbackDeployment = () => {
    clearTimers();
    setDeployState('rolledback');
    addAuditLog('Canary deployment aborted. Triggered emergency rollback.', 'failed');
    
    setLogs(prev => [...prev, 
      `[${new Date().toLocaleTimeString()}] !!! ABORT COMMAND RECEIVED FROM OPERATOR !!!`,
      `[${new Date().toLocaleTimeString()}] Initiating emergency rollback workflow...`,
      `[${new Date().toLocaleTimeString()}] Reverting DNS traffic weight to Variant A...`
    ]);

    setTimeout(() => {
      setTrafficA(80);
      setTrafficB(20);
      setPipelineState([
        { name: isRtl ? 'البناء والاختبار' : 'Build & Test', status: 'completed', time: '10:24 AM' },
        { name: isRtl ? 'بيئة الاختبار' : 'Staging (QA)', status: 'completed', time: '10:45 AM' },
        { name: isRtl ? 'موافقة أمن المعلومات' : 'SecOps Approval', status: 'completed', time: '11:15 AM' },
        { name: isRtl ? 'النشر التدريجي' : 'Canary Rollout', status: 'active', time: 'Rolled Back' },
        { name: isRtl ? 'الإنتاج الشامل' : 'Full Production', status: 'pending', time: 'Cancelled' }
      ]);
      setLogs(prev => [...prev, 
        `[${new Date().toLocaleTimeString()}] Variant B traffic reduced to 0%. De-registering containers...`,
        `[${new Date().toLocaleTimeString()}] ROLLBACK COMPLETED SUCCESSFULLY. SAFE STATE RESTORED.`
      ]);
    }, 1000);
  };

  const headerAction = (
    <button
      onClick={deployState === 'running' ? rollbackDeployment : startDeployment}
      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ${
        deployState === 'running'
          ? 'bg-red-650 hover:bg-red-700 text-white animate-pulse'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {deployState === 'running' ? (
        <>
          <AlertCircle className="w-4 h-4" />
          {isRtl ? 'إلغاء وتراجع' : 'Abort & Rollback'}
        </>
      ) : (
        <>
          <PlayCircle className="w-4 h-4" />
          {isRtl ? 'بدء النشر التجريبي' : 'Trigger Canary Rollout'}
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.deployments.title}
        description={t.clientAdmin.deployments.description}
        action={headerAction}
      />

      {/* Logs Terminal */}
      {logs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3 font-mono text-[10px] text-emerald-400 select-text overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-slate-400 select-none">
            <span className="font-bold uppercase tracking-wider">{isRtl ? 'سجل عمليات النشر والترقية' : 'Live Deployment Console'}</span>
            <span className="flex items-center gap-1.5 font-bold animate-pulse text-[9px]">
              <span className={`w-1.5 h-1.5 rounded-full ${
                deployState === 'running' ? 'bg-amber-500' :
                deployState === 'success' ? 'bg-emerald-500' :
                deployState === 'rolledback' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              {deployState.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin select-text">
            {logs.map((log, idx) => (
              <div key={idx} className={log.includes('!!!') || log.includes('ABORT') ? 'text-rose-400 font-bold' : log.includes('SUCCESSFUL') || log.includes('verified') ? 'text-emerald-300 font-bold' : 'opacity-90'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      <OperationalCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge type={deployState === 'success' ? 'success' : 'info'}>
                  {deployState === 'success' ? (isRtl ? 'تم الترقية بالكامل' : 'Production Active') : (isRtl ? 'تحديث نشط' : 'Active Rollout')}
                </Badge>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Release v2.4.1</span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-2">
                {isRtl ? 'تحديث قاموس الترجمة ونموذج التوجيه' : 'RAG Routing Prompt Weights & Dictionary Sync'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                {isRtl 
                  ? 'يتم نشر هذا الإصدار التدريجي لاختبار تحسينات التصنيف لرسائل واتساب الواردة باللغة العربية.'
                  : 'This release incrementally deploys improved Arabic categorization models for inbound WhatsApp messages and syncs the latest i18n dictionaries.'}
              </p>
            </div>

            {/* Operational Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Commit SHA</span>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <GitCommit className="w-3.5 h-3.5" />
                  a9f2b8c
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Triggered By</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Auto-CI (main)</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Rollback Risk</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Low
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Downtime</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Zero-downtime</span>
              </div>
            </div>

            {/* Pipeline Visual */}
            <div className="pt-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Deployment Pipeline</h4>
              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                
                {pipelineState.map((stage, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      stage.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                      stage.status === 'active' ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' :
                      stage.time === 'Rolled Back' ? 'bg-red-500 border-red-500 text-white' :
                      stage.time === 'Cancelled' ? 'bg-slate-100 dark:bg-slate-800 border-slate-350 text-slate-400 dark:text-slate-600' :
                      'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}>
                      {stage.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                       stage.status === 'active' ? <PlayCircle className="w-4 h-4 animate-pulse" /> :
                       stage.time === 'Rolled Back' ? <AlertCircle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div className="text-center">
                      <span className={`text-[10px] font-bold block ${stage.status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {stage.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{stage.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* A/B Traffic Config Section */}
          <div className="w-full md:w-64 shrink-0 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs text-slate-850 dark:text-white flex items-center gap-2 uppercase tracking-wide mb-4">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {t.clientAdmin.deployments.abTrafficConfig}
            </h3>
            
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed font-mono">
              {isRtl ? 'يتم توجيه نسبة من حركة المرور للإصدار التجريبي لمراقبة معدل الاستقرار قبل النشر الشامل.' : 'Traffic redirection state monitor:'}
            </p>

            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-3 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[11px] text-blue-600 dark:text-blue-400">
                    {t.clientAdmin.deployments.variantA} (v2.4.0)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{trafficA}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${trafficA}%` }} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 shadow-sm rounded-xl border border-blue-200 dark:border-blue-800 ring-1 ring-blue-500/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t.clientAdmin.deployments.variantB} (v2.4.1)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{trafficB}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-purple-500 transition-all duration-500 ${deployState === 'running' ? 'animate-pulse' : ''}`} style={{ width: `${trafficB}%` }} />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
