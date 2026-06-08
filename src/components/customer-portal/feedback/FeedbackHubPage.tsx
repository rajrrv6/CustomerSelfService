import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CsatSurveyWidget } from './CsatSurveyWidget';
import { NpsSurveyWidget } from './NpsSurveyWidget';
import { CallbackQueueCard } from './CallbackQueueCard';

interface FeedbackHubPageProps {
  lang: 'en' | 'ar';
  onBack: () => void;
  pushToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export function FeedbackHubPage({ lang, onBack, pushToast }: FeedbackHubPageProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {lang === 'ar' ? 'مركز التقييمات والدعم' : 'Customer Feedback & Queue Center'}
          </h2>
          <span className="text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5">
            {lang === 'ar'
              ? 'عينة تفاعلية لتجربة الاستبيانات وحجز الاتصال الصوتي.'
              : 'Interactive playground for CSAT, NPS, and real-time voice callback simulations.'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* CSAT Column */}
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
            {lang === 'ar' ? 'استطلاع رضا العملاء (CSAT)' : 'CSAT Survey Widget'}
          </span>
          <CsatSurveyWidget
            lang={lang}
            onToastTrigger={pushToast}
          />
        </div>

        {/* NPS Column */}
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
            {lang === 'ar' ? 'مؤشر الترويج الصافي (NPS)' : 'NPS Recommendation Widget'}
          </span>
          <NpsSurveyWidget
            lang={lang}
            onToastTrigger={pushToast}
          />
        </div>

        {/* Callback Queue Card Column */}
        <div className="space-y-3">
          <span className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
            {lang === 'ar' ? 'طابور الاتصال النشط' : 'Active Callback Queue'}
          </span>
          <CallbackQueueCard
            lang={lang}
            phoneNumber="+966 50 882 1993"
            initialPosition={4}
            onToastTrigger={pushToast}
          />
        </div>
      </div>
    </div>
  );
}
