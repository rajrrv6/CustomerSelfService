'use client';

import React from 'react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';

export function SipTrunkConfigTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="SIP Trunk Voice Configuration"
        description="Configure SIP trunking endpoints, telephony carriers, VoIP networks, and fallback routing lists."
      />

      <OperationalCard hoverEffect={false} className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white">Primary Telephony Carrier Registry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono mb-1.5">Primary VoIP Gate (AST/KSA)</label>
            <input
              type="text"
              readOnly
              value="sip.ksa-trunk.stc.com.sa:5060"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-slate-650 dark:text-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono mb-1.5">Secondary VoIP Gate (Fallback)</label>
            <input
              type="text"
              readOnly
              value="sip.du-trunk.dubai.ae:5060"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-slate-650 dark:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
          <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 mb-2">Trunk Load Balancing</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-transparent" />
              Enable TLS encryption (SIPS)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-transparent" />
              G.711 / G.729 Audio Codec Auto-Negotiate
            </label>
          </div>
        </div>
      </OperationalCard>
    </div>
  );
}
