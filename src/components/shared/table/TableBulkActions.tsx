'use client';

import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import { Check, AlertTriangle, Loader2 } from 'lucide-react';

export interface BulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (selectedRows: TData[]) => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmText?: string;
  cancelText?: string;
}

interface TableBulkActionsProps<TData> {
  table: Table<TData>;
  actions: BulkAction<TData>[];
  lang: 'en' | 'ar';
}

export function TableBulkActions<TData>({
  table,
  actions,
  lang,
}: TableBulkActionsProps<TData>) {
  const isRtl = lang === 'ar';
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const selectedCount = selectedRows.length;
  
  const [activeAction, setActiveAction] = useState<BulkAction<TData> | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const formatText = (en: string, ar: string) => (isRtl ? ar : en);

  if (selectedCount === 0) return null;

  const handleActionClick = (action: BulkAction<TData>) => {
    if (action.requiresConfirmation) {
      setActiveAction(action);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction<TData>) => {
    setIsExecuting(true);
    try {
      await action.onClick(selectedRows);
      table.resetRowSelection();
      setActiveAction(null);
      
      // Feedback loop
      setFeedbackText(
        formatText(
          `Successfully processed bulk action: ${action.label}`,
          `تم بنجاح تنفيذ الإجراء الجماعي: ${action.label}`
        )
      );
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const getVariantStyles = (variant?: 'primary' | 'secondary' | 'danger' | 'success') => {
    switch (variant) {
      case 'danger':
        return 'bg-red-650 hover:bg-red-700 text-white dark:bg-red-750 dark:hover:bg-red-800';
      case 'success':
        return 'bg-green-650 hover:bg-green-700 text-white dark:bg-green-750 dark:hover:bg-green-800';
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600';
      case 'secondary':
      default:
        return 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-355';
    }
  };

  return (
    <>
      {/* Sliding Bulk Selection Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-6 px-5 py-3.5 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur border border-slate-800/80 rounded-2xl shadow-2xl max-w-[90%] w-max animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400">
            <Check className="w-3.5 h-3.5 font-bold" />
          </div>
          <span className="text-xs font-bold text-slate-100 whitespace-nowrap">
            {selectedCount}{' '}
            {formatText(
              selectedCount === 1 ? 'row selected' : 'rows selected',
              selectedCount === 1 ? 'صف محدد' : 'صفوف محددة'
            )}
          </span>
        </div>

        <div className="w-[1px] h-6 bg-slate-800 shrink-0" />

        <div className="flex items-center gap-2 overflow-x-auto max-w-md no-scrollbar">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all transform hover:scale-[1.02] cursor-pointer whitespace-nowrap ${getVariantStyles(
                  action.variant
                )}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-6 bg-slate-800 shrink-0" />

        <button
          type="button"
          onClick={() => table.resetRowSelection()}
          className="text-[10px] font-bold text-slate-450 hover:text-slate-200 transition-colors uppercase tracking-wider cursor-pointer whitespace-nowrap"
        >
          {formatText('Deselect', 'إلغاء التحديد')}
        </button>
      </div>

      {/* Confirmation Modal */}
      {activeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-550 dark:text-amber-450 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeAction.confirmTitle ||
                    formatText('Confirm Bulk Action', 'تأكيد الإجراء الجماعي')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                  {activeAction.confirmMessage ||
                    formatText(
                      `Are you sure you want to perform this action on ${selectedCount} selected items? This action may be permanent.`,
                      `هل أنت متأكد من أنك تريد تنفيذ هذا الإجراء على ${selectedCount} من السجلات المحددة؟ قد يكون هذا الإجراء دائمًا.`
                    )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-850 dark:text-slate-350 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {activeAction.cancelText || formatText('Cancel', 'إلغاء')}
              </button>
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => executeAction(activeAction)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  activeAction.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
              >
                {isExecuting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {activeAction.confirmText ||
                    (activeAction.variant === 'danger'
                      ? formatText('Delete', 'حذف')
                      : formatText('Confirm', 'تأكيد'))}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {showFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white dark:bg-green-600">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold">{feedbackText}</span>
        </div>
      )}
    </>
  );
}
