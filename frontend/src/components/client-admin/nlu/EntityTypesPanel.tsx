'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface EntityItem {
  name: string;
  regex: string;
  languages: string[];
  samples: string;
  required: boolean;
}

interface EntityTypesPanelProps {
  lang: 'en' | 'ar';
  entityCatalog: EntityItem[];
  newEntityName: string;
  setNewEntityName: (val: string) => void;
  newEntityRegex: string;
  setNewEntityRegex: (val: string) => void;
  newEntitySamples: string;
  setNewEntitySamples: (val: string) => void;
  newEntityLanguages: string[];
  setNewEntityLanguages: (val: string[]) => void;
  newEntityRequired: boolean;
  setNewEntityRequired: (val: boolean) => void;
  onAddEntity: (e: React.FormEvent) => void;
  onDeleteEntity: (name: string) => void;
}

export function EntityTypesPanel({
  lang,
  entityCatalog,
  newEntityName,
  setNewEntityName,
  newEntityRegex,
  setNewEntityRegex,
  newEntitySamples,
  setNewEntitySamples,
  newEntityLanguages,
  setNewEntityLanguages,
  newEntityRequired,
  setNewEntityRequired,
  onAddEntity,
  onDeleteEntity
}: EntityTypesPanelProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add form */}
      <form onSubmit={onAddEntity} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-855 rounded-2xl">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم الكيان' : 'Entity Key Name'}</label>
          <input
            type="text"
            required
            placeholder="e.g. shipment_tracking"
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'تعبير التحقق المطابق (RegEx)' : 'Validation Regular Expression'}</label>
          <input
            type="text"
            required
            placeholder="e.g. ^TRK\d{10}$"
            value={newEntityRegex}
            onChange={(e) => setNewEntityRegex(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none font-mono text-xs text-slate-800 dark:text-slate-100 font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'أمثلة للقيم' : 'Sample Phrases / Values'}</label>
          <input
            type="text"
            placeholder="e.g. TRK4810294029"
            value={newEntitySamples}
            onChange={(e) => setNewEntitySamples(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-semibold"
          />
        </div>

        <div className="flex items-end justify-end">
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] cursor-pointer"
          >
            {lang === 'ar' ? 'إدراج بالكتالوج' : 'Add Entity'}
          </button>
        </div>
      </form>

      {/* Catalog Listing */}
      <div className="overflow-x-auto border border-slate-150 dark:border-slate-855 rounded-2xl">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-150 dark:border-slate-855 text-slate-400 font-bold uppercase text-[9px] font-mono">
              <th className="p-3.5 text-start">{lang === 'ar' ? 'الرمز والاسم' : 'Entity Type'}</th>
              <th className="p-3.5 text-start">{lang === 'ar' ? 'تعبير الكشف المطابق' : 'Validation RegEx'}</th>
              <th className="p-3.5 text-start">{lang === 'ar' ? 'اللغات المدعومة' : 'Language Scope'}</th>
              <th className="p-3.5 text-start">{lang === 'ar' ? 'أمثلة مطابقة' : 'Sample values'}</th>
              <th className="p-3.5 text-center">{lang === 'ar' ? 'إجراء' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
            {entityCatalog.map((entity) => (
              <tr key={entity.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400 font-mono">@{entity.name}</td>
                <td className="p-3.5 font-mono text-slate-500 max-w-48 truncate" title={entity.regex}>{entity.regex}</td>
                <td className="p-3.5">
                  <div className="flex gap-1.5 flex-wrap">
                    {entity.languages.map((l) => (
                      <span key={l} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[8px] uppercase font-bold tracking-wide text-slate-400">
                        {l}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3.5 font-mono text-slate-450 truncate max-w-44" title={entity.samples}>{entity.samples}</td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => onDeleteEntity(entity.name)}
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
