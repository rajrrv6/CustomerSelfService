'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EnterpriseTable } from '@/components/shared/table/EnterpriseTable';
import { ColumnDef } from '@tanstack/react-table';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { Badge } from '@/components/shared/BadgeSystem';
import {
  Zap, XCircle, Settings, RefreshCw, ToggleLeft, ToggleRight,
  Wifi, Bot, GitBranch, Eye, EyeOff, Copy,
  Key, Link, Clock, AlertTriangle, Lock as LockIcon, MessageSquare,
  History, Activity, RotateCcw
} from 'lucide-react';

import { DICT, CHANNELS, PROVIDERS, AI_ROUTING_SETTINGS } from './channelsHelper';

// ─── Component ────────────────────────────────────────────────────────────────
export function SuperAdminChannelsTab() {
  const { lang, addAuditLog } = useApp();
  const d = DICT[lang as 'en' | 'ar'] ?? DICT.en;

  // Channel Config modal
  const [selectedChannel, setSelectedChannel] = useState<typeof CHANNELS[0] | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [configMode, setConfigMode] = useState<'live' | 'sandbox'>('live');
  const [revealKey, setRevealKey] = useState(false);

  // Provider Credentials modal
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[0] | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [revealProvKey, setRevealProvKey] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<'success' | null>(null);

  const mockRevisions = [
    { v: 'v2.4.1', by: 'admin@mp-core.ai', date: '2026-05-24 14:30' },
    { v: 'v2.4.0', by: 'system_auto', date: '2026-05-10 09:15' },
  ];

  const [aiSettings, setAiSettings] = useState(AI_ROUTING_SETTINGS);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // KPI computations
  const activeCount = CHANNELS.filter(c => c.status === 'operational').length;
  const totalMsgs = CHANNELS.reduce((a, c) => a + c.msgPerSec * 3600, 0);
  const totalFailed = CHANNELS.reduce((a, c) => a + c.failedWebhooks, 0);
  const avgThroughput = Math.round(CHANNELS.reduce((a, c) => a + c.msgPerSec, 0));
  const aiChannels = CHANNELS.filter(c => c.aiEnabled).length;
  const aiRate = Math.round((aiChannels / CHANNELS.length) * 100);

  const openChannelConfig = (ch: typeof CHANNELS[0]) => {
    setSelectedChannel(ch);
    setConfigMode(ch.mode);
    setRevealKey(false);
    setShowChannelModal(true);
  };

  const openProviderConfig = (p: typeof PROVIDERS[0]) => {
    setSelectedProvider(p);
    setRevealProvKey(false);
    setPingResult(null);
    setShowProviderModal(true);
  };

  const handleTestConnection = () => {
    setIsTestingPing(true);
    setPingResult(null);
    setTimeout(() => {
      setIsTestingPing(false);
      setPingResult('success');
      addAuditLog(`Connection test successful for ${selectedProvider?.name}`, 'success');
    }, 1200);
  };

  const handleSaveChannelConfig = () => {
    if (!selectedChannel) return;
    addAuditLog(`Updated channel config for ${selectedChannel.name} — mode: ${configMode}`, 'success');
    setShowChannelModal(false);
  };

  const handleSaveProviderConfig = () => {
    if (!selectedProvider) return;
    addAuditLog(`Updated provider credentials for ${selectedProvider.name}`, 'success');
    setShowProviderModal(false);
  };

  const handleSync = (ch: typeof CHANNELS[0]) => {
    setSyncingId(ch.id);
    setTimeout(() => {
      setSyncingId(null);
      addAuditLog(`Manual sync triggered for channel: ${ch.name}`, 'success');
    }, 1800);
  };

  const toggleAI = (id: string) => {
    setAiSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const setting = aiSettings.find(s => s.id === id);
    if (setting) addAuditLog(`AI Routing "${setting.label}" ${setting.enabled ? 'disabled' : 'enabled'}`, 'success');
  };

  const statusBadgeType = (status: string) => {
    if (status === 'operational' || status === 'synced') return 'success';
    if (status === 'degraded' || status === 'pending') return 'warning';
    if (status === 'error') return 'error';
    return 'inactive';
  };

  const catalogTableHeaders = [d.colChannel, d.colProvider, d.colStatus, d.colRegion, d.colAI, d.colRouting, d.colFailover, d.colLastSync, d.colActions];
  const credTableHeaders = [d.colProviderName, d.colAuthType, d.colApiKey, d.colWebhook, d.colEnvironment, d.colFailoverProv, d.colRegionProv, d.colSyncStatus, d.colLastValidated, d.colActions];

  const kpiCards = [
    { label: d.activeChannels, value: `${activeCount}/10`, icon: <Wifi className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', trend: 'Web·WA·SMS·Voice·Email·iOS·Android+3', trendUp: true },
    { label: d.connectedProviders, value: String(PROVIDERS.length), icon: <GitBranch className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-500/10', trend: 'Twilio · Meta · Plivo · SendGrid', trendUp: true },
    { label: d.messagesToday, value: (totalMsgs / 1000).toFixed(1) + 'K', icon: <MessageSquare className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-500/10', trend: '+12.4% vs yesterday', trendUp: true },
    { label: d.failedDeliveries, value: String(totalFailed), icon: <XCircle className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-500/10', trend: totalFailed > 10 ? 'Above SLA threshold' : 'Within SLA', trendUp: totalFailed <= 10 },
    { label: d.queueThroughput, value: `${avgThroughput} msg/s`, icon: <Zap className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/10', trend: 'Avg across all channels', trendUp: true },
    { label: d.aiAutomationRate, value: `${aiRate}%`, icon: <Bot className="w-5 h-5 text-sky-500" />, bg: 'bg-sky-500/10', trend: `${aiChannels} of 10 channels`, trendUp: true },
  ];

  const channelColumns = React.useMemo<ColumnDef<typeof CHANNELS[0]>[]>(() => [
    {
      accessorKey: 'name',
      header: d.colChannel || 'Channel',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${row.original.iconBg}`}>{row.original.icon}</div>
          <span className="font-bold text-slate-900 dark:text-white">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'provider',
      header: d.colProvider || 'Provider',
      cell: ({ row }) => (
        <span className="text-slate-500 dark:text-slate-400 max-w-[160px] truncate block font-semibold">
          {row.original.provider}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: d.colStatus || 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${row.original.status === 'operational' ? 'bg-emerald-500 animate-pulse' : row.original.status === 'degraded' ? 'bg-amber-500' : 'bg-slate-400'}`} />
          <Badge type={statusBadgeType(row.original.status)}>{row.original.status}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'region',
      header: d.colRegion || 'Region',
      cell: ({ row }) => (
        <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">
          {row.original.region}
        </span>
      ),
    },
    {
      accessorKey: 'aiEnabled',
      header: d.colAI || 'AI Enabled',
      cell: ({ row }) => (
        row.original.aiEnabled ? (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <Bot className="w-3 h-3" />
            {lang === 'ar' ? 'مفعّل' : 'Yes'}
          </span>
        ) : (
          <span className="text-slate-400 font-semibold">{lang === 'ar' ? 'لا' : 'No'}</span>
        )
      ),
    },
    {
      accessorKey: 'routingPolicy',
      header: d.colRouting || 'Routing Policy',
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-400 truncate block max-w-[160px]" title={row.original.routingPolicy}>
          {row.original.routingPolicy}
        </span>
      ),
    },
    {
      accessorKey: 'failover',
      header: d.colFailover || 'Failover',
      cell: ({ row }) => (
        <span className="text-slate-500">
          {row.original.failover}
        </span>
      ),
    },
    {
      accessorKey: 'lastSync',
      header: d.colLastSync || 'Last Sync',
      cell: ({ row }) => (
        <span className="font-mono text-slate-400 text-[10px]">
          {row.original.lastSync}
        </span>
      ),
    },
    {
      id: 'actions',
      header: d.colActions || 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => openChannelConfig(row.original)}
          data-testid={`configure-channel-${row.original.id}`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Settings className="w-3 h-3" />
          {d.configure}
        </button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [d, lang]);

  const providerColumns = React.useMemo<ColumnDef<typeof PROVIDERS[0]>[]>(() => [
    {
      accessorKey: 'name',
      header: d.colProviderName || 'Provider Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.original.logoBg}`}>
            <Key className={`w-3.5 h-3.5 ${row.original.logoColor}`} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'authType',
      header: d.colAuthType || 'Auth Type',
      cell: ({ row }) => (
        <span className="text-slate-500 dark:text-slate-400 font-semibold">
          {row.original.authType}
        </span>
      ),
    },
    {
      accessorKey: 'apiKey',
      header: d.colApiKey || 'API Key',
      cell: ({ row }) => (
        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 max-w-[120px] truncate block">
          {row.original.apiKey}
        </span>
      ),
    },
    {
      accessorKey: 'webhook',
      header: d.colWebhook || 'Webhook URL',
      cell: ({ row }) => (
        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 max-w-[160px] truncate block">
          {row.original.webhook}
        </span>
      ),
    },
    {
      accessorKey: 'environment',
      header: d.colEnvironment || 'Environment',
      cell: ({ row }) => (
        <span className={`font-bold ${row.original.environment === 'live' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {row.original.environment === 'live' ? '● Live' : '● Sandbox'}
        </span>
      ),
    },
    {
      accessorKey: 'failover',
      header: d.colFailoverProv || 'Failover',
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-400 font-semibold">
          {row.original.failover}
        </span>
      ),
    },
    {
      accessorKey: 'region',
      header: d.colRegionProv || 'Region',
      cell: ({ row }) => (
        <span className="font-mono text-slate-400 text-[10px]">
          {row.original.region.split(' ')[0]}
        </span>
      ),
    },
    {
      accessorKey: 'syncStatus',
      header: d.colSyncStatus || 'Sync Status',
      cell: ({ row }) => (
        <Badge type={statusBadgeType(row.original.syncStatus)}>
          {row.original.syncStatus}
        </Badge>
      ),
    },
    {
      accessorKey: 'lastValidated',
      header: d.colLastValidated || 'Last Validated',
      cell: ({ row }) => (
        <span className="font-mono text-slate-400 text-[10px]">
          {row.original.lastValidated}
        </span>
      ),
    },
    {
      id: 'actions',
      header: d.colActions || 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => openProviderConfig(row.original)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Key className="w-3 h-3" />
          {d.viewCredentials}
        </button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [d, lang]);

  return (
    <div className="space-y-10 text-xs text-slate-800 dark:text-slate-200">

      {/* ── Page Header ── */}
      <SectionHeader
        title={d.title}
        description={d.description}
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Monitoring
            </span>
            <span className="text-[10px] font-mono text-slate-400">Tenant: MP-CORE-PROD</span>
          </div>
        }
      />

      {/* ── KPI HUD Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-2xl p-4 shadow-sm flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>{card.icon}</div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{card.label}</div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white leading-none mt-1">{card.value}</div>
              <div className={`text-[9px] font-semibold mt-1 ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>{card.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION A — CHANNEL CATALOG  (PDF ID #3)
          Web / WhatsApp / SMS / Voice / Email / iOS / Android
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Section label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-900">
            A — {d.catalogTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.catalogTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.catalogDesc}</p>
        </div>

        {/* Channel health cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {CHANNELS.map(ch => (
            <div
              key={ch.id}
              className={`relative bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 duration-200 ${
                ch.status === 'operational' ? 'border-slate-200' :
                ch.status === 'degraded'    ? 'border-amber-300 dark:border-amber-800' :
                                              'border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${ch.accentColor}`} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ch.iconBg}`}>{ch.icon}</div>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px] leading-tight">{ch.name}</span>
                </div>
                <Badge type={ch.status === 'inactive' ? 'inactive' : 'success'}>
                  {ch.status === 'inactive' ? d.inactive : d.active}
                </Badge>
              </div>

              {/* Grouped Catalog Properties */}
              <div className="space-y-1.5 text-[10px] border-t border-b border-slate-100 dark:border-slate-800/60 py-2.5 my-3">
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">{d.colProvider}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[110px]" title={ch.provider}>{ch.provider}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">{d.colRegion}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{ch.region.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">{d.colAI}</span>
                  <span className={`font-bold ${ch.aiEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {ch.aiEnabled ? (lang === 'ar' ? 'مفعّل' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">{d.routingState}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[110px]" title={ch.routingPolicy}>{ch.routingPolicy}</span>
                </div>
              </div>

              {/* Telemetry metrics (Enterprise enhancement preserved) */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex justify-between"><span className="text-slate-400">{d.uptime}</span><span className="font-bold font-mono text-emerald-500">{ch.uptime}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.latency}</span><span className={`font-bold font-mono ${ch.latencyMs > 400 ? 'text-amber-500' : 'text-sky-500'}`}>{ch.latencyMs}ms</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.throughput}</span><span className="font-bold font-mono text-purple-500">{ch.msgPerSec}/s</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.deliveryHealth}</span><span className={`font-bold font-mono ${ch.deliveryHealth < 95 ? 'text-rose-500' : 'text-emerald-500'}`}>{ch.deliveryHealth}%</span></div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => openChannelConfig(ch)}
                  data-testid={`configure-channel-${ch.id}`}
                  className="flex-1 py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 rounded-lg transition-colors text-center"
                >
                  {d.configure}
                </button>
                <button
                  onClick={() => handleSync(ch)}
                  aria-label="Refresh sync"
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${syncingId === ch.id ? 'animate-spin text-blue-500' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Communication Channels — full config table */}
        <div>
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.catalogTableTitle}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{d.catalogTableDesc}</p>
          </div>
          <EnterpriseTable
            data={CHANNELS}
            columns={channelColumns}
            lang={lang}
            enableSearch={true}
            searchPlaceholder={lang === 'ar' ? 'البحث عن القنوات...' : 'Search omnichannel channels...'}
            enableColumnVisibility={false}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION B — PROVIDER CREDENTIALS  (PDF ID #4)
          Twilio / Meta / Plivo / SendGrid / SIP Trunk / Exotel
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Section label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 font-mono px-3 py-1 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-900">
            B — {d.credTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.credTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.credDesc}</p>
        </div>

        {/* Provider summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map(prov => (
            <div
              key={prov.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm space-y-3 hover:-translate-y-0.5 transition-all duration-200 ${
                prov.syncStatus === 'synced'  ? 'border-slate-200 dark:border-slate-800' :
                prov.syncStatus === 'pending' ? 'border-amber-200 dark:border-amber-900/50' :
                                                'border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${prov.logoBg}`}>
                    <Key className={`w-4 h-4 ${prov.logoColor}`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-[12px]">{prov.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono">{prov.authType}</div>
                  </div>
                </div>
                <Badge type={statusBadgeType(prov.syncStatus)}>{prov.syncStatus}</Badge>
              </div>

              {/* Masked API key row */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl px-3 py-2">
                <LockIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 flex-1 truncate">{prov.apiKey}</span>
              </div>

              {/* Webhook URL */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl px-3 py-2">
                <Link className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 flex-1 truncate">{prov.webhook}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block">Environment</span>
                  <span className={`font-bold ${prov.environment === 'live' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {prov.environment === 'live' ? '● Live' : '● Sandbox'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Region</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{prov.region.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Failover</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{prov.failover}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Last Validated</span>
                  <span className="font-mono text-slate-500">{prov.lastValidated}</span>
                </div>
              </div>

              {/* Channels this provider handles */}
              <div className="flex flex-wrap gap-1.5">
                {prov.channels.map(ch => (
                  <span key={ch} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono">{ch}</span>
                ))}
              </div>

              <button
                onClick={() => openProviderConfig(prov)}
                className="w-full py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 text-slate-600 dark:text-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Key className="w-3 h-3" />{d.viewCredentials}
              </button>
            </div>
          ))}
        </div>

        {/* Provider Credentials — full table */}
        <div>
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.providerIntegrationsTitle}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{d.providerIntegrationsDesc}</p>
          </div>
          <EnterpriseTable
            data={PROVIDERS}
            columns={providerColumns}
            lang={lang}
            enableSearch={true}
            searchPlaceholder={lang === 'ar' ? 'البحث عن المزودين...' : 'Search credentials...'}
            enableColumnVisibility={false}
          />
        </div>
      </div>

      {/* ── Live Traffic & Delivery Health (enterprise enhancement, preserved) ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.liveTrafficTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.liveTrafficDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CHANNELS.filter(c => c.status !== 'inactive').map(ch => {
            const healthColor = ch.deliveryHealth >= 99 ? 'text-emerald-500' : ch.deliveryHealth >= 95 ? 'text-amber-500' : 'text-rose-500';
            const barColor   = ch.deliveryHealth >= 99 ? 'bg-emerald-500'   : ch.deliveryHealth >= 95 ? 'bg-amber-500'   : 'bg-rose-500';
            return (
              <div key={ch.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${ch.iconBg}`}>{ch.icon}</div>
                    <span className="font-bold text-[11px] text-slate-800 dark:text-white">{ch.name}</span>
                  </div>
                  <span className={`text-xs font-black font-mono ${healthColor}`}>{ch.deliveryHealth}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${ch.deliveryHealth}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  {[
                    { label: d.throughput,     value: `${ch.msgPerSec}/s`,  color: 'text-purple-500' },
                    { label: d.latency,        value: `${ch.latencyMs}ms`,  color: ch.latencyMs > 400 ? 'text-amber-500' : 'text-sky-500' },
                    { label: d.failedWebhooks, value: String(ch.failedWebhooks), color: ch.failedWebhooks > 3 ? 'text-rose-500' : 'text-emerald-500' },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-2 text-center">
                      <div className="text-slate-400 font-mono mb-1">{m.label}</div>
                      <div className={`font-black font-mono ${m.color}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI Routing & Automation (enterprise enhancement, preserved) ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.aiRoutingTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.aiRoutingDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {aiSettings.map(setting => (
            <div
              key={setting.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all ${
                setting.enabled ? 'border-blue-200 dark:border-blue-900/50' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className={`w-4 h-4 ${setting.enabled ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-[11px] text-slate-800 dark:text-white">{lang === 'ar' ? setting.labelAr : setting.label}</span>
                </div>
                <button
                  onClick={() => toggleAI(setting.id)}
                  aria-pressed={setting.enabled}
                  aria-label={`Toggle ${setting.label}`}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
                >
                  {setting.enabled ? <ToggleRight className="w-7 h-7 text-blue-500" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{lang === 'ar' ? setting.descAr : setting.desc}</p>
              <div className="mt-2">
                <Badge type={setting.enabled ? 'success' : 'inactive'}>{setting.enabled ? d.enabled : d.disabled}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL A — Channel Configuration
      ══════════════════════════════════════════════════════════════ */}
      <ModalWrapper isOpen={showChannelModal} onClose={() => setShowChannelModal(false)} title={selectedChannel ? `${d.channelConfigTitle} — ${selectedChannel.name}` : d.channelConfigTitle} maxWidthClass="max-w-lg">
        {selectedChannel && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
              <div className={`p-2 rounded-xl ${selectedChannel.iconBg}`}>{selectedChannel.icon}</div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{selectedChannel.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selectedChannel.provider}</div>
              </div>
              <div className="ml-auto"><Badge type={statusBadgeType(selectedChannel.status)}>{selectedChannel.status}</Badge></div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.modeLabel}</label>
              <div className="flex gap-2">
                {(['sandbox', 'live'] as const).map(mode => (
                  <button key={mode} onClick={() => setConfigMode(mode)} className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${configMode === mode ? (mode === 'live' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-500') : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {mode === 'sandbox' ? d.sandbox : d.live}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.apiKeyLabel}</label>
              <div className="flex gap-2">
                <input type={revealKey ? 'text' : 'password'} readOnly value={selectedChannel.apiKey} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] focus:outline-none" />
                <button onClick={() => setRevealKey(v => !v)} aria-label={revealKey ? 'Hide' : 'Reveal'} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => navigator.clipboard.writeText(selectedChannel.apiKey)} aria-label="Copy API key" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.webhookLabel}</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={selectedChannel.webhook} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] text-blue-600 dark:text-blue-400 focus:outline-none" />
                <button onClick={() => navigator.clipboard.writeText(selectedChannel.webhook)} aria-label="Copy webhook" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.rateLimitLabel}</label>
                <input type="number" defaultValue={selectedChannel.rateLimit} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl font-mono text-[11px] focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.failoverLabel}</label>
                <select defaultValue={selectedChannel.failoverChannel} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-[11px] focus:outline-none focus:border-blue-500">
                  {CHANNELS.filter(c => c.id !== selectedChannel.id).map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-blue-500" /><span className="font-bold text-[11px]">AI Auto-Routing</span></div>
              <Badge type={selectedChannel.aiEnabled ? 'success' : 'inactive'}>{selectedChannel.aiEnabled ? d.enabled : d.disabled}</Badge>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowChannelModal(false)} data-testid="channel-modal-cancel" className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">{d.cancel}</button>
              <button onClick={handleSaveChannelConfig} data-testid="channel-modal-save" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md active:scale-95 transition-all">{d.save}</button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* ══════════════════════════════════════════════════════════════
          MODAL B — Provider Credentials
      ══════════════════════════════════════════════════════════════ */}
      <ModalWrapper isOpen={showProviderModal} onClose={() => setShowProviderModal(false)} title={selectedProvider ? `${d.providerConfigTitle} — ${selectedProvider.name}` : d.providerConfigTitle} maxWidthClass="max-w-lg">
        {selectedProvider && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedProvider.logoBg}`}>
                <Key className={`w-4 h-4 ${selectedProvider.logoColor}`} />
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{selectedProvider.name}</div>
                <div className="text-[10px] text-slate-400">{selectedProvider.authType}</div>
              </div>
              <div className="ml-auto"><Badge type={statusBadgeType(selectedProvider.syncStatus)}>{selectedProvider.syncStatus}</Badge></div>
            </div>

            {/* Environment toggle */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.modeLabel}</label>
              <div className="flex gap-2">
                {(['sandbox', 'live'] as const).map(mode => (
                  <button key={mode} className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${selectedProvider.environment === mode ? (mode === 'live' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-500') : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {mode === 'sandbox' ? d.sandbox : d.live}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.apiKeyLabel}</label>
              <div className="flex gap-2">
                <input type={revealProvKey ? 'text' : 'password'} readOnly value={selectedProvider.apiKey} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] focus:outline-none" />
                <button onClick={() => setRevealProvKey(v => !v)} aria-label="Toggle reveal" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{revealProvKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => navigator.clipboard.writeText(selectedProvider.apiKey)} aria-label="Copy API key" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Webhook */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{d.webhookLabel}</label>
              <div className="flex gap-2">
                <input type="text" readOnly value={selectedProvider.webhook} className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-955 rounded-xl font-mono text-[10px] text-blue-600 dark:text-blue-400 focus:outline-none" />
                <button onClick={() => navigator.clipboard.writeText(selectedProvider.webhook)} aria-label="Copy webhook" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-855 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Failover + Region */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Failover Provider</label>
                <input type="text" readOnly value={selectedProvider.failover} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Region</label>
                <input type="text" readOnly value={selectedProvider.region} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-[10px] focus:outline-none" />
              </div>
            </div>

            {/* Channels this provider handles */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Channels Handled</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedProvider.channels.map(ch => (
                  <span key={ch} className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-lg font-mono">{ch}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 text-[11px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-500">Last Validated:</span></div>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedProvider.lastValidated}</span>
              </div>
              <button 
                onClick={handleTestConnection}
                disabled={isTestingPing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  pingResult === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  isTestingPing ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed' :
                  'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400'
                }`}
              >
                <Activity className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-pulse' : ''}`} />
                {pingResult === 'success' ? d.connectionSuccess : isTestingPing ? d.connectionTesting : d.testConnection}
              </button>
            </div>

            {/* Revision History */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">{d.revisionHistory}</h4>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 font-bold">{d.colVersion}</th>
                      <th className="px-3 py-2 font-bold">{d.colModifiedBy}</th>
                      <th className="px-3 py-2 font-bold">{d.colDate}</th>
                      <th className="px-3 py-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {mockRevisions.map((rev) => (
                      <tr key={rev.v} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950/50">
                        <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 font-mono">{rev.v}</td>
                        <td className="px-3 py-2 text-slate-500">{rev.by}</td>
                        <td className="px-3 py-2 text-slate-400 font-mono">{rev.date}</td>
                        <td className="px-3 py-2 text-right">
                          <button className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors ml-auto">
                            <RotateCcw className="w-3 h-3" />
                            {d.rollback}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowProviderModal(false)} className="px-4 py-2 border border-slate-205 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">{d.cancel}</button>
              <button onClick={handleSaveProviderConfig} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-md active:scale-95 transition-all">{d.save}</button>
            </div>
          </div>
        )}
      </ModalWrapper>

    </div>
  );
}
