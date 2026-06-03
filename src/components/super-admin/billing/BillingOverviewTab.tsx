'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { mockSubscriptionPlans, mockTenantBillingRecords } from './mockBillingData';
import { SubscriptionPlansTable } from './SubscriptionPlansTable';
import { TenantBillingTable } from './TenantBillingTable';
import { BillingPlanModal } from './BillingPlanModal';
import { SubscriptionPlan, TenantBillingRecord, BillingStatus, PlanStatus } from '@/types/billing';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { CreditCard, DollarSign, Users, ShieldAlert, BarChart3, Search, Plus, Calendar, Coins, CheckCircle } from 'lucide-react';

export function BillingOverviewTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const t = translations[lang];
  const billingT = (t.superAdmin as any).billing || {
    title: isRtl ? 'الفوترة والاشتراكات للمنصة' : 'Platform Billing & Subscriptions',
    description: isRtl ? 'إدارة خطط أسعار المستأجرين، دورات الفوترة، وفواتير الاستخدام للمنصة.' : 'Manage client tenant subscription tiers, billing cycles, and platform usage invoices.',
    activeSubs: isRtl ? 'الاشتراكات النشطة' : 'Active Subscriptions',
    mrr: isRtl ? 'الإيرادات الشهرية MRR' : 'Monthly Revenue (MRR)',
    outstandingInvoices: isRtl ? 'فواتير متأخرة السداد' : 'Outstanding Invoices',
    tierShare: isRtl ? 'توزيع الفئات' : 'Tier Share',
    tenantsTab: isRtl ? 'حسابات فوترة المستأجرين' : 'Tenant Billing Accounts',
    plansTab: isRtl ? 'خطط أسعار المنصة' : 'Subscription Price Plans'
  };

  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'plans'>('tenants');
  const [plans, setPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
  const [records, setRecords] = useState<TenantBillingRecord[]>(mockTenantBillingRecords);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  // Modals state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<TenantBillingRecord, 'id'>>({
    tenantName: '',
    currentPlanId: 'plan-growth',
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceStatus: 'paid',
    monthlySpend: 299,
    usageTier: 'growth',
    billingStatus: 'active'
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<TenantBillingRecord | null>(null);

  // Calculations
  const activeSubs = records.filter(r => r.billingStatus === 'active' || r.billingStatus === 'trial').length;
  const trialCount = records.filter(r => r.billingStatus === 'trial').length;
  const expiredCount = records.filter(r => r.billingStatus === 'expired').length;
  const monthlyRevenue = records.reduce((acc, r) => acc + (r.billingStatus === 'active' ? r.monthlySpend : 0), 0);
  const outstandingInvoices = records.filter(r => r.invoiceStatus === 'overdue' || r.invoiceStatus === 'unpaid').length;

  const usageFree = records.filter(r => r.usageTier === 'free').length;
  const usageGrowth = records.filter(r => r.usageTier === 'growth').length;
  const usageEnt = records.filter(r => r.usageTier === 'enterprise').length;

  // Plan Handlers
  const handleAddPlanClick = () => {
    setEditingPlan(null);
    setShowPlanModal(true);
  };

  const handleEditPlanClick = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleSavePlan = (data: Omit<SubscriptionPlan, 'id'> & { id?: string }) => {
    if (data.id) {
      setPlans(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
      pushToast(
        'success',
        isRtl ? 'تم تحديث خطة الأسعار' : 'Billing Plan Updated',
        isRtl ? `تم حفظ التغييرات على خطة "${data.name}".` : `Successfully updated plan parameters for "${data.name}".`
      );
      addAuditLog(`Updated subscription plan: ${data.name}`, 'success');
    } else {
      const plan: SubscriptionPlan = {
        id: `plan-${Date.now()}`,
        ...data
      };
      setPlans(prev => [...prev, plan]);
      pushToast(
        'success',
        isRtl ? 'تم إنشاء خطة الأسعار' : 'Billing Plan Created',
        isRtl ? `تم تسجيل الخطة جديدة "${data.name}".` : `Successfully registered new subscription tier "${data.name}".`
      );
      addAuditLog(`Created new subscription plan: ${data.name}`, 'success');
    }
    setShowPlanModal(false);
  };

  const handleTogglePlan = (plan: SubscriptionPlan) => {
    const nextStatus: PlanStatus = plan.status === 'disabled' ? 'active' : 'disabled';
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: nextStatus } : p));
    pushToast(
      'success',
      nextStatus === 'active'
        ? (isRtl ? 'تم تفعيل خطة الأسعار' : 'Plan Activated')
        : (isRtl ? 'تم تعطيل خطة الأسعار' : 'Plan Disabled'),
      isRtl ? `تم تعديل حالة الخطة "${plan.name}".` : `Changed plan status for "${plan.name}" to ${nextStatus}.`
    );
    addAuditLog(`Toggled subscription plan status: ${plan.name} (${nextStatus})`, 'success');
  };

  const handleArchivePlan = (plan: SubscriptionPlan) => {
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'archived' } : p));
    pushToast(
      'success',
      isRtl ? 'تم أرشفة الخطة' : 'Plan Archived',
      isRtl ? `تم إرسال الخطة "${plan.name}" إلى الأرشيف.` : `Successfully sent "${plan.name}" to archives.`
    );
    addAuditLog(`Archived subscription plan: ${plan.name}`, 'success');
  };

  // Record Handlers
  const handleAddRecordClick = () => {
    setNewRecord({
      tenantName: '',
      currentPlanId: plans[0]?.id || 'plan-growth',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoiceStatus: 'paid',
      monthlySpend: plans[0]?.monthlyPrice || 299,
      usageTier: plans[0]?.usageTier || 'growth',
      billingStatus: 'active'
    });
    setShowRecordModal(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.tenantName.trim()) return;

    const selectedPlan = plans.find(p => p.id === newRecord.currentPlanId);

    const record: TenantBillingRecord = {
      id: `tenant-${Date.now()}`,
      tenantName: newRecord.tenantName,
      currentPlanId: newRecord.currentPlanId,
      renewalDate: newRecord.renewalDate,
      invoiceStatus: newRecord.invoiceStatus,
      monthlySpend: selectedPlan ? selectedPlan.monthlyPrice : newRecord.monthlySpend,
      usageTier: selectedPlan ? selectedPlan.usageTier : newRecord.usageTier,
      billingStatus: newRecord.billingStatus
    };

    setRecords(prev => [record, ...prev]);
    pushToast(
      'success',
      isRtl ? 'تم إضافة سجل المستأجر' : 'Tenant Record Added',
      isRtl ? `تم بنجاح ربط الفوترة للمستأجر "${record.tenantName}".` : `Successfully created billing contract for "${record.tenantName}".`
    );
    addAuditLog(`Created billing record for client: ${record.tenantName}`, 'success');
    setShowRecordModal(false);
  };

  const handleSuspendRecord = (record: TenantBillingRecord) => {
    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, billingStatus: 'suspended', invoiceStatus: 'overdue' } : r));
    pushToast(
      'success',
      isRtl ? 'تم إيقاف الفوترة مؤقتاً' : 'Billing Suspended',
      isRtl ? `تم تعليق حساب المستأجر "${record.tenantName}" لعدم السداد.` : `Successfully suspended billing flow for "${record.tenantName}".`
    );
    addAuditLog(`Suspended billing for client: ${record.tenantName}`, 'failed');
  };

  const handleResumeRecord = (record: TenantBillingRecord) => {
    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, billingStatus: 'active' } : r));
    pushToast(
      'success',
      isRtl ? 'تم استئناف الفوترة' : 'Billing Resumed',
      isRtl ? `تم إعادة تنشيط حساب المستأجر "${record.tenantName}".` : `Successfully resumed billing status for "${record.tenantName}".`
    );
    addAuditLog(`Resumed billing subscription: ${record.tenantName}`, 'success');
  };

  const handleMarkPaid = (record: TenantBillingRecord) => {
    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, invoiceStatus: 'paid', billingStatus: r.billingStatus === 'suspended' ? 'active' : r.billingStatus } : r));
    pushToast(
      'success',
      isRtl ? 'تم تسجيل الفاتورة كمدفوعة' : 'Invoice Marked Paid',
      isRtl ? `تم بنجاح تحديث حالة الفواتير للمستأجر "${record.tenantName}".` : `Marked outstanding balances as paid for "${record.tenantName}".`
    );
    addAuditLog(`Cleared outstanding invoice: ${record.tenantName}`, 'success');
  };

  const handleViewDetails = (record: TenantBillingRecord) => {
    setDetailsRecord(record);
    setShowDetailsModal(true);
  };

  // Local Filter Logic
  const filteredPlans = plans.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesTier = tierFilter === 'all' || p.usageTier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.billingStatus === statusFilter;
    const matchesTier = tierFilter === 'all' || r.usageTier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const activePlanDetails = plans.find(p => p.id === detailsRecord?.currentPlanId);

  return (
    <div id="h2db4u" className="space-y-6">
      <SectionHeader
        title={billingT.title}
        description={billingT.description}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <OperationalCard hoverEffect={false} className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {billingT.activeSubs}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {activeSubs} <span className="text-xs text-slate-400 font-normal">/ {records.length}</span>
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-teal-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100/50 dark:border-teal-900/30">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {billingT.mrr}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                ${monthlyRevenue}
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-rose-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 border border-rose-100/50 dark:border-rose-900/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {billingT.outstandingInvoices}
              </p>
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-455 font-mono mt-0.5">
                {outstandingInvoices}
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-purple-900/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {billingT.tierShare} (E / G / F)
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {usageEnt} <span className="text-xs text-slate-400 font-normal">/</span> {usageGrowth} <span className="text-xs text-slate-400 font-normal">/</span> {usageFree}
              </h3>
            </div>
          </div>
        </OperationalCard>
      </div>

      {/* Inner Sub-tabs switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => {
            setActiveSubTab('tenants');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
            activeSubTab === 'tenants'
              ? 'border-blue-600 text-blue-600 dark:text-blue-600'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{billingT.tenantsTab}</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('plans');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all -mb-px text-[11px] cursor-pointer shrink-0 ${
            activeSubTab === 'plans'
              ? 'border-blue-600 text-blue-600 dark:text-blue-600'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{billingT.plansTab}</span>
        </button>
      </div>

      {/* Filtering HUD */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit overflow-x-auto scrollbar-none shrink-0 border border-slate-200 dark:border-slate-800">
          {(activeSubTab === 'tenants'
            ? (['all', 'active', 'trial', 'overdue', 'suspended', 'expired'] as const)
            : (['all', 'active', 'draft', 'archived', 'disabled'] as const)
          ).map((filter) => {
            const isActive = statusFilter === filter;
            const labels: Record<string, { en: string; ar: string }> = {
              all: { en: 'All Statuses', ar: 'كل الحالات' },
              active: { en: 'Active', ar: 'نشط' },
              trial: { en: 'Trial', ar: 'تجريبي' },
              overdue: { en: 'Overdue', ar: 'متأخر' },
              suspended: { en: 'Suspended', ar: 'موقوف' },
              expired: { en: 'Expired', ar: 'منتهي' },
              draft: { en: 'Draft', ar: 'مسودة' },
              archived: { en: 'Archived', ar: 'مؤرشف' },
              disabled: { en: 'Disabled', ar: 'معطل' }
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
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {isRtl ? current.ar : current.en}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl items-stretch sm:items-center min-w-0">
          {/* Usage Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold shrink-0"
          >
            <option value="all">{isRtl ? 'جميع فئات الاستخدام' : 'All Tiers'}</option>
            <option value="free">Free / Trial</option>
            <option value="growth">Growth</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {/* Search query input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={activeSubTab === 'tenants' ? (isRtl ? 'البحث عن مستأجرين...' : 'Search tenant contracts...') : (isRtl ? 'البحث عن خطط الأسعار...' : 'Search pricing plans...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            />
          </div>

          {/* Table Header Action Button */}
          <button
            onClick={activeSubTab === 'tenants' ? handleAddRecordClick : handleAddPlanClick}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer shrink-0 font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSubTab === 'tenants' ? (isRtl ? 'إضافة مستأجر' : 'Add Tenant') : (isRtl ? 'إنشاء خطة' : 'Create Plan')}</span>
          </button>
        </div>
      </div>

      {/* Render tables based on tab */}
      {activeSubTab === 'tenants' ? (
        <TenantBillingTable
          data={filteredRecords}
          plans={plans}
          onViewDetails={handleViewDetails}
          onSuspend={handleSuspendRecord}
          onResume={handleResumeRecord}
          onMarkPaid={handleMarkPaid}
          onAddClick={handleAddRecordClick}
        />
      ) : (
        <SubscriptionPlansTable
          data={filteredPlans}
          onEdit={handleEditPlanClick}
          onToggle={handleTogglePlan}
          onArchive={handleArchivePlan}
          onAddClick={handleAddPlanClick}
        />
      )}

      {/* Plan modal */}
      <BillingPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        plan={editingPlan}
        onSave={handleSavePlan}
      />

      {/* Record Creation modal */}
      <ModalWrapper
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title={isRtl ? 'إضافة سجل فوترة لمستأجر' : 'Add Client Billing Contract'}
      >
        <form onSubmit={handleSaveRecord} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'اسم المستأجر / المؤسسة' : 'Organization Tenant Name'}
            </label>
            <input
              type="text"
              required
              value={newRecord.tenantName}
              onChange={(e) => setNewRecord({ ...newRecord, tenantName: e.target.value })}
              placeholder={isRtl ? 'مثال: بنك القاهرة الوطني' : 'e.g. Cairo National Bank'}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'الخطة الحالية' : 'Select Plan'}
              </label>
              <select
                value={newRecord.currentPlanId}
                onChange={(e) => setNewRecord({ ...newRecord, currentPlanId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
              >
                {plans.filter(p => p.status !== 'archived').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'تاريخ التجديد' : 'Renewal Date'}
              </label>
              <input
                type="date"
                required
                value={newRecord.renewalDate}
                onChange={(e) => setNewRecord({ ...newRecord, renewalDate: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'حالة السداد للمستأجر' : 'Invoice Payment status'}
              </label>
              <select
                value={newRecord.invoiceStatus}
                onChange={(e) => setNewRecord({ ...newRecord, invoiceStatus: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
              >
                <option value="paid">{isRtl ? 'مدفوعة' : 'Paid'}</option>
                <option value="pending">{isRtl ? 'معلقة' : 'Pending'}</option>
                <option value="overdue">{isRtl ? 'متأخرة' : 'Overdue'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
                {isRtl ? 'حالة الفوترة' : 'Billing Status'}
              </label>
              <select
                value={newRecord.billingStatus}
                onChange={(e) => setNewRecord({ ...newRecord, billingStatus: e.target.value as BillingStatus })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
              >
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="overdue">Overdue</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRecordModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isRtl ? 'تأكيد الربط' : 'Add Contract'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* View billing details modal */}
      <ModalWrapper
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={isRtl ? 'تفاصيل فوترة حساب المستأجر' : 'Client Tenant Billing Details'}
      >
        {detailsRecord && (
          <div className="space-y-4 text-xs font-semibold text-slate-850 dark:text-slate-250">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{detailsRecord.tenantName}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: {detailsRecord.id}</p>
              </div>
              <div className="text-end">
                <span className="text-[10px] text-slate-400 block font-mono">{isRtl ? 'تجديد العقد' : 'RENEWAL'}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {detailsRecord.renewalDate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  {isRtl ? 'خطة الأسعار الحالية' : 'Current Active Plan'}
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-1">
                  {activePlanDetails?.name || detailsRecord.currentPlanId}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  {isRtl ? 'معدل الإنفاق الشهري' : 'Contract Monthly Spend'}
                </span>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 block mt-1 font-mono">
                  ${detailsRecord.monthlySpend}/mo
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {isRtl ? 'حدود استخدام الموارد والـ AI' : 'Active Resource Usage Limits'}
              </h5>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>{isRtl ? 'مقاعد العملاء المستعملة' : 'User Agent Seats'}</span>
                    <span className="font-mono text-slate-655 dark:text-slate-400">
                      {Math.floor((activePlanDetails?.includedSeats || 5) * 0.6)} / {activePlanDetails?.includedSeats || 5}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>{isRtl ? 'رصيد استهلاك الرموز' : 'AI Tokens Consumed'}</span>
                    <span className="font-mono text-slate-655 dark:text-slate-400">
                      {detailsRecord.usageTier === 'free' ? '280K / 500K' : detailsRecord.usageTier === 'growth' ? '4.8M / 10M' : '62.4M / 100M'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-650 h-full rounded-full" style={{ width: detailsRecord.usageTier === 'free' ? '56%' : detailsRecord.usageTier === 'growth' ? '48%' : '62.4%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'إغلاق نافذة التفاصيل' : 'Close Details'}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
}
