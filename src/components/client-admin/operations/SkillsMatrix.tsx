'use client';

import React from 'react';
import { Sliders } from 'lucide-react';

interface AgentItem {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  activeChatsCount: number;
  maxChatsCount: number;
  csatScore: number;
  resolvedTicketsCount: number;
  lastActive: string;
}

interface SkillsMatrixProps {
  lang: 'en' | 'ar';
  agents: AgentItem[];
  agentSkillsMap: Record<string, string[]>;
  availableSkills: string[];
  onToggleAgentSkill: (agentId: string, skill: string) => void;
}

export function SkillsMatrix({
  lang,
  agents,
  agentSkillsMap,
  availableSkills,
  onToggleAgentSkill
}: SkillsMatrixProps) {
  const isRtl = lang === 'ar';

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
      <div>
        <h4 className="font-bold text-xs text-slate-850 dark:text-white flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-blue-500" />
          <span>{isRtl ? 'مصفوفة إسناد المهارات المتخصصة' : 'Skills & Channel Competence Assignment Matrix'}</span>
        </h4>
        <p className="text-[10px] text-slate-505 dark:text-slate-400 mt-1 font-normal">
          {isRtl
            ? 'حدد المهارات التقنية الموجهة للوكلاء ليتسنى للنظام فرز وتوجيه المحادثات الذاتية بدقة.'
            : 'Check capability nodes per agent to dynamically bind context-based routing locks.'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse text-start">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase font-mono font-bold">
              <th className="py-2 text-start font-bold">{isRtl ? 'اسم الوكيل' : 'Agent'}</th>
              {availableSkills.map((skill) => (
                <th key={skill} className="py-2 px-1 text-center font-bold font-mono text-[9px] max-w-[80px] break-words">
                  {skill}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {agents.map((agent) => {
              const skills = agentSkillsMap[agent.id] || [];
              return (
                <tr key={agent.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                  <td className="py-3 font-semibold text-slate-850 dark:text-slate-200">{agent.name}</td>
                  {availableSkills.map((skill) => {
                    const checked = skills.includes(skill);
                    return (
                      <td key={skill} className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleAgentSkill(agent.id, skill)}
                          className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-550 bg-transparent h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
