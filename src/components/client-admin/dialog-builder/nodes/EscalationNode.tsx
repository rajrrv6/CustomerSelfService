'use client';

import React from 'react';
import { BaseNode } from './BaseNode';
import { DialogNode } from '../types';
import { ShieldAlert } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { Badge } from '@/components/shared/BadgeSystem';

interface EscalationNodeProps {
  id: string;
  data: DialogNode['data'];
  selected: boolean;
}

export function EscalationNode({ id, data, selected }: EscalationNodeProps) {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const queue = data.config.escalationQueue || 'General Queue';
  const priority = data.config.escalationPriority || 'medium';
  const severity = data.config.escalationSeverity || 3;

  return (
    <BaseNode
      id={id}
      type="escalation"
      labelEn={data.labelEn}
      labelAr={data.labelAr}
      selected={selected}
      icon={ShieldAlert}
      colorClass="red"
      inputs={[{ id: 'input' }]}
      outputs={[]} // Terminal node
    >
      <div className="space-y-2 text-[10px] leading-relaxed">
        <div>
          <span className="text-[9px] text-slate-400 font-mono font-bold block">{isAr ? 'طابور التصعيد المستهدف' : 'SLA Routing Queue'}</span>
          <span className="font-bold text-red-655 dark:text-red-400 font-sans">{queue}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge type={priority}>{priority}</Badge>
          <span className="text-[9px] font-mono text-slate-400 font-bold">
            Severity: {severity}/5
          </span>
        </div>
      </div>
    </BaseNode>
  );
}
