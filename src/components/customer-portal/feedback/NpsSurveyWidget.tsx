'use client';

import React, { useState } from 'react';
import { Send, RefreshCw, BarChart2 } from 'lucide-react';

interface NpsSurveyWidgetProps {
  lang: 'en' | 'ar';
  onComplete?: (score: number, comment: string) => void;
  onToastTrigger?: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export function NpsSurveyWidget({ lang, onComplete, onToastTrigger }: NpsSurveyWidgetProps) {
  const isRtl = lang === 'ar';

  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Realistic mock NPS distribution data
  const npsDistribution = {
    promoters: 76,  // 9-10
    passives: 16,   // 7-8
    detractors: 8   // 0-6
  };

  const getScoreCategory = (s: number) => {
    if (s >= 9) return { key: 'promoter', labelEn: 'Promoter', labelAr: 'مروج', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (s >= 7) return { key: 'passive', labelEn: 'Passive', labelAr: 'محايد', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { key: 'detractor', labelEn: 'Detractor', labelAr: 'ناقد', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  };

  const selectedCategory = score !== null ? getScoreCategory(score) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === null) {
      if (onToastTrigger) {
        onToastTrigger('error', isRtl ? 'مطلوب تحديد النتيجة' : 'Selection Required', isRtl ? 'يرجى تحديد درجة من 0 إلى 10 للتقييم.' : 'Please select a score from 0 to 10 before submitting.');
      }
      return;
    }

    setSubmitState('submitting');
    setTimeout(() => {
      setSubmitState('success');
      if (onToastTrigger) {
        onToastTrigger('success', isRtl ? 'شكراً لمشاركتك' : 'NPS Recorded', isRtl ? `تم تسجيل النتيجة بنجاح: ${score}/10` : `NPS Score of ${score}/10 recorded successfully.`);
      }
      if (onComplete) {
        onComplete(score, comment);
      }
    }, 1200);
  };

  if (submitState === 'success') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-md max-w-sm mx-auto animate-fade-in text-xs font-semibold">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Send className="w-5 h-5" />
        </div>
        
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-850 dark:text-white">
            {isRtl ? 'شكراً لتقييمك ومشاركتك!' : 'Thank you for your rating!'}
          </h4>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal font-normal">
            {isRtl ? 'تساعدنا درجات NPS على قياس ولاء العملاء وتوفير خدمات أفضل باستمرار.' : 'Net Promoter Scores help us evaluate customer satisfaction and improve our portal flows.'}
          </p>
        </div>

        {/* Analytics grouping overview */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5 text-left font-mono">
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span className="text-[9px] uppercase font-bold text-slate-450">{isRtl ? 'مؤشرات الرضا العامة' : 'Portal Satisfaction Metrics'}</span>
          </div>

          <div className="space-y-2 text-[10px]">
            {/* Promoters bar */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-emerald-650">
                <span>{isRtl ? 'المروجون (9-10)' : 'Promoters (9-10)'}</span>
                <span>{npsDistribution.promoters}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${npsDistribution.promoters}%` }} />
              </div>
            </div>

            {/* Passives bar */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-amber-500">
                <span>{isRtl ? 'المحايدون (7-8)' : 'Passives (7-8)'}</span>
                <span>{npsDistribution.passives}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${npsDistribution.passives}%` }} />
              </div>
            </div>

            {/* Detractors bar */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-rose-500">
                <span>{isRtl ? 'المنتقدون (0-6)' : 'Detractors (0-6)'}</span>
                <span>{npsDistribution.detractors}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${npsDistribution.detractors}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md max-w-sm mx-auto space-y-5 text-xs font-semibold">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          {isRtl ? 'ما مدى احتمالية ترشيحنا لصديق أو زميل؟' : 'Would you recommend us?'}
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal leading-normal">
          {isRtl 
            ? 'يرجى تحديد درجة من 0 (مستبعد جداً) إلى 10 (مؤكد جداً).'
            : 'Rate from 0 (Not likely at all) to 10 (Extremely likely).'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NPS Grid selector */}
        <div className="grid grid-cols-11 gap-1">
          {Array.from({ length: 11 }).map((_, i) => {
            const num = i;
            const active = score === num;
            
            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300';
            if (active) {
              if (num >= 9) btnStyle = 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-550/20';
              else if (num >= 7) btnStyle = 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-550/20';
              else btnStyle = 'bg-rose-550 border-rose-550 text-white shadow-sm shadow-rose-550/20';
            }

            return (
              <button
                key={num}
                type="button"
                onClick={() => setScore(num)}
                className={`w-full py-2.5 rounded-lg border font-mono text-[9px] font-bold flex items-center justify-center transition-all ${btnStyle}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Detractor / Promoter feedback indicator */}
        <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase font-mono tracking-wider px-1">
          <span>{isRtl ? 'غير محتمل على الإطلاق' : 'Not Likely At All'}</span>
          <span>{isRtl ? 'محتمل جداً وبشدة' : 'Extremely Likely'}</span>
        </div>

        {selectedCategory && (
          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] animate-fade-in font-bold uppercase tracking-wider font-mono ${selectedCategory.color}`}>
            <span>{isRtl ? 'تصنيف النتيجة:' : 'NPS segment:'}</span>
            <span>{isRtl ? selectedCategory.labelAr : selectedCategory.labelEn}</span>
          </div>
        )}

        {/* Detailed feedback text */}
        <div className="space-y-1.5">
          <label htmlFor="nps-comment" className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
            {isRtl ? 'ما هو السبب الرئيسي لاختيارك هذه الدرجة؟' : 'What is the main reason for your score?'}
          </label>
          <textarea
            id="nps-comment"
            rows={2.5}
            placeholder={isRtl ? 'يرجى تقديم تفاصيل إضافية...' : 'Please specify...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-850 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="w-full py-2.5 bg-blue-650 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98]"
        >
          {submitState === 'submitting' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جاري الحفظ...' : 'Saving Score...'}</span>
            </>
          ) : (
            <span>{isRtl ? 'إرسال التقييم' : 'Submit Score'}</span>
          )}
        </button>
      </form>
    </div>
  );
}
