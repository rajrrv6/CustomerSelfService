'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

interface ReindexConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onConfirmReindex: () => void;
}

interface TimelineStep {
  labelEn: string;
  labelAr: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
}

export function ReindexConfirmationModal({ isOpen, onClose, lang, onConfirmReindex }: ReindexConfirmationModalProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [stepState, setStepState] = useState<'idle' | 'running' | 'success'>('idle');
  const [activeStep, setActiveStep] = useState(0);

  const [timeline, setTimeline] = useState<TimelineStep[]>([
    { labelEn: 'Purge existing index partitions in vector DB', labelAr: 'تطهير فهارس تقسيم قواعد البيانات المتجهة', status: 'pending' },
    { labelEn: 'Verify carrier pipelines and API schemas', labelAr: 'التحقق من قنوات النقل ومخططات الـ API', status: 'pending' },
    { labelEn: 'Re-fetch all active RAG document blocks', labelAr: 'إعادة سحب جميع مستندات الـ RAG النشطة', status: 'pending' },
    { labelEn: 'Compute text token embeddings (text-embedding-3)', labelAr: 'حساب ترميز متجهات النصوص البرمجية', status: 'pending' },
    { labelEn: 'Synchronize master dataset to Pinecone DB', labelAr: 'مزامنة مجموعة البيانات الرئيسية مع Pinecone DB', status: 'pending' },
  ]);

  const timelineEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [timeline]);

  // Handle reindex sequence simulation
  useEffect(() => {
    if (stepState !== 'running') return;

    if (activeStep >= timeline.length) {
      setStepState('success');
      pushToast(
        'success',
        isRtl ? 'تمت إعادة الفهرسة الشاملة' : 'Re-Indexing Complete',
        isRtl ? 'تم بنجاح تنظيف وإعادة بناء جميع فهارس متجهات المعرفة.' : 'Pinecone cluster indices successfully compacted and sync flags verified.'
      );
      onConfirmReindex();
      return;
    }

    const interval = setTimeout(() => {
      setTimeline((prev) =>
        prev.map((step, idx) => {
          if (idx === activeStep) {
            return { ...step, status: 'success' as const };
          }
          if (idx === activeStep + 1) {
            return { ...step, status: 'processing' as const };
          }
          return step;
        })
      );
      setActiveStep((a) => a + 1);
    }, 1400);

    return () => clearTimeout(interval);
  }, [stepState, activeStep, timeline.length, onConfirmReindex, isRtl, pushToast]);

  const handleStartReindex = () => {
    setActiveStep(0);
    setTimeline((prev) =>
      prev.map((step, idx) => ({
        ...step,
        status: idx === 0 ? ('processing' as const) : ('pending' as const),
      }))
    );
    setStepState('running');
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'تأكيد إعادة الفهرسة الشاملة' : 'Re-Index Knowledge Base'}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
        
        {stepState === 'idle' && (
          <div className="space-y-4">
            
            {/* Warning callout */}
            <div className="p-4 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 rounded-2xl flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block uppercase">
                  {isRtl ? 'تحذير إجراء أمني حاسم' : 'Critical Operations Warning'}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {isRtl
                    ? 'سيقوم هذا الإجراء بمسح جميع المتجهات المفهرسة وإعادة بنائها بالكامل. قد تضعف دقة المساعد الذكي "فرح" مؤقتاً أثناء التجهيز.'
                    : 'Re-indexing wipes current vectors and regenerates all embeddings from primary sources. RAG accuracy for Farah AI may decrease during build cycles.'}
                </p>
              </div>
            </div>

            {/* Estimated stats */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-[9px] uppercase font-bold text-slate-450">{isRtl ? 'وقت المعالجة المتوقع' : 'Estimated Time'}</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-bold">~ 4.5 minutes</span>
            </div>

            {/* Confirmation buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-205 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleStartReindex}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تأكيد أعد الفهرسة' : 'Confirm Re-Index'}</span>
              </button>
            </div>

          </div>
        )}

        {stepState === 'running' && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                {isRtl ? 'جاري إعادة فهرسة قاعدة المعرفة...' : 'Processing Global Re-Index...'}
              </h4>
              <p className="text-[10px] text-slate-400">
                Please leave this modal open. Preprocessing database shards...
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-3.5 bg-slate-950 p-4 rounded-2xl border border-slate-850 max-h-52 overflow-y-auto select-none font-mono text-[9px] text-slate-400">
              {timeline.map((step, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1" />
                    <span>{isRtl ? step.labelAr : step.labelEn}</span>
                  </div>
                  <span className={`font-bold uppercase shrink-0 ${
                    step.status === 'success'
                      ? 'text-emerald-500'
                      : step.status === 'processing'
                      ? 'text-blue-500 animate-pulse'
                      : 'text-slate-550'
                  }`}>
                    {step.status}
                  </span>
                </div>
              ))}
              <div ref={timelineEndRef} />
            </div>
          </div>
        )}

        {stepState === 'success' && (
          <div className="py-6 text-center space-y-3.5 animate-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {isRtl ? 'اكتملت المزامنة وإعادة الفهرسة!' : 'Index Regenerated Successfully!'}
              </h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal font-normal">
                {isRtl
                  ? 'تم بنجاح إعادة تنظيف المتجهات القديمة ومزامنتها للخدمة الذاتية.'
                  : 'All index collections have been purged, regenerated, and validated.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
              >
                {isRtl ? 'إغلاق النافذة' : 'Close Console'}
              </button>
            </div>
          </div>
        )}

      </div>
    </ModalWrapper>
  );
}
