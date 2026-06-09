import React from 'react';
import { useConversationStore } from '@/stores/conversationStore';
import { useUIStore } from '@/stores/uiStore';

const presenceLabels = {
  en: {
    online: 'online',
    away: 'away',
    busy: 'busy',
    offline: 'offline',
  },
  ar: {
    online: 'متصل',
    away: 'بالخارج',
    busy: 'مشغول',
    offline: 'غير متصل',
  },
};

const typingLabels = {
  en: 'is typing...',
  ar: 'يكتب الآن...',
};

export function TypingIndicator({ name, conversationId }: { name: string; conversationId?: string }) {
  const store = useConversationStore();
  const lang = useUIStore((s) => s.lang) || 'en';
  const activeId = conversationId ?? store.activeConversationId;
  const isTyping = store.typingStates[activeId || ''] || false;
  const presence = store.presenceStates[activeId || ''] || 'offline';

  if (!isTyping) return null;

  const presenceStr = presenceLabels[lang][presence] || presence;
  const typingStr = typingLabels[lang] || 'is typing...';

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex justify-start animate-fade-in-up"
    >
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-2 flex items-center gap-1.5 font-bold text-blue-500 font-mono text-[10px]">
        <div className="flex gap-1 items-center py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-slate-500 font-sans ms-1.5">
          {name} ({presenceStr}) {typingStr}
        </span>
      </div>
    </div>
  );
}
