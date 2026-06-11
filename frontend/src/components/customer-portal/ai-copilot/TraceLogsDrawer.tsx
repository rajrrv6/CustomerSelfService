import React from 'react';
import { Settings, X } from 'lucide-react';
import { TraceLogsDrawerProps } from './types';
import { ANIMATION_TRANSITIONS, getTraceSteps } from './constants';

export const TraceLogsDrawer = React.memo(function TraceLogsDrawer({
  isRtl,
  setShowTracePanel
}: TraceLogsDrawerProps) {
  const traceSteps = getTraceSteps(isRtl);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div 
        onClick={() => setShowTracePanel(false)}
        className="md:hidden absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-25 animate-in fade-in duration-300"
      />
      <div className={`w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-20 flex flex-col justify-between shrink-0 shadow-2xl animate-in ${ANIMATION_TRANSITIONS} ${
        isRtl ? 'slide-in-from-left-4 left-0 border-r md:border-r-0 md:border-l' : 'slide-in-from-right-4 right-0 border-l md:border-l-0 md:border-r'
      } absolute md:relative h-full`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-955 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500 animate-spin" />
            <h4 className="font-extrabold text-xs">{isRtl ? 'تتبع خط المعالجة' : 'NLU Tool Trace Console'}</h4>
          </div>
          <button onClick={() => setShowTracePanel(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">{isRtl ? 'خطوات التحليل' : 'Step Execution Logs'}</span>
            <div className="p-3 bg-slate-950 text-slate-300 dark:text-slate-350 rounded-xl space-y-2 border border-slate-800 text-[10px]">
              {traceSteps.map((step, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className={step.colorClass}>⚡ [{step.step}] {step.intent}</p>
                  {step.details && <p className="text-slate-500">{step.details}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[7.5px] text-slate-400 font-semibold block">{isRtl ? 'زمن الاستجابة' : 'Latency'}</span>
              <strong className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 block">640ms</strong>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-955 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[7.5px] text-slate-400 font-semibold block">{isRtl ? 'التكلفة الكلية' : 'Tokens'}</span>
              <strong className="text-xs font-black text-purple-500 mt-0.5 block">844 Tkn</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-[9.5px]">
            <span className="text-[8px] uppercase font-bold text-slate-400 block">{isRtl ? 'حالة موصلات المؤسسة' : 'ERP Connector Status'}</span>
            <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800 pb-1">
              <span>SAP ERP Link:</span>
              <span className="text-emerald-500 font-bold">STABLE</span>
            </div>
            <div className="flex justify-between">
              <span>Stripe Gateway:</span>
              <span className="text-emerald-500 font-bold">CONNECTED</span>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[8.5px] text-slate-400 text-center font-mono">
          mPaaS telemetry secure.
        </div>
      </div>
    </>
  );
});
