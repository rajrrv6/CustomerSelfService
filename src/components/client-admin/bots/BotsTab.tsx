'use client';

import React, { useState, Suspense, lazy } from 'react';
import { useApp } from '@/context/AppContext';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useRenderProfiler } from '@/hooks/useRenderProfiler';
import { Plus } from 'lucide-react';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { BotCard } from './BotCard';
import { BotEditPersonaModal } from './BotEditPersonaModal';
import { usePermission } from '@/stores/permissionStore';

// Lazy-loaded BotWizard component
const BotWizard = lazy(() => import('./BotWizard').then(m => ({ default: m.BotWizard })));

export function BotsTab() {
  useRenderProfiler('BotsTab');
  // Narrow Zustand selectors — only re-renders when lang or addAuditLog changes
  const lang = useUIStore((s) => s.lang);
  const addAuditLog = useNotificationsStore((s) => s.addAuditLog);
  const t = translations[lang];

  // Fetch bot permissions
  const { canEdit } = usePermission('bots');

  // Feature-scoped bot state stays in AppContext (only BotsTab writes/reads bots)
  const { bots, setBots } = useApp();

  // State to control wizard open
  const [showAddBotModal, setShowAddBotModal] = useState(false);

  // Edit persona modal states
  const [showEditPersonaModal, setShowEditPersonaModal] = useState(false);
  const [editingBot, setEditingBot] = useState<any | null>(null);

  const handleSavePersona = (updatedDetails: { name: string; persona: string; tone: string }) => {
    if (!canEdit) return;
    if (!editingBot) return;
    setBots((prev: any[]) => 
      prev.map((b) => (b.id === editingBot.id ? { ...b, ...updatedDetails } : b))
    );
    addAuditLog(`Updated persona details for bot: ${updatedDetails.name}`, 'success');
    setShowEditPersonaModal(false);
    setEditingBot(null);
  };

  const headerAction = (
    <button
      onClick={() => {
        if (!canEdit) return;
        setShowAddBotModal(true);
      }}
      disabled={!canEdit}
      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 animate-fade-in cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
      title={!canEdit ? "Requires Edit Permission" : undefined}
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

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {bots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            lang={lang}
            t={t}
            canEdit={canEdit}
            onEditPersona={() => {
              if (!canEdit) return;
              setEditingBot(bot);
              setShowEditPersonaModal(true);
            }}
          />
        ))}
      </div>

      {/* Stepper Wizard Modal (Lazy Loaded) */}
      {showAddBotModal && (
        <Suspense fallback={null}>
          <BotWizard 
            isOpen={showAddBotModal} 
            onClose={() => setShowAddBotModal(false)} 
            lang={lang} 
          />
        </Suspense>
      )}

      {/* Edit Persona Modal */}
      <BotEditPersonaModal
        isOpen={showEditPersonaModal}
        onClose={() => {
          setShowEditPersonaModal(false);
          setEditingBot(null);
        }}
        bot={editingBot}
        lang={lang}
        t={t}
        onSave={handleSavePersona}
      />
    </div>
  );
}
