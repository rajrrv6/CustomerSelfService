import React from 'react';
import { Organization } from './types';
import { Globe, Shield, Activity, Users } from 'lucide-react';

interface OrgWorkspaceCardProps {
  org: Organization;
  isActive: boolean;
  onSelect: () => void;
}

export function OrgWorkspaceCard({ org, isActive, onSelect }: OrgWorkspaceCardProps) {
  // Styles based on SLA Tier
  const slaColors = {
    'Platinum Enterprise': 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900 dark:text-purple-400',
    'Gold Premier': 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-955/20 dark:border-amber-900 dark:text-amber-400',
    'Silver Standard': 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400',
  }[org.slaTier];

  const envColors = {
    'Production': 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    'Staging': 'bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-400',
    'Development': 'bg-blue-500/15 text-blue-700 border-blue-500/20 dark:text-blue-400',
  }[org.environment];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isActive
          ? 'bg-blue-500/5 border-blue-500 dark:bg-blue-950/10 dark:border-blue-500 shadow-md shadow-blue-500/5'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {org.name}
            {isActive && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shrink-0" />
            )}
          </h4>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{org.tenantId}</span>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${envColors}`}>
          {org.environment}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{org.region}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{org.role}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${slaColors}`}>
          {org.slaTier}
        </span>
        {isActive && (
          <span className="text-[10px] font-bold text-blue-500 font-mono">
            Active Workspace
          </span>
        )}
      </div>
    </button>
  );
}
