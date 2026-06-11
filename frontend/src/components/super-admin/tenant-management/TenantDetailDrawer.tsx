'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Tenant, TenantStatus } from '@/types/tenant';
import { mockTenantAuditLogs, TenantAuditLog } from './mockTenantData';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { X, Shield, Lock, Eye, EyeOff, Globe, ListFilter, Play, Ban, Copy, Download, Trash2, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { DrawerWrapper } from '@/components/shared/DrawerWrapper';

interface TenantDetailDrawerProps {
  tenant: Tenant;
  onClose: () => void;
  onUpdate: (updated: Tenant) => void;
  onDelete: (id: string) => void;
  onClone: (clonedTenant: Tenant) => void;
}

export function TenantDetailDrawer({ tenant, onClose, onUpdate, onDelete, onClone }: TenantDetailDrawerProps) {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();
  const t = translations[lang];

  const tmT = (t.superAdmin as any).tenantManagement || {
    detail: {
      title: 'Tenant Profile & Configuration',
      overview: 'Overview',
      settings: 'Tenant Settings',
      auditLogs: 'Audit Timeline',
      name: 'Tenant Name',
      domain: 'Domain',
      status: 'Status',
      plan: 'Subscription Plan',
      createdAt: 'Date Created',
      security: 'IP Whitelist & Domain Config',
      whitelistPlaceholder: 'e.g. 192.168.1.1, 10.0.0.0/24',
      saveSettings: 'Save Configuration',
      close: 'Close',
      actions: {
        activate: 'Activate Tenant',
        suspend: 'Suspend Tenant',
        delete: 'Delete Tenant',
        clone: 'Clone Tenant',
        export: 'Export Tenant (JSON)'
      }
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'settings' | 'audit'>('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  // Settings states
  const [ipWhitelistStr, setIpWhitelistStr] = useState(tenant.ipWhitelist.join(', '));
  const [customDomain, setCustomDomain] = useState(tenant.customDomain || '');
  const [adminEmail, setAdminEmail] = useState(tenant.adminEmail);

  // Confirmation Modals State
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [cloneName, setCloneName] = useState('');
  const [cloneDomain, setCloneDomain] = useState('');

  // Audit state
  const [auditLogs, setAuditLogs] = useState<TenantAuditLog[]>(mockTenantAuditLogs[tenant.id] || []);
  const [auditSearch, setAuditSearch] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const whitelist = ipWhitelistStr
      .split(',')
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0);

    const updatedTenant: Tenant = {
      ...tenant,
      adminEmail,
      ipWhitelist: whitelist,
      customDomain: customDomain.trim() || undefined
    };

    onUpdate(updatedTenant);
    pushToast(
      'success',
      isRtl ? 'تم تحديث التكوين' : 'Configuration Updated',
      isRtl
        ? `تم حفظ التغييرات الأمنية والملف للمستأجر "${tenant.name}".`
        : `Successfully saved security and domain profile parameters for "${tenant.name}".`
    );
    addAuditLog(`Updated configuration parameters for tenant: ${tenant.name}`, 'success');

    // Add local audit event log
    const newLog: TenantAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'super_admin',
      action: 'Update IP Whitelist / Custom Domain Configuration',
      ipAddress: '127.0.0.1',
      status: 'success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleToggleStatus = () => {
    setShowSuspendModal(true);
  };

  const confirmToggleStatus = () => {
    const nextStatus: TenantStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
    const updatedTenant: Tenant = {
      ...tenant,
      status: nextStatus,
      billingStatus: nextStatus === 'active' ? 'active' : 'suspended'
    };

    onUpdate(updatedTenant);
    pushToast(
      'success',
      nextStatus === 'active' ? (isRtl ? 'تم تنشيط المستأجر' : 'Tenant Activated') : (isRtl ? 'تم تعليق المستأجر' : 'Tenant Suspended'),
      isRtl
        ? `تم تحديث حالة المستأجر "${tenant.name}" لتصبح نشطة.`
        : `Lifecycle state for "${tenant.name}" updated to ${nextStatus}.`
    );
    addAuditLog(`Updated tenant lifecycle: ${tenant.name} (${nextStatus})`, 'success');

    const newLog: TenantAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'super_admin',
      action: `Set Tenant Lifecycle status to ${nextStatus.toUpperCase()}`,
      ipAddress: '127.0.0.1',
      status: 'success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setShowSuspendModal(false);
  };

  const handleCloneTenant = () => {
    setCloneName(`${tenant.name} (Clone)`);
    setCloneDomain(`clone.${tenant.domain}`);
    setShowCloneModal(true);
  };

  const confirmCloneTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName.trim() || !cloneDomain.trim()) return;

    const clonedTenant: Tenant = {
      ...tenant,
      id: `tenant-clone-${Date.now()}`,
      name: cloneName,
      domain: cloneDomain,
      status: 'trial',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onClone(clonedTenant);

    pushToast(
      'success',
      isRtl ? 'تم استنساخ المستأجر بنجاح' : 'Tenant Cloned Successfully',
      isRtl
        ? `تم إنشاء نسخة مستأجر جديدة "${cloneName}" من المستأجر "${tenant.name}".`
        : `Successfully cloned workspace "${tenant.name}" into "${cloneName}".`
    );
    addAuditLog(`Cloned tenant workspace: ${tenant.name} -> ${cloneName}`, 'success');

    const newLog: TenantAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'super_admin',
      action: 'Initiate Workspace Clone Action',
      ipAddress: '127.0.0.1',
      status: 'success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setShowCloneModal(false);
  };

  const handleExportTenant = () => {
    setShowExportModal(true);
  };

  const confirmExportTenant = () => {
    if (exportFormat === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tenant, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tenant-${tenant.id}-export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const csvContent = `data:text/csv;charset=utf-8,ID,Name,Domain,Plan,Status\n${tenant.id},${tenant.name},${tenant.domain},${tenant.currentPlanId},${tenant.status}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `tenant-${tenant.id}-export.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    pushToast(
      'success',
      isRtl ? 'تم تصدير البيانات' : 'Tenant Exported',
      isRtl ? 'تم إنشاء ملف التصدير وتحميله.' : `Successfully compiled and downloaded tenant configuration in ${exportFormat.toUpperCase()} format.`
    );
    addAuditLog(`Exported config metadata for tenant: ${tenant.name}`, 'success');
    setShowExportModal(false);
  };

  const handleDeleteTenant = () => {
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const confirmDeleteTenant = () => {
    if (deleteConfirmText !== tenant.name) return;

    onDelete(tenant.id);
    pushToast(
      'success',
      isRtl ? 'تم حذف المستأجر نهائياً' : 'Tenant Purged Successfully',
      isRtl ? `تم مسح ملف المستأجر وكافة بياناته من المنصة.` : `Tenant "${tenant.name}" and all associated metadata successfully deleted.`
    );
    addAuditLog(`DELETED tenant workspace: ${tenant.name}`, 'success');
    setShowDeleteModal(false);
  };

  const getStatusText = (status: TenantStatus) => {
    switch (status) {
      case 'active': return isRtl ? 'نشط' : 'Active';
      case 'suspended': return isRtl ? 'معلق' : 'Suspended';
      case 'trial': return isRtl ? 'تجريبي' : 'Trial';
      case 'expired': return isRtl ? 'منتهي الصلاحية' : 'Expired';
    }
  };

  const filteredAuditLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.user.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const customHeader = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
        <Shield className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {tmT.detail.title}
        </h3>
        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
          ID: {tenant.id}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <DrawerWrapper
        isOpen={true}
        onClose={onClose}
        title={customHeader}
        isRtl={isRtl}
        maxWidthClass="max-w-lg"
        noPadding={true}
      >

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 text-[11px] font-bold border-b-2 mr-4 transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tmT.detail.overview}
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`py-3 text-[11px] font-bold border-b-2 mr-4 transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tmT.detail.settings}
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`py-3 text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tmT.detail.auditLogs}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeSubTab === 'overview' && (
            <div className="space-y-5">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.detail.name}
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                    {tenant.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.detail.domain}
                  </p>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                    {tenant.domain}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.detail.status}
                  </p>
                  <p className={`text-xs font-bold mt-0.5 ${
                    tenant.status === 'suspended' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {getStatusText(tenant.status)}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.detail.plan}
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                    {tenant.currentPlanId === 'plan-enterprise' ? 'Enterprise Tier' : tenant.currentPlanId === 'plan-growth' ? 'Growth Tier' : 'Free Trial'}
                  </p>
                </div>
                <div className="mt-2 col-span-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {isRtl ? 'البريد الإلكتروني للمسؤول' : 'Administrator Email'}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    {tenant.adminEmail}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {isRtl ? 'المقاعد النشطة' : 'Seats Load'}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    {tenant.activeSeats} / {tenant.maxSeats} {isRtl ? 'مقعد' : 'seats'}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {tmT.detail.createdAt}
                  </p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {tenant.createdAt}
                  </p>
                </div>
              </div>

              {/* API Key Panel */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'مفتاح بوابة API الفعال' : 'Active API Gateway Token'}</span>
                  </span>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {showApiKey ? (
                      <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" />{isRtl ? 'إخفاء' : 'Hide'}</span>
                    ) : (
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{isRtl ? 'إظهار' : 'Show'}</span>
                    )}
                  </button>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 break-all select-all">
                  {showApiKey ? tenant.apiKey : '••••••••••••••••••••••••••••••••••••••••'}
                </div>
              </div>

              {/* NLU Orchestrator Profile */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    {isRtl ? 'نسخة محرك NLU الفعالة' : 'Active NLU Profile'}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {isRtl ? 'الإصدار الموزع حالياً في خادم الاستدلال.' : 'Currently served pipeline version in inference nodes.'}
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                  {tenant.nluVersion}
                </span>
              </div>

              {/* Resource Usage Limits HUD */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isRtl ? 'استهلاك الموارد النشطة' : 'Resource Utilization Index'}</span>
                </h4>
                
                <div className="space-y-3 font-semibold text-xs text-slate-700 dark:text-slate-350">
                  {/* Seats usage progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>{isRtl ? 'مقاعد العملاء' : 'Active Seats Usage'}</span>
                      <span className="font-mono">{tenant.activeSeats} / {tenant.maxSeats}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(tenant.activeSeats / (tenant.maxSeats || 1)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Tokens usage progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>{isRtl ? 'رصيد استهلاك الرموز' : 'Inference Token Budget'}</span>
                      <span className="font-mono">
                        {tenant.currentPlanId === 'plan-enterprise' ? '45.8M / 100M' : tenant.currentPlanId === 'plan-growth' ? '4.8M / 10M' : '120K / 500K'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: tenant.currentPlanId === 'plan-enterprise' ? '45.8%' : tenant.currentPlanId === 'plan-growth' ? '48%' : '24%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'settings' && (
            <form onSubmit={handleSaveConfig} className="space-y-5">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{tmT.detail.security}</span>
              </h4>

              {/* Admin Email field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                  {isRtl ? 'البريد الإلكتروني للمسؤول' : 'Admin Contact Email'}
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Domain Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                  {isRtl ? 'نطاق مخصص (CNAME)' : 'Custom CNAME Mapping'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. portal.mybrand.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              {/* Whitelist Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                  {isRtl ? 'القائمة البيضاء لعناوين IP (مفصولة بفاصلة)' : 'IP Address Whitelist (comma separated)'}
                </label>
                <textarea
                  rows={3}
                  placeholder={tmT.detail.whitelistPlaceholder}
                  value={ipWhitelistStr}
                  onChange={(e) => setIpWhitelistStr(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {tmT.detail.saveSettings}
              </button>
            </form>
          )}

          {activeSubTab === 'audit' && (
            <div className="space-y-4">
              {/* Search filter in Audit */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <ListFilter className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder={isRtl ? 'البحث في الأحداث...' : 'Filter audit actions...'}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Audit List */}
              <div className="space-y-2.5">
                {filteredAuditLogs.length > 0 ? (
                  filteredAuditLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {log.action}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-mono">
                          <span>{log.user}</span>
                          <span>•</span>
                          <span>{log.ipAddress}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1 font-mono text-[9px] text-slate-400">
                        <span>{log.timestamp}</span>
                        <span className={`font-bold ${log.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs text-slate-400">
                    {isRtl ? 'لا توجد سجلات مطابقة.' : 'No audit records match filters.'}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer / Lifecycle Row Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/20 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Suspend/Activate */}
            <button
              onClick={handleToggleStatus}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                tenant.status === 'suspended'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-950/40 dark:bg-emerald-950/20'
                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-950/40 dark:bg-red-950/20'
              }`}
            >
              {tenant.status === 'suspended' ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{tmT.detail.actions.activate}</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>{tmT.detail.actions.suspend}</span>
                </>
              )}
            </button>

            {/* Clone */}
            <button
              onClick={handleCloneTenant}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>{tmT.detail.actions.clone}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Export JSON */}
            <button
              onClick={handleExportTenant}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{tmT.detail.actions.export}</span>
            </button>

            {/* Purge Delete */}
            <button
              onClick={handleDeleteTenant}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-red-200/50 bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{tmT.detail.actions.delete}</span>
            </button>
          </div>
        </div>

      </DrawerWrapper>

      {/* Suspend / Resume Confirmation Modal */}
      <ModalWrapper
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={tenant.status === 'suspended' ? (isRtl ? 'تنشيط المستأجر' : 'Activate Tenant Lifecycle') : (isRtl ? 'تعليق المستأجر' : 'Suspend Tenant Lifecycle')}
      >
        <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-205">
          <div className="flex gap-3 bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/30 p-3.5 rounded-xl text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="leading-relaxed">
              {tenant.status === 'suspended'
                ? (isRtl ? 'سيؤدي هذا الإجراء إلى إعادة تفعيل البوتات وخطوط الاتصال النشطة واسترداد حدود استخدام المقاعد.' : 'This will resume standard operational routes, reactive agent gateways, and active billing limits for the tenant.')
                : (isRtl ? 'سيتم حظر خطوط الربط ومحركات الصوت وتعليق واجهة الاستدلال. سيتم الاحتفاظ بالبيانات والامتثال بأمان.' : 'This will block conversational routes, pause all chatbot integrations, and hold billing status. Data structures and vector stores will remain intact.')}
            </p>
          </div>
          <p className="leading-relaxed text-slate-655 dark:text-slate-400">
            {isRtl ? 'هل ترغب في متابعة تغيير حالة دورة حياة المستأجر؟' : 'Are you sure you want to change this workspace lifecycle status?'}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSuspendModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={confirmToggleStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isRtl ? 'تأكيد الإجراء' : 'Confirm Action'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Delete Confirmation Modal */}
      <ModalWrapper
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={isRtl ? 'حذف حساب المستأجر نهائياً' : 'Purge Tenant Workspace'}
      >
        <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-205">
          <div className="flex gap-3 bg-red-50/50 dark:bg-red-955/10 border border-red-200 dark:border-red-900/30 p-3.5 rounded-xl text-[11px] text-red-700 dark:text-red-400">
            <Trash2 className="w-5 h-5 shrink-0" />
            <p className="leading-relaxed">
              {isRtl ? 'تحذير: هذا الإجراء يحذف بشكل كامل كافة قنوات الاتصال، وفهارس Pinecone، وبيانات الاستهلاك بشكل نهائي ولا يمكن التراجع عنه!' : 'CAUTION: This permanently deletes all channels, chatbot definitions, vector DB name partitions, and telemetry history. This cannot be undone!'}
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'اكتب اسم المستأجر للتأكيد' : 'Type tenant name to confirm'} *
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={tenant.name}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-red-500 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={confirmDeleteTenant}
              disabled={deleteConfirmText !== tenant.name}
              className="px-4 py-2 bg-red-650 disabled:bg-slate-100 dark:disabled:bg-slate-805 text-white disabled:text-slate-400 rounded-xl font-bold hover:bg-red-750 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRtl ? 'حذف نهائي' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Export Options Modal */}
      <ModalWrapper
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={isRtl ? 'تصدير إعدادات المستأجر' : 'Export Tenant Settings'}
      >
        <div className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'صيغة الملف المصدر' : 'Select Export Format'}
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-slate-805 dark:text-slate-100 font-semibold"
            >
              <option value="json">{isRtl ? 'ملف JSON التفاعلي' : 'Standard JSON (*.json)'}</option>
              <option value="csv">{isRtl ? 'جدول CSV التلخيصي' : 'Metadata Ledger CSV (*.csv)'}</option>
            </select>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={confirmExportTenant}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isRtl ? 'تصدير وتحميل' : 'Export Download'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* Clone Tenant Modal */}
      <ModalWrapper
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        title={isRtl ? 'استنساخ مستأجر وبيئة عمل جديدة' : 'Clone Tenant Workspace'}
      >
        <form onSubmit={confirmCloneTenant} className="space-y-4 text-xs font-semibold text-slate-855 dark:text-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'اسم المستأجر الجديد' : 'New Workspace Name'} *
            </label>
            <input
              type="text"
              required
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono">
              {isRtl ? 'النطاق الأساسي الجديد' : 'New Primary Domain'} *
            </label>
            <input
              type="text"
              required
              value={cloneDomain}
              onChange={(e) => setCloneDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCloneModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isRtl ? 'استنساخ وتشغيل' : 'Launch Clone'}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
}
