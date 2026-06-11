'use client';

import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

interface BotEditPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: {
    id: string;
    name: string;
    persona: string;
    tone?: string;
  } | null;
  lang: 'en' | 'ar';
  t: any;
  onSave: (updatedDetails: { name: string; persona: string; tone: string }) => void;
}

export function BotEditPersonaModal({
  isOpen,
  onClose,
  bot,
  lang,
  t,
  onSave
}: BotEditPersonaModalProps) {
  const [editName, setEditName] = useState('');
  const [editPersona, setEditPersona] = useState('');
  const [editTone, setEditTone] = useState('Neutral');

  useEffect(() => {
    if (bot) {
      setEditName(bot.name || '');
      setEditPersona(bot.persona || '');
      setEditTone(bot.tone || 'Neutral');
    }
  }, [bot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bot) return;
    onSave({
      name: editName,
      persona: editPersona,
      tone: editTone
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t.clientAdmin.bots.modalTitleEdit}
      maxWidthClass="max-w-xl"
    >
      {bot && (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5">
              {t.clientAdmin.bots.fieldName}
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5">
              {t.clientAdmin.bots.fieldPersona}
            </label>
            <textarea
              rows={4}
              required
              value={editPersona}
              onChange={(e) => setEditPersona(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5">
              {t.clientAdmin.bots.fieldTone}
            </label>
            <select
              value={editTone}
              onChange={(e) => setEditTone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="Neutral">{lang === 'ar' ? 'محايد' : 'Neutral'}</option>
              <option value="Friendly">{lang === 'ar' ? 'ودود' : 'Friendly'}</option>
              <option value="Professional">{lang === 'ar' ? 'مهني' : 'Professional'}</option>
              <option value="Concise">{lang === 'ar' ? 'موجز' : 'Concise'}</option>
              <option value="Empathetic">{lang === 'ar' ? 'متعاطف' : 'Empathetic'}</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t.clientAdmin.bots.cancel}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
              {t.clientAdmin.bots.save}
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
