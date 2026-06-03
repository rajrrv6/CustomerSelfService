'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { mockAuditEvents, mockCompliancePolicies } from './mockAuditData';
import { AuditEventsTable } from './AuditEventsTable';
import { CompliancePoliciesTable } from './CompliancePoliciesTable';
import { AuditEventDetailsModal } from './AuditEventDetailsModal';
import { AuditEvent, CompliancePolicy, AuditEventStatus, ComplianceState, AuditEventSeverity } from '@/types/audit';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { ShieldCheck, AlertOctagon, Terminal, Activity, FileText, Search, Plus, Calendar, Filter, HelpCircle } from 'lucide-react';

export function AuditOverviewTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const t = translations[lang];
  const auditT = (t.superAdmin as any).audit || {
    title: isRtl ? 'سجل التدقيق والامتثال الأمني' : 'Audit & Compliance Registry',
    description: isRtl ? 'مراقبة وتتبع السجلات غير القابلة للتغيير وتكوين سياسات الأمان للمنصة.' : 'Track immutable global audit trails and secure compliance configurations for the platform.',
    totalEvents: isRtl ? 'إجمالي الأحداث الأمنية' : 'Total Audit Events',
    securityAlerts: isRtl ? 'التنبيهات الأمنية الحرجة' : 'Critical Alerts',
    policyViolations: isRtl ? 'مخالفات السياسة النشطة' : 'Active Violations',
    complianceRate: isRtl ? 'معدل الامتثال العام' : 'Global Compliance Rate',
    eventsTab: isRtl ? 'سجلات تدقيق العمليات' : 'Operation Audit Logs',
    policiesTab: isRtl ? 'سياسات وقواعد الامتثال' : 'Compliance Policies'
  };

  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'policies'>('logs');
  const [events, setEvents] = useState<AuditEvent[]>(mockAuditEvents);
  const [policies, setPolicies] = useState<CompliancePolicy[]>(mockCompliancePolicies);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');

  // Modal details state
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Create Policy Modal state
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Omit<CompliancePolicy, 'id' | 'lastUpdated' | 'complianceState'>>({
    name: '',
    category: 'Access Control',
    status: 'enabled',
    assignedScope: 'Global Platform',
    description: ''
  });

  // Derived Calculations
  const totalEventsCount = events.length;
  const criticalAlertsCount = events.filter(e => e.severity === 'critical' || e.severity === 'high').length;
  const violationsCount = policies.filter(p => p.status === 'enabled' && p.complianceState === 'violated').length;
  
  const enabledPoliciesCount = policies.filter(p => p.status === 'enabled').length;
  const compliantPoliciesCount = policies.filter(p => p.status === 'enabled' && p.complianceState === 'compliant').length;
  const compliancePercentage = enabledPoliciesCount > 0 ? Math.round((compliantPoliciesCount / enabledPoliciesCount) * 100) : 100;

  // Handlers for Audit Events
  const handleViewDetails = (evt: AuditEvent) => {
    setSelectedEvent(evt);
    setShowEventModal(true);
  };

  const handleMarkReviewed = (evt: AuditEvent) => {
    setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, status: 'reviewed' as AuditEventStatus } : e));
    pushToast(
      'success',
      isRtl ? 'تمت مراجعة السجل الأمني' : 'Audit Event Reviewed',
      isRtl ? `تم تعليم السجل "${evt.id}" كمراجع بنجاح.` : `Successfully marked audit event ${evt.id} as reviewed.`
    );
    addAuditLog(`Reviewed security audit event: ${evt.id}`, 'success');
  };

  const handleExport = (evt: AuditEvent) => {
    pushToast(
      'success',
      isRtl ? 'تم تصدير ملف التدقيق' : 'Audit Log Exported',
      isRtl ? `تم تجهيز ملف السجل الأمني "${evt.id}" للتصدير إلى SIEM.` : `Prepared security audit payload "${evt.id}" for SIEM extraction.`
    );
    addAuditLog(`Exported audit event data: ${evt.id}`, 'success');
  };

  // Handlers for Policies
  const handleTogglePolicy = (policy: CompliancePolicy) => {
    const nextStatus = policy.status === 'disabled' ? 'enabled' : 'disabled';
    setPolicies(prev => prev.map(p => p.id === policy.id ? {
      ...p,
      status: nextStatus,
      complianceState: nextStatus === 'disabled' ? 'disabled' as ComplianceState : p.complianceState
    } : p));

    pushToast(
      'success',
      nextStatus === 'enabled' ? (isRtl ? 'تم تفعيل السياسة الأمنية' : 'Policy Enforced') : (isRtl ? 'تم تعطيل السياسة الأمنية' : 'Policy Suspended'),
      isRtl ? `تغيرت حالة تطبيق السياسة لـ "${policy.name}".` : `Compliance enforcement status for "${policy.name}" updated to ${nextStatus}.`
    );
    addAuditLog(`Toggled compliance policy: ${policy.name} to ${nextStatus}`, 'success');
  };

  const handleArchivePolicy = (policy: CompliancePolicy) => {
    setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, status: 'archived' as const } : p));
    pushToast(
      'success',
      isRtl ? 'تم أرشفة سياسة الامتثال' : 'Policy Archived',
      isRtl ? `تم إرسال السياسة "${policy.name}" للأرشيف.` : `Compliance rule "${policy.name}" sent to archives.`
    );
    addAuditLog(`Archived compliance policy: ${policy.name}`, 'success');
  };

  const handleCreatePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicy.name.trim() || !newPolicy.description.trim()) return;

    const policy: CompliancePolicy = {
      id: `pol-${Date.now().toString().slice(-4)}`,
      name: newPolicy.name,
      category: newPolicy.category,
      status: newPolicy.status as 'enabled' | 'disabled',
      lastUpdated: new Date().toISOString().split('T')[0],
      assignedScope: newPolicy.assignedScope,
      complianceState: 'compliant',
      description: newPolicy.description
    };

    setPolicies(prev => [policy, ...prev]);
    pushToast(
      'success',
      isRtl ? 'تم إنشاء سياسة امتثال جديدة' : 'Compliance Policy Registered',
      isRtl ? `تم تسجيل سياسة "${policy.name}" بنجاح.` : `Policy rule "${policy.name}" registered and assigned successfully.`
    );
    addAuditLog(`Created compliance policy rule: ${policy.name}`, 'success');
    setShowPolicyModal(false);
    setNewPolicy({
      name: '',
      category: 'Access Control',
      status: 'enabled',
      assignedScope: 'Global Platform',
      description: ''
    });
  };

  // Local Filter Logic
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.actionType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesTenant = tenantFilter === 'all' || e.tenantId === tenantFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesTenant;
  });

  const filteredPolicies = policies.filter(p => {
    if (p.status === 'archived') return false; // Ignore archived policies in main screen

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.assignedScope.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesState = statusFilter === 'all' ||
                         (statusFilter === 'disabled' && p.status === 'disabled') ||
                         (p.status === 'enabled' && p.complianceState === statusFilter);
    return matchesSearch && matchesCategory && matchesState;
  });

  // Dynamic values for dropdown filters
  const uniqueTenants = Array.from(new Set(events.map(e => e.tenantId))).map(id => {
    const match = events.find(e => e.tenantId === id);
    return { id, name: match ? match.tenantName : id };
  });

  const uniqueCategories = Array.from(new Set(policies.map(p => p.category)));

  return (
    <div id="h2db4u" className="space-y-6">
      <SectionHeader
        title={auditT.title}
        description={auditT.description}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <OperationalCard hoverEffect={false} className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {auditT.totalEvents}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {totalEventsCount}
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-rose-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0 border border-rose-100/50 dark:border-rose-900/30 animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {auditT.securityAlerts}
              </p>
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-450 font-mono mt-0.5">
                {criticalAlertsCount}
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100/50 dark:border-amber-900/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {auditT.policyViolations}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {violationsCount}
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-emerald-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {auditT.complianceRate}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {compliancePercentage}%
              </h3>
            </div>
          </div>
        </OperationalCard>
      </div>

      {/* Sub-tabs switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => {
            setActiveSubTab('logs');
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
            activeSubTab === 'logs'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{auditT.eventsTab}</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('policies');
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
            activeSubTab === 'policies'
              ? 'border-blue-600 text-blue-600 dark:text-blue-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{auditT.policiesTab}</span>
        </button>
      </div>

      {/* Filter panel HUD */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status filters buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit overflow-x-auto scrollbar-none shrink-0 border border-slate-200 dark:border-slate-800">
          {(activeSubTab === 'logs'
            ? (['all', 'open', 'reviewed', 'escalated', 'archived'] as const)
            : (['all', 'compliant', 'warning', 'violated', 'disabled'] as const)
          ).map((filter) => {
            const isActive = statusFilter === filter;
            const labels: Record<string, { en: string; ar: string }> = {
              all: { en: 'All Statuses', ar: 'كل الحالات' },
              open: { en: 'Open Logs', ar: 'السجلات المفتوحة' },
              reviewed: { en: 'Reviewed', ar: 'تمت مراجعتها' },
              escalated: { en: 'Escalated', ar: 'تم تصعيدها' },
              archived: { en: 'Archived', ar: 'مؤرشفة' },
              compliant: { en: 'Compliant Policies', ar: 'سياسات ممتثلة' },
              warning: { en: 'Warnings', ar: 'تحذيرات' },
              violated: { en: 'Violations', ar: 'مخالفات' },
              disabled: { en: 'Disabled', ar: 'معطلة' }
            };
            const current = labels[filter] || { en: filter, ar: filter };
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                {isRtl ? current.ar : current.en}
              </button>
            );
          })}
        </div>

        {/* Action Panel HUD Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl items-stretch sm:items-center min-w-0 justify-end">
          {activeSubTab === 'logs' ? (
            <>
              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold shrink-0"
              >
                <option value="all">{isRtl ? 'كل مستويات الخطورة' : 'All Severities'}</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              {/* Tenant Filter */}
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold shrink-0 max-w-[150px] truncate"
              >
                <option value="all">{isRtl ? 'جميع المستأجرين' : 'All Tenants'}</option>
                {uniqueTenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </>
          ) : (
            /* Category Filter for Policies */
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold shrink-0"
            >
              <option value="all">{isRtl ? 'جميع فئات السياسات' : 'All Categories'}</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-450" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'logs'
                  ? (isRtl ? 'البحث بالفاعل أو العملية...' : 'Search logs by actor or action...')
                  : (isRtl ? 'البحث باسم السياسة أو النطاق...' : 'Search policies by scope or details...')
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            />
          </div>

          {/* Add Policy button */}
          {activeSubTab === 'policies' && (
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer shrink-0 font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة سياسة' : 'Add Policy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid view selection */}
      {activeSubTab === 'logs' ? (
        <AuditEventsTable
          data={filteredEvents}
          onViewDetails={handleViewDetails}
          onMarkReviewed={handleMarkReviewed}
          onExport={handleExport}
        />
      ) : (
        <CompliancePoliciesTable
          data={filteredPolicies}
          onToggle={handleTogglePolicy}
          onArchive={handleArchivePolicy}
          onAddClick={() => setShowPolicyModal(true)}
        />
      )}

      {/* Read-only Event Details Modal */}
      <AuditEventDetailsModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        event={selectedEvent}
      />

      {/* Create Compliance Policy Modal */}
      <ModalWrapper
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title={isRtl ? 'تسجيل سياسة أمنية وامتثال جديدة' : 'Add Compliance Security Policy'}
      >
        <form onSubmit={handleCreatePolicySubmit} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'اسم سياسة الامتثال' : 'Compliance Policy Name'}
            </label>
            <input
              type="text"
              required
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              placeholder={isRtl ? 'مثال: سياسة المصادقة الثنائية' : 'e.g. MFA Session Timeout Policy'}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'فئة القاعدة الأمنية' : 'Policy Category'}
              </label>
              <select
                value={newPolicy.category}
                onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-850 dark:text-slate-100 font-semibold"
              >
                <option value="Access Control">Access Control</option>
                <option value="Ingestion Pipeline">Ingestion Pipeline</option>
                <option value="Omnichannel Safety">Omnichannel Safety</option>
                <option value="Billing & SLA">Billing & SLA</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'نطاق التطبيق المعني' : 'Assigned Scope'}
              </label>
              <input
                type="text"
                required
                value={newPolicy.assignedScope}
                onChange={(e) => setNewPolicy({ ...newPolicy, assignedScope: e.target.value })}
                placeholder={isRtl ? 'مثال: تسجيل دخول مدراء المستأجرين' : 'e.g. Ingestion Vector Databases'}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'شرح السياسة وتوجيهات الامتثال' : 'Policy Rule Details / Specifications'}
            </label>
            <textarea
              required
              rows={3}
              value={newPolicy.description}
              onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
              placeholder={isRtl ? 'مثال: يجب تفعيل التحقق الثنائي لكافة الحسابات الإدارية وتوثيق محاولات الدخول الخاطئة.' : 'e.g. Monitor active administrator user credentials and trigger alert protocols.'}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isRtl ? 'تسجيل القاعدة' : 'Add Policy'}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
