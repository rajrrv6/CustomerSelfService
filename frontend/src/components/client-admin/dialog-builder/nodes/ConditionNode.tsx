'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { GitBranch } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface ConditionNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function ConditionNode({ id, data, selected }: ConditionNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const conditions = data.config.conditions || [];

  // Generate output handles dynamically for BaseNode
  const outputs = [
    ...conditions.map((cond, idx) => ({
      id: cond.targetHandleId,
      label: isAr
        ? `${cond.variable} ${cond.operator.replace('_', ' ')} ${cond.value}`
        : `${cond.variable} ${cond.operator.replace('_', ' ')} ${cond.value}`
    })),
    {
      id: 'fallback',
      label: isAr ? 'خيار بديل' : 'Fallback'
    }
  ];

  return (
    <BaseNode
      id={id}
      type="condition"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={GitBranch}
      colorClass="amber"
      inputs={[{ id: 'input' }]}
      outputs={outputs}
    >
      <div className="space-y-1.5 text-[10px]">
        <div className="font-bold text-slate-500 font-mono uppercase tracking-wide">
          {isAr ? 'تقييم شروط التوجيه' : 'Evaluation Rules'}
        </div>
        {conditions.length === 0 ? (
          <p className="text-slate-400 italic font-medium leading-normal">
            {isAr ? 'لا يوجد شروط مضافة. سيتم سلك الخيار البديل مباشرة.' : 'No conditions set. Routing directly to Fallback.'}
          </p>
        ) : (
          <div className="space-y-1 font-mono text-[9px] font-bold text-slate-650 dark:text-slate-350">
            {conditions.map((cond, idx) => (
              <div key={cond.id} className="flex items-center gap-1 leading-normal border-b border-dashed border-slate-100 dark:border-slate-800 pb-0.5">
                <span className="text-blue-600 dark:text-blue-400">If:</span>
                <span className="truncate max-w-28 text-slate-700 dark:text-slate-300">{cond.variable}</span>
                <span className="text-amber-600 dark:text-amber-500">{cond.operator === 'equals' ? '=' : cond.operator === 'greater_than' ? '>' : cond.operator === 'less_than' ? '<' : 'match'}</span>
                <span className="truncate max-w-16 text-slate-850 dark:text-slate-100">{cond.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-slate-400 pt-0.5 leading-normal">
              <span>Else:</span>
              <span>Fallback</span>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
