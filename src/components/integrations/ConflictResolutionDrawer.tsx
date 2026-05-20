import React, { useState } from 'react';
import { Database, AlertTriangle, ArrowRight, ArrowLeft, Check, X, ShieldAlert } from 'lucide-react';
import { SyncConflict } from '@/data/seed/syncConflictSeed';

interface ConflictResolutionDrawerProps {
  conflict: SyncConflict;
  onClose: () => void;
  onResolve: (id: string, resolvedFields: { [key: string]: string }, winner: 'local' | 'external' | 'custom') => void;
  isRtl?: boolean;
}

export function ConflictResolutionDrawer({ conflict, onClose, onResolve, isRtl = false }: ConflictResolutionDrawerProps) {
  // Store field resolution choice: 'local' | 'external' | 'custom'
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
    
    // Determine overall winner if applicable
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
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in text-xs font-semibold text-slate-300">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer" 
      />

      {/* Drawer Body */}
      <div 
        className={`relative w-[min(100vw,32rem)] bg-[#0b0f19] border-slate-800 h-full flex flex-col z-10 shadow-2xl overflow-hidden ${
          isRtl ? 'border-r border-slate-800 animate-slide-in-left left-0' : 'border-l border-slate-800 animate-slide-in-right right-0'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isRtl ? 'حل تعارض مزامنة البيانات' : 'Resolve Sync Conflict'}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Record ID: {conflict.customerId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Info panel */}
        <div className="p-5 bg-slate-900/40 border-b border-slate-850 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white uppercase text-[9px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">
              {conflict.sourceConnectorId.toUpperCase()}
            </span>
            <span>•</span>
            <span>Detected at: {conflict.detectedAt}</span>
          </div>
          <p className="text-slate-400 font-normal leading-relaxed">
            {conflict.conflictDescription}
          </p>
        </div>

        {/* Global actions */}
        <div className="px-5 py-3 border-b border-slate-850 bg-slate-900/20 flex items-center justify-between shrink-0">
          <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">Bulk Select Winners:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleResolveAll('local')}
              className="px-3 py-1.5 border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 rounded-lg text-[10px]"
            >
              {isRtl ? 'الاحتفاظ بالمحلي' : 'Use All Local'}
            </button>
            <button
              onClick={() => handleResolveAll('external')}
              className="px-3 py-1.5 border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/40 rounded-lg text-[10px]"
            >
              {isRtl ? 'الاحتفاظ بالخارجي' : 'Use All External'}
            </button>
          </div>
        </div>

        {/* Fields compare scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {conflict.fields.map(field => {
            const currentChoice = selectedSources[field.fieldName] || 'local';

            return (
              <div 
                key={field.fieldName}
                className="bg-slate-900/30 border border-slate-850 rounded-2xl p-4 space-y-3.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                    @{field.fieldName}
                  </span>
                  <span className="text-slate-450 font-normal">{field.fieldLabel}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Local Column Option */}
                  <div
                    onClick={() => handleSelectFieldOption(field.fieldName, 'local')}
                    className={`p-3 border rounded-xl cursor-pointer transition-all space-y-1.5 relative ${
                      currentChoice === 'local'
                        ? 'border-emerald-500 bg-emerald-500/5 text-slate-200'
                        : 'border-slate-800/80 bg-transparent text-slate-450 hover:border-slate-750'
                    }`}
                  >
                    {currentChoice === 'local' && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Local DB Record</span>
                    <span className="font-mono text-[10px] break-all block">{field.localValue}</span>
                  </div>

                  {/* External Column Option */}
                  <div
                    onClick={() => handleSelectFieldOption(field.fieldName, 'external')}
                    className={`p-3 border rounded-xl cursor-pointer transition-all space-y-1.5 relative ${
                      currentChoice === 'external'
                        ? 'border-emerald-500 bg-emerald-500/5 text-slate-200'
                        : 'border-slate-800/80 bg-transparent text-slate-450 hover:border-slate-750'
                    }`}
                  >
                    {currentChoice === 'external' && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">External API (Target)</span>
                    <span className="font-mono text-[10px] break-all block">{field.externalValue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-850 bg-slate-950/40 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:text-white rounded-xl font-bold transition-all text-center"
          >
            {isRtl ? 'إغلاق' : 'Cancel'}
          </button>
          <button
            onClick={handleApplyResolution}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10 text-center"
          >
            {isRtl ? 'تطبيق الدمج والمزامنة' : 'Apply Merge Sync'}
          </button>
        </div>
      </div>
    </div>
  );
}
