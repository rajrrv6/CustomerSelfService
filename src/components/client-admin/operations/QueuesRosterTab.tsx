'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';

export function QueuesRosterTab() {
  const { agents } = useApp();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Queues & Agent Roster"
        description="Monitor active live queues, agent allocation targets, and real-time support rosters."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <OperationalCard key={agent.id} hoverEffect={true} className="flex items-start justify-between">
            <div className="flex gap-3">
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">{agent.name}</h4>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-mono">{agent.email}</span>
                
                <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <span className="text-slate-400 dark:text-slate-500">
                    Chats: <strong className="text-slate-700 dark:text-slate-350">{agent.activeChatsCount}/{agent.maxChatsCount}</strong>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    CSAT Score: <strong className="text-emerald-500">{agent.csatScore}%</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between h-full">
              <Badge type={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'error' : 'warning'}>
                {agent.status}
              </Badge>
            </div>
          </OperationalCard>
        ))}
      </div>
    </div>
  );
}
