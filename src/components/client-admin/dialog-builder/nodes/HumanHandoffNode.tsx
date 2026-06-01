'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { UserCheck } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface HumanHandoffNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function HumanHandoffNode({ id, data, selected }: HumanHandoffNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const queue = data.config.handoffQueue || 'General Support Pool';
  const reason = isAr
    ? data.config.handoffReasonAr || data.config.handoffReasonEn
    : data.config.handoffReasonEn || data.config.handoffReasonAr;

  return (
    <BaseNode
      id={id}
      type="human_handoff"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={UserCheck}
      colorClass="blue"
      inputs={[{ id: 'input' }]}
      outputs={[]} // Terminal node
    >
      <div className="space-y-1.5 text-[10px] leading-relaxed">
        <div>
          <span className="text-[9px] text-slate-400 font-mono font-bold block">{isAr ? 'طابور تحويل العميل' : 'Agent Queue Target'}</span>
          <span className="font-bold text-blue-650 dark:text-blue-400 font-sans">{queue}</span>
        </div>
        {reason && (
          <p className="text-[9px] text-slate-500 truncate" title={reason}>
            {isAr ? 'السبب:' : 'Reason:'} &quot;{reason}&quot;
          </p>
        )}
      </div>
    </BaseNode>
  );
}
