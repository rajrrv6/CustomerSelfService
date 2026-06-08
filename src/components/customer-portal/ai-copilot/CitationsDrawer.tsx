import React from 'react';
import { Eye, X } from 'lucide-react';
import { CitationsDrawerProps } from './types';
import { ANIMATION_TRANSITIONS } from './constants';

export const CitationsDrawer = React.memo(function CitationsDrawer({
  isRtl,
  selectedCitation,
  setSelectedCitation
}: CitationsDrawerProps) {
  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div 
        onClick={() => setSelectedCitation(null)}
        className="md:hidden absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-25 animate-in fade-in duration-300"
      />
      <div className={`w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-20 flex flex-col justify-between shrink-0 shadow-2xl animate-in ${ANIMATION_TRANSITIONS} ${
        isRtl ? 'slide-in-from-left-4 left-0 border-r md:border-r-0 md:border-l' : 'slide-in-from-right-4 right-0 border-l md:border-l-0 md:border-r'
      } absolute md:relative h-full`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <h4 className="font-extrabold text-xs">{isRtl ? 'تفاصيل المرجع RAG' : 'RAG Source Citation'}</h4>
          </div>
          <button onClick={() => setSelectedCitation(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-55 bg-slate-50 dark:bg-slate-955 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">{isRtl ? 'العنوان' : 'Source Document'}</span>
            <p className="font-bold text-slate-900 dark:text-white">
              {selectedCitation === 'art-1' 
                ? (isRtl ? 'كيفية طلب استرداد اشتراك SaaS' : 'How to Request a SaaS Subscription Refund') 
                : (isRtl ? 'إعداد OAuth لموصلات Client-Gate' : 'Setting Up OAuth for Client-Gate API Connectors')}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">{isRtl ? 'الفقرة المسترجعة' : 'Matching Chunk Context'}</span>
            <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-normal leading-relaxed text-slate-600 dark:text-slate-400 rtl:leading-loose">
              {selectedCitation === 'art-1'
                ? (isRtl 
                  ? 'بموجب إرشادات اشتراك mPaaS القياسية، يكون عملاء الشركات مؤهلين لاسترداد الأموال بالكامل في غضون 30 يوماً من الشحن/التجديد إذا كانت معلمات الخدمة تقل عن مقاييس اتفاقية مستوى الخدمة المحددة.' 
                  : 'Under standard mPaaS subscription guidelines, corporate customers are eligible for a full refund within 30 days of shipment/renewal if the service tier parameters fall below stated SLA metrics.')
                : (isRtl 
                  ? 'تدعم موصلات بوابة العميل قواعد تفويض OAuth 2.0. لإنشاء ارتباط واجهة برمجة التطبيقات: قم بتوليد زوج اعتماد جديد في موصلات ERP بصفحة الإعدادات.' 
                  : 'Our client-gate connectors support OAuth 2.0 authorization rules. To establish an API link: Generate a new credentials pair inside ERP Connectors in Settings.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <span className="text-[8px] text-slate-400 font-semibold block">{isRtl ? 'نسبة التطابق' : 'Semantic Fit'}</span>
              <strong className="text-sm font-black text-emerald-500 font-mono mt-0.5 block">
                {selectedCitation === 'art-1' ? '94.2%' : '89.5%'}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <span className="text-[8px] text-slate-400 font-semibold block">{isRtl ? 'المستودع' : 'Vector Database'}</span>
              <strong className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
                Pinecone RAG
              </strong>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 dark:bg-slate-950/60">
          <button
            onClick={() => setSelectedCitation(null)}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-center text-xs focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-colors"
          >
            {isRtl ? 'إغلاق المرجع' : 'Close Citation'}
          </button>
        </div>
      </div>
    </>
  );
});
