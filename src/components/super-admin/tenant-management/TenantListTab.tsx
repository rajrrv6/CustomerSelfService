'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { mockTenants } from './mockTenantData';
import { Tenant, TenantStatus } from '@/types/tenant';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { Search, Plus, Eye, ShieldAlert, CheckCircle, Ban, ArrowUpRight, ShieldCheck, Users } from 'lucide-react';
import { TenantDetailDrawer } from './TenantDetailDrawer';
import { TenantProvisioningWizard } from './TenantProvisioningWizard';
import { BillingStatusBadge } from '../billing/BillingStatusBadge';

export function TenantListTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const t = translations[lang];
  const tmT = (t.superAdmin as any).tenantManagement || {
    list: {
      searchPlaceholder: 'Search tenants by name, domain, or ID...',
      newTenantButton: 'Provision New Tenant',
      tableHeaders: ['Tenant Name', 'Domain', 'Current Plan', 'Billing Status', 'Resource Load', 'Created At', 'Actions'],
      emptyTitle: 'No Tenants Found',
      emptyDesc: 'No tenants match your current filter and search query.'
    }
  };

  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Stats calculation
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active' || t.status === 'trial').length;
  const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;
  const avgLoad = Math.round(tenants.reduce((acc, t) => acc + t.resourceLoad, 0) / (totalTenants || 1));

  // Filters logic
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    const matchesPlan = 
      planFilter === 'all' || 
      (planFilter === 'free' && tenant.currentPlanId === 'plan-free') ||
      (planFilter === 'growth' && tenant.currentPlanId === 'plan-growth') ||
      (planFilter === 'enterprise' && tenant.currentPlanId === 'plan-enterprise');

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleToggleStatus = (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TenantStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
    
    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: nextStatus, billingStatus: nextStatus === 'active' ? 'active' : 'suspended' } : t));
    
    pushToast(
      'success',
      nextStatus === 'active'
        ? (isRtl ? 'تم تفعيل المستأجر' : 'Tenant Activated')
        : (isRtl ? 'تم تعليق المستأجر' : 'Tenant Suspended'),
      isRtl
        ? `تم تحديث حالة المستأجر "${tenant.name}" إلى ${nextStatus === 'active' ? 'نشط' : 'معلق'}.`
        : `Updated status for "${tenant.name}" to ${nextStatus}.`
    );
    addAuditLog(`Toggled tenant lifecycle state: ${tenant.name} (${nextStatus})`, 'success');
  };

  const handleLaunchWizard = () => {
    setShowWizard(true);
  };

  const handleSaveNewTenant = (newTenant: Tenant) => {
    setTenants(prev => [newTenant, ...prev]);
    pushToast(
      'success',
      isRtl ? 'تم إنشاء المستأجر بنجاح' : 'Tenant Created Successfully',
      isRtl
        ? `تم تسجيل ونشر المستأجر "${newTenant.name}" على المنصة.`
        : `Successfully provisioned and deployed "${newTenant.name}" configurations.`
    );
    addAuditLog(`Provisioned new enterprise tenant: ${newTenant.name}`, 'success');
  };



  const getPlanBadge = (planId: string) => {
    if (planId === 'plan-enterprise') {
      return <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 font-mono">ENTERPRISE</span>;
    }
    if (planId === 'plan-growth') {
      return <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">GROWTH</span>;
    }
    return <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">FREE TRIAL</span>;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'إجمالي المستأجرين' : 'Total Tenants'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{totalTenants}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'المستأجرين النشطين' : 'Active & Trial'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{activeTenants}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'الحسابات المعلقة' : 'Suspended Accounts'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{suspendedTenants}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'متوسط حمولة النظام' : 'Avg Platform Load'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{avgLoad}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </OperationalCard>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tmT.list.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[11px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
            <option value="suspended">{isRtl ? 'معلق' : 'Suspended'}</option>
            <option value="trial">{isRtl ? 'تجريبي' : 'Trial'}</option>
            <option value="expired">{isRtl ? 'منتهي' : 'Expired'}</option>
          </select>

          {/* Plan filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="text-[11px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{isRtl ? 'جميع خطط الأسعار' : 'All Plans'}</option>
            <option value="free">{isRtl ? 'خطة مجانية/تجريبية' : 'Free Trial'}</option>
            <option value="growth">{isRtl ? 'خطة النمو' : 'Growth Plan'}</option>
            <option value="enterprise">{isRtl ? 'خطة المؤسسات' : 'Enterprise'}</option>
          </select>

          <button
            onClick={handleLaunchWizard}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>{tmT.list.newTenantButton}</span>
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                {tmT.list.tableHeaders.map((header: string, idx: number) => (
                  <th
                    key={idx}
                    className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-start font-mono"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => setSelectedTenant(tenant)}
                    className="border-b border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {tenant.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {tenant.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {tenant.domain}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getPlanBadge(tenant.currentPlanId)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <BillingStatusBadge status={tenant.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              tenant.resourceLoad > 80 
                                ? 'bg-red-500' 
                                : tenant.resourceLoad > 50 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${tenant.resourceLoad}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400">
                          {tenant.resourceLoad}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                      {tenant.createdAt}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTenant(tenant);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleToggleStatus(tenant, e)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            tenant.status === 'suspended'
                              ? 'border-emerald-200 bg-emerald-50/20 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 dark:border-emerald-950/20'
                              : 'border-red-200 bg-red-50/20 text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:border-red-950/20'
                          }`}
                        >
                          {tenant.status === 'suspended' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {tmT.list.emptyTitle}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {tmT.list.emptyDesc}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Tenant Detail Drawer */}
      {selectedTenant && (
        <TenantDetailDrawer
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onUpdate={(updated) => {
            setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
            setSelectedTenant(updated);
          }}
          onDelete={(id) => {
            setTenants(prev => prev.filter(t => t.id !== id));
            setSelectedTenant(null);
          }}
          onClone={(clonedTenant) => {
            setTenants(prev => [clonedTenant, ...prev]);
            setSelectedTenant(null);
          }}
        />
      )}

      {/* Onboarding Provision Wizard */}
      {showWizard && (
        <TenantProvisioningWizard
          onClose={() => setShowWizard(false)}
          onSave={handleSaveNewTenant}
        />
      )}
    </div>
  );
}
