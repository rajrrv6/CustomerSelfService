'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface CsatSurveyWidgetProps {
  lang: 'en' | 'ar';
  onComplete?: (rating: number, comment: string, tags: string[]) => void;
  onToastTrigger?: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

const sentimentEmojis = [
  { rating: 1, emoji: '😠', labelEn: 'Angry', labelAr: 'غاضب' },
  { rating: 2, emoji: '🙁', labelEn: 'Sad', labelAr: 'مستاء' },
  { rating: 3, emoji: '😐', labelEn: 'Neutral', labelAr: 'محايد' },
  { rating: 4, emoji: '🙂', labelEn: 'Happy', labelAr: 'سعيد' },
  { rating: 5, emoji: '😁', labelEn: 'Delighted', labelAr: 'مبتهج' }
];

const serviceCategories = [
  { id: 'agent_helpfulness', labelEn: 'Agent Helpfulness', labelAr: 'مساعدة الوكيل' },
  { id: 'response_time', labelEn: 'Response Speed', labelAr: 'سرعة الاستجابة' },
  { id: 'resolution_quality', labelEn: 'Resolution Quality', labelAr: 'جودة الحل' },
  { id: 'ai_accuracy', labelEn: 'AI Bot Accuracy', labelAr: 'دقة المساعد الذكي' },
  { id: 'interface_ease', labelEn: 'Portal Interface', labelAr: 'سهولة البوابة' }
];

export function CsatSurveyWidget({ lang, onComplete, onToastTrigger }: CsatSurveyWidgetProps) {
  const isRtl = lang === 'ar';
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const activeRating = hoverRating || rating;
  const currentSentiment = sentimentEmojis.find(s => s.rating === activeRating);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      if (onToastTrigger) {
        onToastTrigger('error', isRtl ? 'مطلوب تقييم' : 'Rating Required', isRtl ? 'يرجى تحديد تصنيف النجوم قبل تقديم التقييم.' : 'Please select a star rating before submitting.');
      }
      return;
    }

    setSubmitState('submitting');
    
    // Simulate submission latency
    setTimeout(() => {
      if (simulateFailure) {
        setSubmitState('error');
        if (onToastTrigger) {
          onToastTrigger('error', isRtl ? 'فشل إرسال التقييم' : 'Submission Failed', isRtl ? 'حدث خطأ في الشبكة أثناء إرسال التقييم.' : 'A simulated network timeout occurred.');
        }
      } else {
        setSubmitState('success');
        if (onToastTrigger) {
          onToastTrigger('success', isRtl ? 'شكراً لتقييمك' : 'Survey Submitted', isRtl ? `تم تسجيل تقييم رضا العملاء بنجاح: ${rating}/5` : `CSAT feedback registered successfully: ${rating}/5 stars.`);
        }
        if (onComplete) {
          onComplete(rating, comment, selectedTags);
        }
      }
    }, 1200);
  };

  if (submitState === 'success') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-3.5 shadow-md max-w-sm mx-auto animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 animate-bounce" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-slate-850 dark:text-white">
            {isRtl ? 'تم إرسال تقييم رضاك بنجاح!' : 'CSAT Survey Submitted!'}
          </h4>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal">
            {isRtl ? 'شكراً لك. نحن نقدر ملاحظاتك لتحسين جودة خدمتنا باستمرار.' : 'Thank you. We appreciate your feedback to continuously improve our support experience.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md max-w-sm mx-auto space-y-5 text-xs font-semibold">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          {isRtl ? 'كيف تقيم محادثتك اليوم؟' : 'Rate Your Conversation'}
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">
          {isRtl ? 'يرجى تقديم تقييم سريع لمساعدتنا على تحسين الخدمة.' : 'Please take a moment to rate our customer service support.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sentiment and Rating selector */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onMouseEnter={() => setHoverRating(num)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(num)}
                className="p-1 focus:outline-none transition-all hover:scale-110 active:scale-90"
              >
                <Star 
                  className={`w-7 h-7 transition-colors ${
                    activeRating >= num 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>

          {currentSentiment && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-full animate-fade-in">
              <span className="text-base select-none">{currentSentiment.emoji}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                {isRtl ? currentSentiment.labelAr : currentSentiment.labelEn}
              </span>
            </div>
          )}
        </div>

        {/* Category tags */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
            {isRtl ? 'ما الذي نال إعجابك أكثر؟' : 'What went well?'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {serviceCategories.map((cat) => {
              const selected = selectedTags.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleTag(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                    selected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {isRtl ? cat.labelAr : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional text comment */}
        <div className="space-y-1.5">
          <label htmlFor="csat-comment" className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
            {isRtl ? 'ملاحظات إضافية (اختياري):' : 'Additional Feedback (Optional):'}
          </label>
          <textarea
            id="csat-comment"
            rows={3}
            placeholder={isRtl ? 'أخبرنا المزيد عن تجربتك...' : 'Tell us what we can do better...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Realism toggler: simulate API error */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 select-none">
          <span className="text-[9px] text-slate-400 font-mono font-medium">SIMULATE NET TIMEOUT</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox"
              checked={simulateFailure}
              onChange={() => setSimulateFailure(!simulateFailure)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
          </label>
        </div>

        {submitState === 'error' && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-2 text-[10px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div className="flex-1 leading-normal font-semibold">
              {isRtl ? 'حدث فشل في الشبكة. يرجى المحاولة مرة أخرى.' : 'Network connection timed out. Please try again.'}
            </div>
            <button
              type="button"
              onClick={() => setSubmitState('idle')}
              className="px-2 py-0.5 bg-rose-500 text-white rounded font-bold uppercase hover:bg-rose-650"
            >
              Retry
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="w-full py-2.5 bg-blue-650 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98]"
        >
          {submitState === 'submitting' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جاري الإرسال...' : 'Submitting...'}</span>
            </>
          ) : (
            <span>{isRtl ? 'إرسال التقييم' : 'Submit Feedback'}</span>
          )}
        </button>
      </form>
    </div>
  );
}
