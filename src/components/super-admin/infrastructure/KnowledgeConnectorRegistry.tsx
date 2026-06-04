'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { KnowledgeConnector } from '@/types/knowledgeConnector';
import { mockKnowledgeConnectors } from './mockKnowledgeConnectors';
import { KnowledgeConnectorTable } from './KnowledgeConnectorTable';
import { KnowledgeConnectorFormModal } from './KnowledgeConnectorFormModal';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { RefreshCw, Plus, Database, Terminal, Sliders, Cpu, Wrench, CheckCircle } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { DrawerWrapper } from '@/components/shared/DrawerWrapper';

export function KnowledgeConnectorRegistry() {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [connectors, setConnectors] = useState<KnowledgeConnector[]>(mockKnowledgeConnectors);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<KnowledgeConnector | null>(null);

  // Detail drawer state
  const [selectedConnector, setSelectedConnector] = useState<KnowledgeConnector | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'logs' | 'timeline'>('info');

  // Vector DB Maintenance state
  const [isMaintOpen, setIsMaintOpen] = useState(false);
  const [maintType, setMaintType] = useState<'compact' | 'sweep' | 'rebuild'>('compact');
  const [maintStep, setMaintStep] = useState<'idle' | 'running' | 'done'>('idle');
  const [maintProgress, setMaintProgress] = useState(0);

  // Sync state tracking to prevent multiple triggers on the same connector
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [syncProgress, setSyncProgress] = useState<Record<string, string>>({});

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
    if (selectedConnector?.id === id) {
      setSelectedConnector(null);
    }
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

    setSyncingIds((prev) => {
      const next = new Set(prev);
      next.add(connector.id);
      return next;
    });

    const steps = [
      { msg: isRtl ? 'بدء الاتصال بالخادم...' : 'Handshaking...', time: 0 },
      { msg: isRtl ? 'جاري فحص التغييرات...' : 'Checking changes...', time: 800 },
      { msg: isRtl ? 'تحميل الصفحات (15 من 60)...' : 'Ingesting page 15 of 60...', time: 1600 },
      { msg: isRtl ? 'تقسيم المستند إلى متجهات...' : 'Generating embeddings (Pinecone)...', time: 2400 },
      { msg: isRtl ? 'اكتملت المزامنة' : 'Sync completed', time: 3200 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        if (step.time === 3200) {
          setSyncingIds((prev) => {
            const next = new Set(prev);
            next.delete(connector.id);
            return next;
          });
          setSyncProgress((prev) => {
            const next = { ...prev };
            delete next[connector.id];
            return next;
          });

          const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
          const isSuccess = connector.id !== 'conn-4'; 

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
        } else {
          setSyncProgress((prev) => ({
            ...prev,
            [connector.id]: step.msg
          }));
        }
      }, step.time);
    });
  };

  const handleRowClick = (connector: KnowledgeConnector) => {
    setSelectedConnector(connector);
    setActiveTab('info');
  };

  const handleTriggerMaint = () => {
    setMaintStep('running');
    setMaintProgress(0);

    const interval = setInterval(() => {
      setMaintProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setMaintStep('done');
          pushToast(
            'success',
            isRtl ? 'اكتملت عملية الصيانة' : 'Maintenance Completed',
            isRtl
              ? `تم الانتهاء من عملية ${maintType === 'compact' ? 'الضغط' : maintType === 'sweep' ? 'الفحص' : 'إعادة البناء'} بنجاح لمؤشرات متجهات Pinecone.`
              : `Successfully completed ${maintType === 'compact' ? 'Index Compaction' : maintType === 'sweep' ? 'Integrity Sweep' : 'Namespace Rebuild'} on Pinecone index.`
          );
          return 100;
        }
        return p + 10;
      });
    }, 250);
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMaintOpen(true);
              setMaintStep('idle');
              setMaintProgress(0);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-[11px] cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>{isRtl ? 'صيانة المتجهات HUD' : 'Vector Maintenance HUD'}</span>
          </button>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة موصل' : 'Add Connector'}</span>
          </button>
        </div>
      </div>

      <KnowledgeConnectorTable
        data={connectors}
        lang={lang}
        onEdit={handleEditClick}
        onDelete={handleDeleteConnector}
        onSync={handleSyncConnector}
        onToggle={handleToggleConnector}
        onRowClick={handleRowClick}
        syncProgress={syncProgress}
      />

      <KnowledgeConnectorFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        connector={editingConnector}
        onSave={handleSaveConnector}
        lang={lang}
      />

      {/* Knowledge Connector Detail Drawer */}
      <DrawerWrapper
        isOpen={!!selectedConnector}
        onClose={() => setSelectedConnector(null)}
        title={selectedConnector ? (isRtl ? `تفاصيل موصل المعرفة: ${selectedConnector.name}` : `Connector Details: ${selectedConnector.name}`) : ''}
        isRtl={isRtl}
        maxWidthClass="max-w-md"
      >
        {selectedConnector && (
          <div className="space-y-5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {(['info', 'logs'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 text-[11px] font-bold border-b-2 mr-4 transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'border-blue-605 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'info' ? (isRtl ? 'المعلومات' : 'Information') : (isRtl ? 'السجلات' : 'Sync Logs')}
                </button>
              ))}
            </div>

            {activeTab === 'info' ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'المالك المسؤول' : 'Responsible Owner'}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 block">{selectedConnector.owner}</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-855 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'رابط الوصول' : 'Endpoint URL'}</span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1 block break-all">{selectedConnector.endpointUrl || (isRtl ? 'لا يوجد (تحميل ملف)' : 'None (File Upload)')}</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-855 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'تكرار المزامنة' : 'Sync Frequency'}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 block capitalize">{selectedConnector.syncFrequency}</span>
                </div>

                {selectedConnector.description && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-855 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">{isRtl ? 'الوصف' : 'Description'}</span>
                    <p className="text-xs font-normal text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedConnector.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-[10px]">
                <div className="p-3.5 bg-slate-955 text-emerald-400 rounded-xl space-y-2 border border-slate-900 overflow-x-auto max-w-full">
                  <p className="text-slate-500">[2026-06-04 12:00:15] Starting webhook handshake...</p>
                  <p className="text-slate-500">[2026-06-04 12:00:16] Fetching updated namespaces...</p>
                  <p className="text-slate-450">[2026-06-04 12:00:18] Crawled 12 updated routes.</p>
                  <p className="text-slate-450">[2026-06-04 12:00:20] Indexing 48 vector nodes in database...</p>
                  <p className="text-emerald-400">[2026-06-04 12:00:22] SYNC STATUS: SUCCESS (0 errors)</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConnector(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </DrawerWrapper>
    </div>
  );
}

