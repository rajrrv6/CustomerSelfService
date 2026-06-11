import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_SESSIONS } from './constants';
import { ActiveSession } from './types';
import { Smartphone, Monitor, ShieldAlert, AlertTriangle } from 'lucide-react';

export function ActiveSessionsPanel() {
  const { lang, addAuditLog } = useApp();
  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_SESSIONS);
  const [confirmingSessionId, setConfirmingSessionId] = useState<string | null>(null);

  const handleForceLogout = (id: string) => {
    const targetSession = sessions.find(s => s.id === id);
    if (!targetSession) return;

    setSessions(prev => prev.filter(s => s.id !== id));
    setConfirmingSessionId(null);
    addAuditLog(`Forced termination of active session: ${targetSession.device} (${targetSession.ip})`, 'failed');
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('phone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-5 h-5 text-blue-500" />;
    }
    return <Monitor className="w-5 h-5 text-slate-500" />;
  };

  const t = {
    en: {
      title: 'Active User Sessions',
      desc: 'Verify active concurrent logins and terminate any unrecognized devices.',
      currentSession: 'Current Session',
      forceLogout: 'Revoke Access',
      confirmTitle: 'Revoke Session Access?',
      confirmDesc: 'This will instantly log out the session and cancel all associated tokens.',
      cancel: 'Cancel',
      confirm: 'Revoke Device',
    },
    ar: {
      title: 'جلسات المستخدم النشطة',
      desc: 'تحقق من الأجهزة المتصلة حالياً وقم بإنهاء الجلسات غير المعترف بها.',
      currentSession: 'الجلسة الحالية',
      forceLogout: 'إلغاء الوصول',
      confirmTitle: 'هل تريد إنهاء الجلسة؟',
      confirmDesc: 'سيؤدي هذا فوراً إلى تسجيل الخروج وإلغاء جميع الرموز المرتبطة.',
      cancel: 'إلغاء',
      confirm: 'إنهاء الجلسة',
    },
  }[lang] || {
    title: 'Active User Sessions',
    desc: 'Verify active concurrent logins and terminate any unrecognized devices.',
    currentSession: 'Current Session',
    forceLogout: 'Revoke Access',
    confirmTitle: 'Revoke Session Access?',
    confirmDesc: 'This will instantly log out the session and cancel all associated tokens.',
    cancel: 'Cancel',
    confirm: 'Revoke Device',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-2">
          <Monitor className="w-4.5 h-4.5 text-blue-500" />
          {t.title}
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold block mt-0.5">
          {t.desc}
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row justify-between md:items-center gap-3 ${
              sess.current
                ? 'bg-blue-500/5 border-blue-500 dark:bg-blue-950/10'
                : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-150 dark:border-slate-850'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-200/50 dark:border-slate-800 shadow-sm shrink-0">
                {getDeviceIcon(sess.device)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{sess.device}</span>
                  {sess.current && (
                    <span className="text-[8.5px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      {t.currentSession}
                    </span>
                  )}
                </div>
                <span className="block text-[9.5px] text-slate-400 font-medium font-mono mt-0.5">
                  {sess.browser} • {sess.ip} • {sess.location}
                </span>
                <span className="block text-[8.5px] text-slate-400 font-semibold mt-1">
                  Active: {sess.lastActive}
                </span>
              </div>
            </div>

            {/* Logout actions */}
            {!sess.current && (
              <div className="shrink-0 flex items-center">
                {confirmingSessionId === sess.id ? (
                  <div className="bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl flex flex-col gap-2 max-w-xs shadow-lg animate-in zoom-in-95 duration-100">
                    <div className="flex gap-2 items-start text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <div>
                        <span className="font-bold block">{t.confirmTitle}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{t.confirmDesc}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmingSessionId(null)}
                        className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-bold hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleForceLogout(sess.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                      >
                        {t.confirm}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingSessionId(sess.id)}
                    className="px-3.5 py-1.5 border border-rose-200 hover:border-rose-600 text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-955/10 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    {t.forceLogout}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
