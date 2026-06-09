'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';

interface SourceFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  onAddSource: (name: string, sizeBytes: number, type: 'pdf') => void;
}

interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'failed';
  chunks?: number;
}

export function SourceFileUploadModal({ isOpen, onClose, lang, onAddSource }: SourceFileUploadModalProps) {
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();
  
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Auto-advance upload simulations
  useEffect(() => {
    if (queue.length === 0) return;

    const interval = setInterval(() => {
      setQueue((prevQueue) => {
        let changed = false;
        const nextQueue = prevQueue.map((item) => {
          if (item.status === 'uploading') {
            changed = true;
            const nextProgress = item.progress + 20;
            if (nextProgress >= 100) {
              if (simulateFailure && item.name.includes('SLA')) {
                return { ...item, progress: 100, status: 'failed' as const };
              }
              return { ...item, progress: 100, status: 'processing' as const };
            }
            return { ...item, progress: nextProgress };
          }
          if (item.status === 'processing') {
            changed = true;
            // Finish processing and generate mock chunks
            const parsedChunks = Math.floor(25 + Math.random() * 80);
            return { ...item, status: 'success' as const, chunks: parsedChunks };
          }
          return item;
        });

        if (!changed) {
          clearInterval(interval);
        }
        return nextQueue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queue, simulateFailure]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const addMockFilesToQueue = (fileList: { name: string; size: number }[]) => {
    const newItems: UploadQueueItem[] = fileList.map((f) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.name.split('.').pop() || 'TXT',
      progress: 0,
      status: 'uploading',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    pushToast(
      'info',
      isRtl ? 'تمت إضافة الملفات للطابور' : 'Files Queued',
      isRtl ? `جاري بدء فحص وفهرسة ${fileList.length} ملفات.` : `Started index preprocessing for ${fileList.length} files.`
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArr = Array.from(e.dataTransfer.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      addMockFilesToQueue(filesArr);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArr = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      addMockFilesToQueue(filesArr);
    }
  };

  const handleRemove = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRetry = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'uploading', progress: 0 } : item))
    );
  };

  const handleAddToIndex = () => {
    const successItems = queue.filter((item) => item.status === 'success');
    if (successItems.length === 0) {
      pushToast(
        'error',
        isRtl ? 'لا توجد ملفات ناجحة' : 'No Successfully Ingested Files',
        isRtl ? 'يرجى الانتظار حتى اكتمال المعالجة أو حل المشاكل.' : 'Please wait for file preprocessing to finish.'
      );
      return;
    }

    successItems.forEach((item) => {
      onAddSource(item.name, item.size, 'pdf');
    });

    pushToast(
      'success',
      isRtl ? 'تم إرسال الملفات للفهرس' : 'Embeddings Generated',
      isRtl
        ? `تم بنجاح إضافة ${successItems.length} ملفات إلى قاعدة بيانات المتجهات.`
        : `Successfully generated vector embeddings for ${successItems.length} documents.`
    );
    setQueue([]);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'رفع ملفات المستندات' : 'Ingest Document Files'}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-5 text-xs font-semibold text-slate-800 dark:text-slate-200">
        
        {/* Drag Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 relative select-none ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-900/10'
              : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
          }`}
        >
          <input
            type="file"
            id="file-upload-input"
            multiple
            aria-label={isRtl ? 'رفع ملفات المستندات' : 'Upload Document Files'}
            accept=".pdf,.docx,.csv,.txt,.html"
            className="hidden"
            onChange={handleFileInput}
          />
          <UploadCloud className="w-10 h-10 text-blue-500 animate-pulse" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">
              {isRtl
                ? 'اسحب وأفلت مستنداتك هنا، أو انقر للتصفح'
                : 'Drag & drop documents here, or click to browse'}
            </p>
            <span className="text-[10px] text-slate-450 block">
              PDF, DOCX, CSV, TXT, HTML (Max 25MB per file)
            </span>
          </div>
          <label
            htmlFor="file-upload-input"
            className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95"
          >
            {isRtl ? 'اختر ملفات' : 'Browse Files'}
          </label>
        </div>

        {/* Realism Failure Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-2xl select-none">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Simulate Parse Failure</span>
            <span className="text-[9px] text-slate-400 font-mono font-medium block">
              Files containing "SLA" will trigger formatting validation faults
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              aria-label="Simulate Parse Failure"
              checked={simulateFailure}
              onChange={() => setSimulateFailure(!simulateFailure)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-3 rtl:peer-checked:after:-translate-x-3 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
          </label>
        </div>

        {/* Upload Queue */}
        {queue.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="font-mono text-[9px] font-bold text-slate-455 uppercase tracking-wide">
              {isRtl ? 'قائمة الملفات المعالجة' : 'File Ingestion Queue'}
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-4 font-mono text-[10px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-slate-400 shrink-0">
                          {(item.size / 1000).toFixed(1)} KB
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.status === 'failed'
                              ? 'bg-rose-500'
                              : item.status === 'success'
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                      {/* Detail Subtext */}
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                        {item.status === 'uploading' && <span>{isRtl ? 'جاري الرفع...' : `Uploading: ${item.progress}%`}</span>}
                        {item.status === 'processing' && (
                          <span className="text-blue-500 flex items-center gap-1">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            <span>{isRtl ? 'جاري تقسيم النص وفهرسته...' : 'Parsing Token Chunks...'}</span>
                          </span>
                        )}
                        {item.status === 'success' && (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>{isRtl ? `تم التقطيع: +${item.chunks} مقطع` : `Success: +${item.chunks} chunks generated`}</span>
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>{isRtl ? 'فشل التقطيع: تالف أو غير مدعوم' : 'Failed: Invalid file layout format'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {item.status === 'failed' && (
                      <button
                        type="button"
                        onClick={() => handleRetry(item.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 rounded-lg cursor-pointer"
                        title="Retry Ingestion"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
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
            disabled={queue.length === 0 || queue.every((x) => x.status !== 'success')}
            onClick={handleAddToIndex}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isRtl ? 'إضافة إلى قاعدة المعرفة' : 'Add to Vector Index'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
