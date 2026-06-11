'use client';

import React, { useState } from 'react';
import { 
  Bell, Check, Pin, Clock, Trash2, ChevronDown, ChevronUp, AlertCircle, 
  CheckCircle, Info, Sparkles, BookOpen, ShieldAlert, AlertTriangle, HelpCircle
} from 'lucide-react';
import { SystemAlert } from '@/stores/notifications/notificationTypes';
import { useApp } from '@/context/AppContext';
import { 
  FOCUS_RING, INTERACTIVE_BTN_GHOST, TRANSITION_STANDARD, GLASS_LIGHT 
} from '@/design-system/tokens';

interface NotificationCardProps {
  alert: SystemAlert;
  onAcknowledge: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({
  alert,
  onAcknowledge,
  onTogglePin,
  onSnooze,
  onDelete
}: NotificationCardProps) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSnoozeSelect, setShowSnoozeSelect] = useState(false);

  // Map category to icon & background style
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'sla':
        return {
          icon: <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          label: isRtl ? 'تحذير SLA' : 'SLA Warning'
        };
      case 'ai':
        return {
          icon: <Sparkles className="w-4.5 h-4.5 text-purple-500" />,
          bgColor: 'bg-purple-500/10 border-purple-500/20',
          label: isRtl ? 'تحديث Farah AI' : 'Farah AI Update'
        };
      case 'operations':
        return {
          icon: <WrenchIcon className="w-4.5 h-4.5 text-blue-500" />,
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          label: isRtl ? 'تنبيه النظام' : 'System Alert'
        };
      case 'compliance':
      case 'security':
        return {
          icon: <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />,
          bgColor: 'bg-rose-500/10 border-rose-500/20',
          label: isRtl ? 'أمان النظام' : 'Security Alert'
        };
      case 'kb':
      case 'recommendation':
        return {
          icon: <BookOpen className="w-4.5 h-4.5 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          label: isRtl ? 'توصيات المعرفة' : 'Knowledge Recommendation'
        };
      case 'ticket':
      case 'escalation':
      default:
        return {
          icon: <Bell className="w-4.5 h-4.5 text-slate-500" />,
          bgColor: 'bg-slate-500/10 border-slate-500/20',
          label: isRtl ? 'تحديث التذكرة' : 'Ticket Update'
        };
    }
  };

  // Helper because Wrench isn't directly loaded
  function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }

  const { icon, bgColor, label } = getCategoryConfig(alert.category);
  const isUnread = !alert.read;

  return (
    <div 
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isUnread 
          ? 'bg-blue-500/5 border-blue-500/25 dark:bg-blue-950/20 shadow-xs' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
      } hover:shadow-md`}
      role="listitem"
      aria-labelledby={`notif-title-${alert.id}`}
    >
      <div className="flex items-start gap-4">
        {/* Unread indicator dot */}
        <div className="flex flex-col items-center justify-start pt-1.5 shrink-0">
          <span 
            className={`w-2 h-2 rounded-full transition-all ${
              isUnread ? 'bg-blue-600 scale-100' : 'bg-transparent scale-0'
            }`} 
            aria-hidden="true" 
          />
        </div>

        {/* Category Icon */}
        <div className={`p-2.5 rounded-xl shrink-0 ${bgColor}`} aria-hidden="true">
          {icon}
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
              {label}
            </span>
            {alert.pinned && (
              <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-500 dark:text-rose-400 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider">
                {isRtl ? 'مثبت' : 'PINNED'}
              </span>
            )}
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-semibold ms-auto shrink-0">
              {alert.timestamp}
            </span>
          </div>

          <h4 
            id={`notif-title-${alert.id}`} 
            className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug"
          >
            {alert.title}
          </h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {alert.message}
          </p>

          {/* Expandable Meta Section */}
          {isExpanded && alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div className={`mt-3 p-3 rounded-xl border text-[10px] space-y-2 animate-in fade-in duration-200 ${GLASS_LIGHT}`}>
              <span className="font-bold text-slate-400 uppercase font-mono block">
                {isRtl ? 'بيانات التنبيه التعريفية' : 'Notification Attributes'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-300 font-mono font-medium">
                {Object.entries(alert.metadata).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="block text-slate-400 font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="block text-slate-800 dark:text-slate-200 font-bold break-all">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0 self-center sm:self-start">
          
          {/* Detail expand toggle */}
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
              aria-expanded={isExpanded}
              aria-label={isRtl ? 'تبديل التفاصيل' : 'Toggle details'}
            >
              {isExpanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
            </button>
          )}

          {/* Pin toggle */}
          <button
            onClick={() => onTogglePin(alert.id)}
            className={`p-2 border rounded-xl transition-all cursor-pointer ${
              alert.pinned 
                ? 'border-rose-500 bg-rose-500/10 text-rose-500' 
                : 'border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            } ${FOCUS_RING}`}
            aria-label={alert.pinned ? (isRtl ? 'إلغاء التثبيت' : 'Unpin notification') : (isRtl ? 'تثبيت التنبيه' : 'Pin notification')}
          >
            <Pin className="w-4.5 h-4.5" />
          </button>

          {/* Mark read button */}
          {isUnread && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className={`p-2 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-emerald-600 hover:border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer ${FOCUS_RING}`}
              aria-label={isRtl ? 'تحديد كمقروء' : 'Mark as read'}
            >
              <Check className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Snooze drop selector toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSnoozeSelect(!showSnoozeSelect)}
              className={`p-2 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/10 rounded-xl transition-colors cursor-pointer ${FOCUS_RING}`}
              aria-label={isRtl ? 'تأجيل التنبيه' : 'Snooze notification'}
              aria-haspopup="listbox"
              aria-expanded={showSnoozeSelect}
            >
              <Clock className="w-4.5 h-4.5" />
            </button>

            {showSnoozeSelect && (
              <div 
                className={`absolute z-30 right-0 mt-1.5 w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-[10px] font-bold font-mono text-slate-600 dark:text-slate-350 animate-in fade-in duration-100 ${isRtl ? 'left-0 right-auto' : 'right-0'}`}
                role="listbox"
              >
                {([1, 8, 24] as const).map(hrs => (
                  <button
                    key={hrs}
                    onClick={() => {
                      onSnooze(alert.id, hrs);
                      setShowSnoozeSelect(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer block"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                    role="option"
                    aria-selected="false"
                  >
                    {hrs} {hrs === 1 ? (isRtl ? 'ساعة' : 'hr') : (isRtl ? 'ساعات' : 'hrs')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete alert */}
          <button
            onClick={() => onDelete(alert.id)}
            className={`p-2 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer ${FOCUS_RING}`}
            aria-label={isRtl ? 'حذف التنبيه' : 'Delete notification'}
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>

        </div>
      </div>
    </div>
  );
}
