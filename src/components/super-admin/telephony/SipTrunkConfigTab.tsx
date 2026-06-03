'use client';

import React, { useState } from 'react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { Plus, Search, Edit, Trash2, PhoneCall, Wifi, HeartPulse, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { SipTrunk, SipTrunkStatus } from '@/types/telephony';
import { TelephonyStatusBadge } from './TelephonyStatusBadge';

const initialTrunks: SipTrunk[] = [
  {
    id: 'trunk-stc-pri',
    provider: 'AST-KSA STC Primary Gateway',
    ipGateway: 'sip.ksa-trunk.stc.com.sa:5060',
    routePrefix: '966',
    concurrencyLimit: 300,
    activeSessions: 142,
    avgMos: 4.4,
    status: 'active'
  },
  {
    id: 'trunk-du-backup',
    provider: 'Du Dubai Fallback Route',
    ipGateway: 'sip.du-trunk.dubai.ae:5060',
    routePrefix: '971',
    concurrencyLimit: 200,
    activeSessions: 34,
    avgMos: 4.1,
    status: 'active'
  },
  {
    id: 'trunk-zain-test',
    provider: 'Zain Testing Trunk',
    ipGateway: 'sip.zain-trunk.internal:5061',
    routePrefix: '9665',
    concurrencyLimit: 50,
    activeSessions: 0,
    avgMos: 3.5,
    status: 'degraded'
  },
  {
    id: 'trunk-plivo-global',
    provider: 'Plivo Global Telephony Gateway',
    ipGateway: 'sip.plivo.global:5060',
    routePrefix: '1',
    concurrencyLimit: 500,
    activeSessions: 0,
    avgMos: 4.3,
    status: 'inactive'
  },
  {
    id: 'trunk-twilio-dev',
    provider: 'Twilio Sandbox Connect',
    ipGateway: 'sip.twilio.sandbox:5060',
    routePrefix: '19',
    concurrencyLimit: 20,
    activeSessions: 0,
    avgMos: 4.0,
    status: 'connecting'
  }
];

export function SipTrunkConfigTab() {
  const { lang, addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { pushToast } = useFeedbackToasts();

  const [trunks, setTrunks] = useState<SipTrunk[]>(initialTrunks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<SipTrunk | null>(null);

  // Form states
  const [newTrunk, setNewTrunk] = useState<Omit<SipTrunk, 'id'>>({
    provider: '',
    ipGateway: '',
    routePrefix: '',
    concurrencyLimit: 100,
    activeSessions: 0,
    avgMos: 4.2,
    status: 'active'
  });

  const handleCreateClick = () => {
    setEditingTrunk(null);
    setNewTrunk({
      provider: '',
      ipGateway: '',
      routePrefix: '',
      concurrencyLimit: 100,
      activeSessions: 0,
      avgMos: 4.2,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditClick = (trunk: SipTrunk) => {
    setEditingTrunk(trunk);
    setNewTrunk({
      provider: trunk.provider,
      ipGateway: trunk.ipGateway,
      routePrefix: trunk.routePrefix,
      concurrencyLimit: trunk.concurrencyLimit,
      activeSessions: trunk.activeSessions,
      avgMos: trunk.avgMos,
      status: trunk.status
    });
    setShowModal(true);
  };

  const handleToggleTrunk = (trunk: SipTrunk) => {
    const nextStatus: SipTrunkStatus = trunk.status === 'inactive' ? 'active' : 'inactive';
    setTrunks((prev) =>
      prev.map((t) =>
        t.id === trunk.id
          ? {
              ...t,
              status: nextStatus,
              activeSessions: nextStatus === 'inactive' ? 0 : t.activeSessions
            }
          : t
      )
    );
    pushToast(
      'success',
      nextStatus === 'active'
        ? (isRtl ? 'تم تفعيل خط الربط' : 'SIP Trunk Enabled')
        : (isRtl ? 'تم تعطيل خط الربط' : 'SIP Trunk Disabled'),
      isRtl
        ? `تم تحديث حالة الخط "${trunk.provider}".`
        : `Successfully changed status of "${trunk.provider}" to ${nextStatus}.`
    );
    addAuditLog(`Toggled SIP Trunk status: ${trunk.provider} (${nextStatus})`, 'success');
  };

  const handleDeleteClick = (id: string) => {
    const trunk = trunks.find(tr => tr.id === id);
    if (!trunk) return;
    setTrunks((prev) => prev.filter((tr) => tr.id !== id));
    pushToast(
      'success',
      isRtl ? 'تم حذف خط SIP' : 'SIP Trunk Deleted',
      isRtl ? `تم إزالة الخط "${trunk.provider}" من الإعدادات.` : `Successfully deleted SIP trunk "${trunk.provider}".`
    );
    addAuditLog(`Deregistered SIP Trunk: ${trunk.provider}`, 'success');
  };

  const handleSaveTrunk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrunk.provider || !newTrunk.ipGateway) return;

    if (editingTrunk) {
      setTrunks((prev) =>
        prev.map((tr) =>
          tr.id === editingTrunk.id
            ? {
                ...tr,
                provider: newTrunk.provider,
                ipGateway: newTrunk.ipGateway,
                routePrefix: newTrunk.routePrefix,
                concurrencyLimit: newTrunk.concurrencyLimit,
                activeSessions: newTrunk.activeSessions,
                status: newTrunk.status
              }
            : tr
        )
      );
      pushToast(
        'success',
        isRtl ? 'تم تحديث خط SIP' : 'SIP Trunk Updated',
        isRtl ? `تم بنجاح تحديث إعدادات خط "${newTrunk.provider}".` : `Successfully updated SIP trunk "${newTrunk.provider}".`
      );
      addAuditLog(`Updated SIP Trunk config: ${newTrunk.provider}`, 'success');
    } else {
      const trunk: SipTrunk = {
        id: `trunk-${Date.now()}`,
        provider: newTrunk.provider,
        ipGateway: newTrunk.ipGateway,
        routePrefix: newTrunk.routePrefix,
        concurrencyLimit: newTrunk.concurrencyLimit,
        activeSessions: 0,
        avgMos: 4.5,
        status: newTrunk.status
      };
      setTrunks((prev) => [...prev, trunk]);
      pushToast(
        'success',
        isRtl ? 'تم إعداد خط SIP بنجاح' : 'SIP Trunk Provisioned',
        isRtl ? `تم تسجيل وتدشين بوابة الصوت للخط "${trunk.provider}".` : `Successfully provisioned new SIP trunk "${trunk.provider}".`
      );
      addAuditLog(`Provisioned new SIP Trunk: ${trunk.provider}`, 'success');
    }

    setShowModal(false);
    setEditingTrunk(null);
  };

  // Compute telemetry metrics
  const activeCount = trunks.filter(t => t.status === 'active').length;
  const totalConcurrency = trunks.reduce((acc, t) => acc + (t.status === 'active' ? t.concurrencyLimit : 0), 0);
  const averageMos = trunks.length > 0 ? (trunks.reduce((acc, t) => acc + t.avgMos, 0) / trunks.length).toFixed(1) : '0.0';

  // Dynamic carrier list parsing for filters
  const uniqueProviders = Array.from(new Set(trunks.map(t => t.provider.split(' ')[0])));

  const filteredTrunks = trunks.filter((tr) => {
    const matchesSearch =
      tr.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.ipGateway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tr.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || tr.provider.toLowerCase().includes(providerFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const tableHeaders = [
    isRtl ? 'معرف الخط' : 'Trunk ID',
    isRtl ? 'الموفر / البوابة' : 'Provider / Trunk',
    isRtl ? 'عنوان البوابة' : 'Gateway Address',
    isRtl ? 'بادئة التوجيه' : 'Route Prefix',
    isRtl ? 'الحد الأقصى للاتصالات' : 'Concurrency Limit',
    isRtl ? 'الجلسات النشطة' : 'Active Sessions',
    isRtl ? 'جودة الصوت MOS' : 'MOS Quality',
    isRtl ? 'الحالة' : 'Status',
    isRtl ? 'الإجراءات' : 'Actions'
  ];

  if (trunks.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={t.superAdmin.sipTrunk.title}
          description={t.superAdmin.sipTrunk.description}
        />

        <div className="flex flex-col items-center justify-center border border-dashed border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-650 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 mb-4 shadow-sm">
            <PhoneCall className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
            {isRtl ? 'لا توجد خطوط اتصالات مسجلة' : 'No SIP Trunks Provisioned'}
          </h3>
          <p className="text-[10px] text-slate-400 max-w-sm mt-2 mb-6 font-semibold">
            {isRtl
              ? 'يرجى تسجيل وبوابة اتصال SIP جديدة لتمكين الاتصالات الصوتية لعملائك.'
              : 'Please configure a primary voice connectivity gate to link international trunks and enable telephony routes.'}
          </p>
          <button
            onClick={handleCreateClick}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'تهيئة خط SIP جديد' : 'Provision First SIP Trunk'}</span>
          </button>
        </div>

        <ModalWrapper
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTrunk ? (isRtl ? 'تعديل خط الاتصال SIP' : 'Edit SIP Trunk Config') : (isRtl ? 'تهيئة خط SIP جديد' : 'Provision SIP Trunk')}
        >
          <form onSubmit={handleSaveTrunk} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'اسم الموفر / خط الربط' : 'Trunk Provider Label'}
              </label>
              <input
                type="text"
                required
                value={newTrunk.provider}
                onChange={(e) => setNewTrunk({ ...newTrunk, provider: e.target.value })}
                placeholder={isRtl ? 'مثال: stc_primary_ksa' : 'e.g. STC Primary Voice Gateway'}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'عنوان بوابة IP لـ VoIP' : 'IP Gateway Address'}
              </label>
              <input
                type="text"
                required
                value={newTrunk.ipGateway}
                onChange={(e) => setNewTrunk({ ...newTrunk, ipGateway: e.target.value })}
                placeholder="e.g. sip.provider.com:5060 or 10.192.4.1"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                  {isRtl ? 'بادئة توجيه الخط (Route Prefix)' : 'Route Dial Prefix'}
                </label>
                <input
                  type="text"
                  required
                  value={newTrunk.routePrefix}
                  onChange={(e) => setNewTrunk({ ...newTrunk, routePrefix: e.target.value })}
                  placeholder="e.g. 966 or 971"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                  {isRtl ? 'الحد الأقصى للاتصالات المتزامنة' : 'Concurrency Limit'}
                </label>
                <input
                  type="number"
                  required
                  value={newTrunk.concurrencyLimit}
                  onChange={(e) => setNewTrunk({ ...newTrunk, concurrencyLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'الحالة التشغيلية' : 'Operational Status'}
              </label>
              <select
                value={newTrunk.status}
                onChange={(e) => setNewTrunk({ ...newTrunk, status: e.target.value as SipTrunkStatus })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
              >
                <option value="active">Active / Healthy</option>
                <option value="inactive">Inactive</option>
                <option value="degraded">Degraded Performance</option>
                <option value="connecting">Connecting / Provisioning</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                {isRtl ? 'تهيئة وتفعيل' : 'Provision Line'}
              </button>
            </div>
          </form>
        </ModalWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.superAdmin.sipTrunk.title}
        description={t.superAdmin.sipTrunk.description}
        action={
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer font-mono"
          >
            <Plus className="w-4 h-4" />
            {t.superAdmin.sipTrunk.provisionButton || 'Provision SIP Trunk'}
          </button>
        }
      />

      {/* Telephony Health telemetry cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OperationalCard hoverEffect={false} className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'خطوط الاتصال النشطة' : 'Active Trunks'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 animate-pulse">
                {activeCount} <span className="text-slate-400 font-normal text-xs">/ {trunks.length}</span>
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-purple-900/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'القدرة الاستيعابية للمكالمات المتزامنة' : 'SIP Concurrency Capacity'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {totalConcurrency} <span className="text-slate-400 font-normal text-xs">{isRtl ? 'قناة' : 'channels'}</span>
              </h3>
            </div>
          </div>
        </OperationalCard>

        <OperationalCard hoverEffect={false} className="border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-emerald-900/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isRtl ? 'متوسط جودة الصوت MOS' : 'Average MOS Voice Quality'}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {averageMos} <span className="text-slate-400 font-normal text-xs">/ 5.0</span>
              </h3>
            </div>
          </div>
        </OperationalCard>
      </div>

      {/* Search and Filter HUD */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit overflow-x-auto scrollbar-none shrink-0 border border-slate-200 dark:border-slate-800">
          {(['all', 'active', 'inactive', 'degraded', 'connecting'] as const).map((filter) => {
            const isActive = statusFilter === filter;
            const labels = {
              all: isRtl ? 'كل الحالات' : 'All Statuses',
              active: isRtl ? 'نشط' : 'Active',
              inactive: isRtl ? 'غير نشط' : 'Inactive',
              degraded: isRtl ? 'متدهور' : 'Degraded',
              connecting: isRtl ? 'جاري الاتصال' : 'Connecting'
            };
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
                {labels[filter]}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 flex-1 max-w-md items-center min-w-0">
          {/* Provider Select Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="all">{isRtl ? 'جميع موفري الخدمة' : 'All Providers'}</option>
            {uniqueProviders.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Search query input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isRtl ? 'البحث عن خطوط SIP...' : 'Search trunks by label/gateway...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Enterprise Trunks Table */}
      <EnterpriseTable
        headers={tableHeaders}
        empty={filteredTrunks.length === 0}
        emptyTitle={isRtl ? 'لا توجد خطوط اتصالات' : 'No SIP Trunks Provisioned'}
        emptyDesc={isRtl ? 'لم يتم العثور على خطوط SIP تطابق الاستعلام.' : 'There are no active telecom trunk configurations matching your search.'}
      >
        {filteredTrunks.map((trunk) => (
          <tr key={trunk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-slate-450 text-[10px]">{trunk.id}</td>
            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{trunk.provider}</td>
            <td className="px-6 py-4 font-mono text-slate-655 dark:text-slate-350">{trunk.ipGateway}</td>
            <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-400">+{trunk.routePrefix}</td>
            <td className="px-6 py-4 font-mono font-bold text-slate-855 dark:text-slate-200">{trunk.concurrencyLimit}</td>
            <td className="px-6 py-4 font-mono font-bold text-slate-855 dark:text-slate-200">{trunk.activeSessions}</td>
            <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{trunk.avgMos.toFixed(1)}</td>
            <td className="px-6 py-4">
              <TelephonyStatusBadge status={trunk.status} />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleTrunk(trunk)}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    trunk.status === 'inactive'
                      ? 'text-slate-455 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      : 'text-emerald-500 hover:text-slate-455 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={trunk.status === 'inactive' ? (isRtl ? 'تمكين' : 'Enable') : (isRtl ? 'تعطيل' : 'Disable')}
                >
                  {trunk.status === 'inactive' ? (
                    <ToggleLeft className="w-4 h-4" />
                  ) : (
                    <ToggleRight className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEditClick(trunk)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 rounded cursor-pointer transition-colors"
                  title={isRtl ? 'تعديل' : 'Edit'}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(trunk.id)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 rounded cursor-pointer transition-colors"
                  title={isRtl ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </EnterpriseTable>

      {/* Global Config Settings Checkbox Panel */}
      <OperationalCard hoverEffect={false} className="p-6 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-855 dark:text-white">
          {t.superAdmin.sipTrunk.configTitle}
        </h3>
        <p className="text-[10px] text-slate-400 -mt-2 font-semibold">
          {t.superAdmin.sipTrunk.configDesc}
        </p>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-5">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-655 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-transparent" />
            <span>{t.superAdmin.sipTrunk.enableTls}</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-655 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-transparent" />
            <span>{t.superAdmin.sipTrunk.codecAutoNegotiate}</span>
          </label>
        </div>
      </OperationalCard>

      {/* Form Modal */}
      <ModalWrapper
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTrunk ? (isRtl ? 'تعديل خط الاتصال SIP' : 'Edit SIP Trunk Config') : (isRtl ? 'تهيئة خط SIP جديد' : 'Provision SIP Trunk')}
      >
        <form onSubmit={handleSaveTrunk} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
              {isRtl ? 'اسم الموفر / خط الربط' : 'Trunk Provider Label'}
            </label>
            <input
              type="text"
              required
              value={newTrunk.provider}
              onChange={(e) => setNewTrunk({ ...newTrunk, provider: e.target.value })}
              placeholder={isRtl ? 'مثال: stc_primary_ksa' : 'e.g. STC Primary Voice Gateway'}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
              {isRtl ? 'عنوان بوابة IP لـ VoIP' : 'IP Gateway Address'}
            </label>
            <input
              type="text"
              required
              value={newTrunk.ipGateway}
              onChange={(e) => setNewTrunk({ ...newTrunk, ipGateway: e.target.value })}
              placeholder="e.g. sip.provider.com:5060 or 10.192.4.1"
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'بادئة توجيه الخط (Route Prefix)' : 'Route Dial Prefix'}
              </label>
              <input
                type="text"
                required
                value={newTrunk.routePrefix}
                onChange={(e) => setNewTrunk({ ...newTrunk, routePrefix: e.target.value })}
                placeholder="e.g. 966 or 971"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'الحد الأقصى للاتصالات المتزامنة' : 'Concurrency Limit'}
              </label>
              <input
                type="number"
                required
                value={newTrunk.concurrencyLimit}
                onChange={(e) => setNewTrunk({ ...newTrunk, concurrencyLimit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'الاتصالات النشطة الحالية' : 'Current Active Sessions'}
              </label>
              <input
                type="number"
                required
                value={newTrunk.activeSessions}
                onChange={(e) => setNewTrunk({ ...newTrunk, activeSessions: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
                {isRtl ? 'الحالة التشغيلية' : 'Operational Status'}
              </label>
              <select
                value={newTrunk.status}
                onChange={(e) => setNewTrunk({ ...newTrunk, status: e.target.value as SipTrunkStatus })}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none text-slate-850 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none font-semibold"
              >
                <option value="active">Active / Healthy</option>
                <option value="inactive">Inactive</option>
                <option value="degraded">Degraded Performance</option>
                <option value="connecting">Connecting / Provisioning</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer font-semibold"
            >
              {editingTrunk ? (isRtl ? 'حفظ التغييرات' : 'Save Changes') : (isRtl ? 'تهيئة وتفعيل' : 'Provision Line')}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}
