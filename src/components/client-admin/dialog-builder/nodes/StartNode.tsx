'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { Play } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface StartNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function StartNode({ id, data, selected }: StartNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  return (
    <BaseNode
      id={id}
      type="start"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={Play}
      colorClass="blue"
      inputs={[]}
      outputs={[{ id: 'output' }]}
    >
      <div className="text-[10px] text-slate-400 font-mono flex flex-col gap-1 leading-normal">
        <span className="font-bold text-slate-600 dark:text-slate-350">
          {isAr ? 'بدء تدفق المحادثة الذكي' : 'Smart Chat Flow Entry'}
        </span>
        <span className="truncate">
          {isAr ? data.config.startMessageAr : data.config.startMessageEn}
        </span>
      </div>
    </BaseNode>
  );
}
