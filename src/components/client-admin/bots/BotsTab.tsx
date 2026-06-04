'use client';

import React, { useState, Suspense, lazy } from 'react';
import { useApp } from '@/context/AppContext';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useRenderProfiler } from '@/hooks/useRenderProfiler';
import { Plus, AlertTriangle, Sparkles, GitBranch, Brain, ShieldCheck, Layers, Activity, Clock, Globe, Settings, Database } from 'lucide-react';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { BotCard } from './BotCard';
import { BotEditPersonaModal } from './BotEditPersonaModal';
import { usePermission } from '@/stores/permissionStore';
import { useAlerts } from '@/stores/notifications/notificationSelectors';
import { OperationalActivityFeed } from '../shared/OperationalActivityFeed';

// Lazy-loaded BotWizard component
const BotWizard = lazy(() => import('./BotWizard').then(m => ({ default: m.BotWizard })));

export function BotsTab() {
  useRenderProfiler('BotsTab');
  // Narrow Zustand selectors — only re-renders when lang or addAuditLog changes
  const lang = useUIStore((s) => s.lang);
  const addAuditLog = useNotificationsStore((s) => s.addAuditLog);
  const t = translations[lang];

  // Fetch bot permissions
  const { canEdit } = usePermission('bots');

  // Feature-scoped bot state stays in AppContext (only BotsTab writes/reads bots)
  const { bots, setBots } = useApp();

  // State to control wizard open
  const [showAddBotModal, setShowAddBotModal] = useState(false);

  // Edit persona modal states
  const [showEditPersonaModal, setShowEditPersonaModal] = useState(false);
  const [editingBot, setEditingBot] = useState<any | null>(null);

  // Fetch live alerts for warning banner
  const alerts = useAlerts();
  const activeSlaAlerts = alerts.filter(
    (a) => a.lifecycleState === 'active' && (a.category === 'sla' || a.severity === 'critical')
  );

  const handleSavePersona = (updatedDetails: { name: string; persona: string; tone: string }) => {
    if (!canEdit) return;
    if (!editingBot) return;
    setBots((prev: any[]) => 
      prev.map((b) => (b.id === editingBot.id ? { ...b, ...updatedDetails } : b))
    );
    addAuditLog(`Updated persona details for bot: ${updatedDetails.name}`, 'success');
    setShowEditPersonaModal(false);
    setEditingBot(null);
  };

  const headerAction = (
    <button
      onClick={() => {
        if (!canEdit) return;
        setShowAddBotModal(true);
      }}
      disabled={!canEdit}
      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 animate-fade-in cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
      title={!canEdit ? "Requires Edit Permission" : undefined}
    >
      <Plus className="w-4 h-4" />
      {t.clientAdmin.bots.createButton}
    </button>
  );

  const isRtl = lang === 'ar';

  const handleQuickAction = (screenId: string) => {
    const event = new CustomEvent('navigate-to-screen', {
      detail: { screenId }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.clientAdmin.bots.title}
        description={t.clientAdmin.bots.description}
        action={headerAction}
      />

      {/* Dynamic SLA Health warning or alert banner if deflection dips */}
      {activeSlaAlerts.length > 0 ? (
        activeSlaAlerts.map((alert) => (
          <div key={alert.id} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 dark:text-white leading-none">
                  {alert.title}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {alert.message}
                </p>
              </div>
            </div>
            {alert.actions && alert.actions.length > 0 && (
              <button 
                onClick={() => {
                  const act = alert.actions?.[0];
                  if (act && act.actionType === 'navigate' && act.payload?.screenId) {
                    handleQuickAction(act.payload.screenId);
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-650 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors text-[10px] shrink-0 cursor-pointer"
              >
                {alert.actions[0].label}
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 dark:text-white leading-none">
                {isRtl ? 'تحذير: عتبة دقة NLU منخفضة في Staging' : 'Warning: Unconfigured Prompt in Staging Variant'}
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {isRtl 
                  ? 'البوت Farah-DeepSeek يعمل بمؤشر دقة 55٪. يرجى تهيئة الكلمات الدلالية لتفادي أخطاء استرجاع RAG.' 
                  : 'Farah-DeepSeek variant lacks fallback confidence mappings. Review intent training scores.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleQuickAction('training')}
            className="px-3.5 py-1.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors text-[10px] shrink-0 cursor-pointer"
          >
            {isRtl ? 'تصحيح النموذج' : 'Train Intelligence'}
          </button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left Column: Bots list */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              {isRtl ? 'الروبوتات النشطة للمستأجر' : 'Active Tenant Agent Rosters'}
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-slate-900 text-blue-800 dark:text-blue-400 font-mono text-[9px] font-bold">
              {bots.length} {isRtl ? 'روبوتات مفعّلة' : 'Active Bots'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                lang={lang}
                t={t}
                canEdit={canEdit}
                onEditPersona={() => {
                  if (!canEdit) return;
                  setEditingBot(bot);
                  setShowEditPersonaModal(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Stabilized Operations & Governance widgets */}
        <div className="w-full xl:w-96 xl:shrink-0 space-y-4">
          
          {/* Categorized Quick Actions Panel */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850/65 rounded-3xl p-5 shadow-sm space-y-4 w-full">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>{isRtl ? 'مشغل الإجراءات السريعة' : 'Operational Quick Actions'}</span>
            </h4>

            {/* AI & Knowledge */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">
                {isRtl ? 'الذكاء الاصطناعي والمعرفة' : 'AI & Knowledge'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                  onClick={() => setShowAddBotModal(true)}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>{isRtl ? 'إنشاء بوت جديد' : 'Create Bot'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('knowledge_base')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Brain className="w-4 h-4 text-emerald-500" />
                  <span>{isRtl ? 'رفع مصدر المعرفة' : 'Upload Knowledge'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('intents')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>{isRtl ? 'تدريب النوايا' : 'Train Intents'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('dialog_flow')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <GitBranch className="w-4 h-4 text-blue-500" />
                  <span>{isRtl ? 'مخطط الحوار' : 'Open Dialog Builder'}</span>
                </button>
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">
                {isRtl ? 'القنوات والاتصال' : 'Channels & Integrations'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                  onClick={() => handleQuickAction('channels')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Globe className="w-4 h-4 text-pink-500" />
                  <span>{isRtl ? 'التحقق من WhatsApp' : 'Verify WhatsApp'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('channels')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Settings className="w-4 h-4 text-orange-500" />
                  <span>{isRtl ? 'تهيئة شات الويب' : 'Configure Widget'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('channels')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer col-span-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Database className="w-4 h-4 text-rose-500" />
                  <span>{isRtl ? 'فتح إعدادات الهاتف / IVR' : 'Open IVR Config'}</span>
                </button>
              </div>
            </div>

            {/* Governance */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block">
                {isRtl ? 'الحوكمة والمراقبة' : 'Governance & Analytics'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                  onClick={() => handleQuickAction('guardrails')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>{isRtl ? 'مراجعة حواجز الأمان' : 'Review Guardrails'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('analytics_center')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-550 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Activity className="w-4 h-4 text-teal-500" />
                  <span>{isRtl ? 'فتح الإحصائيات' : 'Open Analytics'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('deployments')}
                  className="p-2.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer col-span-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{isRtl ? 'سجل العمليات والترقيات' : 'Audit Recent Deployments'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Queue Status Summary Card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850/65 rounded-3xl p-5 shadow-sm space-y-4 w-full">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{isRtl ? 'ملخص القنوات والانتظار' : 'Queue Capacity & SLA Metrics'}</span>
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'مكالمات الانتظار' : 'Calls Queue'}</span>
                <strong className="text-sm font-bold text-slate-800 dark:text-white font-mono block">12</strong>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'متوسط الانتظار' : 'Avg Wait'}</span>
                <strong className="text-sm font-bold text-slate-800 dark:text-white font-mono block">38s</strong>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">{isRtl ? 'الالتزام بـ SLA' : 'SLA Rate'}</span>
                <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-450 font-mono block">94.8%</strong>
              </div>
            </div>
          </div>

          {/* Real-time AI Training & Operations Feed (Connected to Store) */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850/65 rounded-3xl p-5 shadow-sm space-y-4 w-full">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{isRtl ? 'سجل العمليات والتدريب' : 'AI Training & Operations Feed'}</span>
            </h4>
            <OperationalActivityFeed filterScope="bots" limit={4} compact={true} />
          </div>
          
        </div>
      </div>

      {/* Stepper Wizard Modal (Lazy Loaded) */}
      {showAddBotModal && (
        <Suspense fallback={null}>
          <BotWizard 
            isOpen={showAddBotModal} 
            onClose={() => setShowAddBotModal(false)} 
            lang={lang} 
          />
        </Suspense>
      )}

      {/* Edit Persona Modal */}
      <BotEditPersonaModal
        isOpen={showEditPersonaModal}
        onClose={() => {
          setShowEditPersonaModal(false);
          setEditingBot(null);
        }}
        bot={editingBot}
        lang={lang}
        t={t}
        onSave={handleSavePersona}
      />
    </div>
  );
}
