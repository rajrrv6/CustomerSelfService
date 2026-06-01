'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { Sliders } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface VariableSetNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function VariableSetNode({ id, data, selected }: VariableSetNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const key = data.config.variableKey || 'not_set';
  const val = data.config.variableValue || '';

  return (
    <BaseNode
      id={id}
      type="variable_set"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={Sliders}
      colorClass="slate"
      inputs={[{ id: 'input' }]}
      outputs={[{ id: 'output' }]}
    >
      <div className="space-y-1 text-[10px] leading-relaxed">
        <span className="text-[9px] text-slate-400 font-mono font-bold block">{isAr ? 'تعيين قيمة المتغير' : 'Set Local Variable'}</span>
        <div className="font-mono text-[9.5px] font-bold text-slate-700 dark:text-slate-350 truncate">
          <span className="text-blue-650 dark:text-blue-400">{key}</span>
          <span className="mx-1 text-slate-400">=</span>
          <span className="text-slate-800 dark:text-slate-100">&quot;{val}&quot;</span>
        </div>
      </div>
    </BaseNode>
  );
}
