'use client';

import React from 'react';
import { X, File, FileText } from 'lucide-react';
import { StagedAttachment } from '@/stores/conversationStore';

interface ComposerAttachmentPreviewProps {
  attachments: StagedAttachment[];
  onRemove: (id: string) => void;
  lang: 'en' | 'ar';
}

export function ComposerAttachmentPreview({
  attachments,
  onRemove,
  lang,
}: ComposerAttachmentPreviewProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className="flex flex-wrap gap-2.5 py-1.5 select-none"
      role="list"
      aria-label={lang === 'ar' ? 'الملفات المرفقة الجاهزة للإرسال' : 'Staged attachments'}
    >
      {attachments.map((file) => {
        const isImage = file.type === 'image';
        return (
          <div
            key={file.id}
            role="listitem"
            className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950 w-44 max-w-xs transition-all animate-in zoom-in-95 duration-200"
          >
            {isImage ? (
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-150 bg-slate-50 dark:border-slate-850">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {file.type === 'pdf' ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
              </div>
            )}

            <div className="min-w-0 flex-1 pr-6 rtl:pr-0 rtl:pl-6 text-[10px] leading-tight">
              <p className="truncate font-bold text-slate-800 dark:text-slate-200" title={file.name}>
                {file.name}
              </p>
              <p className="font-mono font-bold text-slate-400 mt-0.5">
                {formatSize(file.sizeBytes)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(file.id)}
              aria-label={
                lang === 'ar'
                  ? `إزالة ${file.name}`
                  : `Remove ${file.name}`
              }
              className="absolute top-1.5 end-1.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-655 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
