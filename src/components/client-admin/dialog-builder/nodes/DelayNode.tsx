'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { Clock } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface DelayNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function DelayNode({ id, data, selected }: DelayNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const seconds = data.config.delaySeconds || 0;

  return (
    <BaseNode
      id={id}
      type="delay"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={Clock}
      colorClass="amber"
      inputs={[{ id: 'input' }]}
      outputs={[{ id: 'output' }]}
    >
      <div className="space-y-1 text-[10px]">
        <span className="text-[9px] text-slate-400 font-mono font-bold block">{isAr ? 'تأخير زمني مؤقت' : 'Workflow Pause'}</span>
        <p className="font-bold font-mono text-slate-700 dark:text-slate-300">
          {isAr ? `الانتظار لمدة ${seconds} ثوانٍ` : `Hold session for ${seconds} seconds`}
        </p>
      </div>
    </BaseNode>
  );
}
