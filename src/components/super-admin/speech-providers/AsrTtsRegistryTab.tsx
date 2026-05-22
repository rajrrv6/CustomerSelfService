'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ASRTTSProvider } from '@/types';
import { Plus, Search } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Badge } from '@/components/shared/BadgeSystem';
import { translations } from '@/i18n/translations';

export function AsrTtsRegistryTab() {
  const { lang, asrProviders, setAsrProviders, addAuditLog } = useApp();
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  
  // ASR/TTS creation state
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [newProvider, setNewProvider] = useState<Omit<ASRTTSProvider, 'id'>>({
    name: '',
    type: 'ASR',
    languages: ['English', 'Arabic'],
    latencyMs: 150,
    costPerMin: 0.01,
    status: 'online'
  });

  const handleRegisterProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvider.name) return;

    const provider: ASRTTSProvider = {
      ...newProvider,
      id: `prov-${Date.now()}`
    };

    setAsrProviders((prev) => [...prev, provider]);
    setShowAddProviderModal(false);
    addAuditLog(`Registered new ASR/TTS Engine: ${provider.name}`, 'success');
    setNewProvider({
      name: '',
      type: 'ASR',
      languages: ['English', 'Arabic'],
      latencyMs: 150,
      costPerMin: 0.01,
      status: 'online'
    });
  };

  const filteredProviders = asrProviders.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerAction = (
    <button
      onClick={() => setShowAddProviderModal(true)}
      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" />
      {t.superAdmin.asrTts.registerButton}
    </button>
  );

  const tableHeaders = [...t.superAdmin.asrTts.tableHeaders];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.asrTts.title}
        description={t.superAdmin.asrTts.description}
        action={headerAction}
      />

      {/* Search bar */}
      <div className="flex gap-2 min-w-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.superAdmin.asrTts.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <EnterpriseTable
        headers={tableHeaders}
        empty={filteredProviders.length === 0}
        emptyTitle={t.superAdmin.asrTts.emptyTitle}
        emptyDesc={t.superAdmin.asrTts.emptyDesc}
      >
        {filteredProviders.map((provider) => (
          <tr key={provider.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{provider.name}</td>
            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{provider.type}</td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-1">
                {provider.languages.map((l, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-6 py-4 font-mono font-bold text-slate-850 dark:text-slate-200">{provider.latencyMs} ms</td>
            <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">
              ${provider.costPerMin.toFixed(4)}
            </td>
            <td className="px-6 py-4">
              <Badge type={provider.status === 'online' ? 'success' : 'error'}>
                {provider.status}
              </Badge>
            </td>
          </tr>
        ))}
      </EnterpriseTable>

      {/* Provider modal overlay */}
      <ModalWrapper
        isOpen={showAddProviderModal}
        onClose={() => setShowAddProviderModal(false)}
        title={t.superAdmin.asrTts.modalTitle}
      >
        <form onSubmit={handleRegisterProvider} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.asrTts.fieldName}</label>
            <input
              type="text"
              required
              value={newProvider.name}
              onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
              placeholder={t.superAdmin.asrTts.fieldPlaceholder}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.asrTts.fieldType}</label>
              <select
                value={newProvider.type}
                onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-slate-800 dark:text-slate-100"
              >
                <option value="ASR">ASR (Speech-to-Text)</option>
                <option value="TTS">TTS (Text-to-Speech)</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.asrTts.fieldLatency}</label>
              <input
                type="number"
                required
                value={newProvider.latencyMs}
                onChange={(e) => setNewProvider({ ...newProvider, latencyMs: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.superAdmin.asrTts.fieldCost}</label>
            <input
              type="number"
              step="0.0001"
              required
              value={newProvider.costPerMin}
              onChange={(e) => setNewProvider({ ...newProvider, costPerMin: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddProviderModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {t.superAdmin.asrTts.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              {t.superAdmin.asrTts.register}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
