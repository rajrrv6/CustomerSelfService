'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { Power } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { Badge } from '@/components/shared/BadgeSystem';

interface EndNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function EndNode({ id, data, selected }: EndNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const text = isAr
    ? data.config.endMessageAr || data.config.endMessageEn
    : data.config.endMessageEn || data.config.endMessageAr;
  const triggerCSAT = data.config.triggerCSAT || false;

  return (
    <BaseNode
      id={id}
      type="end"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={Power}
      colorClass="red"
      inputs={[{ id: 'input' }]}
      outputs={[]} // Terminal node
    >
      <div className="space-y-2 text-[10px] leading-relaxed">
        <p className="font-semibold text-slate-500 italic truncate" title={text}>
          &quot;{text || (isAr ? 'تم إنهاء الحوار' : 'Session complete')}&quot;
        </p>

        {triggerCSAT && (
          <div>
            <Badge type="success">
              {isAr ? 'تقييم رضا العملاء CSAT' : 'Trigger CSAT'}
            </Badge>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
