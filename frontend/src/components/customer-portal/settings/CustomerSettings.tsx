'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Settings, ShieldCheck, Lock, Globe, Eye, CheckCircle, 
  Trash2, ToggleLeft, ToggleRight, Laptop, Tablet, Smartphone, Sparkles,
  UserCheck, Sliders, Accessibility, BellRing, KeyRound, ShieldAlert
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import { ProfileEditor } from './ProfileEditor';
import { AppearanceSettings } from './AppearanceSettings';
import { AccessibilitySettings } from './AccessibilitySettings';
import { NotificationPreferences } from '../notifications/NotificationPreferences';
import { 
  FOCUS_RING, INTERACTIVE_BTN_PRIMARY, INTERACTIVE_BTN_GHOST, SURFACE_PANEL, ENTER_PANEL 
} from '@/design-system/tokens';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  type: 'desktop' | 'mobile' | 'tablet';
}

export function CustomerSettings() {
  const { lang } = useUIStore();
  const { addAuditLog } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'accessibility' | 'notifications' | 'security' | 'sessions'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security mock form
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState<Session[]>([
    { id: 's1', device: 'Macbook Pro - Chrome', location: 'Dubai, UAE', ip: '147.28.112.5', lastActive: 'Active Now', type: 'desktop' },
    { id: 's2', device: 'iPhone 15 Pro - Safari', location: 'Riyadh, KSA', ip: '192.168.10.150', lastActive: '2 hours ago', type: 'mobile' },
    { id: 's3', device: 'iPad Air - Slack Webhook', location: 'Abu Dhabi, UAE', ip: '147.28.112.6', lastActive: 'May 28, 2026', type: 'tablet' }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass) return;
    setOldPass('');
    setNewPass('');
    addAuditLog('Customer updated account security password', 'success');
    triggerToast(isRtl ? 'تم تغيير كلمة المرور بنجاح.' : 'Account password updated.');
  };

  const handleMfaToggle = () => {
    const nextVal = !mfaEnabled;
    setMfaEnabled(nextVal);
    addAuditLog(`MFA setup state toggled to: ${nextVal}`, 'success');
    triggerToast(nextVal ? (isRtl ? 'تم تفعيل التحقق الثنائي MFA.' : 'MFA Authentication enabled.') : (isRtl ? 'تم تعطيل التحقق الثنائي.' : 'MFA Authentication disabled.'));
  };

  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    addAuditLog(`Revoked active session token ID: ${id}`, 'success');
    triggerToast(isRtl ? 'تم إلغاء الجلسة بنجاح.' : 'Device session revoked.');
  };

  return (
    <div 
      className={`space-y-6 text-slate-800 dark:text-slate-200 ${ENTER_PANEL}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Settings Top Bar */}
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4`}>
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
            {isRtl ? 'إعدادات الحساب وتفضيلات البوابة' : 'Account & Portal Settings'}
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            {isRtl ? 'إدارة المظهر، إعدادات الأمان، قنوات التنبيهات والأجهزة النشطة.' : 'Configure profile fields, accessibility themes, notification channels, and active sessions.'}
          </span>
        </div>
        <div className="px-3.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-extrabold font-mono flex items-center gap-1.5 shadow-sm border border-amber-500/20 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GOLD CORPORATE USER</span>
        </div>
      </div>

      {/* Tabs list (Sticky / Responsive wrap) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-none pb-0.5 gap-4">
        {[
          { id: 'profile', labelEN: 'Profile Info', labelAR: 'الملف الشخصي', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'appearance', labelEN: 'Appearance', labelAR: 'المظهر والسمات', icon: <Sliders className="w-4 h-4" /> },
          { id: 'accessibility', labelEN: 'Accessibility', labelAR: 'سهولة الوصول', icon: <Accessibility className="w-4 h-4" /> },
          { id: 'notifications', labelEN: 'Notifications', labelAR: 'التنبيهات المفضلة', icon: <BellRing className="w-4 h-4" /> },
          { id: 'security', labelEN: 'Security & MFA', labelAR: 'الأمان والحماية', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'sessions', labelEN: 'Active Sessions', labelAR: 'الأجهزة المتصلة', icon: <Laptop className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 border-b-2 px-1 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
            } ${FOCUS_RING}`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.icon}
            <span>{isRtl ? tab.labelAR : tab.labelEN}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-300">
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'accessibility' && <AccessibilitySettings />}
        {activeTab === 'notifications' && <NotificationPreferences />}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Password Form */}
            <form onSubmit={handleSecuritySave} className={`p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm`}>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                <Lock className="w-4.5 h-4.5 text-blue-500" />
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  {isRtl ? 'تغيير كلمة المرور' : 'Change Credentials'}
                </h5>
              </div>

              <div className="space-y-3 font-semibold text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">{isRtl ? 'كلمة المرور القديمة' : 'Current Password'}</label>
                  <input
                    type="password"
                    required
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono block">{isRtl ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none ${FOCUS_RING}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md cursor-pointer text-center text-xs transition-all ${INTERACTIVE_BTN_PRIMARY}`}
              >
                {isRtl ? 'تحديث كلمة المرور' : 'Update Credentials'}
              </button>
            </form>

            {/* MFA setup */}
            <div className={`p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm`}>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  {isRtl ? 'التحقق الثنائي (MFA)' : 'Multi-Factor Authentication'}
                </h5>
              </div>
              
              <p className="text-slate-450 dark:text-slate-400 font-semibold text-xs leading-relaxed">
                {isRtl 
                  ? 'يتطلب تسجيل الدخول إدخال رمز التحقق لمرة واحدة (OTP) المرسل لهاتفك الخلوي لتعزيز الأمان.' 
                  : 'Add an extra validation barrier by forcing OTP check challenges on new browser logins.'}
              </p>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-350">{isRtl ? 'تفعيل التحقق الثنائي (OTP)' : 'Enable OTP MFA Lock'}</span>
                <button
                  type="button"
                  onClick={handleMfaToggle}
                  className={`cursor-pointer ${INTERACTIVE_BTN_GHOST} ${FOCUS_RING}`}
                  aria-label={isRtl ? 'تبديل التحقق الثنائي' : 'Toggle MFA'}
                >
                  {mfaEnabled ? (
                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block font-mono">
              {isRtl ? 'الأجهزة والرموز المصرح لها بالوصول' : 'Active Authorization Sessions'}
            </span>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950">
              <table className="w-full text-left border-collapse text-xs" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-450 text-[10px] font-extrabold font-mono border-b border-slate-200 dark:border-slate-800 uppercase">
                    <th className="p-4">{isRtl ? 'الجهاز المتصل' : 'Device / OS'}</th>
                    <th className="p-4">{isRtl ? 'الموقع التقريبي' : 'Location'}</th>
                    <th className="p-4">{isRtl ? 'عنوان الـ IP' : 'IP Address'}</th>
                    <th className="p-4">{isRtl ? 'آخر نشاط' : 'Last Active'}</th>
                    <th className="p-4 text-center">{isRtl ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-600 dark:text-slate-350">
                  {sessions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="p-4 flex items-center gap-2.5">
                        {s.type === 'desktop' ? <Laptop className="w-4 h-4 text-blue-500" /> :
                         s.type === 'tablet' ? <Tablet className="w-4 h-4 text-purple-500" /> :
                         <Smartphone className="w-4 h-4 text-indigo-500" />}
                        <span>{s.device}</span>
                      </td>
                      <td className="p-4">{s.location}</td>
                      <td className="p-4 font-mono text-[10px]">{s.ip}</td>
                      <td className="p-4 font-mono text-[10px]">{s.lastActive}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className={`p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer ${FOCUS_RING}`}
                          title={isRtl ? 'إلغاء الترخيص' : 'Revoke session'}
                        >
                          <Trash2 className="w-4.5 h-4.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Local Toast alerts */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 border border-slate-800 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-[10px] font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
