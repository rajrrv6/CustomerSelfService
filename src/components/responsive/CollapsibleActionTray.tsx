'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleActionTrayProps {
  summary: string;
  children: React.ReactNode;
  /** When false, tray is not used (e.g. desktop) */
  enabled?: boolean;
  defaultOpen?: boolean;
}

/**
 * Progressive disclosure for secondary operational actions on small screens.
 */
export function CollapsibleActionTray({
  summary,
  children,
  enabled = true,
  defaultOpen = false,
}: CollapsibleActionTrayProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        aria-expanded={open}
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {summary}
      </button>
      {open && <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">{children}</div>}
    </div>
  );
}
