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

  const handleToggleConnector = (connector: KnowledgeConnector) => {
    const nextStatus = connector.status === 'disabled' ? 'active' : 'disabled';
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === connector.id
          ? {
              ...c,
              status: nextStatus,
              lastSync: nextStatus === 'active' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : c.lastSync
            }
          : c
      )
    );
    pushToast(
      'success',
      nextStatus === 'active'
        ? (isRtl ? 'تم تفعيل الموصل' : 'Connector Enabled')
        : (isRtl ? 'تم تعطيل الموصل' : 'Connector Disabled'),
      isRtl
        ? `تم تحديث حالة الموصل "${connector.name}".`
        : `Successfully changed status of "${connector.name}".`
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
              status: 'synchronizing',
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

  if (connectors.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 mb-4 shadow-sm">
            <Database className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
            {isRtl ? 'لا توجد موصلات معرفة مضافة' : 'No Knowledge Connectors Configured'}
          </h3>
          <p className="text-[10px] text-slate-400 max-w-sm mt-2 mb-6 font-semibold">
            {isRtl
              ? 'يرجى إضافة موصل معرفة جديد لربط مستندات ومصادر RAG الخارجية بنظام المساعد الذكي الخاص بك.'
              : 'Please register a new knowledge connector to link external document stores and resources to your RAG-powered chatbot.'}
          </p>
          <button
            onClick={handleCreateClick}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة موصل معرفة جديد' : 'Add First Knowledge Connector'}</span>
          </button>
        </div>

        <KnowledgeConnectorFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          connector={null}
          onSave={handleSaveConnector}
          lang={lang}
        />
      </div>
    );
  }

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
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
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
        onToggle={handleToggleConnector}
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

