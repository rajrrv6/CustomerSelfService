'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { BrainCircuit } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface IntentNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function IntentNode({ id, data, selected }: IntentNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const intentName = data.config.intentName || 'not_set';
  const utterances = data.config.utterances || [];

  return (
    <BaseNode
      id={id}
      type="intent"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={BrainCircuit}
      colorClass="blue"
      inputs={[{ id: 'input' }]}
      outputs={[{ id: 'output' }]}
    >
      <div className="space-y-1.5 text-[10px]">
        <div>
          <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wide block">Trigger Intent</span>
          <span className="font-bold text-blue-655 dark:text-blue-400 font-mono">#{intentName}</span>
        </div>

        {utterances.length > 0 && (
          <div>
            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Phrases count</span>
            <div className="flex flex-wrap gap-1 mt-1 font-mono text-[9px]">
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-500">
                {utterances.length} utterances
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
