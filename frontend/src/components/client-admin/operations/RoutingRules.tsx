'use client';

import React from 'react';
import { GitBranch } from 'lucide-react';
import { Badge } from '@/components/shared/BadgeSystem';
import { OperationalCard } from '@/components/shared/OperationalCard';

export interface RoutingRule {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'skill' | 'language' | 'vip';
  ruleDescriptionEn: string;
  ruleDescriptionAr: string;
  enabled: boolean;
}

interface RoutingRulesProps {
  lang: 'en' | 'ar';
  routingRules: RoutingRule[];
  onToggleRule: (id: string) => void;
  canEdit: boolean;
  canManage: boolean;
}

export function RoutingRules({
  lang,
  routingRules,
  onToggleRule,
  canEdit,
  canManage
}: RoutingRulesProps) {
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="space-y-4">
        <h4 className="font-bold text-[11px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-mono">
          {isRtl ? 'محرك توجيه المحادثات الذكي' : 'Intelligent Dial & Conversation Routing Criteria Engine'}
        </h4>

        <div className="space-y-4">
          {routingRules.map((rule) => (
            <OperationalCard key={rule.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl shrink-0 h-11 w-11 flex items-center justify-center text-blue-500">
                  <GitBranch className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">
                      {isRtl ? rule.nameAr : rule.nameEn}
                    </h4>
                    <Badge type={rule.type === 'vip' ? 'warning' : rule.type === 'language' ? 'info' : 'success'}>
                      {rule.type.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                    {isRtl ? rule.ruleDescriptionAr : rule.ruleDescriptionEn}
                  </p>
                </div>
              </div>

              <label 
                className={`relative inline-flex items-center shrink-0 pt-1 ${!canEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title={!canEdit ? "Requires Edit Permission" : undefined}
              >
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  disabled={!canEdit}
                  onChange={() => {
                    if (!canEdit) return;
                    onToggleRule(rule.id);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
              </label>
            </OperationalCard>
          ))}
        </div>
      </div>
    </div>
  );
}
