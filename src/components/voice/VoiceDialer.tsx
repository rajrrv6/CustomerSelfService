import React, { useState } from 'react';
import { Phone, Settings, X, Globe, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { DialPad } from './DialPad';
import { sipTrunksSeed, phoneNumberPoolSeed } from '@/data/seed/sipConfigSeed';

interface VoiceDialerProps {
  isOpen: boolean;
  onClose: () => void;
  dialInput: string;
  onDialInputChange: (val: string) => void;
  onDialKeyPress: (digit: string) => void;
  onBackspace: () => void;
  onClearInput: () => void;
  onCall: (number: string, name: string) => void;
  activeCallStatus?: string;
}

export function VoiceDialer({
  isOpen,
  onClose,
  dialInput,
  onDialInputChange,
  onDialKeyPress,
  onBackspace,
  onClearInput,
  onCall,
  activeCallStatus
}: VoiceDialerProps) {
  const [activeTab, setActiveTab] = useState<'dial' | 'sip' | 'pool'>('dial');
  const [activeCallerId, setActiveCallerId] = useState('+1 (800) 555-0199');
  
  if (!isOpen) return null;

  const handleCall = () => {
    onCall(dialInput, 'Outbound SIP Call');
    onClearInput();
  };

  const getTrunkStatusIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />;
    return <AlertCircle className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl z-40 animate-in slide-in-from-bottom-5 duration-200 text-xs font-semibold text-slate-800 dark:text-slate-200 select-none" style={{ borderRadius: '2rem' }}>
      
      {/* Console Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600 animate-pulse" />
          <div>
            <strong className="block text-slate-900 dark:text-white">mPaaS SIP Telephony</strong>
            <span className="text-[9px] text-slate-400 font-mono">Caller ID: {activeCallerId}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs navigation row */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-center">
        <button
          onClick={() => setActiveTab('dial')}
          className={`flex-1 py-2.5 border-b-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'dial'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Phone className="w-3 h-3" />
          <span>Dial Pad</span>
        </button>

        <button
          onClick={() => setActiveTab('sip')}
          className={`flex-1 py-2.5 border-b-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'sip'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>SIP Trunks</span>
        </button>

        <button
          onClick={() => setActiveTab('pool')}
          className={`flex-1 py-2.5 border-b-2 flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'pool'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Settings className="w-3 h-3" />
          <span>DID Pool</span>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="p-4" style={{ minHeight: '300px' }}>
        {activeTab === 'dial' && (
          <DialPad
            value={dialInput}
            onChange={onDialInputChange}
            onKeyPress={onDialKeyPress}
            onBackspace={onBackspace}
            onCall={handleCall}
            disabled={Boolean(activeCallStatus && activeCallStatus !== 'idle')}
          />
        )}

        {activeTab === 'sip' && (
          <div className="space-y-3">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Registered Gateway Routes:</span>
            <div className="space-y-2">
              {sipTrunksSeed.map((trunk) => (
                <div
                  key={trunk.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <strong className="block text-slate-900 dark:text-white leading-none">{trunk.name}</strong>
                    <span className="block text-[9px] text-slate-400 font-mono leading-none">{trunk.gateway}</span>
                    <span className="block text-[9px] text-slate-500 font-mono">Region: {trunk.region}</span>
                  </div>

                  <div className="text-right space-y-1.5">
                    <div className="flex justify-end">{getTrunkStatusIcon(trunk.status)}</div>
                    <span className="block text-[9px] text-slate-500 font-mono font-bold">
                      Channels: {trunk.channels}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pool' && (
          <div className="space-y-3">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Outbound DID Numbers Pool:</span>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {phoneNumberPoolSeed.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 bg-slate-50 dark:bg-slate-950 border rounded-2xl flex justify-between items-center transition-all ${
                    activeCallerId === item.phoneNumber
                      ? 'border-blue-500 bg-blue-50/10'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <strong className="block text-slate-900 dark:text-white font-mono leading-none">{item.phoneNumber}</strong>
                    <span className="block text-[9px] text-slate-500 font-mono uppercase">
                      Type: {item.type} | Status: {item.status}
                    </span>
                  </div>

                  {item.status === 'active' && (
                    <button
                      onClick={() => setActiveCallerId(item.phoneNumber)}
                      className={`px-2 py-1 text-[9px] rounded-lg font-bold transition-all ${
                        activeCallerId === item.phoneNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {activeCallerId === item.phoneNumber ? 'Active' : 'Select'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
