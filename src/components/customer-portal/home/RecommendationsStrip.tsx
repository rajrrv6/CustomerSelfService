'use client';

import React from 'react';
import { Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SURFACE_PANEL, INTERACTIVE_CARD, SUPPORT_MICRO_TRANSITION } from '@/design-system/tokens';
import type { RecommendationsStripProps } from './types';

export const RecommendationsStrip = React.memo(function RecommendationsStrip({
  onSelectRecommendation
}: RecommendationsStripProps) {
  const { lang } = useApp();

  const items = [
    {
      id: 'art-2',
      title: lang === 'ar' ? 'إعداد OAuth لموصلات بوابة العميل' : 'Setting Up OAuth for Client-Gate API Connectors',
      reason: lang === 'ar' ? 'بناءً على نشاط "Stripe 403"' : 'Based on "Stripe 403" activity',
      category: 'Developer APIs',
      confidence: 96
    },
    {
      id: 'art-4',
      title: lang === 'ar' ? 'التعامل مع تأخيرات تسليم بوابة الألياف البصرية' : 'Handling Fiber Gateway Delivery Delays',
      reason: lang === 'ar' ? 'بناءً على تذكرة الشحن الأخيرة' : 'Based on recent shipment ticket',
      category: 'Returns & Refunds',
      confidence: 89
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 py-0.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
          {lang === 'ar' ? 'توصيات فرح المخصصة لك' : 'AI Recommended Support Intel'}
        </span>
      </div>
      <div className="flex sm:grid sm:grid-cols-2 overflow-x-auto sm:overflow-x-visible gap-2 pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory">
        {items.map(rec => (
          <button
            key={rec.id}
            onClick={() => onSelectRecommendation(rec.id)}
            className={`flex items-start justify-between p-3 rounded-2xl text-left group shrink-0 w-[85%] sm:w-auto snap-start border border-slate-200/60 dark:border-slate-800/40 hover:border-blue-400/40 hover:shadow-md hover:-translate-y-0.5 shadow-sm ${SURFACE_PANEL} ${INTERACTIVE_CARD} ${SUPPORT_MICRO_TRANSITION}`}
            style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
              <div className="p-1.5 bg-blue-500/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[7.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.25 rounded uppercase font-mono tracking-wider shrink-0 select-none">
                    {lang === 'ar' ? 'فرح الذكي' : 'Farah AI'}
                  </span>
                  <span className="text-[7.5px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 py-0.25 rounded uppercase font-mono tracking-wider shrink-0 select-none">
                    {rec.confidence}% {lang === 'ar' ? 'تطابق' : 'Match'}
                  </span>
                </div>
                <span className="block text-[10.5px] font-extrabold text-slate-850 dark:text-white leading-snug line-clamp-2 whitespace-normal">
                  {rec.title}
                </span>
                <span className="text-[7.5px] text-slate-400 dark:text-slate-455 font-bold font-mono uppercase block leading-none">
                  {rec.reason}
                </span>
              </div>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-blue-500 shrink-0 rotate-180 group-hover:translate-x-0.5 transition-transform self-center" />
          </button>
        ))}
      </div>
    </div>
  );
});
