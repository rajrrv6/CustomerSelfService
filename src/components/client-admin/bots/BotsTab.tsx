'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bot as BotIcon, Plus } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';

export function BotsTab() {
  const { lang, bots, createBot, setBots, addAuditLog } = useApp();
  const t = translations[lang];

  // Bot creation states
  const [showAddBotModal, setShowAddBotModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotPersona, setNewBotPersona] = useState('');
  const [newBotLang, setNewBotLang] = useState('English, Arabic');
  // Edit persona modal state
  const [showEditPersonaModal, setShowEditPersonaModal] = useState(false);
  const [editingBot, setEditingBot] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPersona, setEditPersona] = useState('');
  const [editTone, setEditTone] = useState('Neutral');

  const handleCreateBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName || !newBotPersona) return;
    createBot({
      name: newBotName,
      persona: newBotPersona,
      status: 'draft',
      language: newBotLang.split(',').map((l) => l.trim()),
      intentCount: 12,
      knowledgeBaseId: 'kb-custom'
    });
    setShowAddBotModal(false);
    setNewBotName('');
    setNewBotPersona('');
  };

  const handleSavePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    setBots((prev: any[]) => prev.map((b) => (b.id === editingBot.id ? { ...b, name: editName, persona: editPersona, tone: editTone } : b)));
    addAuditLog(`Edited persona for bot: ${editName}`, 'success');
    setShowEditPersonaModal(false);
    setEditingBot(null);
  };

  const headerAction = (
    <button
      onClick={() => setShowAddBotModal(true)}
      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 animate-fade-in cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Plus className="w-4 h-4" />
      {t.clientAdmin.bots.createButton}
    </button>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.bots.title}
        description={t.clientAdmin.bots.description}
        action={headerAction}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <BotIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-850 dark:text-white">{bot.name}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{lang === 'ar' ? 'تم الإنشاء:' : 'Created:'} {bot.createdAt}</span>
                  </div>
                </div>
                <Badge type={bot.status}>
                  {bot.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal min-h-12">
                {bot.persona}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-880/80 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900/50">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">{t.clientAdmin.bots.deflection}</span>
                  <span className="font-bold text-slate-850 dark:text-white font-mono">{bot.deflectionRate}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900/50">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono block">{t.clientAdmin.bots.activeChats}</span>
                  <span className="font-bold text-slate-850 dark:text-white font-mono">{bot.activeSessions}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                      setEditingBot(bot);
                      setEditName(bot.name || '');
                      setEditPersona(bot.persona || '');
                      setEditTone((bot as any).tone || 'Neutral');
                      setShowEditPersonaModal(true);
                    }}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-350 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {t.clientAdmin.bots.editPersona}
                </button>
                <button
                  onClick={() => {
                    // Dispatch a global navigation event; WorkspaceShell listens for this
                    const ev = new CustomEvent('navigate-to-screen', { detail: { screenId: 'dialog_flow', botId: bot.id } });
                    window.dispatchEvent(ev);
                  }}
                  className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {t.clientAdmin.bots.flows}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bot Modal */}
      <ModalWrapper
        isOpen={showAddBotModal}
        onClose={() => setShowAddBotModal(false)}
        title={t.clientAdmin.bots.modalTitleCreate}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreateBotSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.clientAdmin.bots.fieldName}</label>
            <input
              type="text"
              required
              placeholder={t.clientAdmin.bots.fieldNamePlaceholder}
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.clientAdmin.bots.fieldPersona}</label>
            <textarea
              required
              rows={3}
              placeholder={t.clientAdmin.bots.fieldPersonaPlaceholder}
              value={newBotPersona}
              onChange={(e) => setNewBotPersona(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.clientAdmin.bots.fieldLanguages}</label>
            <input
              type="text"
              value={newBotLang}
              onChange={(e) => setNewBotLang(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddBotModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
            >
              {t.clientAdmin.bots.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              {t.clientAdmin.bots.initialize}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* Edit Persona Modal */}
      <ModalWrapper
        isOpen={showEditPersonaModal}
        onClose={() => {
          setShowEditPersonaModal(false);
          setEditingBot(null);
        }}
        title={t.clientAdmin.bots.modalTitleEdit}
        maxWidthClass="max-w-xl"
      >
        {editingBot && (
          <form onSubmit={handleSavePersona} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.clientAdmin.bots.fieldName}</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.clientAdmin.bots.fieldPersona}</label>
              <textarea
                rows={4}
                required
                value={editPersona}
                onChange={(e) => setEditPersona(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.clientAdmin.bots.fieldTone}</label>
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
                onClick={() => {
                  setShowEditPersonaModal(false);
                  setEditingBot(null);
                }}
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
    </div>
  );
}
