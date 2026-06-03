'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { KnowledgeConnector } from '@/types/knowledgeConnector';
import { mockKnowledgeConnectors } from './mockKnowledgeConnectors';
import { KnowledgeConnectorTable } from './KnowledgeConnectorTable';
import { KnowledgeConnectorFormModal } from './KnowledgeConnectorFormModal';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { RefreshCw, Plus, Database } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';

export function KnowledgeConnectorRegistry() {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [connectors, setConnectors] = useState<KnowledgeConnector[]>(mockKnowledgeConnectors);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<KnowledgeConnector | null>(null);

  // Sync state tracking to prevent multiple triggers on the same connector
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  const handleCreateClick = () => {
    setEditingConnector(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (connector: KnowledgeConnector) => {
    setEditingConnector(connector);
    setIsFormOpen(true);
  };

  const handleSaveConnector = (data: Omit<KnowledgeConnector, 'id' | 'lastSync'> & { id?: string }) => {
    if (data.id) {
      // Edit mode
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === data.id
            ? {
                ...c,
                name: data.name,
                type: data.type,
                endpointUrl: data.endpointUrl,
                description: data.description,
                owner: data.owner,
                syncFrequency: data.syncFrequency
              }
            : c
        )
      );
      pushToast(
        'success',
        isRtl ? 'تم تحديث الموصل' : 'Connector Updated',
        isRtl ? 'تم بنجاح حفظ تعديلات إعدادات الموصل.' : 'Successfully updated knowledge connector configuration.'
      );
    } else {
      // Create mode
      const newConnector: KnowledgeConnector = {
        id: `conn-${Date.now()}`,
        name: data.name,
        type: data.type,
        status: 'pending',
        lastSync: isRtl ? 'قيد الانتظار للمزامنة الأولى' : 'Pending Initial Sync',
        owner: data.owner,
        endpointUrl: data.endpointUrl,
        description: data.description,
        syncFrequency: data.syncFrequency
      };
      setConnectors((prev) => [newConnector, ...prev]);
      pushToast(
        'success',
        isRtl ? 'تم إنشاء الموصل' : 'Connector Created',
        isRtl ? 'تم إضافة موصل المعرفة الجديد بنجاح في سجل المراقبة.' : 'Successfully registered new connector, initial synchronization is pending.'
      );
    }
  };

  const handleDeleteConnector = (id: string) => {
    setConnectors((prev) => prev.filter((c) => c.id !== id));
    pushToast(
      'success',
      isRtl ? 'تم حذف الموصل' : 'Connector Deleted',
      isRtl ? 'تم إزالة الموصل المختار من السجل.' : 'Successfully removed knowledge connector from the registry.'
    );
  };

  const handleSyncConnector = (connector: KnowledgeConnector) => {
    if (syncingIds.has(connector.id)) return;

    // Track as syncing
    setSyncingIds((prev) => {
      const next = new Set(prev);
      next.add(connector.id);
      return next;
    });

    // Update connector status in table UI
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === connector.id
          ? {
              ...c,
              status: 'pending',
              lastSync: isRtl ? 'جاري المزامنة...' : 'Synchronizing...'
            }
          : c
      )
    );

    // Simulate crawl/index delay
    setTimeout(() => {
      // Clean up sync states
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(connector.id);
        return next;
      });

      // Update to active/error with timestamp
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const isSuccess = connector.id !== 'conn-4'; // Let conn-4 (Google Drive HR) fail to show simulated error handling

      setConnectors((prev) =>
        prev.map((c) =>
          c.id === connector.id
            ? {
                ...c,
                status: isSuccess ? 'active' : 'error',
                lastSync: dateStr
              }
            : c
        )
      );

      if (isSuccess) {
        pushToast(
          'success',
          isRtl ? 'اكتملت مزامنة البيانات' : 'Sync Completed',
          isRtl ? `تمت فهرسة أحدث الملفات لموصل "${connector.name}".` : `Successfully crawled and indexed new RAG documents for "${connector.name}".`
        );
      } else {
        pushToast(
          'error',
          isRtl ? 'فشلت المزامنة' : 'Sync Failed',
          isRtl ? `فشل الوصول للملفات في موصل "${connector.name}". انتهت صلاحية المصادقة.` : `Unable to handshake with cloud host for "${connector.name}". Access token has expired.`
        );
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-105/50 dark:border-blue-900/30">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
              {isRtl ? 'سجل الموصلات النشطة' : 'Active Connection Registry'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isRtl ? 'إدارة وجدولة وتتبع صحة مستودعات المزامنة والملفات للـ RAG.' : 'Manage, schedule, and track sync health for RAG document stores.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة موصل' : 'Add Connector'}</span>
        </button>
      </div>

      <KnowledgeConnectorTable
        data={connectors}
        lang={lang}
        onEdit={handleEditClick}
        onDelete={handleDeleteConnector}
        onSync={handleSyncConnector}
      />

      <KnowledgeConnectorFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        connector={editingConnector}
        onSave={handleSaveConnector}
        lang={lang}
      />
    </div>
  );
}
