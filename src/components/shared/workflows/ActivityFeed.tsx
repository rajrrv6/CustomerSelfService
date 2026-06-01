'use client';

import React from 'react';
import { Database, User, ShieldAlert, Cpu } from 'lucide-react';

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  type: 'system' | 'agent' | 'database' | 'security' | 'error';
  user?: string;
}

interface ActivityFeedProps {
  items?: ActivityFeedItem[];
  isRtl?: boolean;
}

export function ActivityFeed({ items = [], isRtl = false }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs italic">
        {isRtl ? 'لا توجد أنشطة مسجلة' : 'No recorded activity.'}
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-3.5 h-3.5 text-emerald-500" />;
      case 'agent':
        return <User className="w-3.5 h-3.5 text-blue-500" />;
      case 'security':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'error':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
      case 'system':
      default:
        return <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          {/* Icon frame */}
          <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-lg shrink-0">
            {getIcon(item.type)}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                {isRtl && item.titleAr ? item.titleAr : item.title}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                {item.timestamp}
              </span>
            </div>

            {(isRtl && item.descriptionAr ? item.descriptionAr : item.description) && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {isRtl && item.descriptionAr ? item.descriptionAr : item.description}
              </p>
            )}

            {item.user && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {isRtl ? 'بواسطة:' : 'Actor:'}
                </span>
                <span className="text-[10px] font-semibold text-slate-650 dark:text-slate-350">
                  {item.user}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
