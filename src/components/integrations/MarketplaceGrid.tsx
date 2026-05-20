import React, { useState } from 'react';
import { CRMConnector } from '@/data/seed/crmConnectorsSeed';
import { Database, Plus, Check, Settings, ShieldAlert, CreditCard, ShoppingBag, MessageSquare, AlertCircle } from 'lucide-react';

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
    <div className="space-y-6 text-xs font-semibold text-slate-350">
      {/* Category selector */}
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
                  : 'border-slate-850 bg-slate-900/60 text-slate-400 hover:border-slate-750'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConnectors.map(conn => {
          const isConnected = conn.status === 'connected' || conn.status === 'degraded';
          const isDegraded = conn.status === 'degraded';

          return (
            <div
              key={conn.id}
              className={`bg-[#0b0f19]/35 border rounded-3xl p-5.5 hover:border-slate-750 transition-all flex flex-col justify-between h-56 ${
                isConnected ? 'border-blue-500/10' : 'border-slate-850'
              }`}
            >
              {/* Card top */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  {/* Category icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                    isConnected 
                      ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
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
                        ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
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
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 rounded text-[8px] font-bold font-mono tracking-wider">
                      AVAILABLE
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-[12px]">{conn.name}</h4>
                  <p className="text-[10px] text-slate-450 font-normal leading-relaxed min-h-[36px] line-clamp-2">
                    {conn.desc}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-850/60 pt-3.5 mt-3 flex justify-between items-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">
                  {conn.category} INT
                </span>

                {isConnected ? (
                  <button
                    onClick={() => onSelectConnector(conn)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-xl font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {isRtl ? 'الإعدادات' : 'Configure'}
                  </button>
                ) : (
                  <button
                    onClick={() => onLaunchOAuth(conn)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10"
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
