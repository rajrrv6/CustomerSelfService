'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, User, Database, Lock, Eye, AlertCircle, Save } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationsStore } from '@/stores/notificationsStore';

export function RbacTab() {
  const lang = useUIStore((s) => s.lang);
  const isRtl = lang === 'ar';
  const addAuditLog = useNotificationsStore((s) => s.addAuditLog);

  const [permissionsMatrix, setPermissionsMatrix] = useState([
    { role: 'Administrator', bots: true, channels: true, routing: true, billing: true, safety: true },
    { role: 'Supervisor', bots: false, channels: false, routing: true, billing: false, safety: true },
    { role: 'QA Manager', bots: false, channels: false, routing: false, billing: false, safety: false },
    { role: 'Support Agent', bots: false, channels: false, routing: false, billing: false, safety: false },
    { role: 'Viewer', bots: false, channels: false, routing: false, billing: false, safety: false }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (roleIndex: number, field: 'bots' | 'channels' | 'routing' | 'billing' | 'safety') => {
    setPermissionsMatrix((prev) =>
      prev.map((row, idx) => {
        if (idx === roleIndex) {
          const newVal = !row[field];
          addAuditLog(`RBAC: Modified ${row.role} permission scope "${field}" to ${newVal ? 'ENABLED' : 'DISABLED'}`, 'success');
          return { ...row, [field]: newVal };
        }
        return row;
      })
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addAuditLog(`RBAC settings globally compiled and synced to gateway.`, 'success');
      alert(isRtl ? 'تم حفظ وإعادة بناء سياسات RBAC بنجاح!' : 'RBAC access policies compiled and deployed successfully!');
    }, 1200);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isRtl ? 'إدارة الصلاحيات والـ RBAC' : 'RBAC Access Governance Policies'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {isRtl 
              ? 'تعديل سياسات التحكم بالوصول المستندة إلى الأدوار (RBAC) لشركاء العمل والمشرفين ووكلاء الدعم.' 
              : 'Modify Tenant role-based access control (RBAC) permissions matrix and deploy rules.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ السياسات' : 'Save Policies')}</span>
        </button>
      </div>

      {/* Permissions Matrix Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
          <Shield className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase font-mono">
            {isRtl ? 'جدول توزيع الصلاحيات' : 'Role Permissions Assignment Matrix'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-855 text-slate-400 font-bold">
                <th className="pb-3 pr-4">{isRtl ? 'الدور الوظيفي' : 'Tenant Role'}</th>
                <th className="pb-3 text-center">Bot Config</th>
                <th className="pb-3 text-center">Channels API</th>
                <th className="pb-3 text-center">Queue Routing</th>
                <th className="pb-3 text-center">Billing Access</th>
                <th className="pb-3 text-center">Safety Gates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-300 font-semibold">
              {permissionsMatrix.map((row, roleIdx) => (
                <tr key={row.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-4 pr-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-slate-455" />
                    </div>
                    <span>{row.role}</span>
                  </td>
                  {/* Bot Config */}
                  <td className="py-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.bots}
                      disabled={row.role === 'Administrator'}
                      onChange={() => handleToggle(roleIdx, 'bots')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  {/* Channels API */}
                  <td className="py-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.channels}
                      disabled={row.role === 'Administrator'}
                      onChange={() => handleToggle(roleIdx, 'channels')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  {/* Queue Routing */}
                  <td className="py-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.routing}
                      disabled={row.role === 'Administrator'}
                      onChange={() => handleToggle(roleIdx, 'routing')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  {/* Billing Access */}
                  <td className="py-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.billing}
                      disabled={row.role === 'Administrator'}
                      onChange={() => handleToggle(roleIdx, 'billing')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  {/* Safety Gates */}
                  <td className="py-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.safety}
                      disabled={row.role === 'Administrator'}
                      onChange={() => handleToggle(roleIdx, 'safety')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory Alert */}
      <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-xs leading-relaxed font-semibold">
        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
        <p>
          {isRtl 
            ? 'تنبيه: يتم فرض قيود RBAC على مستوى العميل فوراً. أي تداخل أو إزالة لصلاحيات أساسية قد يؤثر على أوقات استجابة وكلاء خدمة العملاء.' 
            : 'Notice: RBAC rules are enforced at the API gateway layer instantly. Adjusting queue routing might affect active call transfer capacity for agent workspaces.'}
        </p>
      </div>
    </div>
  );
}
export default RbacTab;
