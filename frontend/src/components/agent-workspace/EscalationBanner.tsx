import React from 'react';
import { AlertOctagon, Sparkles, CheckCircle, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationStore';

interface EscalationBannerProps {
  conversationId: string;
  lang: 'en' | 'ar';
}

export function EscalationBanner({ conversationId, lang }: EscalationBannerProps) {
  const isAr = lang === 'ar';
  const store = useConversationStore();
  const escalationState = store.escalationStates[conversationId];
  const recommendations = store.supervisorRecommendations[conversationId] || [];
  const resolve = store.resolveEscalation;
  const startTransfer = store.startTransfer;
  const startConsult = store.startSupervisorConsult;

  if (!escalationState || escalationState.status !== 'escalated') return null;

  return (
    <div
      className="p-4 bg-rose-50/90 dark:bg-rose-950/10 border-b border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-900 dark:text-rose-300 space-y-3 animate-in slide-in-from-top-4 duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" />
          <div>
            <strong className="text-sm font-extrabold block">
              {isAr
                ? `تنبيه تصعيد نشط: ${
                    escalationState.type === 'sla_breach'
                      ? 'انتهاك اتفاقية مستوى الخدمة (SLA)'
                      : escalationState.type === 'manager_request'
                      ? 'طلب مدير / مشرف'
                      : escalationState.type === 'sentiment_risk'
                      ? 'مخاطر استياء العميل'
                      : 'طلب دعم متقدم'
                  }`
                : `Active Escalation Alert: ${
                    escalationState.type === 'sla_breach'
                      ? 'SLA Target Breached'
                      : escalationState.type === 'manager_request'
                      ? 'Supervisor / Manager Request'
                      : escalationState.type === 'sentiment_risk'
                      ? 'Severe Sentiment/CSAT Risk'
                      : 'High Priority Issue'
                  }`}
            </strong>
            <p className="text-[10px] text-rose-700 dark:text-rose-450 opacity-90 mt-0.5">
              {isAr
                ? `تم تصعيد هذه المحادثة في ${escalationState.escalatedAt || 'الموعد المحدد'}`
                : `This conversation was escalated at ${escalationState.escalatedAt || 'scheduled time'}`}
            </p>
          </div>
        </div>

        {/* Quick Resolution button */}
        <button
          onClick={() => resolve(conversationId)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none shrink-0"
          aria-label={isAr ? 'حل التصعيد وإرجاع الحالة للوضع العادي' : 'Resolve escalation state'}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isAr ? 'حل التصعيد' : 'Resolve Escalation'}</span>
        </button>
      </div>

      {/* Supervisor Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-400 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'توصيات المشرف الذكية بالذكاء الاصطناعي' : 'Supervisor / Copilot Recommendations'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/45 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {rec.title}
                    </span>
                    <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/40 text-[9px] rounded-md font-mono font-bold text-rose-700">
                      {rec.confidence}%
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-2">
                  {rec.actionType === 'transfer' && (
                    <button
                      onClick={() => startTransfer(conversationId, 'q-vip', 'agent-3', 'Auto-routing suggestion applied.')}
                      className="px-2.5 py-1 border border-rose-200 hover:bg-rose-50/50 dark:border-rose-900 dark:hover:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg text-[10px] font-bold transition-all focus-visible:ring-1 focus-visible:ring-rose-500"
                    >
                      {isAr ? 'تنفيذ التحويل' : 'Apply Transfer'}
                    </button>
                  )}
                  {rec.actionType === 'consult' && (
                    <button
                      onClick={() => startConsult(conversationId, 'super-1', 'Auto-consultation recommendation applied.')}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all focus-visible:ring-1 focus-visible:ring-rose-500"
                    >
                      {isAr ? 'استشارة المشرف' : 'Consult Supervisor'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
