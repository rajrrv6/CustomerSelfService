import React, { useState } from 'react';
import { CRMConnector } from '@/data/seed/crmConnectorsSeed';
import { MappingBuilder } from './MappingBuilder';
import { Key, Layers, Power, ChevronLeft, ChevronRight } from 'lucide-react';

interface ConnectorRegistryProps {
  connector: CRMConnector;
  onDisconnect: (id: string) => void;
  onSaveMappings: (id: string, mappings: any[]) => void;
  onBack: () => void;
  isRtl?: boolean;
}

export function ConnectorRegistry({ connector, onDisconnect, onSaveMappings, onBack, isRtl = false }: ConnectorRegistryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'mappings' | 'credentials'>('mappings');

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Back button and title header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all flex items-center justify-center shrink-0"
        >
          {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">{connector.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider ${
              connector.status === 'connected' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
            }`}>
              {connector.status.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Configure sync keys, authorization scopes, and active mappings</p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'mappings', label: isRtl ? 'مطابقة الحقول' : 'Field Mappings Schema', icon: <Layers className="w-4 h-4" /> },
          { id: 'credentials', label: isRtl ? 'بيانات الاعتماد والتوصيل' : 'Connection & OAuth Keys', icon: <Key className="w-4 h-4" /> }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 border-b-2 font-bold transition-all -mb-px text-[11px] ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View router */}
      {activeSubTab === 'mappings' && (
        <MappingBuilder
          connector={connector}
          onSave={onSaveMappings}
          isRtl={isRtl}
        />
      )}

      {activeSubTab === 'credentials' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
          <div className="space-y-2.5">
            <h4 className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold font-mono">Simulated Authentication Metadata</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-1 font-mono text-[9.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">CLIENT_ID:</span>
                  <span className="text-slate-800 dark:text-white select-all">{connector.clientId || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CLIENT_SECRET:</span>
                  <span className="text-slate-500 dark:text-slate-400 select-all">{connector.clientSecret || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CONNECTED_AT:</span>
                  <span className="text-slate-500 dark:text-slate-400">{connector.connectedAt || 'None'}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold block">GRANTED SCOPES:</span>
                <div className="flex flex-wrap gap-1">
                  {connector.scopes && connector.scopes.length > 0 ? (
                    connector.scopes.map(s => (
                      <span key={s} className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">No scopes selected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-white text-[11px] block">
                {isRtl ? 'قطع الاتصال بالكامل' : 'Disconnect Integration'}
              </span>
              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-normal leading-normal max-w-md">
                Disconnecting this integration will immediately flush access tokens from the vault and halt all automated background sync jobs.
              </p>
            </div>

            <button
              onClick={() => onDisconnect(connector.id)}
              className="px-4 py-2.5 bg-red-50 dark:bg-red-600/10 border border-red-300 dark:border-red-500/25 hover:bg-red-600 hover:text-white text-red-700 dark:text-red-400 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Power className="w-4 h-4" />
              {isRtl ? 'قطع الاتصال بالموصل' : 'Disconnect App'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
