'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, MessageSquare, BellRing, Monitor, Volume2, ShieldAlert, CheckCircle 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  FOCUS_RING, INTERACTIVE_BTN_PRIMARY, SURFACE_PANEL, GLASS_LIGHT 
} from '@/design-system/tokens';
import { NotificationPreference } from '../personalization/types';
import { DEFAULT_NOTIFICATION_PREFERENCE } from '../personalization/constants';

interface NotificationPreferencesProps {
  onSavePreferences?: (prefs: NotificationPreference) => void;
}

export function NotificationPreferences({
  onSavePreferences
}: NotificationPreferencesProps) {
  const { lang, addAuditLog } = useApp();
  const isRtl = lang === 'ar';

  const [prefs, setPrefs] = useState<NotificationPreference>(DEFAULT_NOTIFICATION_PREFERENCE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user-notification-preferences');
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored notifications preferences', err);
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (key: keyof Omit<NotificationPreference, 'quietHours'>) => {
    const nextPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(nextPrefs);
  };

  const handleDndToggle = () => {
    const nextPrefs = {
      ...prefs,
      quietHours: {
        ...prefs.quietHours,
        enabled: !prefs.quietHours.enabled
      }
    };
    setPrefs(nextPrefs);
  };

  const handleTimeChange = (field: 'start' | 'end', val: string) => {
    const nextPrefs = {
      ...prefs,
      quietHours: {
        ...prefs.quietHours,
        [field]: val
      }
    };
    setPrefs(nextPrefs);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user-notification-preferences', JSON.stringify(prefs));
    addAuditLog(`Saved notification preferences override`, 'success');
    if (onSavePreferences) {
      onSavePreferences(prefs);
    }
    triggerToast(
      isRtl 
        ? 'تم حفظ تفضيلات التنبيهات بنجاح.' 
        : 'Notification channel preferences saved.'
    );
  };

  // Reusable Accessible Toggle Switch
  const Switch = ({
    checked,
    onChange,
    label
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${FOCUS_RING} ${
        checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked 
            ? (isRtl ? '-translate-x-5' : 'translate-x-5') 
            : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <form 
      onSubmit={handleSave} 
      className={`p-6 rounded-3xl border text-slate-800 dark:text-slate-200 space-y-6 ${SURFACE_PANEL}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
          {isRtl ? 'قنوات استلام التنبيهات' : 'Notification Delivery Channels'}
        </h4>
        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
          {isRtl 
            ? 'حدد القنوات التي ترغب في تلقي تحديثات النظام وتذاكر الدعم من خلالها.' 
            : 'Configure preferred endpoints to receive system logs and ticket escalation events.'}
        </span>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
        {/* Email Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl" aria-hidden="true">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-900 dark:text-white">
                {isRtl ? 'البريد الإلكتروني' : 'Email Alerts'}
              </span>
              <span className="block text-[10px] text-slate-400 font-normal">
                {isRtl ? 'تلقي إشعارات تفصيلية بالبريد.' : 'SLA alerts and full logs digest.'}
              </span>
            </div>
          </div>
          <Switch 
            checked={prefs.email} 
            onChange={() => handleToggle('email')} 
            label={isRtl ? 'تفعيل البريد الإلكتروني' : 'Toggle email alerts'} 
          />
        </div>

        {/* SMS Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl" aria-hidden="true">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-900 dark:text-white">
                {isRtl ? 'رسائل الجوال SMS' : 'SMS Broadcasts'}
              </span>
              <span className="block text-[10px] text-slate-400 font-normal">
                {isRtl ? 'تنبيهات عاجلة للاتصال الهاتفي.' : 'Critical priority phone alerts.'}
              </span>
            </div>
          </div>
          <Switch 
            checked={prefs.sms} 
            onChange={() => handleToggle('sms')} 
            label={isRtl ? 'تفعيل رسائل الجوال' : 'Toggle SMS alerts'} 
          />
        </div>

        {/* Push Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl" aria-hidden="true">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-900 dark:text-white">
                {isRtl ? 'إشعارات المتصفح' : 'Push Notifications'}
              </span>
              <span className="block text-[10px] text-slate-400 font-normal">
                {isRtl ? 'تحديثات لحظية أثناء استخدام المتصفح.' : 'Direct local desktop overlays.'}
              </span>
            </div>
          </div>
          <Switch 
            checked={prefs.push} 
            onChange={() => handleToggle('push')} 
            label={isRtl ? 'تفعيل إشعارات المتصفح' : 'Toggle push alerts'} 
          />
        </div>

        {/* In-app Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl" aria-hidden="true">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-900 dark:text-white">
                {isRtl ? 'التنبيهات داخل البوابة' : 'In-App Overlays'}
              </span>
              <span className="block text-[10px] text-slate-400 font-normal">
                {isRtl ? 'شريط التنبيهات في الزاوية العلوية.' : 'Header bell badge listings.'}
              </span>
            </div>
          </div>
          <Switch 
            checked={prefs.inApp} 
            onChange={() => handleToggle('inApp')} 
            label={isRtl ? 'تفعيل التنبيهات داخل البوابة' : 'Toggle in-app alerts'} 
          />
        </div>
      </div>

      {/* DND Scheduler and Priority Mode */}
      <div className="border-t border-slate-150 dark:border-slate-850 pt-5 space-y-5">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
            {isRtl ? 'وضع عدم الإزعاج والأولويات' : 'Quiet Hours & Priority Controls'}
          </h4>
        </div>

        {/* DND Toggle Row */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/10 text-slate-500 rounded-xl" aria-hidden="true">
                <Volume2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-slate-900 dark:text-white">
                  {isRtl ? 'وضع عدم الإزعاج الجدولي (DND)' : 'Scheduled Quiet Hours (DND)'}
                </span>
                <span className="block text-[10px] text-slate-400 font-normal">
                  {isRtl ? 'كتم جميع الإشعارات خلال الساعات المحددة.' : 'Mutes all regular notifications within set intervals.'}
                </span>
              </div>
            </div>
            <Switch 
              checked={prefs.quietHours.enabled} 
              onChange={handleDndToggle} 
              label={isRtl ? 'تفعيل وضع عدم الإزعاج الجدولي' : 'Toggle DND scheduler'} 
            />
          </div>

          {/* Time Picker Inputs */}
          {prefs.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/45 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase font-mono block">
                  {isRtl ? 'وقت البدء' : 'Start Time'}
                </label>
                <input
                  type="time"
                  value={prefs.quietHours.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className={`w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-center font-mono font-bold ${FOCUS_RING}`}
                  aria-label={isRtl ? 'وقت بدء عدم الإزعاج' : 'DND Start Time'}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase font-mono block">
                  {isRtl ? 'وقت الانتهاء' : 'End Time'}
                </label>
                <input
                  type="time"
                  value={prefs.quietHours.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className={`w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-center font-mono font-bold ${FOCUS_RING}`}
                  aria-label={isRtl ? 'وقت انتهاء عدم الإزعاج' : 'DND End Time'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Priority-Only Mode */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl" aria-hidden="true">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block text-slate-900 dark:text-white">
                {isRtl ? 'تنبيهات الطوارئ فقط' : 'Priority-Only Alert Mode'}
              </span>
              <span className="block text-[10px] text-slate-400 font-normal">
                {isRtl ? 'تلقي إشعارات الحالات الطارئة والحرجة فقط.' : 'Deliver only critical and SLA breach alert messages.'}
              </span>
            </div>
          </div>
          <Switch 
            checked={prefs.priorityOnly} 
            onChange={() => handleToggle('priorityOnly')} 
            label={isRtl ? 'تفعيل تنبيهات الطوارئ فقط' : 'Toggle Priority Only alert mode'} 
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="submit"
          className={`w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/15 text-center cursor-pointer transition-all ${INTERACTIVE_BTN_PRIMARY}`}
        >
          {isRtl ? 'حفظ تفضيلات التنبيهات' : 'Save Notification Preferences'}
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 border border-slate-800 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </form>
  );
}
