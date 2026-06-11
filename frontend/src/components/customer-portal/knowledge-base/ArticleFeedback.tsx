'use client';

import React, { useState } from 'react';
import { CheckCircle, Star, ThumbsDown, ThumbsUp, MessageSquare, Send, X } from 'lucide-react';
import {
  FOCUS_RING, FOCUS_RING_SUCCESS, FOCUS_RING_DANGER, FOCUS_RING_WARNING, FOCUS_RING_NEUTRAL,
  SURFACE_PANEL, TINT_SUCCESS, TINT_INFO
} from '@/design-system/tokens';

interface ArticleFeedbackProps {
  articleId: string;
  isRtl?: boolean;
  feedbackGiven?: 'up' | 'down' | null;
  onFeedback: (id: string, type: 'up' | 'down') => void;
}

export function ArticleFeedback({
  articleId,
  isRtl = false,
  feedbackGiven,
  onFeedback
}: ArticleFeedbackProps) {
  const [starRating, setStarRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleThumbsFeedback = (type: 'up' | 'down') => {
    onFeedback(articleId, type);
    if (type === 'down') setShowCommentBox(true);
  };

  const handleStarClick = (rating: number) => {
    setStarRating(rating);
    if (rating <= 2) setShowCommentBox(true);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentSubmitted(true);
    setComment('');
    setShowCommentBox(false);
  };

  // Full thank-you state (both thumbs feedback + comment submitted)
  if (feedbackGiven && commentSubmitted) {
    return (
      <div
        className={`p-5 rounded-3xl flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${TINT_SUCCESS}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {isRtl ? 'شكراً على ملاحظاتك!' : 'Thank you for your feedback!'}
          </p>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 leading-relaxed">
            {isRtl
              ? 'سيساعد ذلك فريقنا على تحسين مستوى التوثيق.'
              : 'Your input helps our team improve documentation quality.'}
          </p>
        </div>
      </div>
    );
  }

  // Partial feedback recorded (thumbs given, no comment yet)
  if (feedbackGiven && !showCommentBox) {
    return (
      <div
        className={`p-5 rounded-3xl flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${TINT_INFO}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="p-2 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
            {isRtl ? 'تم تسجيل رأيك!' : 'Feedback recorded!'}
          </p>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
            {isRtl ? 'هل تريد إضافة ملاحظة إضافية؟' : 'Would you like to add a note?'}
          </p>
          <button
            type="button"
            onClick={() => setShowCommentBox(true)}
            className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline focus-visible:outline-none focus-visible:underline"
          >
            <MessageSquare className="w-3 h-3" />
            {isRtl ? 'إضافة تعليق' : 'Add a comment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-3xl space-y-4 ${SURFACE_PANEL}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Heading */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
          {isRtl ? 'هل كانت هذه المقالة مفيدة؟' : 'Was this article helpful?'}
        </span>
      </div>

      {/* Thumbs + Stars row */}
      {!feedbackGiven && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Thumbs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleThumbsFeedback('up')}
              className={`flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/8 border border-emerald-500/25 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all duration-200 text-[11px] font-bold cursor-pointer ${FOCUS_RING_SUCCESS}`}
              aria-label={isRtl ? 'مفيدة — نعم' : 'Helpful — Yes'}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {isRtl ? 'نعم' : 'Yes'}
            </button>
            <button
              type="button"
              onClick={() => handleThumbsFeedback('down')}
              className={`flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all duration-200 text-[11px] font-bold cursor-pointer ${FOCUS_RING_DANGER}`}
              aria-label={isRtl ? 'مفيدة — لا' : 'Helpful — No'}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {isRtl ? 'لا' : 'No'}
            </button>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Star rating */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold me-0.5">
              {isRtl ? 'التقييم:' : 'Rate:'}
            </span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStarClick(s)}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                className={`transition-transform duration-100 hover:scale-125 active:scale-95 rounded-sm cursor-pointer ${FOCUS_RING_WARNING}`}
                aria-label={`${s} star${s !== 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-4 h-4 transition-colors duration-100 ${
                    s <= (hoveredStar || starRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </button>
            ))}
            {starRating > 0 && (
              <span className="text-[10px] text-amber-500 font-bold font-mono ms-1">
                {starRating}/5
              </span>
            )}
          </div>
        </div>
      )}

      {/* Comment box — animated slide in */}
      {showCommentBox && (
        <form
          onSubmit={handleCommentSubmit}
          className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">
              {isRtl ? 'أخبرنا ما الذي يمكن تحسينه' : 'Tell us what could be improved'}
            </label>
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className={`text-slate-400 hover:text-slate-600 transition-colors rounded cursor-pointer ${FOCUS_RING_NEUTRAL}`}
              aria-label={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={
              isRtl
                ? 'مثال: المعلومات غير محدّثة، ينقصها خطوات واضحة...'
                : 'e.g., Information is outdated, missing clear steps...'
            }
            className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-350 dark:placeholder:text-slate-600 transition-all ${FOCUS_RING}`}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className={`px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer ${FOCUS_RING_NEUTRAL}`}
            >
              {isRtl ? 'تخطي' : 'Skip'}
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              className={`flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-[11px] transition-all shadow-sm cursor-pointer ${FOCUS_RING}`}
            >
              <Send className="w-3 h-3" />
              {isRtl ? 'إرسال' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ArticleFeedback;
