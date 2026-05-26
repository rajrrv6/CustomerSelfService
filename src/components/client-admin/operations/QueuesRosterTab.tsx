'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';
import { Users, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export function QueuesRosterTab() {
  const { lang, agents } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Simulate grouping agents into distinct operational queues
  const tier1Agents = agents.slice(0, 3);
  const escalationAgents = agents.slice(3, 5);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.agents.title}
        description={t.clientAdmin.agents.description}
      />

      {/* Queue Health HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OperationalCard className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-l-4 border-l-blue-500">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Staffing</span>
            <p className="text-lg font-bold text-slate-800 dark:text-white font-mono leading-none mt-1">12/15</p>
          </div>
        </OperationalCard>
        
        <OperationalCard className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Avg Wait</span>
            <p className="text-lg font-bold text-slate-800 dark:text-white font-mono leading-none mt-1">45s</p>
          </div>
        </OperationalCard>
        
        <OperationalCard className="p-4 flex items-center gap-4 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 border-l-4 border-l-red-500">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-red-800/70 dark:text-red-400 font-mono block">Active Items</span>
            <p className="text-lg font-bold text-red-700 dark:text-red-300 font-mono leading-none mt-1">28</p>
          </div>
        </OperationalCard>
        
        <OperationalCard className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">SLA Adherence</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono leading-none mt-1">98.2%</p>
          </div>
        </OperationalCard>
      </div>

      {/* Queue 1: Tier 1 Support */}
      <div className="space-y-4">
        <h3 className="font-bold text-[11px] text-slate-650 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
          {isRtl ? 'قائمة الدعم الفني (المستوى الأول)' : 'Tier 1 Support Roster'}
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[9px]">3 Agents</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tier1Agents.map((agent) => {
            const utilization = Math.round((agent.activeChatsCount / agent.maxChatsCount) * 100);
            return (
              <OperationalCard key={agent.id} hoverEffect={true} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={agent.avatarUrl}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${
                        agent.status === 'online' ? 'bg-emerald-500' : agent.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{agent.name}</h4>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-mono mt-0.5">{agent.email}</span>
                    </div>
                  </div>
                  <Badge type={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'error' : 'warning'}>
                    {agent.status}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Utilization</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{utilization}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className={`h-full ${utilization >= 100 ? 'bg-red-500' : utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${utilization}%` }} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 flex justify-between">
                      Chats: <strong className="text-slate-700 dark:text-slate-300 font-mono">{agent.activeChatsCount}/{agent.maxChatsCount}</strong>
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 flex justify-between">
                      CSAT: <strong className="text-emerald-500 font-mono">{agent.csatScore}%</strong>
                    </span>
                  </div>
                </div>
              </OperationalCard>
            );
          })}
        </div>
      </div>

      {/* Queue 2: Escalations */}
      <div className="space-y-4 pt-4">
        <h3 className="font-bold text-[11px] text-slate-650 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
          {isRtl ? 'فريق التصعيد وحل النزاعات' : 'Escalations & Disputes Team'}
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[9px]">2 Agents</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {escalationAgents.map((agent) => {
            const utilization = Math.round((agent.activeChatsCount / agent.maxChatsCount) * 100);
            return (
              <OperationalCard key={agent.id} hoverEffect={true} className="flex flex-col gap-3 bg-purple-50/30 dark:bg-purple-900/5 border-purple-100 dark:border-purple-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={agent.avatarUrl}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-purple-100 dark:ring-purple-900/40"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${
                        agent.status === 'online' ? 'bg-emerald-500' : agent.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{agent.name}</h4>
                      <span className="text-[10px] text-purple-600/70 dark:text-purple-400/70 block font-mono mt-0.5">Senior Specialist</span>
                    </div>
                  </div>
                  <Badge type={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'error' : 'warning'}>
                    {agent.status}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-purple-100 dark:border-purple-900/30">
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Utilization</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{utilization}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className={`h-full ${utilization >= 100 ? 'bg-red-500' : utilization > 60 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${utilization}%` }} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 flex justify-between">
                      Chats: <strong className="text-slate-700 dark:text-slate-300 font-mono">{agent.activeChatsCount}/{agent.maxChatsCount}</strong>
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 flex justify-between">
                      Time in State: <strong className="text-slate-700 dark:text-slate-300 font-mono">14m</strong>
                    </span>
                  </div>
                </div>
              </OperationalCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

