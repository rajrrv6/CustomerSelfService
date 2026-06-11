'use client';

import React, { useState } from 'react';
import { User, Sparkles, Shield } from 'lucide-react';
import { Customer360Drawer } from './Customer360Drawer';
import { AICopilotPanel } from './AICopilotPanel';
import { CustomerProfile360 } from '@/data/seed/customer360Seed';
import { Conversation } from '@/types';
import { translations } from '@/i18n/translations';

interface RightWorkspacePanelProps {
  profile?: CustomerProfile360;
  activeChat: Conversation;
  lang: 'en' | 'ar';
  onApplySuggestedReply: (text: string) => void;
  onSummarize: () => void;
}

export function RightWorkspacePanel({
  profile,
  activeChat,
  lang,
  onApplySuggestedReply,
  onSummarize
}: RightWorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState<'360' | 'copilot'>('360');
  const t = translations[lang];

  return (
    <div className="h-full flex flex-col min-h-0 bg-slate-50/95 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-hidden">
      {/* Sidebar switcher tabs headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('360')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 border-b-2 font-bold text-xs uppercase transition-all outline-none ${
            activeTab === '360'
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'ملف 360°' : '360° Profile'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 border-b-2 font-bold text-xs uppercase transition-all outline-none ${
            activeTab === 'copilot'
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span>{lang === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot'}</span>
        </button>
      </div>

      {/* Main scrolling tab window content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === '360' ? (
          <Customer360Drawer profile={profile} />
        ) : (
          <AICopilotPanel
            activeChat={activeChat}
            lang={lang}
            onApplySuggestedReply={onApplySuggestedReply}
            onSummarize={onSummarize}
          />
        )}
      </div>
    </div>
  );
}
