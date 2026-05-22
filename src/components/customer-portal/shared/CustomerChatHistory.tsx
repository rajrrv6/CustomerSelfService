'use client';
import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';

interface ChatHistoryItem {
  id: string;
  title: string;
  solvedDate: string;
  rating: number;
  agent: string;
}

interface CustomerChatHistoryProps {
  historicalChats: ChatHistoryItem[];
  setActiveSubScreen: (sub: string) => void;
}

export function CustomerChatHistory({
  historicalChats,
  setActiveSubScreen
}: CustomerChatHistoryProps) {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubScreen('customer_home')}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{t.portal.chatHistory.title}</h2>
          <p className="text-xs text-slate-400">{t.portal.chatHistory.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {historicalChats.map((chat) => (
          <div
            key={chat.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-400 font-mono">
              <span>{t.portal.chatHistory.chatId} {chat.id}</span>
              <span>{t.portal.chatHistory.solved} {chat.solvedDate}</span>
            </div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">{chat.title}</h4>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850 text-xs">
              <span className="text-slate-450 dark:text-slate-400">{t.portal.chatHistory.agent} <strong>{chat.agent}</strong></span>
              
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: chat.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
