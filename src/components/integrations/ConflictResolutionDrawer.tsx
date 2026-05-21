import React, { useState } from 'react';
import { Database, AlertTriangle, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { SyncConflict } from '@/data/seed/syncConflictSeed';
import { DrawerWrapper } from '../shared/DrawerWrapper';

interface ConflictResolutionDrawerProps {
  conflict: SyncConflict;
  onClose: () => void;
  onResolve: (id: string, resolvedFields: { [key: string]: string }, winner: 'local' | 'external' | 'custom') => void;
  isRtl?: boolean;
}

export function ConflictResolutionDrawer({ conflict, onClose, onResolve, isRtl = false }: ConflictResolutionDrawerProps) {
  const [selectedSources, setSelectedSources] = useState<{ [key: string]: 'local' | 'external' }>({});
  const [customValues, setCustomValues] = useState<{ [key: string]: string }>({});

  const handleSelectFieldOption = (fieldName: string, source: 'local' | 'external') => {
    setSelectedSources(prev => ({ ...prev, [fieldName]: source }));
  };

  const handleResolveAll = (source: 'local' | 'external') => {
    const updated: { [key: string]: 'local' | 'external' } = {};
    conflict.fields.forEach(f => {
      updated[f.fieldName] = source;
    });
    setSelectedSources(updated);
  };

  const handleApplyResolution = () => {
    const resolvedFields: { [key: string]: string } = {};
    let winner: 'local' | 'external' | 'custom' = 'custom';
    
    const choices = conflict.fields.map(f => selectedSources[f.fieldName] || 'local');
    const allLocal = choices.every(c => c === 'local');
    const allExternal = choices.every(c => c === 'external');
    if (allLocal) winner = 'local';
    else if (allExternal) winner = 'external';

    conflict.fields.forEach(f => {
      const choice = selectedSources[f.fieldName] || 'local';
      resolvedFields[f.fieldName] = choice === 'local' ? f.localValue : f.externalValue;
    });

    onResolve(conflict.id, resolvedFields, winner);
    onClose();
  };

  return (
    <DrawerWrapper
      isOpen={true}
      onClose={onClose}
      title={isRtl ? 'حل تعارض مزامنة البيانات' : 'Resolve Sync Conflict'}
      isRtl={isRtl}
      maxWidthClass="max-w-lg"
      noPadding={true}
    >
      <div className="flex-1 flex flex-col min-h-0 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
        
        {/* Record ID / Alert subheader for visual parity */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-2.5 shrink-0">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-500" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Record ID: {conflict.customerId}
          </span>
        </div>

        {/* Info panel */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-white uppercase text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">
              {conflict.sourceConnectorId.toUpperCase()}
            </span>
            <span>•</span>
            <span>Detected at: {conflict.detectedAt}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            {conflict.conflictDescription}
          </p>
        </div>

        {/* Bulk resolve toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/20 flex items-center justify-between shrink-0">
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold font-mono">Bulk Select Winners:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleResolveAll('local')}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
            >
              {isRtl ? 'الاحتفاظ بالمحلي' : 'Use All Local'}
            </button>
            <button
              onClick={() => handleResolveAll('external')}
              className="px-3 py-1.5 border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/40 rounded-lg text-[10px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
            >
              {isRtl ? 'الاحتفاظ بالخارجي' : 'Use All External'}
            </button>
          </div>
        </div>

        {/* Field comparison scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {conflict.fields.map(field => {
            const currentChoice = selectedSources[field.fieldName] || 'local';

            return (
              <div 
                key={field.fieldName}
                className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-white font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    @{field.fieldName}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-normal">{field.fieldLabel}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Local Column */}
                  <div
                    onClick={() => handleSelectFieldOption(field.fieldName, 'local')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        handleSelectFieldOption(field.fieldName, 'local');
                        e.preventDefault();
                      }
                    }}
                    tabIndex={0}
                    role="radio"
                    aria-checked={currentChoice === 'local'}
                    className={`p-3 border rounded-xl cursor-pointer transition-all space-y-1.5 relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                      currentChoice === 'local'
                        ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 text-slate-800 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {currentChoice === 'local' && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">Local DB Record</span>
                    <span className="font-mono text-[10px] break-all block text-slate-700 dark:text-slate-300">{field.localValue}</span>
                  </div>

                  {/* External Column */}
                  <div
                    onClick={() => handleSelectFieldOption(field.fieldName, 'external')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        handleSelectFieldOption(field.fieldName, 'external');
                        e.preventDefault();
                      }
                    }}
                    tabIndex={0}
                    role="radio"
                    aria-checked={currentChoice === 'external'}
                    className={`p-3 border rounded-xl cursor-pointer transition-all space-y-1.5 relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                      currentChoice === 'external'
                        ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 text-slate-800 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {currentChoice === 'external' && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">External API (Target)</span>
                    <span className="font-mono text-[10px] break-all block text-slate-700 dark:text-slate-300">{field.externalValue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-400 rounded-xl font-bold transition-all text-center focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            {isRtl ? 'إغلاق' : 'Cancel'}
          </button>
          <button
            onClick={handleApplyResolution}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10 text-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            {isRtl ? 'تطبيق الدمج والمزامنة' : 'Apply Merge Sync'}
          </button>
        </div>
      </div>
    </DrawerWrapper>
  );
}

