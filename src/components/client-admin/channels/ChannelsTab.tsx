'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/shared/BadgeSystem';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { DrawerWrapper } from '@/components/shared/DrawerWrapper';
import { EnterpriseTable } from '@/components/shared/EnterpriseTable';
import {
  MessageSquare, Globe, Mail, Phone, Radio, Camera, Send,
  Zap, Clock, Bot, ToggleLeft, ToggleRight, Settings,
  CheckCircle2, Palette, Eye, Sliders, MessageCircle, BarChart3, UserCheck,
  History
} from 'lucide-react';

import { DICT, CHANNELS, INITIAL_TEMPLATES } from './clientChannelsHelper';
import { VoiceIvrDesigner } from './VoiceIvrDesigner';

export function ChannelsTab() {
  const { lang, addAuditLog, agents } = useApp();
  const d = DICT[lang as 'en' | 'ar'] ?? DICT.en;

  // State configurations
  const [activeChannels, setActiveChannels] = useState(CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<typeof CHANNELS[0] | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showIvrDesigner, setShowIvrDesigner] = useState(false);

  // Business operations configurations
  const [hoursMode, setHoursMode] = useState<'biz' | '24h'>('24h');
  const [primaryQueue, setPrimaryQueue] = useState('Support Team');
  const [triageEnabled, setTriageEnabled] = useState(true);
  const [handoffConfidence, setHandoffConfidence] = useState(0.65);
  const [langRouting, setLangRouting] = useState(true);
  const [offlineReply, setOfflineReply] = useState('Thank you for contacting us. We are currently offline. We will resume support shortly.');

  // Templates state
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof INITIAL_TEMPLATES[0] | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Web Chat configuration states
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [greetingEn, setGreetingEn] = useState('Hello! I am Farah. How can I help you today?');
  const [greetingAr, setGreetingAr] = useState('مرحباً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟');
  const [launcherPosition, setLauncherPosition] = useState<'right' | 'left'>('right');
  const [avatarEnabled, setAvatarEnabled] = useState(true);
  const [collectLeadData, setCollectLeadData] = useState(true);
  const [offlineAction, setOfflineAction] = useState<'ticket' | 'reply'>('ticket');
  const [csatTriggerEnabled, setCsatTriggerEnabled] = useState(true);

  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [widgetAuditLogs, setWidgetAuditLogs] = useState([
    { id: '1', date: '2026-05-24 10:45', user: 'admin@mp-core.ai', action: 'Changed theme color to #2563eb' },
    { id: '2', date: '2026-05-18 16:20', user: 'system_auto', action: 'Updated Arabic greeting text' },
  ]);

  const handleSaveWidgetConfigs = () => {
    addAuditLog('Saved web chat widget configurations successfully.', 'success');
    setWidgetAuditLogs([{
      id: Date.now().toString(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Current Admin',
      action: `Updated configuration (Theme: ${themeColor})`
    }, ...widgetAuditLogs]);
  };

  // Totals computation
  const activeCount = activeChannels.filter(c => c.enabled).length;
  const totalVolume = activeChannels.reduce((a, c) => a + c.volume, 0);

  const toggleChannelState = (id: string) => {
    setActiveChannels(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.enabled;
        addAuditLog(`Toggled channel "${c.name}" to ${nextState ? 'Enabled' : 'Disabled'}`, 'success');
        return { ...c, enabled: nextState };
      }
      return c;
    }));
  };

  const handleOpenChannelModal = (ch: typeof CHANNELS[0]) => {
    setSelectedChannel(ch);
    setShowChannelModal(true);
  };

  const handleSaveChannelConfig = () => {
    if (selectedChannel) {
      addAuditLog(`Saved routing configurations for ${selectedChannel.name}`, 'success');
      setShowChannelModal(false);
    }
  };

  const handleSaveGlobalConfigs = () => {
    addAuditLog('Saved global tenant omnichannel configurations successfully.', 'success');
  };

  const handlePreviewTemplate = (tpl: typeof INITIAL_TEMPLATES[0]) => {
    setSelectedTemplate(tpl);
    setShowTemplateModal(true);
  };

  const statusBadgeType = (status: string) => {
    if (status === 'approved' || status === 'active' || status === 'synced') return 'success';
    if (status === 'pending' || status === 'degraded') return 'warning';
    if (status === 'rejected' || status === 'error' || status === 'inactive') return 'error';
    return 'inactive';
  };

  const templateTableHeaders = [
    d.colTplName,
    d.colCategory,
    d.colLanguage,
    d.colUsage,
    d.colSuccessRate,
    d.colStatusLabel,
    d.preview
  ];

  const kpis = [
    { label: d.activeChannels, value: `${activeCount}/7`, icon: <Zap className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', subtext: 'WhatsApp · Web Chat · Email...' },
    { label: d.aiAutomationUsage, value: '64.2%', icon: <Bot className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-500/10', subtext: 'Farah chatbot triage matches' },
    { label: d.liveConversations, value: '18 Active', icon: <MessageCircle className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-500/10', subtext: 'Assigned queues in live state' },
    { label: d.waDeliveryRate, value: '99.7%', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', subtext: 'Meta outbound sync success' },
    { label: d.avgResponseTime, value: lang === 'ar' ? '٤٥ ثانية' : '45 sec', icon: <Clock className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/10', subtext: 'Omnichannel response average' },
    { label: d.activeSessions, value: String(totalVolume), icon: <BarChart3 className="w-5 h-5 text-sky-500" />, bg: 'bg-sky-500/10', subtext: 'Total inbound contacts volume' }
  ];

  if (showIvrDesigner) {
    return <VoiceIvrDesigner onClose={() => setShowIvrDesigner(false)} />;
  }

  return (
    <div className="space-y-10 text-xs text-slate-800 dark:text-slate-200">

      {/* ── Page Header ── */}
      <SectionHeader
        title={d.title}
        description={d.description}
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-55 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Tenant Scope: Active
            </span>
            <span className="text-[10px] font-mono text-slate-400">Organization: Client-Tenant-HQ</span>
          </div>
        }
      />

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>{card.icon}</div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{card.label}</div>
              <div className="text-md font-black font-mono text-slate-900 dark:text-white leading-none mt-1">{card.value}</div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold truncate">{card.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION A — CHANNEL CATALOG (TENANT CUSTOMIZED)
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
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

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {activeChannels.map(ch => (
            <div
              key={ch.id}
              className={`relative bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden transition-all hover:-translate-y-0.5 duration-200 ${
                ch.enabled ? 'border-slate-200' : 'border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ch.iconBg}`}>{ch.icon}</div>
                  <span className={`font-bold text-slate-800 dark:text-white text-[11px] leading-tight ${!ch.enabled ? 'text-slate-400 dark:text-slate-500' : ''}`}>{ch.name}</span>
                </div>
                <button
                  onClick={() => toggleChannelState(ch.id)}
                  aria-pressed={ch.enabled}
                  aria-label={`Toggle ${ch.name}`}
                  className="focus:outline-none"
                >
                  {ch.enabled ? (
                    <ToggleRight className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="space-y-1 text-[10px] pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between"><span className="text-slate-400">{d.colStatus}</span><Badge type={statusBadgeType(ch.enabled ? 'active' : 'inactive')}>{ch.enabled ? d.active : d.inactive}</Badge></div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{d.colAI}</span>
                  <span className={`font-mono font-bold ${ch.aiEnabled ? 'text-blue-500' : 'text-slate-400'}`}>{ch.aiEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400">{d.colRoutingMode}</span><span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[80px]" title={ch.routingMode}>{ch.routingMode}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.colQueue}</span><span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[80px]" title={ch.queue}>{ch.queue}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.colSLA}</span><span className="font-mono text-emerald-500 font-bold">{ch.sla}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">{d.colVolume}</span><span className="font-mono font-bold text-purple-500">{ch.volume}</span></div>
              </div>

              {ch.enabled && (
                <button
                  onClick={() => handleOpenChannelModal(ch)}
                  className="w-full mt-3 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-400 rounded-lg transition-colors text-center flex items-center justify-center gap-1"
                >
                  <Settings className="w-3 h-3" />{d.configure}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Business Operations & Routing Policy ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 font-mono px-3 py-1 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-900">
            B — {d.bizOpsTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.bizOpsTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.bizOpsDesc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              {d.supportHours}
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setHoursMode('24h')}
                className={`w-full py-2 px-3 text-left rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  hoursMode === '24h'
                    ? 'border-purple-500 bg-purple-50/20 text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{d.alwaysOpen}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <button
                onClick={() => setHoursMode('biz')}
                className={`w-full py-2 px-3 text-left rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  hoursMode === 'biz'
                    ? 'border-purple-500 bg-purple-50/20 text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{d.bizHours}</span>
                {hoursMode === 'biz' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {d.primaryQueue}
              </label>
              <select
                value={primaryQueue}
                onChange={e => setPrimaryQueue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="Support Team">General Customer Support Queue</option>
                <option value="Escalations">Tier-2 Operational Escalations</option>
                <option value="Billing & Subs">Billing & Invoicing Department</option>
                <option value="Sales">Premium Corporate Accounts</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                {d.chatbotTriage}
              </h4>
              <button onClick={() => setTriageEnabled(!triageEnabled)} className="focus:outline-none">
                {triageEnabled ? (
                  <ToggleRight className="w-7 h-7 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">{d.chatbotTriageDesc}</p>

            <div className={`${!triageEnabled ? 'opacity-40 pointer-events-none' : ''} space-y-2`}>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{d.handoffSlider}</span>
                <span className="font-mono text-blue-500 font-black">{Math.round(handoffConfidence * 100)}%</span>
              </div>
              <p className="text-[10px] text-slate-450">{d.handoffDesc}</p>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={handoffConfidence}
                onChange={e => setHandoffConfidence(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-pink-500" />
                {d.languageRouting}
              </h4>
              <button onClick={() => setLangRouting(!langRouting)} className="focus:outline-none">
                {langRouting ? (
                  <ToggleRight className="w-7 h-7 text-pink-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">{d.languageRoutingDesc}</p>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {d.offlineAutoReply}
              </label>
              <textarea
                value={offlineReply}
                onChange={e => setOfflineReply(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-[11px] focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveGlobalConfigs}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {d.saveSettings}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION C — WHATSAPP TEMPLATE CENTER
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-900">
            C — {d.waTemplateTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.waTemplateTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.waTemplateDesc}</p>
        </div>

        <EnterpriseTable headers={templateTableHeaders} empty={false} emptyTitle="" emptyDesc="">
          {templates.map((tpl, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 text-[11px]">
              <td className="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-white">{tpl.name}</td>
              <td className="px-5 py-3.5">
                <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-400">
                  {tpl.category}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-500 font-mono font-bold text-[10px]">{tpl.lang}</td>
              <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400 font-semibold">{tpl.usage.toLocaleString()}</td>
              <td className="px-5 py-3.5">
                <span className={`font-mono font-bold ${tpl.successRate === '0%' ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {tpl.successRate}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <Badge type={statusBadgeType(tpl.status)}>
                  {tpl.status === 'approved' ? d.approved : tpl.status === 'pending' ? d.pending : d.rejected}
                </Badge>
              </td>
              <td className="px-5 py-3.5">
                <button
                  onClick={() => handlePreviewTemplate(tpl)}
                  data-testid={`preview-template-${tpl.name}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 rounded-lg transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {d.preview}
                </button>
              </td>
            </tr>
          ))}
        </EnterpriseTable>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION D — WEB CHAT CUSTOMIZATION
      ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 font-mono px-3 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-full border border-orange-200 dark:border-orange-900">
            D — {d.webChatTitle}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{d.webChatTitle}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{d.webChatDesc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 mb-2 uppercase font-mono tracking-wider">
                  {d.primaryColor}
                </label>
                <div className="flex items-center gap-3">
                  {['#2563eb', '#16a34a', '#7c3aed', '#db2777', '#ea580c'].map(col => (
                    <button
                      key={col}
                      onClick={() => setThemeColor(col)}
                      style={{ backgroundColor: col }}
                      aria-label={`Select ${col}`}
                      className={`w-7 h-7 rounded-xl transition-all border shadow-sm ${
                        themeColor === col
                          ? 'border-white dark:border-slate-850 ring-2 ring-blue-500 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                  <input
                    type="text"
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl font-mono text-xs text-slate-855 dark:text-slate-255 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 mb-2 uppercase font-mono tracking-wider">
                  {d.launcherPos}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLauncherPosition('right')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      launcherPosition === 'right'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {d.bottomRight}
                  </button>
                  <button
                    onClick={() => setLauncherPosition('left')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      launcherPosition === 'left'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {d.bottomLeft}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 mb-2 uppercase font-mono tracking-wider">
                  {d.greetingEn}
                </label>
                <input
                  type="text"
                  value={greetingEn}
                  onChange={e => setGreetingEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-455 mb-2 uppercase font-mono tracking-wider">
                  {d.greetingAr}
                </label>
                <input
                  type="text"
                  value={greetingAr}
                  onChange={e => setGreetingAr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none text-slate-800 dark:text-white"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">{d.botAvatar}</span>
                <button onClick={() => setAvatarEnabled(!avatarEnabled)} className="focus:outline-none">
                  {avatarEnabled ? (
                    <ToggleRight className="w-6 h-6 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">{d.welcomeFlow}</span>
                <button onClick={() => setCollectLeadData(!collectLeadData)} className="focus:outline-none">
                  {collectLeadData ? (
                    <ToggleRight className="w-6 h-6 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">{d.csatTrigger}</span>
                <button onClick={() => setCsatTriggerEnabled(!csatTriggerEnabled)} className="focus:outline-none">
                  {csatTriggerEnabled ? (
                    <ToggleRight className="w-6 h-6 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 mb-2 uppercase font-mono tracking-wider">
                {d.offlineBehavior}
              </label>
              <select
                value={offlineAction}
                onChange={e => setOfflineAction(e.target.value as 'ticket' | 'reply')}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="ticket">{d.submitTicket}</option>
                <option value="reply">{d.autoReplyOnly}</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-500" />
              {d.livePreview}
            </h4>

            <div className="flex-1 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-[260px] flex flex-col shadow-inner">
              <div
                style={{ backgroundColor: themeColor }}
                className="px-4 py-3 text-white flex items-center gap-2.5 transition-all duration-300"
              >
                {avatarEnabled ? (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-xs leading-none">{d.farahBot}</div>
                  <div className="text-[9px] text-white/80 mt-1 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    {d.online}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-3.5 space-y-3.5 flex flex-col justify-end text-[10px]">
                <div className="flex items-start gap-2 max-w-[85%]">
                  {avatarEnabled && (
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl rounded-tl-none px-3 py-2 text-slate-700 dark:text-slate-300 shadow-sm leading-relaxed">
                    {lang === 'ar' ? greetingAr : greetingEn}
                  </div>
                </div>

                {collectLeadData && (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl text-center space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      {d.welcomeFlow}
                    </span>
                    <input
                      type="text"
                      disabled
                      placeholder="David Miller (d.miller@company.com)"
                      className="w-full text-center px-2 py-1 text-[9px] bg-slate-100/50 border border-slate-200 dark:border-slate-800 rounded focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-850 flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  placeholder={d.typeMessage}
                  className="flex-1 bg-transparent border-none text-[10px] focus:outline-none"
                />
                <button disabled className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
              <span className="text-slate-450 font-bold">Launcher Widget Simulated:</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-md" style={{ backgroundColor: themeColor, alignSelf: launcherPosition === 'right' ? 'flex-end' : 'flex-start' }}>
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setShowAuditDrawer(true)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {d.viewAuditLogs}
          </button>
          <button
            onClick={handleSaveWidgetConfigs}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {d.saveWidgetConfigs}
          </button>
        </div>
      </div>

      {/* ── MODAL A — Channel Operations Configuration (Tenant Level) ── */}
      <ModalWrapper
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        title={selectedChannel ? `${selectedChannel.name} Operations` : 'Channel Configuration'}
        maxWidthClass="max-w-md"
      >
        {selectedChannel && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
              <div className={`p-2 rounded-xl ${selectedChannel.iconBg}`}>{selectedChannel.icon}</div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{selectedChannel.name}</div>
                <div className="text-[10px] text-slate-400">{selectedChannel.routingMode}</div>
              </div>
              <div className="ml-auto">
                <Badge type={statusBadgeType(selectedChannel.enabled ? 'active' : 'inactive')}>
                  {selectedChannel.enabled ? d.active : d.inactive}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Channel Dispatch Queue
              </label>
              <select
                defaultValue={selectedChannel.queue}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-bold"
              >
                <option>{selectedChannel.queue}</option>
                <option>General Support Team</option>
                <option>Premium Accounts Routing</option>
                <option>Billing Exceptions Queue</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                AI Agent Triage Enablement
              </label>
              <div className="p-3 bg-slate-55 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-400">Pre-route matching intents</span>
                <span className="font-mono text-blue-600 font-bold">{selectedChannel.aiEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Response SLA Trigger Baseline
              </label>
              <input
                type="text"
                defaultValue={selectedChannel.sla}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-xs font-mono font-bold"
              />
            </div>

            {selectedChannel.id === 't-vo' && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-dashed border-blue-200 dark:border-blue-900 rounded-xl text-center space-y-2">
                <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                  Voice IVR Designer Available
                </span>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Configure interactive caller menus, business hour branches, agent queue dispatch, and voice assistant fallback paths.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowChannelModal(false);
                    setShowIvrDesigner(true);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-[10.5px]"
                >
                  {d.openIvrDesigner || 'Design IVR Workflow'}
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowChannelModal(false)}
                className="px-4 py-2 border border-slate-205 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                {d.cancel}
              </button>
              <button
                onClick={handleSaveChannelConfig}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
              >
                {d.configure}
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* ── MODAL B — WhatsApp Notification Template Preview ── */}
      <ModalWrapper
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={d.templateDetails}
        maxWidthClass="max-w-md"
      >
        {selectedTemplate && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-55 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-xl space-y-1">
              <div className="font-bold text-[13px] font-mono text-slate-900 dark:text-white">
                {selectedTemplate.name}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-450">
                <span>Category: <strong className="text-slate-600 dark:text-slate-350">{selectedTemplate.category}</strong></span>
                <span>Language: <strong className="text-slate-600 dark:text-slate-350">{selectedTemplate.lang}</strong></span>
              </div>
              <div className="pt-2 flex justify-between items-center text-[10px] border-t border-slate-200 dark:border-slate-800/80">
                <span>Usage: <strong className="text-slate-600 dark:text-slate-350">{selectedTemplate.usage.toLocaleString()}</strong></span>
                <span>Delivery: <strong className="text-emerald-500">{selectedTemplate.successRate}</strong></span>
              </div>
            </div>

            {selectedTemplate.bodyEn && (
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  English Template Body (EN)
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed font-sans text-slate-700 dark:text-slate-350">
                  {selectedTemplate.bodyEn}
                </div>
              </div>
            )}

            {selectedTemplate.bodyAr && (
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Arabic Template Body (AR)
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed font-sans text-slate-700 dark:text-slate-350" dir="rtl">
                  {selectedTemplate.bodyAr}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
              <span className="font-bold text-slate-500">Facebook Meta Approval:</span>
              <Badge type={statusBadgeType(selectedTemplate.status)}>
                {selectedTemplate.status === 'approved' ? d.approved : selectedTemplate.status === 'pending' ? d.pending : d.rejected}
              </Badge>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowTemplateModal(false)}
                data-testid="close-template-preview-btn"
                className="px-5 py-2.5 bg-slate-150 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all text-slate-700 dark:text-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* ── DRAWER A — Web Chat Audit Logs ── */}
      <DrawerWrapper
        isOpen={showAuditDrawer}
        onClose={() => setShowAuditDrawer(false)}
        title={d.auditLogsTitle}
        isRtl={lang === 'ar'}
      >
        <div className="space-y-4 text-xs">
          {widgetAuditLogs.map(log => (
            <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {log.date}
                </div>
                <Badge type="inactive">{log.id}</Badge>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <UserCheck className="w-4 h-4 text-blue-500" />
                {log.user}
              </div>
              <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                {log.action}
              </div>
            </div>
          ))}
        </div>
      </DrawerWrapper>

    </div>
  );
}
