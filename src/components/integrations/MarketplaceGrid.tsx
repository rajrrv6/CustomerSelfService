import React, { useState } from 'react';
import { CRMConnector } from '@/data/seed/crmConnectorsSeed';
import { Database, Plus, Check, Settings, AlertCircle, CreditCard, ShoppingBag, MessageSquare } from 'lucide-react';

interface MarketplaceGridProps {
  connectors: CRMConnector[];
  onSelectConnector: (connector: CRMConnector) => void;
  onLaunchOAuth: (connector: CRMConnector) => void;
  isRtl?: boolean;
}

export function MarketplaceGrid({ connectors, onSelectConnector, onLaunchOAuth, isRtl = false }: MarketplaceGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: isRtl ? 'الكل' : 'All Connectors' },
    { id: 'crm', label: isRtl ? 'إدارة العملاء' : 'CRM Systems' },
    { id: 'erp', label: isRtl ? 'المخازن و الطلبات' : 'ERP & Commerce' },
    { id: 'billing', label: isRtl ? 'الفوترة' : 'Billing' },
    { id: 'support', label: isRtl ? 'الدعم و التذاكر' : 'Support Desks' }
  ];

  const filteredConnectors = connectors.filter(c => {
    return activeCategory === 'all' || c.category === activeCategory;
  });

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
        {categories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl border transition-all ${
                isActive
                  ? 'border-blue-500/20 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Connector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConnectors.map(conn => {
          const isConnected = conn.status === 'connected' || conn.status === 'degraded';
          const isDegraded = conn.status === 'degraded';

          return (
            <div
              key={conn.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between shadow-sm min-h-[220px] ${
                isConnected 
                  ? 'border-blue-200 dark:border-blue-900/40' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card top */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  {/* Category icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isConnected 
                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {conn.category === 'billing' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : conn.category === 'erp' ? (
                      <ShoppingBag className="w-5 h-5" />
                    ) : conn.category === 'support' ? (
                      <MessageSquare className="w-5 h-5" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                  </div>

                  {/* Status Badge */}
                  {isConnected ? (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider flex items-center gap-1 ${
                      isDegraded 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {isDegraded ? (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>DEGRADED</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          <span>CONNECTED</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded text-[8px] font-bold font-mono tracking-wider">
                      AVAILABLE
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white text-[12px]">{conn.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed min-h-[36px] line-clamp-2">
                    {conn.desc}
                  </p>
                </div>
              </div>

              {/* Action footer */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-3 flex justify-between items-center">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">
                  {conn.category} INT
                </span>

                {isConnected ? (
                  <button
                    onClick={() => onSelectConnector(conn)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {isRtl ? 'الإعدادات' : 'Configure'}
                  </button>
                ) : (
                  <button
                    onClick={() => onLaunchOAuth(conn)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isRtl ? 'ربط الموصل' : 'Link App'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
