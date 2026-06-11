import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface CallNotesProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: (notes: string) => void;
}

export function CallNotes({ value, onChange, onSave }: CallNotesProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(value);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">Live Call Notes:</label>
        {onSave && (
          <button
            onClick={handleSave}
            className="text-[9px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {isSaved ? 'Saved!' : 'Save'}
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type call notes, ticket summaries, or customer queries..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] leading-relaxed outline-none focus:border-blue-500"
        />
        {value.trim().length === 0 && (
          <div className="absolute right-3 bottom-3 text-slate-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}
