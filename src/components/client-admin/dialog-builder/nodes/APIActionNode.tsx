'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { Globe } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface APIActionNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function APIActionNode({ id, data, selected }: APIActionNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const method = data.config.apiMethod || 'GET';
  const url = data.config.apiUrl || 'https://api.example.com';

  const outputs = [
    { id: 'success', label: isAr ? 'نجاح (200)' : 'Success (200)' },
    { id: 'failure', label: isAr ? 'فشل' : 'Failure' }
  ];

  return (
    <BaseNode
      id={id}
      type="api_action"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={Globe}
      colorClass="emerald"
      inputs={[{ id: 'input' }]}
      outputs={outputs}
    >
      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
            method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
          }`}>
            {method}
          </span>
          <span className="text-slate-400 font-bold uppercase tracking-wide">REST API</span>
        </div>
        <p className="font-mono text-[9px] text-slate-500 dark:text-slate-400 truncate font-semibold" title={url}>
          {url}
        </p>
      </div>
    </BaseNode>
  );
}
