'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { translations } from '@/i18n/translations';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { OperationalCard } from '@/components/shared/OperationalCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useFeedbackToasts } from '@/components/customer-portal/feedback/PostChatToasts';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  RefreshCw,
  ShieldCheck,
  Rocket,
  Layers,
  Phone,
  BarChart2,
  CheckCircle2,
  Trash2,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';

interface NoticeItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
}

export function NotificationsOverviewTab() {
  const lang = useUIStore((s) => s.lang);
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const ns = t.superAdmin.notifications;
  const { addAuditLog } = useApp();
  const { pushToast } = useFeedbackToasts();

  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Initialize notices on lang or translations load
  useEffect(() => {
    const initialNotices: NoticeItem[] = [
      {
        id: 'billing_cycle',
        icon: <Layers className="w-4 h-4" />,
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        title: ns.items.billingCycleTitle,
        description: ns.items.billingCycleDesc,
        time: ns.items.billingCycleTime,
        category: 'billing',
        categoryLabel: isRtl ? 'فوترة' : 'Billing',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      },
      {
        id: 'sync_completed',
        icon: <RefreshCw className="w-4 h-4" />,
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        title: ns.items.syncCompletedTitle,
        description: ns.items.syncCompletedDesc,
        time: ns.items.syncCompletedTime,
        category: 'sync',
        categoryLabel: isRtl ? 'مزامنة' : 'Sync',
        categoryColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      },
      {
        id: 'compliance_reminder',
        icon: <ShieldCheck className="w-4 h-4" />,
        iconBg: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        title: ns.items.complianceReminderTitle,
        description: ns.items.complianceReminderDesc,
        time: ns.items.complianceReminderTime,
        category: 'governance',
        categoryLabel: isRtl ? 'حوكمة' : 'Governance',
        categoryColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      },
      {
        id: 'deployment_notice',
        icon: <Rocket className="w-4 h-4" />,
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        title: ns.items.deploymentNoticeTitle,
        description: ns.items.deploymentNoticeDesc,
        time: ns.items.deploymentNoticeTime,
        category: 'deployment',
        categoryLabel: isRtl ? 'نشر' : 'Deployment',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      },
      {
        id: 'sip_health',
        icon: <Phone className="w-4 h-4" />,
        iconBg: 'bg-slate-50 dark:bg-slate-800/60',
        iconColor: 'text-slate-600 dark:text-slate-400',
        title: ns.items.sipHealthTitle,
        description: ns.items.sipHealthDesc,
        time: ns.items.sipHealthTime,
        category: 'telephony',
        categoryLabel: isRtl ? 'اتصالات' : 'Telephony',
        categoryColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      },
      {
        id: 'llm_cost',
        icon: <BarChart2 className="w-4 h-4" />,
        iconBg: 'bg-rose-50 dark:bg-rose-900/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        title: ns.items.llmCostTitle,
        description: ns.items.llmCostDesc,
        time: ns.items.llmCostTime,
        category: 'advisory',
        categoryLabel: isRtl ? 'تنبيه' : 'Advisory',
        categoryColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      },
    ];

    setNoticesList(initialNotices);
  }, [lang, ns]);

  // Handle Mark All as Read
  const handleMarkAllRead = () => {
    const allIds = noticesList.map((n) => n.id);
    setReadIds(new Set(allIds));
    pushToast(
      'success',
      isRtl ? 'تم تحديد الكل كمقروء' : 'All Marked as Read',
      isRtl ? 'تم تحديث جميع التنبيهات النشطة.' : 'Successfully marked all current advisories as read.'
    );
    addAuditLog('Marked all system advisories notifications as read.', 'success');
  };

  // Handle Delete Single Notice
  const handleDeleteNotice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoticesList((prev) => prev.filter((n) => n.id !== id));
    pushToast(
      'success',
      isRtl ? 'تم حذف التنبيه' : 'Notification Dismissed',
      isRtl ? 'تم إزالة التنبيه من لوحتك.' : 'Successfully removed notification from layout view.'
    );
  };

  // Handle Toggle Read Status inside Modal
  const toggleReadStatus = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Simulate Diagnostic Alert Trigger
  const triggerDiagnosticAlert = () => {
    const newId = `diag_${Date.now()}`;
    const newAlert: NoticeItem = {
      id: newId,
      icon: <ShieldCheck className="w-4 h-4" />,
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      title: isRtl ? 'تنبيه تشخيصي: زمن استجابة LLM حرج' : 'Diagnostic Alert: Critical LLM Latency Spike',
      description: isRtl 
        ? 'تجاوز زمن الاستجابةClaude-3.5 للاتصال الهاتفي 2.1 ثانية في خادم KSA-East.' 
        : 'Claude-3.5 telephony agent response latency spiked to 2.1s in regional node KSA-East.',
      time: isRtl ? 'الآن' : 'Just Now',
      category: 'advisory',
      categoryLabel: isRtl ? 'تنبيه' : 'Advisory',
      categoryColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };

    setNoticesList((prev) => [newAlert, ...prev]);
    pushToast(
      'info',
      isRtl ? 'تنبيه طارئ محاكى' : 'Emergency Alert Simulated',
      isRtl ? 'تم إدراج تنبيه تشخيصي عاجل في النظام.' : 'Injected simulated emergency gateway alert into active feed.'
    );
    addAuditLog('Simulated critical LLM latency emergency alert.', 'success');
  };

  // Filter Notices
  const filteredNotices = noticesList.filter((notice) => {
    if (activeCategory === 'all') return true;
    return notice.category === activeCategory;
  });

  // Category counts
  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return noticesList.length;
    return noticesList.filter((n) => n.category === cat).length;
  };

  // Stat tile counts calculated dynamically
  const statTiles = [
    {
      id: 'recent_alerts',
      label: ns.recentAlertsLabel,
      value: noticesList.filter((n) => !readIds.has(n.id)).length.toString(),
      icon: <Bell className="w-5 h-5" />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'sync_notices',
      label: ns.syncNoticesLabel,
      value: noticesList.filter((n) => n.category === 'sync').length.toString(),
      icon: <RefreshCw className="w-5 h-5" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'governance_reminders',
      label: ns.governanceRemindersLabel,
      value: noticesList.filter((n) => n.category === 'governance').length.toString(),
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'deployment_updates',
      label: ns.deploymentUpdatesLabel,
      value: noticesList.filter((n) => n.category === 'deployment').length.toString(),
      icon: <Rocket className="w-5 h-5" />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const categories = [
    { id: 'all', label: isRtl ? 'الكل' : 'All' },
    { id: 'billing', label: isRtl ? 'فوترة' : 'Billing' },
    { id: 'sync', label: isRtl ? 'مزامنة' : 'Sync' },
    { id: 'governance', label: isRtl ? 'حوكمة' : 'Governance' },
    { id: 'deployment', label: isRtl ? 'نشر' : 'Deployment' },
    { id: 'telephony', label: isRtl ? 'اتصالات' : 'Telephony' },
    { id: 'advisory', label: isRtl ? 'تنبيهات' : 'Advisory' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <SectionHeader
          title={ns.title}
          description={ns.description}
        />
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={triggerDiagnosticAlert}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 hover:text-red-650 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white dark:bg-slate-900"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>{isRtl ? 'محاكاة تنبيه تشخيصي' : 'Simulate Diagnostic Alert'}</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={noticesList.length === 0}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            {isRtl ? 'تحديد الكل كمقروء' : 'Mark All as Read'}
          </button>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statTiles.map((tile) => (
          <OperationalCard key={tile.id} hoverEffect={false}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${tile.iconBg} ${tile.iconColor} flex items-center justify-center shrink-0`}>
                {tile.icon}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-tight">
                  {tile.label}
                </p>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5 font-mono">
                  {tile.value}
                </h3>
              </div>
            </div>
          </OperationalCard>
        ))}
      </div>

      {/* Category Pills Menu */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200/60 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Notices List */}
      <OperationalCard hoverEffect={false}>
        <div className="space-y-1">
          {filteredNotices.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-6 h-6 stroke-[1.5]" />}
              title={ns.allClearTitle}
              description={ns.allClearDesc}
            />
          ) : (
            filteredNotices.map((notice, idx) => {
              const isRead = readIds.has(notice.id);
              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`flex items-start gap-4 py-4 px-3 rounded-xl transition-all duration-150 group cursor-pointer border border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-950/20 hover:border-slate-100 dark:hover:border-slate-850/30 ${
                    idx < filteredNotices.length - 1 ? 'border-b border-b-slate-100 dark:border-b-slate-800/60' : ''
                  } ${isRead ? 'opacity-60' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${notice.iconBg} ${notice.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                    {notice.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`flex flex-wrap items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="text-xs font-extrabold text-slate-850 dark:text-white leading-tight">
                        {notice.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${notice.categoryColor}`}>
                        {notice.categoryLabel}
                      </span>
                      {!isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {notice.description}
                    </p>
                  </div>

                  {/* Right side interactions */}
                  <div className="flex items-center gap-2 mt-0.5 shrink-0">
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {notice.time}
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotice(notice);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title={isRtl ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNotice(notice.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title={isRtl ? 'حذف التنبيه' : 'Dismiss Alert'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </OperationalCard>

      {/* Notification Detail Overlay Modal */}
      {selectedNotice && (
        <ModalWrapper
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title={isRtl ? 'تفاصيل التنبيه الإداري' : 'System Advisory details'}
        >
          <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${selectedNotice.iconBg} ${selectedNotice.iconColor} flex items-center justify-center shrink-0`}>
                {selectedNotice.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white leading-snug">{selectedNotice.title}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wide inline-block mt-1 ${selectedNotice.categoryColor}`}>
                  {selectedNotice.categoryLabel}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
              <p className="leading-relaxed text-slate-655 dark:text-slate-355 font-semibold">{selectedNotice.description}</p>
            </div>

            {/* Telemetry metadata */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>{isRtl ? 'بيانات التتبع التشخيصي' : 'Advisory Telemetry Metadata'}</span>
              </span>
              <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl font-mono text-[9px] text-emerald-450 leading-relaxed space-y-1 overflow-x-auto">
                <div>{`{`}</div>
                <div className="pl-4">{`"eventId": "evt_${selectedNotice.id}",`}</div>
                <div className="pl-4">{`"traceId": "tr_${selectedNotice.id.substring(0, 8)}_${Date.now().toString().slice(-4)}",`}</div>
                <div className="pl-4">{`"timestamp": "2026-06-04T12:41:00Z",`}</div>
                <div className="pl-4">{`"category": "${selectedNotice.category}",`}</div>
                <div className="pl-4">{`"severity": "${selectedNotice.iconBg.includes('red') ? 'critical' : selectedNotice.iconBg.includes('amber') ? 'warning' : 'info'}",`}</div>
                <div className="pl-4">{`"origin": "SuperAdminConsoleHub",`}</div>
                <div className="pl-4">{`"actor": "SystemObserveAgent"`}</div>
                <div>{`}`}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleReadStatus(selectedNotice.id);
                  pushToast(
                    'success',
                    isRtl ? 'تم تحديث الحالة' : 'Status Toggled',
                    isRtl ? 'تم تحديث حالة قراءة التنبيه.' : 'Advisory read status updated successfully.'
                  );
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl hover:text-blue-600 transition-all font-bold cursor-pointer"
              >
                {readIds.has(selectedNotice.id) 
                  ? (isRtl ? 'تعيين كغير مقروء' : 'Mark as Unread')
                  : (isRtl ? 'تعيين كمقروء' : 'Mark as Read')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-250 rounded-xl font-bold cursor-pointer transition-colors"
              >
                {isRtl ? 'إغلاق' : 'Dismiss View'}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
