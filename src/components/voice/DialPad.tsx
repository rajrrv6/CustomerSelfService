import React, { useCallback } from 'react';
import { Delete } from 'lucide-react';

interface DialPadProps {
  value: string;
  onChange: (val: string) => void;
  onKeyPress: (digit: string) => void;
  onBackspace: () => void;
  onCall: () => void;
  disabled?: boolean;
}

// DTMF Frequencies mapping
const dtmfFrequencies: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
};

export function DialPad({ value, onChange, onKeyPress, onBackspace, onCall, disabled }: DialPadProps) {
  
  // Play DTMF Tone helper using Web Audio API
  const playDTMFTone = useCallback((digit: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const freqs = dtmfFrequencies[digit];
      if (!freqs) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext blocked or not supported
    }
  }, []);

  const handleKeyClick = (digit: string) => {
    if (disabled) return;
    playDTMFTone(digit);
    onKeyPress(digit);
  };

  const keys = [
    { num: '1', letters: 'o o' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' }
  ];

  return (
    <div className="space-y-4">
      {/* Dial Input Buffer */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter SIP number..."
          disabled={disabled}
          className="bg-transparent border-none focus:ring-0 text-lg font-mono text-slate-800 dark:text-white font-bold w-full outline-none"
        />
        {value.length > 0 && (
          <button
            onClick={onBackspace}
            disabled={disabled}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800"
          >
            <Delete className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Grid Keypad */}
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {keys.map((k) => (
          <button
            key={k.num}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyClick(k.num)}
            className="w-14 h-14 rounded-full flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 active:scale-95 transition-all outline-none"
          >
            <span className="text-base font-bold font-mono">{k.num}</span>
            <span className="text-[7px] text-slate-400 font-mono tracking-widest">{k.letters || '\u00A0'}</span>
          </button>
        ))}
      </div>

      {/* Call Actions */}
      <button
        onClick={onCall}
        disabled={disabled || value.trim().length === 0}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
      >
        <span>Call Destination</span>
      </button>
    </div>
  );
}
