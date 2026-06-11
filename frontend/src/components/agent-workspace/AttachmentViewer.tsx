import React from 'react';
import { FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  type: 'image' | 'pdf' | 'doc' | 'generic';
}

interface AttachmentViewerProps {
  attachments: Attachment[];
  lang: 'en' | 'ar';
}

export function AttachmentViewer({ attachments, lang }: AttachmentViewerProps) {
  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAriaLabel = (att: Attachment): string => {
    const fileTypeStr = {
      image: lang === 'ar' ? 'صورة' : 'Image',
      pdf: 'PDF',
      doc: lang === 'ar' ? 'مستند' : 'Document',
      generic: lang === 'ar' ? 'ملف' : 'File'
    }[att.type] || (lang === 'ar' ? 'ملف' : 'File');

    return lang === 'ar'
      ? `${fileTypeStr}: ${att.name} (${formatFileSize(att.sizeBytes)})`
      : `${fileTypeStr}: ${att.name} (${formatFileSize(att.sizeBytes)})`;
  };

  return (
    <div 
      className="mt-2.5 space-y-2 max-w-full"
      role="group"
      aria-label={lang === 'ar' ? 'المرفقات' : 'Attachments'}
    >
      {attachments.map((att) => {
        const isImage = att.type === 'image';
        const formattedSize = formatFileSize(att.sizeBytes);

        if (isImage) {
          return (
            <div
              key={att.id}
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group max-w-sm"
              role="img"
              aria-label={getAriaLabel(att)}
            >
              {/* Image element with responsive layout */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.url}
                alt={att.name}
                className="w-full max-h-48 object-cover transition-transform group-hover:scale-105 duration-350"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={lang === 'ar' ? `عرض الصورة الكاملة ${att.name}` : `View full image ${att.name}`}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={att.url}
                  download={att.name}
                  aria-label={lang === 'ar' ? `تحميل الصورة ${att.name}` : `Download image ${att.name}`}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <div className="p-2 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] flex justify-between items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-xs">{att.name}</span>
                <span className="font-mono text-slate-450 dark:text-slate-500 shrink-0">{formattedSize}</span>
              </div>
            </div>
          );
        }

        // Document or generic file card
        return (
          <div
            key={att.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs gap-3 max-w-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-rose-500/10 dark:bg-rose-500/5 rounded-lg shrink-0">
                <FileText className="w-5 h-5 text-rose-500 shrink-0" />
              </div>
              <div className="text-start min-w-0">
                <span 
                  className="font-bold block text-xs text-slate-800 dark:text-slate-200 truncate select-all"
                  style={{ maxWidth: '180px' }}
                  title={att.name}
                >
                  {att.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                  {formattedSize} • {att.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </span>
              </div>
            </div>
            <a
              href={att.url}
              download={att.name}
              aria-label={lang === 'ar' ? `تحميل الملف ${att.name}` : `Download file ${att.name}`}
              className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-[11px] font-bold"
            >
              <Download className="w-4 h-4 shrink-0" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
