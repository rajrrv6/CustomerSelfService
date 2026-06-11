import React, { useState } from 'react';
import { TimelineEvent } from '@/hooks/useSyncTimeline';
import { Search, CheckCircle, Info, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface SyncTimelineProps {
  events: TimelineEvent[];
  isRtl?: boolean;
}

export function SyncTimeline({ events, isRtl = false }: SyncTimelineProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = events.filter(e => {
    const matchesFilter = filterType === 'all' || e.type === filterType;
    const matchesSearch = e.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.detail && e.detail.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          e.connectorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-5 text-xs font-semibold shadow-sm">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin-slow" />
            {isRtl ? 'خط المزامنة الزمني المباشر' : 'Live Sync Transaction Stream'}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Real-time observer log for incoming and outgoing sync updates</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder={isRtl ? 'بحث في الأحداث...' : 'Filter events...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-white focus:outline-none w-full text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
        {[
          { value: 'all', label: isRtl ? 'الكل' : 'All events' },
          { value: 'success', label: isRtl ? 'ناجحة' : 'Success' },
          { value: 'info', label: isRtl ? 'معلومات' : 'Information' },
          { value: 'warning', label: isRtl ? 'تحذير' : 'Warnings' },
          { value: 'error', label: isRtl ? 'خطأ' : 'Errors' }
        ].map(opt => {
          const isActive = filterType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                isActive
                  ? 'border-blue-500/20 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Timeline stream */}
      <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3.5 space-y-5 py-2">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 pl-0 border-l border-transparent">
            {isRtl ? 'لم يتم العثور على أحداث مطابقة.' : 'No sync activities found matching criteria.'}
          </div>
        ) : (
          filteredEvents.map(e => {
            const isSuccess = e.type === 'success';
            const isInfo = e.type === 'info';
            const isWarning = e.type === 'warning';
            const isError = e.type === 'error';

            return (
              <div key={e.id} className="relative pl-6 space-y-1">
                {/* Status dot */}
                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  isSuccess 
                    ? 'bg-emerald-500' 
                    : isInfo 
                    ? 'bg-blue-500' 
                    : isWarning 
                    ? 'bg-amber-500' 
                    : 'bg-red-500'
                }`} />

                {/* Event details */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-white text-[11px] leading-relaxed">
                      {e.message}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="text-blue-600 dark:text-blue-400 uppercase font-bold">{e.connectorName}</span>
                      <span>•</span>
                      <span>ID: {e.id}</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px] whitespace-nowrap shrink-0">{e.timestamp}</span>
                </div>

                {e.detail && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-normal italic font-mono pt-1">
                    {e.detail}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
