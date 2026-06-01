'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { Search } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface KnowledgeSearchNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function KnowledgeSearchNode({ id, data, selected }: KnowledgeSearchNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const source = data.config.kbSource || 'General FAQ';
  const confidence = data.config.kbMinConfidence || 0.75;

  const outputs = [
    { id: 'found', label: isAr ? 'تم العثور' : 'Found' },
    { id: 'not_found', label: isAr ? 'لم يتم العثور' : 'Not Found' }
  ];

  return (
    <BaseNode
      id={id}
      type="knowledge_search"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={Search}
      colorClass="emerald"
      inputs={[{ id: 'input' }]}
      outputs={outputs}
    >
      <div className="space-y-1.5 text-[10px] leading-relaxed">
        <div>
          <span className="text-[9px] text-slate-400 font-mono font-bold block">{isAr ? 'مصدر قاعدة المعرفة RAG' : 'RAG Knowledge Source'}</span>
          <span className="font-bold text-emerald-650 dark:text-emerald-400 truncate block font-sans" title={source}>{source}</span>
        </div>

        <div className="font-mono text-[9px] text-slate-400 font-bold">
          Confidence threshold: {Math.round(confidence * 100)}%
        </div>
      </div>
    </BaseNode>
  );
}
