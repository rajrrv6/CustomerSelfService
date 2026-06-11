'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { MessageSquare, Clock, Paperclip } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface MessageNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function MessageNode({ id, data, selected }: MessageNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const text = isAr
    ? data.config.messageAr || data.config.messageEn
    : data.config.messageEn || data.config.messageAr;
  const delay = data.config.typingDelayMs || 0;
  const attachmentsCount = data.config.attachments?.length || 0;

  return (
    <BaseNode
      id={id}
      type="message"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={MessageSquare}
      colorClass="slate"
      inputs={[{ id: 'input' }]}
      outputs={[{ id: 'output' }]}
    >
      <div className="space-y-2 text-[10px] leading-relaxed">
        <p className="font-medium text-slate-700 dark:text-slate-200 line-clamp-2 italic">
          &quot;{text || (isAr ? 'لم يتم كتابة رسالة' : 'No message set')}&quot;
        </p>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[9px]">
          {delay > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500 shrink-0" />
              <span>{delay}ms</span>
            </span>
          )}
          {attachmentsCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{attachmentsCount} files</span>
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
