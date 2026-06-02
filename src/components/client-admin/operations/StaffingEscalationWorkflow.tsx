'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertOctagon, ArrowRight, ShieldCheck, Sparkles, Send, Bell, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

interface StaffingEscalationWorkflowProps {
  lang: 'en' | 'ar';
}

interface EscalationLog {
  id: string;
  timestamp: string;
  actionEn: string;
  actionAr: string;
  user: string;
  status: 'active' | 'completed' | 'reverted';
}

export function StaffingEscalationWorkflow({ lang }: StaffingEscalationWorkflowProps) {
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();

  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [emergencyBroadcast, setEmergencyBroadcast] = useState(false);
  
  const [escalations, setEscalations] = useState<EscalationLog[]>([
    {
      id: 'e-1',
      timestamp: '2026-06-01 10:14',
      actionEn: 'Rerouted General queue spillover to Secondary Support Pool',
      actionAr: 'توجيه فائض الدعم العام إلى المجموعة الاحتياطية الثانية',
      user: 'Operations Supervisor',
      status: 'completed'
    },
    {
      id: 'e-2',
      timestamp: '2026-06-01 11:30',
      actionEn: 'Temporarily reassigned Liam Bennett (VIP Specialist) to Technical Escalations queue',
      actionAr: 'إعادة تعيين مؤقت للأخصائي ليام بينيت لتغطية طابور التصعيد الفني',
      user: 'System Autopilot Manager',
      status: 'completed'
    }
  ]);

  const handleTriggerProtocol = (type: 'overflow' | 'backfill' | 'callback') => {
    setActiveProtocol(type);
    
    let actionTextEn = '';
    let actionTextAr = '';

    if (type === 'overflow') {
      actionTextEn = 'Activated overflow routing strategy: redirects calls to fallback group.';
      actionTextAr = 'تفعيل بروتوكول تحويل الفائض: إعادة توجيه المحادثات للمجموعة الاحتياطية.';
    } else if (type === 'backfill') {
      actionTextEn = 'Requested workforce backfill support: queued backup agents.';
      actionTextAr = 'طلب إسناد إضافي للقوى العاملة: حشد وكلاء الدعم الاحتياطيين.';
    } else {
      actionTextEn = 'Triggered emergency IVR Callback mode for wait times exceeding 5 mins.';
      actionTextAr = 'تشغيل خيار الاتصال الهاتفي التلقائي الطارئ لفترات الانتظار المتجاوزة لـ 5 دقائق.';
    }

    const newLog: EscalationLog = {
      id: `e-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actionEn: actionTextEn,
      actionAr: actionTextAr,
      user: 'Operations Supervisor',
      status: 'active'
    };

    setEscalations([newLog, ...escalations]);
    addAuditLog(`Staffing Escalation Protocol: ${actionTextEn}`, 'success');
  };

  const handleRevertEscalation = (id: string) => {
    setEscalations(prev =>
      prev.map(item => {
        if (item.id === id) {
          addAuditLog(`Reverted staffing reassignment: ${item.actionEn}`, 'success');
          return { ...item, status: 'reverted' as const };
        }
        return item;
      })
    );
  };

  const handleToggleEmergency = () => {
    const nextState = !emergencyBroadcast;
    setEmergencyBroadcast(nextState);
    addAuditLog(
      nextState 
        ? 'Broadcasted emergency staffing notifications to all offline backup teams.' 
        : 'Deactivated emergency team broadcasts.', 
      nextState ? 'success' : 'failed'
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Escalation Controls */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {isRtl ? 'إدارة تصعيد القوى العاملة وسحب الاحتياط' : 'Staffing & Resource Escalation Desk'}
            </h4>
            <p className="text-[10px] text-slate-455 mt-1.5">
              {isRtl 
                ? 'تفعيل قنوات الدعم الاحتياطية وإعادة توجيه فائض الاتصالات عند حدوث عجز في الحضور.' 
                : 'Deploy overflow routing, request emergency agent backfill, or trigger automated callback strategies.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {/* Overflow Routing Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Strategy A</span>
                <strong className="text-xs font-bold text-slate-850 dark:text-white block">{isRtl ? 'توجيه الفائض الاحتياطي' : 'Activate Queue Overflow'}</strong>
                <p className="text-[9.5px] text-slate-450 font-normal leading-relaxed">
                  {isRtl ? 'تحويل فائض الطابور إلى المجموعة الاحتياطية.' : 'Route overflow sessions to the backup support group.'}
                </p>
              </div>
              <button
                onClick={() => handleTriggerProtocol('overflow')}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                {isRtl ? 'تفعيل الخيار' : 'Route Overflow'}
              </button>
            </div>

            {/* Backfill Roster Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Strategy B</span>
                <strong className="text-xs font-bold text-slate-850 dark:text-white block">{isRtl ? 'طلب إسناد للموظفين' : 'Request Agent Backfill'}</strong>
                <p className="text-[9.5px] text-slate-450 font-normal leading-relaxed">
                  {isRtl ? 'استدعاء موظفي الطوارئ المسجلين خارج الدوام.' : 'Call offline backup agents into active service.'}
                </p>
              </div>
              <button
                onClick={() => handleTriggerProtocol('backfill')}
                className="w-full py-1.5 bg-amber-650 hover:bg-amber-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                {isRtl ? 'طلب استدعاء' : 'Request Backfill'}
              </button>
            </div>

            {/* Callback Trigger Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Strategy C</span>
                <strong className="text-xs font-bold text-slate-850 dark:text-white block">{isRtl ? 'تشغيل الاتصال التلقائي' : 'Emergency Callback'}</strong>
                <p className="text-[9.5px] text-slate-450 font-normal leading-relaxed">
                  {isRtl ? 'إجبار المتصلين على حجز موعد اتصال عند ارتفاع الانتظار.' : 'Force callback options when queue delay exceeds 5m.'}
                </p>
              </div>
              <button
                onClick={() => handleTriggerProtocol('callback')}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                {isRtl ? 'تشغيل البروتوكول' : 'Trigger Callback'}
              </button>
            </div>
          </div>

          {/* Emergency Broadcast Toggle */}
          <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/15 rounded-2xl">
            <div className="flex gap-3 items-center min-w-0">
              <Bell className="w-6 h-6 text-red-500 shrink-0 animate-bounce" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-slate-850 dark:text-white block">
                  {isRtl ? 'إشارة استدعاء الطوارئ للفريق الاحتياطي' : 'Emergency Team Broadcast Network'}
                </span>
                <p className="text-[10px] text-slate-450 leading-relaxed font-normal truncate">
                  {isRtl 
                    ? 'إرسال تنبيهات عاجلة للأجهزة الذكية لجميع موظفي الدعم الاحتياطيين للالتحاق الفوري.' 
                    : 'Dispatch priority push notifications requesting immediate login from offline resources.'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={emergencyBroadcast}
                onChange={handleToggleEmergency}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2.5px] after:start-[2.5px] after:bg-slate-400 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white" />
            </label>
          </div>
        </div>
      </div>

      {/* Escalation history timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {isRtl ? 'سجل إجراءات وتغييرات الموارد' : 'Escalation Actions Log'}
            </h4>
            <p className="text-[10px] text-slate-455 mt-1.5">
              {isRtl 
                ? 'مراقبة التعديلات ومسارات التحويل الاحتياطية المنفذة حديثاً.' 
                : 'Timeline audit tracking staffing reroutes and priority interventions.'}
            </p>
          </div>

          <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
            {escalations.map((item) => (
              <div key={item.id} className="border-l-2 border-slate-200 dark:border-slate-850 pl-3.5 space-y-1 relative">
                <div className={`absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full ${
                  item.status === 'active' ? 'bg-amber-500 animate-ping' : item.status === 'reverted' ? 'bg-slate-400' : 'bg-emerald-500'
                }`} />
                <div className="flex justify-between items-center text-[9px] gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-250 truncate max-w-[130px] font-mono">
                    {item.user}
                  </span>
                  <span className="font-mono text-slate-450 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-[10px] text-slate-655 dark:text-slate-350 font-normal leading-normal font-sans">
                  {isRtl ? item.actionAr : item.actionEn}
                </p>
                {item.status === 'active' && (
                  <button
                    onClick={() => handleRevertEscalation(item.id)}
                    className="flex items-center gap-1 text-[8px] font-bold text-slate-450 hover:text-rose-500 uppercase tracking-wider font-mono border border-slate-200 dark:border-slate-800 hover:border-rose-500/20 px-1.5 py-0.5 rounded-md hover:bg-rose-500/5 mt-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Revert Route</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-850 text-[9px] text-slate-500 font-mono text-center select-none mt-4">
          {isRtl ? 'نظام الحوكمة الآمنة والتعديلات مسجلة بالكامل.' : 'All resource modifications are locked in audit logs.'}
        </div>
      </div>
    </div>
  );
}
