'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Plus, Copy, Pause, Archive, Play, Users, Mail, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { Badge } from '@/components/shared/BadgeSystem';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { OperationalActivityFeed } from '@/components/client-admin/shared/OperationalActivityFeed';
import { useClientAdminStore, Campaign } from '@/stores/clientAdminPersistenceStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { translations } from '@/i18n/translations';

export function CampaignsWorkspace() {
  const campaigns = useClientAdminStore((state) => state.campaigns);
  const addCampaign = useClientAdminStore((state) => state.addCampaign);
  const togglePauseCampaign = useClientAdminStore((state) => state.togglePauseCampaign);
  const cloneCampaign = useClientAdminStore((state) => state.cloneCampaign);
  const archiveCampaign = useClientAdminStore((state) => state.archiveCampaign);
  const updateCampaignDelivery = useClientAdminStore((state) => state.updateCampaignDelivery);
  const clearCampaigns = useClientAdminStore((state) => state.clearCampaigns);
  const lang = useClientAdminStore((state) => state.settings.defaultLang);

  const isAr = lang === 'ar';
  const t = translations[lang];

  // Component hydration guard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Campaign['status']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Active delivery metrics rolling update simulation
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      const activeCampaigns = campaigns.filter(c => c.status === 'running');
      if (activeCampaigns.length === 0) return;

      activeCampaigns.forEach((c) => {
        if (c.sent >= c.audienceSize) {
          // Complete campaign
          updateCampaignDelivery(c.id, c.audienceSize, c.audienceSize - Math.floor(c.audienceSize * 0.02), Math.floor(c.audienceSize * 0.02), c.openRate);
          // Manually update status to completed by directly mutating store state or calling custom updates
          useClientAdminStore.setState((state) => ({
            campaigns: state.campaigns.map((item) =>
              item.id === c.id ? { ...item, status: 'completed' } : item
            )
          }));
          
          useNotificationsStore.getState().addAlert({
            category: 'operations',
            source: 'omnichannel',
            severity: 'success',
            alertCode: 'CAMPAIGN_COMPLETED',
            sourceEntity: c.name,
            title: isAr ? 'اكتملت حملة البث' : 'Broadcast Campaign Completed',
            message: isAr 
              ? `تم تسليم الحملة "${c.name}" بالكامل لـ ${c.audienceSize} مستلم.` 
              : `Campaign "${c.name}" has completed delivery to ${c.audienceSize} recipients.`,
            metadata: { campaignId: c.id }
          });
          
          useNotificationsStore.getState().addAuditLog(`Broadcast campaign completed: "${c.name}"`, 'success');
        } else {
          // Increment delivery progress
          const increment = Math.min(Math.floor(50 + Math.random() * 100), c.audienceSize - c.sent);
          const nextSent = c.sent + increment;
          const nextDelivered = Math.floor(nextSent * 0.98);
          const nextFailed = nextSent - nextDelivered;
          const nextOpenRate = c.sent === 0 ? 70.5 : parseFloat((c.openRate + (Math.random() * 2 - 1)).toFixed(1));
          
          updateCampaignDelivery(c.id, nextSent, nextDelivered, nextFailed, Math.max(10, Math.min(100, nextOpenRate)));
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [campaigns, isMounted, updateCampaignDelivery, isAr]);

  const handleCreateCampaign = () => {
    const name = isAr ? `حملة جديدة #${campaigns.length + 1}` : `New Campaign #${campaigns.length + 1}`;
    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      name,
      channel: 'email',
      audienceSize: 1000 + Math.floor(Math.random() * 5000),
      status: 'draft',
      sent: 0,
      openRate: 0,
      delivered: 0,
      failedCount: 0,
    };
    addCampaign(newCampaign);
    setCurrentPage(1);

    useNotificationsStore.getState().addAlert({
      category: 'operations',
      source: 'omnichannel',
      severity: 'success',
      alertCode: 'CAMPAIGN_CREATED',
      sourceEntity: name,
      title: isAr ? 'تم إنشاء حملة جديدة' : 'Campaign Created',
      message: isAr ? `تم إنشاء مسودة للحملة "${name}" بنجاح.` : `Draft Campaign "${name}" created successfully.`,
      metadata: { campaignId: newCampaign.id }
    });
  };

  const handleTogglePause = (id: string) => {
    togglePauseCampaign(id);
  };

  const handleClone = (id: string) => {
    cloneCampaign(id, isAr);
    setCurrentPage(1);
  };

  const handleArchive = (id: string) => {
    archiveCampaign(id);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'running':
        return <Badge type="success">{isAr ? 'نشط' : 'Running'}</Badge>;
      case 'paused':
        return <Badge type="warning">{isAr ? 'مؤقت' : 'Paused'}</Badge>;
      case 'scheduled':
        return <Badge type="info">{isAr ? 'مجدول' : 'Scheduled'}</Badge>;
      case 'completed':
        return <Badge type="success">{isAr ? 'مكتمل' : 'Completed'}</Badge>;
      case 'failed':
        return <Badge type="error">{isAr ? 'فشل' : 'Failed'}</Badge>;
      case 'draft':
      default:
        return <Badge type="neutral">{isAr ? 'مسودة' : 'Draft'}</Badge>;
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase">Loading Campaigns...</span>
      </div>
    );
  }

  // Filter and Query Match Logic
  const filteredCampaigns = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / itemsPerPage));
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeAudienceReach = campaigns
    .filter((c) => c.status === 'running')
    .reduce((acc, c) => acc + c.audienceSize, 0);

  const campaignsWithActivity = campaigns.filter((c) => c.sent > 0);
  const avgOpenRate = campaignsWithActivity.length
    ? (campaignsWithActivity.reduce((acc, c) => acc + c.openRate, 0) / campaignsWithActivity.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <SectionHeader
        title={isAr ? 'إدارة الحملات التوعوية' : 'Broadcast Campaigns'}
        description={isAr ? 'إنشاء وإدارة وتتبع حملات البث والتوعوية عبر البريد الإلكتروني والرسائل النصية والواتساب.' : 'Create, orchestrate, and track outbound broadcast flows over email, SMS, and WhatsApp.'}
        action={
          <button
            onClick={handleCreateCampaign}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء حملة جديدة' : 'Create Campaign'}</span>
          </button>
        }
      />

      {/* KPI Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'إجمالي الحملات' : 'Total Campaigns'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              {campaigns.length}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-blue-600">
            <Mail className="w-5 h-5" />
          </div>
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'الوصول النشط' : 'Active Audience Reach'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              {activeAudienceReach.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </OperationalCard>

        <OperationalCard className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isAr ? 'متوسط نسبة الفتح' : 'Avg Open Rate'}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-white font-mono">
              {avgOpenRate}%
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </OperationalCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table layout */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 text-slate-450 absolute top-2.5 ${isAr ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={isAr ? 'البحث عن طريق اسم الحملة...' : 'Search campaigns by name...'}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 ${
                  isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'
                } text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100`}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-250 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
                <option value="scheduled">{isAr ? 'مجدول' : 'Scheduled'}</option>
                <option value="running">{isAr ? 'نشط' : 'Running'}</option>
                <option value="paused">{isAr ? 'مؤقت' : 'Paused'}</option>
                <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                <option value="failed">{isAr ? 'فشل' : 'Failed'}</option>
              </select>

              {campaigns.length > 0 && (
                <button
                  onClick={clearCampaigns}
                  className="text-xs font-bold text-red-500 border border-red-500/20 hover:bg-red-500/5 rounded-xl px-3 py-2 cursor-pointer transition-all"
                >
                  {isAr ? 'حذف الكل' : 'Clear All'}
                </button>
              )}
            </div>
          </div>

          {filteredCampaigns.length === 0 ? (
            <EmptyState
              title={isAr ? 'لا توجد حملات مسجلة' : 'No Campaigns Found'}
              description={isAr ? 'انقر على "إنشاء حملة جديدة" للبدء بالبث التوعوي لعملائك.' : 'Click "Create Campaign" at the top to build your first broadcast list.'}
              action={
                <button
                  onClick={handleCreateCampaign}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  {isAr ? 'بدء إعداد البث' : 'Build Broadcast Campaign'}
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              <EnterpriseTable
                headers={[
                  isAr ? 'اسم الحملة' : 'Campaign Name',
                  isAr ? 'القناة' : 'Channel',
                  isAr ? 'المستهدفين' : 'Audience',
                  isAr ? 'الحالة' : 'Status',
                  isAr ? 'معدل التسليم والفتح' : 'Delivery & Performance',
                  isAr ? 'الإجراءات' : 'Actions'
                ]}
              >
                {paginatedCampaigns.map((c) => {
                  const percentDelivered = c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(0) : '0';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200">
                        {c.name}
                      </td>
                      <td className="px-6 py-4.5 font-semibold capitalize font-mono text-[10px] text-slate-500">
                        {c.channel}
                      </td>
                      <td className="px-6 py-4.5 font-bold font-mono text-[11px] text-slate-650 dark:text-slate-350">
                        {c.audienceSize.toLocaleString()}
                      </td>
                      <td className="px-6 py-4.5">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-slate-600 dark:text-slate-400">
                        {c.sent > 0 ? (
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between font-mono font-bold">
                              <span>{c.sent.toLocaleString()} sent ({percentDelivered}% Deliv)</span>
                              <span className="text-emerald-500">{c.openRate}% Open</span>
                            </div>
                            <div className="w-40 bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden flex">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${c.openRate}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">Awaiting trigger</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex gap-2">
                          {(c.status === 'running' || c.status === 'paused') && (
                            <button
                              onClick={() => handleTogglePause(c.id)}
                              className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-450 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              title={c.status === 'running' ? 'Pause' : 'Resume'}
                            >
                              {c.status === 'running' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {c.status === 'draft' && (
                            <button
                              onClick={() => {
                                useClientAdminStore.setState((state) => ({
                                  campaigns: state.campaigns.map((item) =>
                                    item.id === c.id ? { ...item, status: 'running' } : item
                                  )
                                }));
                                useNotificationsStore.getState().addAuditLog(`Started broadcast campaign: "${c.name}"`, 'success');
                              }}
                              className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-emerald-600 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              title="Trigger Broadcast"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleClone(c.id)}
                            className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-455 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            title="Clone"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleArchive(c.id)}
                            className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-red-500 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </EnterpriseTable>

              {/* Pagination UI Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-[#111827] border border-slate-205 dark:border-slate-800 px-4 py-3 rounded-2xl text-xs">
                  <div className="text-slate-500 font-semibold">
                    {t.clientAdmin.persistence.pagination.showing
                      .replace('{start}', String((currentPage - 1) * itemsPerPage + 1))
                      .replace('{end}', String(Math.min(currentPage * itemsPerPage, filteredCampaigns.length)))
                      .replace('{total}', String(filteredCampaigns.length))
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

        {/* Action Feeds and Telemetry */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-450 dark:text-slate-500 font-mono tracking-wider">
            {isAr ? 'الأنشطة والتحذيرات التشغيلية' : 'Outbound Alerts & Telemetry'}
          </h3>
          <OperationalActivityFeed filterScope="channels" limit={6} />
        </div>
      </div>
    </div>
  );
}
export default CampaignsWorkspace;
