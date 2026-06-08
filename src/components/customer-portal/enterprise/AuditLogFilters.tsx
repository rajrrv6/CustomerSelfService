import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface AuditLogFiltersProps {
  query: string;
  setQuery: (q: string) => void;
  severity: string;
  setSeverity: (s: string) => void;
  selectedModule: string;
  setSelectedModule: (m: string) => void;
  modules: string[];
  lang: 'en' | 'ar';
  onReset: () => void;
}

export function AuditLogFilters({
  query,
  setQuery,
  severity,
  setSeverity,
  selectedModule,
  setSelectedModule,
  modules,
  lang,
  onReset,
}: AuditLogFiltersProps) {
  const t = {
    en: {
      search: 'Search by action, actor, or region...',
      severity: 'Severity',
      all: 'All',
      info: 'Info',
      warning: 'Warning',
      critical: 'Critical',
      module: 'Module',
      reset: 'Reset Filters',
    },
    ar: {
      search: 'البحث بالإجراء، الفاعل، أو المنطقة...',
      severity: 'الخطورة',
      all: 'الكل',
      info: 'معلومات',
      warning: 'تحذير',
      critical: 'خطير',
      module: 'الوحدة',
      reset: 'إعادة ضبط التصفية',
    },
  }[lang] || {
    search: 'Search by action, actor, or region...',
    severity: 'Severity',
    all: 'All',
    info: 'Info',
    warning: 'Warning',
    critical: 'Critical',
    module: 'Module',
    reset: 'Reset Filters',
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            className={`w-full ${
              lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            } py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
            placeholder={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
            {t.severity}:
          </span>
          <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 bg-white dark:bg-slate-950">
            {['all', 'info', 'warning', 'critical'].map((lvl) => {
              const isActive = severity === lvl;
              const label = (t as any)[lvl];
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Module Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
            {t.module}:
          </span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 dark:text-slate-250 cursor-pointer"
          >
            <option value="all">{lang === 'ar' ? 'جميع الوحدات' : 'All Modules'}</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {(query || severity !== 'all' || selectedModule !== 'all') && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-rose-200 hover:border-rose-500 text-rose-500 rounded-xl text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.reset}</span>
          </button>
        )}
      </div>
    </div>
  );
}
