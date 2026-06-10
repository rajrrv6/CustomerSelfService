'use client';

import React, { useEffect } from 'react';
import { User } from 'lucide-react';

export interface Collaborator {
  id: string;
  name: string;
  role: 'agent' | 'supervisor';
  status: 'online' | 'busy' | 'away' | 'offline';
}

interface CollaboratorSelectorProps {
  collaborators: Collaborator[];
  searchQuery: string;
  selectedIndex: number;
  onSelect: (collaborator: Collaborator) => void;
  isRtl: boolean;
}

export function CollaboratorSelector({
  collaborators,
  searchQuery,
  selectedIndex,
  onSelect,
  isRtl,
}: CollaboratorSelectorProps) {
  const filtered = collaborators.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div
      id="collaborator-listbox"
      role="listbox"
      aria-label="Collaborators roster for mention"
      className="absolute z-[60] bottom-full mb-1 w-56 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 p-1 space-y-0.5 max-h-48 overflow-y-auto"
      style={{ [isRtl ? 'right' : 'left']: 0 }}
    >
      {filtered.map((c, idx) => {
        const isSelected = idx === selectedIndex;
        const statusColors = {
          online: 'bg-emerald-500',
          busy: 'bg-rose-500',
          away: 'bg-amber-500',
          offline: 'bg-slate-400',
        };

        return (
          <button
            key={c.id}
            type="button"
            role="option"
            tabIndex={-1}
            aria-selected={isSelected}
            onClick={() => onSelect(c)}
            className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-start transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 ${
              isSelected
                ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0 select-none">
                <div className="w-5 h-5 rounded-full bg-slate-150 dark:bg-slate-800 flex items-center justify-center">
                  <User className="w-3 h-3 text-slate-400" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-slate-950 ${
                    statusColors[c.status] || 'bg-slate-400'
                  }`}
                />
              </div>
              <span className="truncate">{c.name}</span>
            </div>
            <span className="text-[8px] uppercase font-bold text-slate-400 font-mono shrink-0">
              {c.role}
            </span>
          </button>
        );
      })}
    </div>
  );
}
