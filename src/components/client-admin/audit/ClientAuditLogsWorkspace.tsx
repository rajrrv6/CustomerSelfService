'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, Search, User, Key, Database, RefreshCw, Eye, Download, AlertTriangle, Pin, PinOff, Plus, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { DrawerWrapper } from '@/components/shared/DrawerWrapper';
import { Badge } from '@/components/shared/BadgeSystem';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useClientAdminStore, ClientAuditLog } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { translations } from '@/i18n/translations';

export function ClientAuditLogsWorkspace() {
  const auditLogs = useClientAdminStore((state) => state.auditLogs);
  const pinnedAuditLogIds = useClientAdminStore((state) => state.pinnedAuditLogIds);
  const addAuditLog = useClientAdminStore((state) => state.addAuditLog);
  const togglePinAuditLog = useClientAdminStore((state) => state.togglePinAuditLog);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);

  const isAr = lang === 'ar';
  const t = translations[lang];

  // Component hydration guard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ClientAuditLog | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleExport = () => {
    useNotificationsStore.getState().addAuditLog('Exported administrative audit logs to CSV', 'success');

    const headers = ['Timestamp', 'Category', 'Severity', 'Action', 'Actor', 'IP Address'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.category,
      log.severity,
      isAr ? log.actionAr : log.action,
      log.actor,
      log.ip
    ]);

    const filename = `audit_logs_export_${Date.now()}.csv`;
    const content = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    useNotificationsStore.getState().addAlert({
      category: 'compliance',
      source: 'guardrails',
      severity: 'success',
      alertCode: 'AUDIT_EXPORTED',
      sourceEntity: 'SIEM Ledger',
      title: isAr ? 'تم تصدير سجلات التدقيق' : 'Audit Logs Exported',
      message: isAr ? `تم حفظ ملف سجلات التدقيق "${filename}" بنجاح.` : `Audit logs exported successfully to "${filename}".`,
      metadata: { count: filteredLogs.length }
    });
  };

  const handleSimulateAdminAction = () => {
    const actionsPool = [
      {
        action: 'SLA policy altered: Warning limit set to 45 seconds',
        actionAr: 'تعديل اتفاقية الخدمة: تعيين مؤقت التنبيه المبكر لـ ٤٥ ثانية',
        category: 'user' as const,
        severity: 'info' as const,
        payload: { setting: 'warnTimeout', previousValue: 30, nextValue: 45 }
      },
      {
        action: 'API Connection Token Rotated: Vonage REST Credentials',
        actionAr: 'تدوير مفاتيح الوصول لـ API: بيانات Vonage',
        category: 'api' as const,
        severity: 'warning' as const,
        payload: { connector: 'Vonage Broker', credentialsAction: 'rotateKeys' }
      },
      {
        action: 'Jailbreak model intercept: Malicious prompt blocked',
        actionAr: 'اعتراض اختراق النموذج: حظر موجه إدخال خبيث',
        category: 'security' as const,
        severity: 'critical' as const,
        payload: { toxicityScore: 0.94, jailbreakVectorMatched: 'DAN-6.0' }
      }
    ];

    const pick = actionsPool[Math.floor(Math.random() * actionsPool.length)];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newLog: ClientAuditLog = {
      id: `log-${Date.now()}`,
      timestamp,
      category: pick.category,
      action: pick.action,
      actionAr: pick.actionAr,
      actor: 'sudhir.admin@mpaas.io',
      ip: '192.168.1.104',
      severity: pick.severity,
      payload: pick.payload
    };

    addAuditLog(newLog);
    setCurrentPage(1);

    useNotificationsStore.getState().addAlert({
      category: 'operations',
      source: 'guardrails',
      severity: 'success',
      alertCode: 'MOCK_AUDIT_LOG_ADDED',
      sourceEntity: 'Simulator Engine',
      title: isAr ? 'تم إدراج سجل تدقيق جديد' : 'New Audit Log Dispatched',
      message: isAr ? `حدث إداري وهمي: "${pick.actionAr}"` : `Mock admin action logged: "${pick.action}"`,
      metadata: { logId: newLog.id }
    });
  };

  const getCategoryBadge = (cat: ClientAuditLog['category']) => {
    switch (cat) {
      case 'security':
        return <Badge type="error">{isAr ? 'أمن' : 'Security'}</Badge>;
      case 'api':
        return <Badge type="info">{isAr ? 'واجهة' : 'API Connection'}</Badge>;
      case 'ai':
        return <Badge type="warning">{isAr ? 'ذكاء' : 'AI Engine'}</Badge>;
      case 'user':
      default:
        return <Badge type="neutral">{isAr ? 'مستخدم' : 'User Admin'}</Badge>;
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Audit Logs...</span>
      </div>
    );
  }

  // Filters logic
  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);

    const matchCat = filterCategory === 'all' || log.category === filterCategory;
    const matchSev = filterSeverity === 'all' || log.severity === filterSeverity;

    return matchSearch && matchCat && matchSev;
  });

  // Pinned Audit Logs
  const pinnedLogs = auditLogs.filter(log => pinnedAuditLogIds.includes(log.id));

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={isAr ? 'سجل تدقيق العمليات للمشرف' : 'Administrative Audit Logs'}
        description={isAr ? 'سجل الحسابات والامتثال لجميع تغييرات التكوين والسياسات التي قام بها مشرفو النظام.' : 'Compliance audit log recording all branding, route updates, SLA modifications, and security actions.'}
        action={
          <div className="flex gap-2">
            <button
              onClick={handleSimulateAdminAction}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <Plus className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>{isAr ? 'محاكاة حدث إداري' : 'Trigger Mock Action'}</span>
            </button>
            <button
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير السجل الكامل' : 'Export Logs'}</span>
            </button>
          </div>
        }
      />

      {/* Pinned Security Events Cards widgets */}
      {pinnedLogs.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
            <Pin className="w-3.5 h-3.5 text-blue-500" />
            <span>{isAr ? 'الأحداث الأمنية المثبتة' : 'Pinned Critical Events'}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pinnedLogs.map((log) => (
              <OperationalCard key={log.id} className="p-4 flex flex-col justify-between gap-3 border-l-4 border-blue-500 bg-blue-500/5 relative group">
                <button
                  onClick={() => togglePinAuditLog(log.id)}
                  className="absolute top-3.5 end-3.5 text-slate-400 hover:text-red-500 cursor-pointer outline-none"
                  title="Unpin Event"
                >
                  <PinOff className="w-3.5 h-3.5" />
                </button>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[9px] font-bold font-mono">
                    <span className="text-slate-450 uppercase">{log.category}</span>
                    <span className="text-slate-350">•</span>
                    <span className="text-slate-450">{log.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-850 dark:text-white leading-snug pr-6 rtl:pl-6">
                    {isAr ? log.actionAr : log.action}
                  </h4>
                </div>
                <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-slate-100 dark:border-slate-850/80 text-slate-500 font-mono">
                  <span>Actor: {log.actor.split('@')[0]}</span>
                  <span>IP: {log.ip}</span>
                </div>
              </OperationalCard>
            ))}
          </div>
        </div>
      )}

      {/* Filter and query toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex-1 relative">
          <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isAr ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isAr ? 'البحث عن طريق الإجراء، البريد الإلكتروني، أو عنوان IP...' : 'Search logs by action, email, or IP address...'}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 ${
              isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'
            } text-xs font-medium focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100`}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
            <option value="security">{isAr ? 'الأمن والحماية' : 'Security'}</option>
            <option value="api">{isAr ? 'واجهات الاتصال API' : 'API Connections'}</option>
            <option value="ai">{isAr ? 'الذكاء الاصطناعي NLU' : 'AI Intent Engine'}</option>
            <option value="user">{isAr ? 'إجراءات المستخدمين' : 'User Modifications'}</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">{isAr ? 'جميع المستويات' : 'All Severities'}</option>
            <option value="info">{isAr ? 'معلومات' : 'Info'}</option>
            <option value="warning">{isAr ? 'تنبيه' : 'Warning'}</option>
            <option value="critical">{isAr ? 'حرج' : 'Critical'}</option>
          </select>
        </div>
      </div>

      {/* Enterprise Audit Logs Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 font-mono tracking-wider">
            {isAr ? 'قائمة سجل الأحداث والتدقيق' : 'Recorded System Actions & Traces'}
          </h3>
          <span className="font-mono text-[9px] text-slate-450 dark:text-slate-500 font-black">
            {filteredLogs.length} events logged
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            title={isAr ? 'لا توجد سجلات تدقيق' : 'No Audit Logs Match'}
            description={isAr ? 'لم نجد أي سجلات تطابق الكلمة المفتاحية أو خيارات التصفية المعطاة.' : 'Adjust your search queries or filter categories to find logs.'}
          />
        ) : (
          <div className="space-y-4">
            <EnterpriseTable
              headers={[
                isAr ? 'طابع الوقت' : 'Timestamp',
                isAr ? 'الفئة' : 'Category',
                isAr ? 'الإجراء التفصيلي' : 'Action Logs',
                isAr ? 'المستخدم' : 'Actor',
                isAr ? 'عنوان IP' : 'IP Address',
                isAr ? 'إجراءات' : 'Actions'
              ]}
            >
              {paginatedLogs.map((log) => {
                const isPinned = pinnedAuditLogIds.includes(log.id);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(log.category)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 max-w-[280px] truncate">
                      <div className="space-y-0.5">
                        <span>{isAr ? log.actionAr : log.action}</span>
                        {log.severity !== 'info' && (
                          <span className={`block text-[8.5px] font-bold font-mono uppercase ${
                            log.severity === 'critical' ? 'text-red-500 animate-pulse' : 'text-amber-500'
                          }`}>
                            {log.severity} Event
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-650 dark:text-slate-350">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 font-semibold font-mono text-[10px] text-slate-450">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-blue-500 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          title="View payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => togglePinAuditLog(log.id)}
                          className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isPinned ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={isPinned ? 'Unpin Event' : 'Pin Event'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </EnterpriseTable>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 px-4 py-3 rounded-2xl text-xs">
                <div className="text-slate-500 font-semibold font-sans">
                  {t.clientAdmin.persistence.pagination.showing
                    .replace('{start}', String((currentPage - 1) * itemsPerPage + 1))
                    .replace('{end}', String(Math.min(currentPage * itemsPerPage, filteredLogs.length)))
                    .replace('{total}', String(filteredLogs.length))
                  }
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    title={t.clientAdmin.persistence.pagination.previous}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <ChevronLeft className={`w-4 h-4 ${isAr ? 'scale-x-[-1]' : ''}`} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    title={t.clientAdmin.persistence.pagination.next}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <ChevronRight className={`w-4 h-4 ${isAr ? 'scale-x-[-1]' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* JSON Payload Inspector Drawer */}
      {selectedLog && (
        <DrawerWrapper
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white font-sans">
                  {isAr ? 'معاينة تفاصيل الحمولة' : 'Inspection Event Log Payload'}
                </h4>
                <span className="text-[9px] font-mono text-slate-450 block mt-0.5 uppercase">ID: {selectedLog.id}</span>
              </div>
            </div>
          }
        >
          <div className="p-5 space-y-5 text-xs font-semibold">
            <div className="space-y-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-450 uppercase">{isAr ? 'الإجراء:' : 'Action Event:'}</span>
                <p className="font-bold text-slate-850 dark:text-white mt-0.5">{isAr ? selectedLog.actionAr : selectedLog.action}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-850/80 text-[10px]">
                <div>
                  <span className="text-slate-400 block">{isAr ? 'المستخدم:' : 'Actor:'}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{selectedLog.actor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? 'عنوان IP:' : 'IP address:'}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-350">{selectedLog.ip}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 font-mono tracking-wider">
                {isAr ? 'الحمولة التفصيلية الخام JSON' : 'Raw Event Metadata Payload (JSON)'}
              </span>
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 overflow-hidden relative">
                <pre className="text-[9.5px] font-mono text-emerald-400 leading-normal max-w-full overflow-x-auto scrollbar-thin max-h-96">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </DrawerWrapper>
      )}
    </div>
  );
}
export default ClientAuditLogsWorkspace;
